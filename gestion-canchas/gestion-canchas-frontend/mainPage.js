let map;
let service;
let infowindow;
let nextPage = null;

function initMap() {
  const ubicacion = { lat: 4.6482837, lng: -74.2478946 }; // Bogotá
  map = new google.maps.Map(document.getElementById("map"), {
    center: ubicacion,
    zoom: 14,
  });

  infowindow = new google.maps.InfoWindow();

  const request = {
    location: ubicacion,
    radius: '5000',
    query: 'cancha sintética',
  };

  service = new google.maps.places.PlacesService(map);
  service.textSearch(request, mostrarResultados);
}

function mostrarResultados(results, status, pagination) {
  if (status === google.maps.places.PlacesServiceStatus.OK) {
    if (results.length === 0) {
      console.log("No se encontraron canchas sintéticas.");
    }

    for (let i = 0; i < results.length; i++) {
      createMarker(results[i]);
    }

    if (pagination && pagination.hasNextPage) {
      nextPage = pagination;
      setTimeout(() => {
        nextPage.nextPage();
      }, 2000); // Retardo para evitar peticiones rápidas
    }
  } else {
    console.error("Error al buscar canchas sintéticas: ", status);
  }
}

function createMarker(place) {
  if (!place.geometry || !place.geometry.location) return;

  const marker = new google.maps.Marker({
    map,
    position: place.geometry.location,
    icon: {
      url: 'ruta/a/tu/icono.png',
      scaledSize: new google.maps.Size(40, 40),
    }
  });

  google.maps.event.addListener(marker, "click", () => {
    let content = `<div><strong>${place.name}</strong><br>`;
    content += place.formatted_address ? `${place.formatted_address}<br>` : "";

    if (place.photos && place.photos.length > 0) {
      const photoUrl = place.photos[0].getUrl({ maxWidth: 300 });
      content += `<img src="${photoUrl}" alt="Cancha" class="popup-content"/>`;
    } else {
      content += `<p>(No hay foto disponible)</p>`;
    }

    content += `</div>`;

    infowindow.setContent(content);
    infowindow.open(map, marker);
  });
}
