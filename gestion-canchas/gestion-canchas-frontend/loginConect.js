document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
  
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
  
    try {
      const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
  
      const data = await response.json();
  
      if (response.ok) {
        // Guardar el token en localStorage
        localStorage.setItem('token', data.token);
        alert('¡Inicio de sesión exitoso!');
        // Aquí puedes redirigir al usuario o cerrar el modal
        document.getElementById('login-menu').classList.add('hidden');
      } else {
        alert(data.error || 'Error al iniciar sesión');
      }
  
    } catch (error) {
      console.error('Error al enviar el login:', error);
      alert('Error al conectar con el servidor');
    }
  });