// Obtener todos los botones con clase 'head-btn'
const botones = document.querySelectorAll(".head-btn");

// Agregar evento de clic a cada botón
botones.forEach(btn => {
    const target = btn.getAttribute("data-target");

    if (target === "info-page") {
        btn.addEventListener("click", () => alert("Sección de información próximamente"));
    } else if (target === "about-page") {
        btn.addEventListener("click", () => alert("Sección 'Sobre nosotros' próximamente"));
    } else {
        btn.addEventListener("click", () => showPage(target));
    }
});

// Función para mostrar la sección y activar el botón correspondiente
function showPage(pageId) {
    // Ocultar todas las secciones
    document.querySelectorAll("main").forEach(seccion => {
        seccion.classList.remove("show");
    });

    // Mostrar la sección deseada
    const page = document.getElementById(pageId);
    if (page) {
        page.classList.add("show");
    }

    // Desactivar todos los botones
    botones.forEach(btn => {
        btn.classList.remove("active-btn");
    });

    // Activar el botón que corresponde a esta sección
    const botonActivo = document.querySelector(`.head-btn[data-target="${pageId}"]`);
    if (botonActivo) {
        botonActivo.classList.add("active-btn");
    }
}

showPage("main-page");

