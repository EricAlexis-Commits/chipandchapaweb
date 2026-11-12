/* Google Analytics (GA4) - Inicialización externa compatible con CSP estricta */
window.dataLayer = window.dataLayer || [];
function gtag() {
    dataLayer.push(arguments);
}
window.gtag = gtag;
gtag('js', new Date());
gtag('config', 'G-STCZ4CX0Q0');

// Medición de clics desacoplada (evita violaciones de CSP por atributos inline como onclick)
document.addEventListener('DOMContentLoaded', function () {
    document.addEventListener('click', function (e) {
        var el = e.target.closest('[data-ga-event]');
        if (!el) return;

        var evento = el.getAttribute('data-ga-event');
        var appName = el.getAttribute('data-ga-app') || 'Miscelanea';
        var ubicacion = el.getAttribute('data-ga-ubicacion') || 'hero_section';

        gtag('event', evento, {
            'app_name': appName,
            'ubicacion': ubicacion,
            'debug_mode': true
        });
    });
});
