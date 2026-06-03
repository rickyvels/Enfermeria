// Flujos de redirección de NurseCore
function irPerfil() {
    const tipo = localStorage.getItem("tipoUsuario");
    if (tipo === "profesional") {
        window.location.href = "perfil-profesional.html";
    } else {
        window.location.href = "perfil-estudiante.html";
    }
}

function irDashboard() {
    const tipo = localStorage.getItem("tipoUsuario");
    if (tipo === "profesional") {
        window.location.href = "dashboard-profesional.html";
    } else {
        window.location.href = "dashboard-estudiante.html";
    }
}

// ==========================================
// SISTEMA DINÁMICO DE CONFIGURACIÓN DE COLOR
// ==========================================
function aplicarColoresPersonalizados() {
    const sidebarColor = localStorage.getItem('nc_sidebar_color');
    const topbarColor = localStorage.getItem('nc_topbar_color');

    // Aplicar color al Sidebar si existe
    if (sidebarColor) {
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            sidebar.style.backgroundColor = sidebarColor;
            // Ajuste dinámico de contraste para texto del sidebar
            const esClaro = esColorClaro(sidebarColor);
            const items = sidebar.querySelectorAll('a, span, h1, p');
            items.forEach(item => {
                if (!item.classList.contains('active-item')) {
                    item.style.color = esClaro ? '#1e293b' : 'rgba(255, 255, 255, 0.8)';
                }
            });
        }
    }

    // Aplicar color al Topbar si existe
    if (topbarColor) {
        const topbar = document.getElementById('topbar');
        if (topbar) {
            topbar.style.backgroundColor = topbarColor;
            // Ajuste dinámico de contraste para texto del topbar
            const esClaro = esColorClaro(topbarColor);
            const titulos = topbar.querySelectorAll('h1, p, span, svg');
            titulos.forEach(t => {
                t.style.color = esClaro ? '#0f172a' : '#ffffff';
            });
        }
    }
}

// Función auxiliar para detectar si un color hexadecimal es claro u oscuro
function esColorClaro(hex) {
    if (!hex) return false;
    const c = hex.replace('#', '');
    const r = parseInt(c.substr(0, 2), 16);
    const g = parseInt(c.substr(2, 2), 16);
    const b = parseInt(c.substr(4, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 155; // Retorna true si es un color claro
}

// Ejecutar automáticamente en cada carga de página
document.addEventListener('DOMContentLoaded', aplicarColoresPersonalizados);
