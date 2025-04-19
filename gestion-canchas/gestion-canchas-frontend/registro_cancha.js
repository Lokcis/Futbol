// archivo: registro_cancha.js

let lat, lng;

function initMap() {
  const input = document.getElementById("ubicacion");

  // Crea un objeto Autocompleter de Google Maps para la dirección
  const autocomplete = new google.maps.places.Autocomplete(input);

  autocomplete.addListener("place_changed", () => {
    const place = autocomplete.getPlace();
    console.log(place);
    // Si el lugar tiene una ubicación (latitud y longitud)
    if (place.geometry) {
      lat = place.geometry.location.lat();
      lng = place.geometry.location.lng();
    } else {
      alert("No se pudo obtener la ubicación. Intenta nuevamente.");
    }
  });
}

// Espera a que la API de Google Maps cargue antes de ejecutar el mapa
document.getElementById('register-cancha-form').addEventListener('submit', async function (e) {
  e.preventDefault();

  console.log("El formulario se ha enviado correctamente.");

  // Obtener los valores del formulario
  const nombre = document.getElementById('nombre').value;
  const direccion = document.getElementById('ubicacion').value;
  const imagenes = document.getElementById('imagenes').files;

  // Asegúrate de que latitud y longitud estén definidos
  if (!lat || !lng) {
    console.log("Latitud y longitud no están definidas:", { lat, lng });
    alert("Por favor, ingresa una dirección válida");
    return;
  }

  // Crear un FormData para enviar los datos junto con la imagen
  const formData = new FormData();
  formData.append('nombre', nombre);
  formData.append('direccion', direccion);
  formData.append('lat', lat);
  formData.append('lng', lng);
  const dueno_id = 22; // Cambia esto por el ID del dueño autenticado
  formData.append('dueno_id', dueno_id);

  // Añadir las imágenes al FormData (puede haber más de una)
  for (let i = 0; i < imagenes.length; i++) {
    formData.append('imagenes', imagenes[i]);
  }

  try {
    console.log("Datos enviados:");
    for (let pair of formData.entries()) {
      console.log(pair[0] + ": " + pair[1]);
    }

    // Enviar la solicitud POST al backend
    const response = await fetch('http://localhost:5000/canchas', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (response.ok) {
      alert('Cancha registrada con éxito');
      // Redirigir o hacer algo después de registrar la cancha
    } else {
      alert(data.error || 'Error al registrar la cancha');
    }
  } catch (error) {
    console.error('Error al enviar el formulario:', error);
    alert('Error al conectar con el servidor');
  }
});
