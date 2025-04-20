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
    const result = await pool.query(`
      SELECT c.id AS cancha_id, 
             c.nombre, 
             c.direccion, 
             c.lat, 
             c.lng, 
             c.dueno_id, 
             c.telefono_contacto, -- Incluye el campo telefono_contacto
             json_agg(CONCAT('http://localhost:5000', ci.url)) AS imagenes
      FROM canchas c
      LEFT JOIN cancha_imagenes ci ON c.id = ci.cancha_id
      GROUP BY c.id
    `);

    res.json(result.rows); // Devuelve las canchas con sus imágenes y teléfono
  } catch (error) {
    console.error("Error al obtener canchas:", error);
    res.status(500).json({ error: "Error al obtener canchas" });
  }
});

// Ruta para realizar una reserva
app.post("/reservas", verificarToken, async (req, res) => {
  const { disponibilidad_id } = req.body;
  const usuario_id = req.user.userId; // Obtener el ID del usuario desde el token

  try {
    await pool.query("BEGIN");

    // Crear la reserva
    const result = await pool.query(
      `INSERT INTO reservas (usuario_id, disponibilidad_id, fecha_reserva)
       VALUES ($1, $2, NOW()) RETURNING id`,
      [usuario_id, disponibilidad_id]
    );

    // Marcar la disponibilidad como no disponible
    await pool.query(
      "UPDATE disponibilidades SET disponible = false WHERE id = $1",
      [disponibilidad_id]
    );

    await pool.query("COMMIT");
    res.status(201).json({ message: "Reserva creada exitosamente", reserva_id: result.rows[0].id });
  } catch (error) {
    await pool.query("ROLLBACK");
    console.error("Error al crear la reserva:", error);
    res.status(500).json({ error: "Error al crear la reserva" });
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

    const { nombre, direccion, lat, lng, dueno_id, telefono_contacto, cantidad_canchas } = req.body;

    if (!nombre?.trim() || !direccion?.trim() || !lat?.trim() || !lng?.trim() || !dueno_id?.trim() || !telefono_contacto?.trim() || !cantidad_canchas) {
      return res.status(400).json({ error: "Faltan datos requeridos" });
    }

    try {
      // 1. Insertar la cancha
      const result = await pool.query(
        `INSERT INTO canchas (nombre, direccion, lat, lng, dueno_id, telefono_contacto, cantidad_canchas) 
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [nombre, direccion, lat, lng, dueno_id, telefono_contacto, cantidad_canchas]
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

app.post("/canchas", verificarToken, verificarRol(["dueño", "admin"]), async (req, res) => {
  const { nombre, direccion, lat, lng, dueno_id, telefono_contacto, cantidad_canchas, horarios } = req.body;

  if (!nombre || !direccion || !lat || !lng || !dueno_id || !telefono_contacto || !cantidad_canchas) {
    return res.status(400).json({ error: "Faltan datos requeridos" });
  }

  try {
    await pool.query("BEGIN");

    // Insertar la cancha
    const result = await pool.query(
      `INSERT INTO canchas (nombre, direccion, lat, lng, dueno_id, telefono_contacto, cantidad_canchas) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      [nombre, direccion, lat, lng, dueno_id, telefono_contacto, cantidad_canchas]
    );

    const canchaId = result.rows[0].id;

    // Insertar los horarios
    if (horarios && horarios.length > 0) {
      for (const horario of horarios) {
        await pool.query(
          `INSERT INTO disponibilidades (cancha_id, fecha, hora_inicio, hora_fin) 
           VALUES ($1, $2, $3, $4)`,
          [canchaId, horario.fecha, horario.hora_inicio, horario.hora_fin]
        );
      }
    }

    await pool.query("COMMIT");
    res.status(201).json({ mensaje: "Cancha y horarios registrados con éxito" });
  } catch (error) {
    await pool.query("ROLLBACK");
    console.error("Error al registrar la cancha y horarios:", error);
    res.status(500).json({ error: "Error al registrar la cancha y horarios" });
  }
});

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

app.get("/reservas/cancha/:cancha_id", verificarToken, async (req, res) => {
  const { cancha_id } = req.params;

  try {
    const result = await pool.query(
      `SELECT r.id, d.fecha, d.hora_inicio, d.hora_fin
       FROM reservas r
       JOIN disponibilidades d ON r.disponibilidad_id = d.id
       WHERE d.cancha_id = $1`,
      [cancha_id]
    );

    res.json(result.rows); // Devuelve las reservas de la cancha
  } catch (error) {
    console.error("Error al obtener las reservas de la cancha:", error);
    res.status(500).json({ error: "Error al obtener las reservas de la cancha" });
  }
});

app.get("/disponibilidades/cancha/:cancha_id", async (req, res) => {
  const { cancha_id } = req.params;

  if (isNaN(cancha_id)) {
    return res.status(400).json({ error: "El ID de la cancha debe ser un número válido." });
  }

  try {
    const result = await pool.query(
      `SELECT id, fecha, hora_inicio, hora_fin, disponible
       FROM disponibilidades
       WHERE cancha_id = $1 AND disponible = true`,
      [parseInt(cancha_id)]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener las disponibilidades de la cancha:", error);
    res.status(500).json({ error: "Error al obtener las disponibilidades de la cancha" });
  }
});

// Levantar el servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
