document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
  
    const nombre = document.getElementById('register-nombre').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
  
    try {
      const response = await fetch('http://localhost:5000/usuarios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nombre,
          email,
          password,
          rol: 'usuario' // o 'admin'/'cancha' si querés permitir que elijan rol
        })
      });
  
      const data = await response.json();
  
      if (response.ok) {
        alert('Usuario registrado exitosamente');
        // Podés redirigir, guardar token o cerrar el modal
        document.getElementById('register-menu').classList.add('hidden');
      } else {
        alert(data.error || 'Error al registrar usuario');
      }
  
    } catch (error) {
      console.error('Error al registrar:', error);
      alert('Error al conectar con el servidor');
    }
  });