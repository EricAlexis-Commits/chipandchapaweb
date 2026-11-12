/* Google Analytics (GA4) - Inicialización externa compatible con CSP estricta */
window.dataLayer = window.dataLayer || [];
function gtag() {
    dataLayer.push(arguments);
}
window.gtag = gtag;
gtag('js', new Date());

// Habilitar debug_mode global para registrar el dispositivo de inmediato en DebugView de GA4
gtag('config', 'G-STCZ4CX0Q0', {
    'debug_mode': true
});

// Medición de clics delegada directamente en document (sin depender de timing de DOMContentLoaded)
document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-ga-event]');
    if (!el) return;

    var evento = el.getAttribute('data-ga-event');
    var appName = el.getAttribute('data-ga-app') || 'Miscelanea';
    var ubicacion = el.getAttribute('data-ga-ubicacion') || 'hero_section';

    gtag('event', evento, {
        'app_name': appName,
        'ubicacion': ubicacion,
        'debug_mode': true,
        'transport_type': 'beacon'
    });

    if (window.console && console.log) {
        console.log('[GA4 Debug Evento]', evento, { app_name: appName, ubicacion: ubicacion });
    }
}, true);
