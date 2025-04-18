// Obtener todos los botones de navegación
const buttons = document.querySelectorAll("#nav-buttons .head-btn");
const loginBtn = document.getElementById("login-btn");
const loginMenu = document.getElementById("login-menu");
const closeModalBtn = document.getElementById("close-modal-btn");

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

// Función para abrir el modal
loginBtn.addEventListener("click", () => {
    loginMenu.classList.remove("hidden"); // Muestra el modal al quitar la clase 'hidden'
    loginMenu.classList.add("show"); // Añade la clase 'show' para hacer visible el modal
});

// Función para cerrar el modal cuando se haga clic en el botón de cerrar
closeModalBtn.addEventListener("click", () => {
    loginMenu.classList.remove("show"); // Elimina la clase 'show'
    loginMenu.classList.add("hidden"); // Añade la clase 'hidden' para ocultar el modal
});

// Opcional: Cerrar el modal si el usuario hace clic fuera del contenido del modal
loginMenu.addEventListener("click", (event) => {
    if (event.target === loginMenu) {
        loginMenu.classList.add("hidden");
    }
});
