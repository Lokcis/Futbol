const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const app = express();
const cors = require('cors');
const multer = require("multer");
const path = require("path")
const pool = require("./db"); // ← importas la conexión

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json()); // Middleware para manejar peticiones con cuerpo JSON
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.urlencoded({ extended: true }));
// Configurar multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Asegúrate de tener esta carpeta creada
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });


// Middleware para verificar el JWT
const verificarToken = (req, res, next) => {
  const token = req.headers["authorization"];

  if (!token) {
    return res.status(403).json({ error: "Token no proporcionado" });
  }

  console.log("Token recibido:", token);

  jwt.verify(token.split(" ")[1], "miclaveultrasecreta", (err, decoded) => {
    if (err) {
      console.error("Error al verificar el token:", err);
      return res.status(403).json({ error: "Token inválido" });
    }

    console.log("Token decodificado:", decoded); // Para depuración
    req.user = decoded; // Decodifica el token y lo almacena en `req.user`
    next();
  });
};

// Middleware para verificar rol (solo si es dueño)
const verificarRol = (roles) => {
  return (req, res, next) => {
    console.log("Rol del usuario:", req.user.rol); // Para depuración
    if (!roles.includes(req.user.rol)) {
      return res.status(403).json({ error: "No tienes permiso para acceder a esta ruta" });
    }
    next();
  };
};

// Ruta para login de usuario
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email y contraseña son requeridos" });
  }

  try {
    const result = await pool.query("SELECT * FROM usuarios WHERE email = $1", [
      email,
    ]);

    if (result.rowCount === 0) {
      return res.status(400).json({ error: "Correo o contraseña incorrectos" });
    }

    const user = result.rows[0];

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: "Correo o contraseña incorrectos" });
    }

    const token = jwt.sign(
      { userId: user.id, rol: user.rol },
      "miclaveultrasecreta",
      { expiresIn: "1h" }
    );

    res.json({ token });
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    res.status(500).json({ error: "Error al iniciar sesión" });
  }
});

// Ruta para registrar usuarios
app.post("/usuarios", async (req, res) => {
  const { nombre, email, password, rol } = req.body;

  if (!nombre || !email || !password || !rol) {
    return res.status(400).json({ error: "Faltan datos requeridos" });
  }

  try {
    const userExist = await pool.query(
      "SELECT * FROM usuarios WHERE email = $1",
      [email]
    );

    if (userExist.rowCount > 0) {
      return res
        .status(400)
        .json({ error: "El usuario con ese correo ya existe" });
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insertar el nuevo usuario
    const result = await pool.query(
      "INSERT INTO usuarios (nombre, email, password, rol) VALUES ($1, $2, $3, $4) RETURNING *",
      [nombre, email, hashedPassword, rol]
    );

    res.status(201).json({
      mensaje: "Usuario registrado correctamente",
      usuario: result.rows[0],
    });
    

  } catch (error) {
    console.error("Error al registrar el usuario:", error);
    res.status(500).json({ error: "Error al registrar el usuario" });
  }
});

// Ruta para probar conexión
app.get("/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error en la base de datos");
  }
});

// Ruta para obtener todas las canchas
app.get("/canchas", verificarToken, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM canchas");
    res.json(result.rows); // ← manda las canchas como respuesta
  } catch (error) {
    console.error("Error al obtener canchas:", error);
    res.status(500).json({ error: "Error al obtener canchas" });
  }
});

// Ruta para realizar una reserva
app.post("/reservas", verificarToken, async (req, res) => {
  const { usuario_id, disponibilidad_id } = req.body;

  try {
    // Verificar que la disponibilidad está disponible
    const disponibilidadResult = await pool.query(
      "SELECT disponible FROM disponibilidades WHERE id = $1",
      [disponibilidad_id]
    );
    const disponibilidad = disponibilidadResult.rows[0];

    if (!disponibilidad || !disponibilidad.disponible) {
      return res
        .status(400)
        .json({ message: "La disponibilidad no está disponible." });
    }

    // Marcar la disponibilidad como reservada (disponible = false)
    await pool.query(
      "UPDATE disponibilidades SET disponible = false WHERE id = $1",
      [disponibilidad_id]
    );

    // Crear la reserva
    const reservaResult = await pool.query(
      "INSERT INTO reservas (usuario_id, disponibilidad_id) VALUES ($1, $2) RETURNING *",
      [usuario_id, disponibilidad_id]
    );

    res.status(201).json(reservaResult.rows[0]);
  } catch (error) {
    console.error("Error al realizar la reserva:", error);
    res.status(500).json({ error: "Error al realizar la reserva" });
  }
});

// Ruta para agregar una nueva cancha con imágenes
app.post(
  "/canchas",
  verificarToken, // Verifica que el usuario esté autenticado
  verificarRol(["dueño", "admin"]), // Permite solo a dueños o admins
  upload.array("imagenes", 5),
  async (req, res) => {
    console.log("📥 Se recibió un POST en /canchas");
    console.log("🧾 req.body:", req.body);
    console.log("🖼️ req.files:", req.files);

    const { nombre, direccion, lat, lng, dueno_id } = req.body;

    if (!nombre?.trim() || !direccion?.trim() || !lat?.trim() || !lng?.trim() || !dueno_id?.trim()) {
      return res.status(400).json({ error: "Faltan datos requeridos" });
    }

    try {
      // 1. Insertar la cancha
      const result = await pool.query(
        `INSERT INTO canchas (nombre, direccion, lat, lng, dueno_id) 
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [nombre, direccion, lat, lng, dueno_id]
      );

      const cancha = result.rows[0];

      // 2. Insertar las imágenes en la tabla cancha_imagenes
      const archivos = req.files;
      if (archivos && archivos.length > 0) {
        for (let i = 0; i < archivos.length; i++) {
          const archivo = archivos[i];
          const url = `/uploads/${archivo.filename}`; // Ruta accesible desde el frontend

          await pool.query(
            `INSERT INTO cancha_imagenes (cancha_id, url, orden) VALUES ($1, $2, $3)`,
            [cancha.id, url, i]
          );
        }
      }

      res.status(201).json({ mensaje: "Cancha registrada con éxito", cancha });
    } catch (error) {
      console.error("Error al registrar la cancha:", error);
      res.status(500).json({ error: "Error al registrar la cancha" });
    }
  }
);
// Ruta para agregar disponibilidad
app.post("/disponibilidades", async (req, res) => {
  const { cancha_id, fecha, hora_inicio, hora_fin } = req.body;

  try {
    const result = await pool.query(
      "INSERT INTO disponibilidades (cancha_id, fecha, hora_inicio, hora_fin) VALUES ($1, $2, $3, $4) RETURNING *",
      [cancha_id, fecha, hora_inicio, hora_fin]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error al agregar disponibilidad:", error);
    res.status(500).json({ error: "Error al agregar disponibilidad" });
  }
});

app.post("/reservas", verificarToken, async (req, res) => {
  const { usuario_id, disponibilidad_id } = req.body;

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Verificar si la disponibilidad existe y está disponible
    const dispoResult = await client.query(
      "SELECT * FROM disponibilidades WHERE id = $1 AND disponible = true",
      [disponibilidad_id]
    );

    if (dispoResult.rowCount === 0) {
      await client.query("ROLLBACK");
      return res
        .status(400)
        .json({ error: "La disponibilidad no existe o ya fue reservada" });
    }

    // Crear reserva
    const reservaResult = await client.query(
      `INSERT INTO reservas (usuario_id, disponibilidad_id)
       VALUES ($1, $2) RETURNING *`,
      [usuario_id, disponibilidad_id]
    );

    // Marcar disponibilidad como no disponible
    await client.query(
      "UPDATE disponibilidades SET disponible = false WHERE id = $1",
      [disponibilidad_id]
    );

    await client.query("COMMIT");
    res.status(201).json(reservaResult.rows[0]);
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error al crear reserva:", error);
    res.status(500).json({ error: "Error al crear la reserva" });
  } finally {
    client.release();
  }
});
app.get("/reservas/:usuario_id", verificarToken, async (req, res) => {
  const { usuario_id } = req.params;

  try {
    // Obtenemos las reservas del usuario
    const result = await pool.query(
      `SELECT r.id AS reserva_id, r.fecha_reserva, 
              d.fecha, d.hora_inicio, d.hora_fin, c.nombre AS cancha_nombre, 
              c.ubicacion, c.imagen_url
       FROM reservas r
       JOIN disponibilidades d ON r.disponibilidad_id = d.id
       JOIN canchas c ON d.cancha_id = c.id
       WHERE r.usuario_id = $1`,
      [usuario_id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "No tienes reservas." });
    }

    res.json(result.rows); // Devuelve todas las reservas del usuario
  } catch (error) {
    console.error("Error al obtener las reservas:", error);
    res.status(500).json({ error: "Error al obtener las reservas" });
  }
});

// Ruta para cancelar una reserva
app.delete("/reservas/:reserva_id", verificarToken, async (req, res) => {
  const { reserva_id } = req.params;

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Verificar si la reserva existe
    const reservaResult = await client.query(
      "SELECT * FROM reservas WHERE id = $1",
      [reserva_id]
    );

    if (reservaResult.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Reserva no encontrada" });
    }

    const disponibilidad_id = reservaResult.rows[0].disponibilidad_id;

    // Eliminar la reserva
    await client.query("DELETE FROM reservas WHERE id = $1", [reserva_id]);

    // Marcar la disponibilidad como disponible
    await client.query(
      "UPDATE disponibilidades SET disponible = true WHERE id = $1",
      [disponibilidad_id]
    );

    await client.query("COMMIT");
    res.status(200).json({ message: "Reserva cancelada exitosamente" });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error al cancelar la reserva:", error);
    res.status(500).json({ error: "Error al cancelar la reserva" });
  } finally {
    client.release();
  }
});

// Levantar el servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
