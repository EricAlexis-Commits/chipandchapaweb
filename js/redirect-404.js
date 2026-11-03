/* Redirección suave desde rutas de sección en 404.html hacia el inicio */
(function () {
    var secciones = ["inicio", "servicios", "proyectos", "metodo", "equipo", "contacto"];
    var partes = location.pathname.split("/").filter(Boolean);
    var ultima = (partes[partes.length - 1] || "").toLowerCase();
    if (secciones.indexOf(ultima) !== -1) {
        try { sessionStorage.setItem("chipScroll", ultima); } catch (e) {}
        location.replace("/");
    }
})();
