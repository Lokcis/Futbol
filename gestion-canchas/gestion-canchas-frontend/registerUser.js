document.getElementById('register-form').addEventListener('submit', async function (e) {
  e.preventDefault();

  const nombre = document.getElementById('register-nombre').value;
  const email = document.getElementById('register-email').value;
  const password = document.getElementById('register-password').value;
  const rol = 'usuario';

  try {
    const response = await fetch('http://localhost:5000/usuarios', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ nombre, email, password, rol }),
    });

    const data = await response.json();

    if (response.ok) {
      // Cerrar el modal de registro
      document.getElementById('register-menu').classList.add('hidden');

      // Mostrar el modal de verificación
      document.getElementById("verify-modal").classList.remove("hidden");
      document.getElementById("verify-email").value = email;

      alert("Código enviado al correo. Por favor, verifica tu cuenta.");
    } else {
      alert(data.error || 'Error al registrar el usuario');
    }
  } catch (error) {
    console.error('Error al enviar el formulario:', error);
    alert('Error al conectar con el servidor, verificación');
  }
});
