/* Chip&Chapa - comportamiento común: scroll suave, URL limpia, menú y respaldo de imágenes */
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

    function cerrarMenu() {
        var menu = document.getElementById("navMenu");
        if (menu && menu.classList.contains("show") && window.bootstrap) {
            bootstrap.Collapse.getOrCreateInstance(menu).hide();
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

    // Al cargar el index: ir a la sección guardada por otra página o por el 404
    window.addEventListener("DOMContentLoaded", function () {
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

        // /equipo/#software o #hardware: baja a la sección y deja la URL limpia (/equipo/)
        var h = (location.hash || "").replace("#", "");
        if (h && (h === "software" || h === "hardware") && document.getElementById(h)) {
            setTimeout(function () {
                document.getElementById(h).scrollIntoView({ behavior: "smooth" });
                history.replaceState(null, "", location.pathname);
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
