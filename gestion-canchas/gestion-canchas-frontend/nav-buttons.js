// Obtener todos los botones de navegación
const buttons = document.querySelectorAll("#nav-buttons .head-btn");

// Navegación entre páginas
buttons.forEach(btn => {
    const target = btn.getAttribute("data-target");
    btn.addEventListener("click", () => showPage(target));
});

// Función para mostrar las páginas correspondientes
function showPage(pageId) {
    // Ocultar todas las secciones
    document.querySelectorAll("main").forEach(seccion => {
        seccion.classList.remove("show");
    });

    // Mostrar la sección correspondiente
    const page = document.getElementById(pageId);
    if (page) page.classList.add("show");

    // Cambiar el botón activo
    buttons.forEach(btn => {
        btn.classList.remove("active-btn");
    });

    const botonActivo = document.querySelector(`.head-btn[data-target="${pageId}"]`);
    if (botonActivo) botonActivo.classList.add("active-btn");
}

// Mostrar página principal al cargar
showPage("main-page");