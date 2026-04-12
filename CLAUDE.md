# GDI - Notas para Claude

## Dominio del sitio

- **URL base del sitio:** `https://gobiernodigitaleinnovacion.com`
- **Formato de URLs de artículos:** `https://gobiernodigitaleinnovacion.com/blog/articulos/YYYY-MM-DD-slug` (SIN .html al final)
- **NUNCA usar:** `gobiernodigitaleinnovacion.github.io/GDI/` — ese NO es el dominio correcto

## Stack y hosting

- **Hosting:** Netlify (`netlify.toml` + `netlify/functions/submission-created.js`)
- **Sitio:** estático HTML/CSS inline (NO Tailwind, NO frameworks)
- **Blog:** archivos HTML en `blog/articulos/`, índice en `blog/posts.json`
- **Forms:** Netlify Forms (`data-netlify="true"`)
- **DNS:** apex `gobiernodigitaleinnovacion.com` es el canónico; `www.` redirige 301 al apex

## SEO y tracking

- **Sitemap:** `sitemap.xml` en raíz, generado por `scripts/generate-sitemap.js` desde `posts.json`
- **Robots:** `robots.txt` en raíz apunta al sitemap
- **IndexNow:** clave pública en `gdi-indexnow-key-2026.txt` (raíz). Script `scripts/ping-search-engines.js` notifica a Bing/Yandex en cada publicación
- **Google Search Console:** propiedad de Dominio `gobiernodigitaleinnovacion.com` (sc-domain), sitemap enviado el 2026-04-07
- **GA4:** `G-6ZDGM6LM7J` (en `index.html`)
- **Google Ads tag:** `AW-3373421209` (en `index.html`)
- **TikTok Pixel:** `D5MHUKBC77UEK8Q4I9B0` (en `index.html`)

### Eventos de conversión instrumentados (`index.html`)

- **Form `contacto-gdi`** → `gtag('event', 'generate_lead', {value: 10})` + `form_submit`
- **WhatsApp link** → `gtag('event', 'contact', {method: 'whatsapp'})` + `generate_lead` (value: 1)
- **Email principal** → `gtag('event', 'contact', {method: 'email'})` + `generate_lead` (value: 1)
- **Email footer** → `gtag('event', 'contact', {method: 'email_footer'})` + `generate_lead` (value: 1)

Para que cuenten como conversión: marcar `generate_lead` como evento clave en GA4 → vincular GA4 con Google Ads → importar conversión.

## Google Ads — automatización de blogs

- **Cuenta operativa:** `337-342-1209` (Gobierno Digital)
- **MCC:** `395-109-8462` (JHR Manager)
- **Developer Token:** Test Account (no usado por ahora — usamos Google Ads Scripts en su lugar)
- **Campaña automatizada:** `Blog GDI - Auto`
  - Tipo: Search · Presupuesto: MXN 10/día · Estrategia: Maximizar clics · CPC max MXN 3
  - Ubicación: México · Idioma: Español
  - campaignId: `23727842049`
- **Script de auto-creación:** `scripts/google-ads-script.js`
  - Vive dentro de Google Ads (Herramientas → Acciones masivas → Secuencias de comandos)
  - Lee `https://gobiernodigitaleinnovacion.com/blog/posts.json`
  - Por cada post de los últimos 30 días: si no existe ad group con `Post: <slug>`, crea ad group + Responsive Search Ad (15 headlines, 4 descriptions) + 5 keywords broad match
  - Programado: semanal, domingos 6pm
- **No usar Performance Max para blogs** — usar Search.

## Skill `publicar-blog` (en `.claude/commands/publicar-blog.md`)

Pipeline al publicar un blog:
1. Crear HTML en `blog/articulos/YYYY-MM-DD-slug.html`
2. Agregar entrada al inicio de `blog/posts.json`
3. Actualizar `index.html` (3 destacados)
4. Crear borradores en `social-drafts/` (LinkedIn + Twitter/X)
5. **`node scripts/generate-sitemap.js`** (regenera sitemap)
6. **`node scripts/ping-search-engines.js`** (notifica IndexNow)
7. `git add . && git commit && git push`

El paso de Google Ads NO está aquí — el Google Ads Script lo detecta solo en su próxima corrida semanal.

## Estilo visual

- **Color principal:** `#667eea` (púrpura)
- **Color secundario:** `#764ba2` (violeta)
- **Gradiente:** `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`
- **CSS:** Inline (NO Tailwind)
- **Iconos:** Font Awesome 6.5
