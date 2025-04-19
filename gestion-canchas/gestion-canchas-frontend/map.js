// Declaración de variables globales
let map;               // Mapa de Google Maps
let service;           // Servicio de búsqueda de lugares de Google Maps
let infowindow;        // Ventana de información para mostrar datos
let nextPage = null;   // Para gestionar la paginación en los resultados

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

  // Definir los parámetros para la búsqueda de lugares cercanos
  const request = {
    location: ubicacion,  // La ubicación desde donde se hace la búsqueda
    radius: '5000',       // Buscar lugares dentro de un radio de 5000 metros
    query: 'cancha sintética',  // Buscar canchas sintéticas
  };

  // Crear el servicio de PlacesService
  service = new google.maps.places.PlacesService(map);

  // Realizar la búsqueda de lugares con los parámetros definidos
  service.textSearch(request, mostrarResultados);
}

// Función para mostrar los resultados de la búsqueda de lugares
function mostrarResultados(results, status, pagination) {
  // Verificar que la búsqueda haya sido exitosa
  if (status === google.maps.places.PlacesServiceStatus.OK) {
    // Si no se encuentran resultados
    if (results.length === 0) {
      console.log("No se encontraron canchas sintéticas.");
    }

    // Crear un marcador para cada resultado
    for (let i = 0; i < results.length; i++) {
      createMarker(results[i]);
    }

    // Si hay más resultados, gestionar la paginación
    if (pagination && pagination.hasNextPage) {
      nextPage = pagination;
      setTimeout(() => {
        nextPage.nextPage();  // Cargar la siguiente página de resultados
      }, 2000);  // Retardo de 2 segundos para evitar peticiones rápidas
    }
  } else {
    // Si ocurre un error en la búsqueda, mostrar un mensaje
    console.error("Error al buscar canchas sintéticas: ", status);
  }
}
// Función para crear un marcador en el mapa para cada lugar encontrado
function createMarker(place) {
  // Verificar si el lugar tiene una ubicación válida
  if (!place.geometry || !place.geometry.location) return;

  // Crear un marcador en el mapa para el lugar
  const marker = new google.maps.Marker({
    map,                          // Asignar el mapa en el que se mostrará
    position: place.geometry.location,  // Establecer la posición del marcador
    icon: {
      //   url: 'ruta/a/tu/icono.png',  // URL de un icono personalizado para el marcador
      scaledSize: new google.maps.Size(40, 40),  // Tamaño escalado del icono
    }
  });

  // Añadir un evento de clic al marcador
  google.maps.event.addListener(marker, "click", () => {
    // Crear el contenido HTML que se mostrará en el popup
    let content = `<div><strong>${place.name}</strong><br>`;
    content += place.formatted_address ? `${place.formatted_address}<br>` : "";

    // Verificar si el lugar tiene fotos disponibles
    if (place.photos && place.photos.length > 0) {
      const photoUrl = place.photos[0].getUrl({ maxWidth: 300 });
      content += `<img src="${photoUrl}" alt="Cancha" class="popup-content"/>`;  // Incluir la foto en el contenido
    } else {
      content += `<p>(No hay foto disponible)</p>`;  // Mensaje si no hay foto
    }

    content += `</div>`;  // Cerrar el contenido del popup

    // Agregar un botón de redirección dentro del pop-up
    content += `
      <br>
      <button onclick="window.location.href='horarios.html?placeId=${place.place_id}'">
        Ver horarios disponibles
      </button>
    `;

    // Establecer el contenido del infowindow y abrirlo en el mapa
    infowindow.setContent(content);
    infowindow.open(map, marker);
  });
}


