// Definir los botones
const main_btn = document.getElementById("main-btn");
const courts_btn = document.getElementById("courts-btn");
const community_btn = document.getElementById("community-btn");
const info_btn = document.getElementById("info-btn");
const about_btn = document.getElementById("about-btn");

// Agregar el evento de clic para cada botón
main_btn.addEventListener("click", () => showPage("main-page"));
courts_btn.addEventListener("click", () => showPage("courts-page"));
community_btn.addEventListener("click", () => showPage("comunity-page"));
info_btn.addEventListener("click", () => alert("Sección de información próximamente"));
about_btn.addEventListener("click", () => alert("Sección 'Sobre nosotros' próximamente"));

// Función para mostrar la página y resaltar el botón activo
function showPage(pageId) {
    // Ocultar todas las secciones
    document.querySelectorAll("main").forEach(seccion => {
        seccion.classList.remove("show");  // Eliminar la clase 'show' para ocultar las secciones
    });

    // Mostrar la sección correspondiente
    const page = document.getElementById(pageId);
    if (page) {
        page.classList.add("show");  // Agregar la clase 'show' para mostrar la sección
    }

    // Eliminar la clase 'active-btn' de todos los botones
    document.querySelectorAll(".head-btn").forEach(btn => {
        btn.classList.remove("active-btn");
    });

    // Agregar la clase 'active-btn' al botón correspondiente
    const activeBtn = document.getElementById(pageId + "-btn");
    if (activeBtn) {
        activeBtn.classList.add("active-btn");
    }
}
