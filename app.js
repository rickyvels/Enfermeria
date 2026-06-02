console.log("NurseCore iniciado");

function seleccionarUsuario(tipo) {
    localStorage.setItem("tipoUsuario", tipo);
    window.location.href = "registro.html";
}

/* Después del registro → va al perfil según tipo */
function irPerfil() {
    const tipo = localStorage.getItem("tipoUsuario");
    if (tipo === "profesional") {
        window.location.href = "perfil-profesional.html";
    } else {
        window.location.href = "perfil-estudiante.html";
    }
}

/* Desde los perfiles → va al dashboard según tipo */
function irDashboard() {
    const tipo = localStorage.getItem("tipoUsuario");
    if (tipo === "profesional") {
        window.location.href = "dashboard-profesional.html";
    } else {
        window.location.href = "dashboard-estudiante.html";
    }
}

function mostrarUsuario() {
    const tipo = localStorage.getItem("tipoUsuario");
    const elemento = document.getElementById("usuarioTexto");
    if (!elemento) return;
    if (tipo === "profesional") {
        elemento.innerHTML = "👩‍⚕️ Profesional";
    } else {
        elemento.innerHTML = "🎓 Estudiante";
    }
}

document.addEventListener("DOMContentLoaded", () => {
    mostrarUsuario();
});
