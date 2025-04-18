// Selección de elementos
const loginBtn = document.getElementById("login-btn");
const loginMenu = document.getElementById("login-menu");
const closeModalBtn = document.getElementById("close-modal-btn");

// Modal de registro
const registerMenu = document.getElementById("register-menu");
const closeRegisterBtn = document.getElementById("close-register-btn");
const redirectLoginBtn = document.getElementById("redirect-login-btn");
const openRegisterLink = document.getElementById("open-register");

// Modal de cancha
const canchaMenu = document.getElementById("cancha-menu");
const closeCanchaBtn = document.getElementById("close-cancha-btn");
const redirectLoginCanchaBtn = document.getElementById("redirect-login-cancha-btn");
const canchaLink = document.querySelector('a[href="#cancha"]');

// Modal de administrador
const adminMenu = document.getElementById("admin-menu");
const closeAdminBtn = document.getElementById("close-admin-btn");
const redirectLoginAdminBtn = document.getElementById("redirect-login-admin-btn");
const adminLink = document.querySelector('a[href="#admin"]');

// Función para ocultar todos los modales
function hideAllModals() {
    const modals = [loginMenu, registerMenu, canchaMenu, adminMenu];
    modals.forEach(modal => {
        modal.classList.add("hidden");
        modal.classList.remove("show");
    });
}

// Event listeners

// 1. Modal de login
loginBtn.addEventListener("click", (e) => {
    e.preventDefault();
    hideAllModals();
    loginMenu.classList.remove("hidden");
    loginMenu.classList.add("show");
});

// 3. Cerrar modal de login
closeModalBtn.addEventListener("click", () => {
    loginMenu.classList.add("hidden");
    loginMenu.classList.remove("show");
});

// 4. Cerrar al hacer clic fuera del contenido
loginMenu.addEventListener("click", (event) => {
    if (event.target === loginMenu) {
        loginMenu.classList.add("hidden");
    }
});

// 5. Abrir modal de registro desde login
openRegisterLink.addEventListener("click", (e) => {
    e.preventDefault();
    hideAllModals();
    registerMenu.classList.remove("hidden");
    registerMenu.classList.add("show");
});

// 6. Cerrar modal de registro
closeRegisterBtn.addEventListener("click", () => {
    registerMenu.classList.add("hidden");
    registerMenu.classList.remove("show");
});

// 7. Ir desde registro a login
redirectLoginBtn.addEventListener("click", () => {
    hideAllModals();
    loginMenu.classList.remove("hidden");
    loginMenu.classList.add("show");
});

// 8. Abrir modal cancha desde enlace
canchaLink.addEventListener("click", (e) => {
    e.preventDefault();
    hideAllModals();
    canchaMenu.classList.remove("hidden");
    canchaMenu.classList.add("show");
});

// 9. Cerrar modal cancha
closeCanchaBtn.addEventListener("click", () => {
    canchaMenu.classList.add("hidden");
    canchaMenu.classList.remove("show");
});

// 10. Ir desde cancha a login
redirectLoginCanchaBtn.addEventListener("click", () => {
    hideAllModals();
    loginMenu.classList.remove("hidden");
    loginMenu.classList.add("show");
});

// 11. Abrir modal admin desde enlace
adminLink.addEventListener("click", (e) => {
    e.preventDefault();
    hideAllModals();
    adminMenu.classList.remove("hidden");
    adminMenu.classList.add("show");
});

// 12. Cerrar modal admin
closeAdminBtn.addEventListener("click", () => {
    adminMenu.classList.add("hidden");
    adminMenu.classList.remove("show");
});

// 13. Ir desde admin a login
redirectLoginAdminBtn.addEventListener("click", () => {
    hideAllModals();
    loginMenu.classList.remove("hidden");
    loginMenu.classList.add("show");
});

// 14. Cerrar modales con tecla ESC
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        hideAllModals();
    }
});

// 15. Cerrar al hacer clic fuera para todos los modales
[registerMenu, canchaMenu, adminMenu].forEach(modal => {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.add("hidden");
            modal.classList.remove("show");
        }
    });
});