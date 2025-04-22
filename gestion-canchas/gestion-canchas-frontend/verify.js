document.getElementById("verify-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("verify-email").value;
  const codigo = document.getElementById("verify-code").value;

  try {
    const res = await fetch("http://localhost:5000/verificar", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, codigo })
    });

    const data = await res.json();

    if (res.ok) {
      alert("Cuenta verificada correctamente");

      // Redirigir a otro lugar, por ejemplo a la página de inicio o login
      window.location.href = 'horarios.html'; // O redirigir a login

      // Cerrar el modal de verificación
      document.getElementById("verify-modal").classList.add("hidden");

    } else {
      alert(data.error || "Error al verificar el código");
    }
  } catch (error) {
    console.error("Error al conectar con el servidor:", error);
    alert("Error al conectar con el servidor. Revisa la consola para más detalles.");
  }
});

document.getElementById("resend-code-btn").addEventListener("click", async () => {
  const email = document.getElementById("verify-email").value;
  const nombre = document.getElementById("register-nombre").value || "Usuario"; // si está disponible
  const password = document.getElementById("register-password").value || "temporal123"; // solo para enviar algo válido
  const rol = "usuario";

  if (!email) {
    alert("Ingresa el correo con el que te registraste.");
    return;
  }

  try {
    const res = await fetch("http://localhost:5000/usuarios", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ nombre, email, password, rol })
    });

    const data = await res.json();

    if (res.ok) {
      alert("Código reenviado al correo.");
    } else {
      alert(data.error || "No se pudo reenviar el código.");
    }
  } catch (error) {
    console.error("Error al reenviar código:", error);
    alert("Ocurrió un error al intentar reenviar el código.");
  }
});
