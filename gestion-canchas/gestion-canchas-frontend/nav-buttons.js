// Obtener todos los botones de navegación
const buttons = document.querySelectorAll("#nav-buttons .head-btn");
const loginBtn = document.getElementById("login-btn");
const loginMenu = document.getElementById("login-menu");
const closeModalBtn = document.getElementById("close-modal-btn");

// Nuevos elementos para el registro
const registerMenu = document.getElementById("register-menu");
const closeRegisterBtn = document.getElementById("close-register-btn");
const redirectLoginBtn = document.getElementById("redirect-login-btn");
const openRegisterLink = document.getElementById("open-register");

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

// Función para abrir el modal de login
loginBtn.addEventListener("click", () => {
    loginMenu.classList.remove("hidden");
    loginMenu.classList.add("show");
});

// Función para cerrar el modal de login
closeModalBtn.addEventListener("click", () => {
    loginMenu.classList.remove("show");
    loginMenu.classList.add("hidden");
});

// Cerrar login al hacer clic fuera del contenido
loginMenu.addEventListener("click", (event) => {
    if (event.target === loginMenu) {
        loginMenu.classList.add("hidden");
    }
});

// Cerrar modal de registro
closeRegisterBtn.addEventListener("click", () => {
    registerMenu.classList.add("hidden");
    registerMenu.classList.remove("show");
});

redirectLoginBtn.addEventListener("click", () => {
    // Cerrar modal de registro
    registerMenu.classList.add("hidden");
    registerMenu.classList.remove("show");

    // Mostrar el modal de login
    loginMenu.classList.remove("hidden");
    loginMenu.classList.add("show");
});

// Abrir modal de registro y cerrar login
openRegisterLink.addEventListener("click", (e) => {
    e.preventDefault(); 
    loginMenu.classList.add("hidden");  // Oculta login
    loginMenu.classList.remove("show");
    registerMenu.classList.remove("hidden");  // Muestra registro
    registerMenu.classList.add("show");
});