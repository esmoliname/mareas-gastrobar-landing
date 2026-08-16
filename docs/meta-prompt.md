# META PROMPT — Mareas Gastrobar Landing (Vue 3 + Vite + Pinia + Vercel)

## Contexto
Repo: https://github.com/esmoliname/mareas-gastrobar-landing.git (rama main, auto-deploy a
https://mareas-gastrobar-landing.vercel.app/). Landing de un gastrobar en Ciudad Quesada, CR:
hero, menú con carrito, vista 3D/RA (model-viewer), galería IG, reservas por WhatsApp, panel admin.
Stack: Vue 3.5, Vite 6, Pinia, vue-router, @google/model-viewer 4.3.1, lucide-vue-next, CSS propio en
src/styles/main.css (design tokens en :root). NO hay framework CSS ni tests. Build: `npm run build`.

## Objetivos de negocio
1. Restaurante real: el sitio debe sentirse como fotos y datos verdaderos del local, no como demo IA.
2. El menú es el corazón: buscar, ver foto, ver en RA, agregar al carrito, pedir por WhatsApp.
3. Escalable: una sola fuente de verdad para horarios, contacto, fotos y modelos 3D; el admin
   (panel /admin) edita catálogo y settings en localStorage.

## Reglas duras
- NO usar emojis decorativos (🌴🍹🎉) en UI ni en copy; usar iconos de lucide-vue-next.
- NO inventar datos: likes falsos, reseñas, precios u horarios que no estén en config/site.js.
- Horarios SIEMPRE vía config.hours + utils/hours.js (format12h/toMinutes). Nada hardcodeado
  en componentes, ni en JSON-LD (se genera en src/main.js desde config+site+images).
- Fotos SIEMPRE vía src/data/images.js (fotos.real del local cuando existan; Unsplash solo como
  fallback provisional). Cada `<img>` debe usar SmartImage.vue (fallback por categoría al fallar).
- No romper el flujo RA: canActivateAR es getter booleano síncrono (Boolean(viewer.canActivateAR));
  retry recarga vía viewer.src; reset usa resetTurntableRotation(0).
- Precios en colones (formatColones), formato 12h ("11:45 p.m."), voseo costarricense.
- Archivos < 500 líneas; sin comentarios innecesarios; seguir el estilo del código existente.
- Al terminar: npm run build sin errores, git commit en estilo repo ("fix(ui): ..."/"feat(ui): ..."),
  git push origin main (Vercel despliega solo). Verificar el bundle nuevo en la URL desplegada.

## Estado actual (ya hecho, no revertir)
- ArModal arreglado (RA funciona), SmartImage + images.js creados, PlaceholderMedia eliminado,
  horarios unificados y JSON-LD dinámico, badges sin duplicados, chip de mesa con estilos en móvil,
  galería sin likes falsos, palmeras SVG en hero. Commit base: aadd76a.

## Tareas por prioridad
P1 — Fotografía real: pedir al dueño fotos del local (terraza, cócteles, pizza, mariscos) y
  reemplazar las URLs de Unsplash en images.js; subirlas a /public/photos o CDN propio.
P2 — Credenciales admin: mover admin.password fuera del bundle; exigir VITE_ADMIN_PASS en
  producción (Vercel env vars); bloquear /admin si no existe. Sin tocar hasta coordinar con el dueño.
P3 — Modelos 3D: descargar los .glb/.usdz de models3d.js a /public/models (GitHub raw es lento y
  dependiente); mapear modelo por categoría (pizza→pizza, cócteles→vaso/coctelera, etc.);
  comprimir si posible; mantener USDZ para iOS Quick Look.
P4 — Performance: hero con <img sizes> y preload de la imagen LCP; Preload el CSS crítico;
  verificar Web Vitals en Lighthouse; lazy-load SocialFeed/Experience con defineAsyncComponent.
P5 — UX menú: al filtrar por búsqueda/categoría, mantener scroll; agregar contador y "limpiar";
  skeleton loading para tarjetas; botón "Agotado" deshabilitado con mensaje claro.
P6 — Accesibilidad: focus trap en ArModal y CartDrawer, aria-expanded en chips de categoría
  (hoy role="tab" sin tabpanel), contraste del texto muted (4.5:1), alt descriptivos.
P7 — SEO/social: og:image con foto real del local, favicon PNG de 512px, actualizar canonical a
  restaurantemareascr.com solo cuando exista ese dominio; generar sitemap.xml en /public.

## Criterios de aceptación
- Lighthouse ≥ 90 en Performance/Accesibilidad/SEO (mobile).
- RA: en iOS abre Quick Look, en Android WebXR/Scene Viewer, desktop vista 360° con mensaje claro.
- Cero emojis en componentes públicos; cero datos falsos; cero horarios duplicados.
- npm run build exitoso; sitio desplegado verificado (cambia el hash de assets/index-*.js).
- Un commit por bloque lógico, mensajes en español estilo repo.

## Anti-objetivos
- No reescribir el diseño general (paleta verde/crema/dorado, Fraunces+Inter) sin pedir aprobación.
- No migrar a otro framework ni añadir CSS frameworks sin justificación.
- No almacenar credenciales en el repo ni en localStorage (solo catálogo/settings).
- No borrar funcionalidad existente (carrito, reservas, QR de mesa, panel admin).