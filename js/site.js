/* Chip&Chapa - comportamiento común: scroll suave, URL limpia y menú */
(function () {
    var KEY = "chipScroll";

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
        history.replaceState(null, "", id === "inicio" ? "/" : "/" + id);
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