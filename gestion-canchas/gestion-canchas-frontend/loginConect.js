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
        localStorage.setItem('token', data.token);
  
        if (data.nombre) {
          localStorage.setItem('nombreUsuario', data.nombre); // Guardar el nombre
          mostrarBienvenida(data.nombre);
        }
  
        alert('¡Inicio de sesión exitoso!');
        document.getElementById('login-menu').classList.add('hidden');
           
            // Redirigir al mapa
            window.location.href = "horarios.html"; // Redirige a mapa.html después de registro exitoso
    
      } else {
        alert(data.error || 'Error al iniciar sesión');
      }
  
  
    } catch (error) {
      console.error('Error al enviar el login:', error);
      alert('Error al conectar con el servidor');
    }
  }); 

  function mostrarBienvenida(nombre) {
    const mensaje = document.getElementById("welcome-message");
    mensaje.textContent = `¡Bienvenido, ${nombre}! 👋`;
    mensaje.classList.remove("hidden");
  }