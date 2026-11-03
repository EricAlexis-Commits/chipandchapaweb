# Plan de Acción y Registro de Endurecimiento Técnico — Chip&Chapa Web

Este documento consolida las intervenciones técnicas aplicadas al repositorio, responde con rigor a las conclusiones sobredimensionadas de auditorías preliminares y establece la arquitectura de seguridad para la futura integración de suscripciones POS mediante Azure Functions.

---

## PARTE 1: Corrección de Conclusiones y Medidas Aplicadas en el Código

### 1. Reajuste de Afirmaciones Exageradas
| Afirmación preliminar | Realidad técnica objetiva | Estado real |
| :--- | :--- | :--- |
| *"Protección contra spam: 0 % → activa"* | Un honeypot con `display:none` solo frena scrapers básicos. Bots con headless browsers (Puppeteer) evalúan CSS. Además, el endpoint de Formspree es público y susceptible a `curl` directo. | **Protección básica/inicial.** Se requiere Cloudflare Turnstile para seguridad real. |
| *"Indexación garantizada"* | Un `sitemap.xml` solo **facilita el descubrimiento**; ningún archivo garantiza indexación en Google ni Bing. | **Indexación facilitada.** Requiere alta en Google Search Console. |
| *"Limpieza de 2.02 MB mejora la velocidad del usuario"* | Los archivos huérfanos nunca eran descargados por el navegador. | **Higiene de repositorio (DX)**, no optimización de ancho de banda para el visitante. |
| *"Lazy loading en todas las imágenes mejora el LCP"* | Colocar `loading="lazy"` en imágenes visibles en el primer pantallazo (*above the fold*) **retrasa** el LCP (*Largest Contentful Paint*). | **Corregido:** Solo imágenes *below the fold* llevan `lazy`. El Hero lleva `fetchpriority="high"`. |
| *"SRI en Bootstrap es protección fuerte"* | Con versión fija de Bootstrap, el vector de ataque era bajo. No protege contra fuentes, iconos ni endpoints. Un hash erróneo inutiliza el CSS del sitio. | **Mitigación puntual de cadena de suministro CDN.** La opción más robusta a futuro es autoalojar archivos compilados mínimos. |

---

### 2. Cambios de Endurecimiento Aplicados en el Repositorio

#### 2.1 Optimización LCP y Prevención de Saltos de Diseño (CLS)
* **Qué se hizo:**
  1. En `index.html`, la mascota del Hero ([line 74](file:///C:/Users/cadav/source/repos/EricAlexis-Commits/chipandchapaweb/index.html#L74)) se configuró **sin** `loading="lazy"` y con el atributo `fetchpriority="high"` para forzar su descarga inmediata como elemento LCP.
  2. Se declararon dimensiones intrínsecas (`width` y `height`) en todas las imágenes de proyectos y miembros del equipo (`846x433` para Clínica, `1919x1044` para Miscelánea, `400x400` para creadores).
* **Por qué se hizo:** Al declarar ancho y alto nativos, el navegador reserva la caja de renderizado antes de recibir los bytes de la imagen (`aspect-ratio`), eliminando el parpadeo de movimiento o Cumulative Layout Shift (CLS).

#### 2.2 Endurecimiento del Formulario de Contacto
* **Qué se hizo:**
  1. Se implementaron restricciones de entrada del lado del cliente:
     * Nombre: `maxlength="80"` y `autocomplete="name"`
     * Correo: `maxlength="100"` y `autocomplete="email"`
     * Teléfono: `maxlength="20"`, `autocomplete="tel"` y expresión regular `pattern="[\d\s\+\-\(\)]{7,20}"`
     * Mensaje: `maxlength="2000"`
  2. Se añadió el aviso de privacidad conforme a la LFPDPPP (México) bajo el botón de envío.
* **Por qué se hizo:** Aunque la validación en el cliente no reemplaza la seguridad en backend, evita envíos vacíos, trunca desbordamientos accidentales de texto y cumple con la normativa de tratamiento de datos personales.
* **Siguiente paso:** Para mitigar envíos automatizados a Formspree, integrar el widget de **Cloudflare Turnstile** (gratuito, sin fricción visual tipo puzzle) y configurar el bloqueo de dominio en el panel de Formspree.

#### 2.3 Seguridad en Enlaces Salientes (Prevención de Tabnabbing)
* **Qué se hizo:** Se auditaron todos los enlaces externos a WhatsApp (`https://wa.me/...`) y a GitHub (`https://github.com/...`) en todas las páginas HTML, asegurando los atributos:
  ```html
  target="_blank" rel="noopener noreferrer"
  ```
* **Por qué se hizo:** Evita la vulnerabilidad de *reverse tabnabbing*, impidiendo que la pestaña abierta pueda acceder a `window.opener.location` para redirigir la página original a un sitio de phishing.

#### 2.4 Metadatos SEO, Open Graph y Esquema Estructurado
* **Qué se hizo:**
  1. Se añadió `og:image:alt="Chip&amp;Chapa - Software y Soporte Técnico"` en todas las páginas.
  2. Se corrigió la ruta de `og:image` hacia la carpeta en plural `/Imagenes/Mascotas/mascota-negra.png`.
  3. Se incorporó marcado semántico JSON-LD `LocalBusiness` en [index.html](file:///C:/Users/cadav/source/repos/EricAlexis-Commits/chipandchapaweb/index.html) con datos oficiales (teléfono, zona geográfica de cobertura, precio orientativo y servicios).
  4. Se mantuvieron los enlaces `<link rel="canonical">` en cada documento.
* **Nota sobre caché social:** Facebook, LinkedIn y Twitter cachean las tarjetas Open Graph. Tras publicar cambios en `og:image`, se debe pasar la URL por el *Facebook Sharing Debugger* y el *LinkedIn Post Inspector* para purgar su caché manualmente.

---

## PARTE 2: Seguridad en el Borde para Sitio Estático (Cloudflare)

Al estar alojado en GitHub Pages, el servidor web no permite configurar cabeceras HTTP personalizadas (`.htaccess` o `web.config`). La arquitectura óptima consiste en colocar **Cloudflare** (plan gratuito) delante del dominio `chipandchapa.com`.

### 1. Cabeceras HTTP Recomendadas (vía Cloudflare Transform Rules)
| Cabecera | Valor recomendado | Qué mitiga |
| :--- | :--- | :--- |
| **Content-Security-Policy (CSP)** | `default-src 'self'; script-src 'self' https://cdn.jsdelivr.net https://challenges.cloudflare.com; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://fonts.googleapis.com; font-src https://fonts.gstatic.com https://cdn.jsdelivr.net; img-src 'self' data: https:; connect-src 'self' https://formspree.io https://<api-pos>.azurewebsites.net; frame-ancestors 'none'; base-uri 'self'; form-action 'self' https://formspree.io;` | XSS, inyección de scripts externos, clickjacking y exfiltración no autorizada de datos. |
| **Strict-Transport-Security (HSTS)** | `max-age=31536000; includeSubDomains; preload` | Fuerza conexión HTTPS e impide degradación de protocolo (SSL Stripping). |
| **X-Content-Type-Options** | `nosniff` | Impide que el navegador interprete archivos con tipos MIME incorrectos. |
| **Referrer-Policy** | `strict-origin-when-cross-origin` | Evita fuga de rutas internas hacia dominios de terceros. |
| **Permissions-Policy** | `camera=(), microphone=(), geolocation=(), payment=()` | Bloquea acceso a APIs sensibles del dispositivo en el contexto de la web. |
| **Cross-Origin-Opener-Policy** | `same-origin` | Aísla el contexto de navegación contra ataques entre pestañas. |

### 2. Configuración de Dominio y DNS
1. **Always Use HTTPS:** Activo en Cloudflare para forzar redirección 301 automática de HTTP a HTTPS.
2. **DNSSEC:** Activado en el registrador de dominio y en Cloudflare para prevenir spoofing de DNS / envenenamiento de caché.
3. **Registros CAA:** Restringir explícitamente qué entidades certificadoras (ej. Let's Encrypt / Cloudflare) pueden emitir certificados TLS para `chipandchapa.com`.
4. **2FA Obligatorio:** En la cuenta registradora del dominio y en la cuenta de GitHub con bloqueo de transferencia activo.

---

## PARTE 3: Arquitectura para Validación de Suscripciones POS con Azure Functions

### 1. Principio Fundamental de Seguridad
> **El cliente estático es un entorno hostil.**  
> Cualquier validación ejecutada en el navegador del usuario (JavaScript) puede ser alterada mediante DevTools o peticiones emuladas. La página web **nunca** decide si un pago es legítimo ni altera bases de datos directamente.

```
┌─────────────────────────────────┐
│ Proveedor de Pagos (Stripe/MP)  │
└────────────────┬────────────────┘
                 │ Webhook firmado (HMAC-SHA256)
                 ▼
┌────────────────────────────────────────────────────────┐
│ Azure Function: ProcesarWebhookPago                    │
│ • Valida firma criptográfica con secreto de Key Vault  │
│ • Verifica monto, divisa y marca temporal (anti-replay)│
│ • Procesa con idempotencia (ID de evento único)        │
└────────────────┬───────────────────────────────────────┘
                 │ Actualiza estado
                 ▼
┌────────────────────────────────────────────────────────┐
│ Base de Datos: Suscripciones POS (SQL / CosmosDB)      │
└────────────────▲───────────────────────────────────────┘
                 │ Consulta de solo lectura
┌────────────────┴───────────────────────────────────────┐
│ Azure Function: ConsultarEstadoSuscripcion             │
│ • Requiere Token JWT de usuario autenticado            │
│ • CORS restringido exclusivamente a chipandchapa.com   │
└────────────────▲───────────────────────────────────────┘
                 │ fetch('/api/estado', { Bearer token })
┌────────────────┴────────────────┐
│ Sitio Web Estático (Navegador)  │
│ • Solo muestra: Activo / Vencido│
└─────────────────────────────────┘
```

### 2. Medidas Técnicas Obligatorias en Azure Functions
1. **Webhooks con Firma HMAC:** La Function receptora calcula el hash HMAC con el secreto almacenado y lo compara en tiempo constante (`FixedTimeEquals`) contra la firma enviada por la pasarela de pagos.
2. **Idempotencia:** Cada evento de pago incluye un `transaction_id`. Si se recibe dos veces el mismo ID (por reintentos del webhook), la Function responde HTTP 200 sin procesar duplicados.
3. **Gestión de Secretos:** Llaves de API, cadenas de conexión y secretos de webhook se guardan en **Azure Key Vault** y se consumen mediante **Managed Identities**, sin credenciales en código ni en variables expuestas.
4. **Autenticación en Consultas de Cliente:** Para consultar el estado de una suscripción, el cliente no envía la `function_key` (que es pública si viaja en frontend). Se utiliza un token JWT emitido por un proveedor de identidad (Microsoft Entra External ID / Auth0) y se valida la firma del token en la Function.
5. **CORS Estricto:** Cabecera `Access-Control-Allow-Origin: https://chipandchapa.com`. Jamás utilizar comodín (`*`).
6. **Protección de Red y Costos:** Configurar alertas de presupuesto (*Cost Management*) y límites de tasa (*Rate Limiting*) para mitigar ataques de denegación de servicio que eleven los costos de ejecución serverless.

---

## PARTE 4: Plan de Medición Objetiva y Prioridades

Para fundamentar cualquier afirmación con métricas empíricas:
1. **Lighthouse / PageSpeed Insights:** Auditar Performance, Accesibilidad, Buenas Prácticas y SEO registrando el informe JSON antes y después de cada despliegue.
2. **SecurityHeaders.com & Mozilla Observatory:** Comprobar la calificación de las cabeceras HTTP una vez activadas las reglas en Cloudflare (meta: grado A/A+).
3. **Google Search Console:** Monitorear el informe de cobertura de indexación real de las URLs enviadas en el `sitemap.xml`.
4. **Pruebas de Estrés en Webhooks:** Validar que la Azure Function rechace solicitudes con firmas alteradas, marcas de tiempo manipuladas o montos modificados.

### Matriz de Prioridad de Ejecución
| Prioridad | Acción técnica | Nivel de esfuerzo |
| :---: | :--- | :---: |
| **Alta** | Activar Cloudflare con reglas de cabeceras de seguridad (CSP, HSTS, nosniff). | Medio |
| **Alta** | Integrar Cloudflare Turnstile en el formulario para frenar bots reales. | Bajo |
| **Alta** | Diseñar Azure Functions con HMAC, Key Vault y JWT para las suscripciones del POS. | Medio |
| **Media** | Migración opcional de imágenes en uso a formato WebP/AVIF con etiqueta `<picture>`. | Medio |
| **Media** | Registro y verificación del sitio en Google Search Console y Bing Webmaster Tools. | Bajo |
| **Baja** | Evaluar autoalojamiento local de Bootstrap compilado mínimo para eliminar CDN por completo. | Bajo |
