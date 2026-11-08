/* Chip&Chapa - comportamiento común: scroll suave, URL limpia, menú responsive y respaldo de imágenes */
(function () {
    var KEY = "chipScroll";

    function ocultarImagenFallida(img) {
        if (!img || img.dataset.ccFallbackApplied) return;
        img.dataset.ccFallbackApplied = "1";
        img.style.display = "none";
        console.warn("Imagen no disponible ocultada:", img.currentSrc || img.src);
    }

    // Manejador global en fase de captura para errores de carga de imágenes (compatible con CSP)
    document.addEventListener("error", function (e) {
        var target = e.target;
        if (target && target.tagName === "IMG") {
            ocultarImagenFallida(target);
        }
    }, true);

    function alternarMenu() {
        var menu = document.getElementById("navMenu");
        var toggler = document.querySelector(".navbar-toggler");
        if (!menu) return;

        if (window.bootstrap && window.bootstrap.Collapse) {
            var bsCollapse = bootstrap.Collapse.getOrCreateInstance(menu);
            bsCollapse.toggle();
        } else {
            var abierto = menu.classList.toggle("show");
            if (toggler) {
                toggler.setAttribute("aria-expanded", abierto ? "true" : "false");
                toggler.classList.toggle("collapsed", !abierto);
            }
        }
    }

    function cerrarMenu() {
        var menu = document.getElementById("navMenu");
        var toggler = document.querySelector(".navbar-toggler");
        if (!menu) return;

        if (menu.classList.contains("show")) {
            if (window.bootstrap && window.bootstrap.Collapse) {
                bootstrap.Collapse.getOrCreateInstance(menu).hide();
            } else {
                menu.classList.remove("show");
            }
            if (toggler) {
                toggler.setAttribute("aria-expanded", "false");
                toggler.classList.add("collapsed");
            }
        }
    }

    function irA(id, animado) {
        var el = document.getElementById(id);
        if (!el) return false;
        el.scrollIntoView({ behavior: animado ? "smooth" : "auto" });
        history.replaceState(null, "", id === "inicio" ? "/" : "/#" + id);
        return true;
    }

    // Clicks en enlaces con data-section (funcionan en el index y en las demás páginas)
    document.addEventListener("click", function (e) {
        var a = e.target.closest("a[data-section]");
        if (!a) return;
        e.preventDefault();
        var id = a.getAttribute("data-section");
        cerrarMenu();
        if (!irA(id, true)) {
            try { sessionStorage.setItem(KEY, id); } catch (err) { }
            window.location.href = "/";
        }
    });

    // Al cargar el DOM
    window.addEventListener("DOMContentLoaded", function () {
        // Soporte robusto para el botón de menú móvil (fallback directo si Bootstrap JS tarda o es bloqueado por CSP)
        var toggler = document.querySelector(".navbar-toggler");
        if (toggler) {
            toggler.addEventListener("click", function (e) {
                if (!window.bootstrap || !window.bootstrap.Collapse) {
                    e.preventDefault();
                    alternarMenu();
                }
            });
        }

        // Cerrar menú al hacer clic fuera del navbar en pantallas táctiles y móviles
        document.addEventListener("click", function (e) {
            var nav = document.querySelector(".cc-nav");
            if (nav && !nav.contains(e.target)) {
                cerrarMenu();
            }
        });

        // Revisar imágenes que hayan fallado antes de registrar el listener
        var imgs = document.querySelectorAll("img");
        imgs.forEach(function (img) {
            if (img.complete && img.naturalWidth === 0) {
                ocultarImagenFallida(img);
            }
        });

        var guardada = null;
        try { guardada = sessionStorage.getItem(KEY); sessionStorage.removeItem(KEY); } catch (err) { }
        if (guardada) setTimeout(function () { irA(guardada, true); }, 120);

        // Soporte de navegación por hash / ancla (#punto-de-venta, #software, #hardware, etc.)
        var h = (location.hash || "").replace("#", "");
        if (h && document.getElementById(h)) {
            setTimeout(function () {
                document.getElementById(h).scrollIntoView({ behavior: "smooth" });
            }, 120);
        }

        // Resalta en el menú la sección visible
        var links = document.querySelectorAll(".cc-nav .nav-link[data-section]");
        if (!links.length || !("IntersectionObserver" in window)) return;
        var obs = new IntersectionObserver(function (entradas) {
            entradas.forEach(function (en) {
                if (!en.isIntersecting) return;
                links.forEach(function (l) {
                    l.classList.toggle("active", l.getAttribute("data-section") === en.target.id);
                });
            });
        }, { rootMargin: "-45% 0px -50% 0px" });
        links.forEach(function (l) {
            var s = document.getElementById(l.getAttribute("data-section"));
            if (s) obs.observe(s);
        });
    });
})();

//Abrir modals de Términos y Condiciones y Avisos de Privacidad
let terminosCondicionesAbrir = document.getElementById('abrirTerminos');
let avisosPrivacidadAbrir = document.getElementById('abrirAvisos');

let modalTerminos = document.getElementById('modalAbrir-1');
let modalAvisos = document.getElementById('modalAbrir-2');

let cerrarTerminos = document.getElementById('cerrarModal-1');
let cerrarPrivacidad = document.getElementById('cerrarModal-2');

terminosCondicionesAbrir.addEventListener('click',(e)=>{
    e.preventDefault();
    modalTerminos.showModal();
});
avisosPrivacidadAbrir.addEventListener('click',(e)=>{
    e.preventDefault();
    modalAvisos.showModal();
});

cerrarTerminos.addEventListener('click',()=>{
    modalTerminos.close();
});
cerrarPrivacidad.addEventListener('click',()=>{
    modalAvisos.close();
});