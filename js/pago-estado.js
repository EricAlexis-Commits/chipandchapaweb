/* Chip&Chapa - Control de formulario desplegable en páginas de estado de pago */
document.addEventListener("DOMContentLoaded", function () {
    var btn = document.getElementById("btnToggleQuejas");
    var seccion = document.getElementById("seccionQuejas");
    if (!btn || !seccion) return;

    btn.addEventListener("click", function (e) {
        e.preventDefault();
        var estaOculto = seccion.classList.contains("d-none");
        if (estaOculto) {
            seccion.classList.remove("d-none");
            btn.setAttribute("aria-expanded", "true");
            btn.innerHTML = '<i class="bi bi-x-circle me-1"></i> Ocultar formulario';
            seccion.scrollIntoView({ behavior: "smooth", block: "start" });
            var primerCampo = seccion.querySelector("input[name='nombre']");
            if (primerCampo) {
                setTimeout(function () { primerCampo.focus(); }, 350);
            }
        } else {
            seccion.classList.add("d-none");
            btn.setAttribute("aria-expanded", "false");
            btn.innerHTML = '<i class="bi bi-chat-square-dots me-1"></i> Reportar duda o queja';
        }
    });
});

