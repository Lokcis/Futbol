// Declaración de variables globales
let map;               // Mapa de Google Maps
let infowindow;        // Ventana de información para mostrar datos

// Función para inicializar el mapa
function initMap() {
  // Establecer la ubicación inicial (Bogotá, Colombia)
  const ubicacion = { lat: 4.6482837, lng: -74.2478946 };

  // Crear el mapa en el elemento con id "map"
  map = new google.maps.Map(document.getElementById("map"), {
    center: ubicacion,  // Centrar el mapa en la ubicación de Bogotá
    zoom: 14,           // Nivel de zoom para el mapa
  });

  // Crear la ventana de información que se mostrará al hacer clic en los marcadores
  infowindow = new google.maps.InfoWindow();

  // Obtener el token del almacenamiento local
  const token = localStorage.getItem("token");
  if (!token) {
    console.error("No se encontró un token. Por favor, inicia sesión.");
    return;
  }

  // Obtener las canchas registradas desde el backend
  fetch("http://localhost:5000/canchas", {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`, // Incluir el token en los headers
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Error al obtener las canchas registradas.");
      }
      return response.json();
    })
    .then((canchas) => {
      if (canchas.length === 0) {
        console.log("No se encontraron canchas registradas.");
        return;
      }

      // Crear un marcador para cada cancha registrada
      canchas.forEach((cancha) => {
        createMarker({
          cancha_id: cancha.cancha_id, // Asegúrate de incluir el ID de la cancha
          imagenes: cancha.imagenes,   // Agregar las imágenes de la cancha
          name: cancha.nombre,
          formatted_address: cancha.direccion,
          geometry: {
            location: {
              lat: parseFloat(cancha.lat), // Convertir a número
              lng: parseFloat(cancha.lng), // Convertir a número
            },
          },
        });
      });
    })
    .catch((error) => {
      console.error("Error al obtener las canchas registradas:", error);
    });
}

// Función para crear un marcador en el mapa para cada lugar encontrado
function createMarker(place) {
  // Verificar si el lugar tiene una ubicación válida
  if (!place.geometry || !place.geometry.location) return;

  // Crear un marcador en el mapa para el lugar
  const marker = new google.maps.Marker({
    map,                          // Asignar el mapa en el que se mostrará
    position: place.geometry.location,  // Establecer la posición del marcador
  });

  // Añadir un evento de clic al marcador
  google.maps.event.addListener(marker, "click", () => {
    // Crear el contenido HTML que se mostrará en el popup
    let content = `<div style="max-width: 300px;">`; // Limitar el ancho máximo del popup

    // Agregar las imágenes al popup (encima del nombre y dirección)
    if (place.imagenes && place.imagenes.length > 0) {
      content += `<div>`;
      place.imagenes.forEach((imagen) => {
        content += `<img src="${imagen}" alt="Imagen de la cancha" style="width:100%; height:auto; max-height:150px; margin-bottom:10px;">`;
      });
      content += `</div>`;
    }

    // Agregar el nombre y la dirección de la cancha
    content += `<strong>${place.name}</strong><br>`;
    content += place.formatted_address ? `${place.formatted_address}<br>` : "";

    // Agregar el botón de "Reservar"
    content += `<button onclick="window.location.href='reservar.html?cancha_id=${place.cancha_id}'"
                style="margin-top: 10px; padding: 5px 10px; background-color: #007BFF; color: white; border: none; border-radius: 5px; cursor: pointer;">
                Reservar
                </button>`;

    content += `</div>`;

    // Mostrar el popup en el marcador
    infowindow.setContent(content);
    infowindow.open(map, marker);
  });
}


