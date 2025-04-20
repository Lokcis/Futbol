// Escuchar el evento de envío del formulario de registro
document.getElementById('register-form').addEventListener('submit', async function (e) {
  e.preventDefault();

  // Obtener los valores del formulario
  const nombre = document.getElementById('register-nombre').value;
  const email = document.getElementById('register-email').value;
  const password = document.getElementById('register-password').value;
  const rol = 'usuario'; 
  try {
    // Enviar la solicitud POST al backend
    const response = await fetch('http://localhost:5000/usuarios', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json', // Enviar datos como JSON
      },
      body: JSON.stringify({
        nombre,
        email,
        password,
        rol,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      alert('Usuario registrado con éxito');
      // Redirigir al login o realizar otra acción
      window.location.href = 'horarios.html';
    } else {
      console.log('Respuesta del servidor:', data);
      alert(data.error || 'Error al registrar el usuario');
    }
  } catch (error) {
    console.error('Error al enviar el formulario:', error);
    alert('Error al conectar con el servidor');
  }
});