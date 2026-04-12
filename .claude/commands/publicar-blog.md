# Skill: Publicar Blog en GDI Data

Cuando el usuario invoque este comando, sigue estos pasos para publicar un nuevo artículo en el blog de GDI.

## Información del proyecto

- **Ruta del proyecto:** C:\paginas\GDI
- **Artículos HTML:** blog/articulos/
- **Base de datos de posts:** blog/posts.json
- **Página principal:** index.html
- **Borradores redes:** social-drafts/
- **Página del blog:** blog.html

## Estilo Visual GDI

- **Color principal:** #667eea (púrpura)
- **Color secundario:** #764ba2 (violeta)
- **Gradiente:** `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`
- **CSS:** Inline (NO usa Tailwind)
- **Iconos:** Font Awesome 6.5

## Datos que necesitas del usuario

1. **Título** del artículo
2. **Categoría** (Finanzas Municipales, Alerta, Economía, Tecnología)
3. **Contenido** completo del artículo

## Categorías y colores

| Categoría | categoryColor | Uso |
|-----------|---------------|-----|
| Finanzas Municipales | purple | Análisis de finanzas públicas |
| Alerta | red | Situaciones críticas/problemas |
| Economía | green | Datos económicos generales |
| Tecnología | blue | Innovación y transformación digital |

## Pasos a ejecutar

### 1. Crear archivo HTML del artículo

- **Nombre del archivo:** `YYYY-MM-DD-slug-del-titulo.html`
- **Ubicación:** `blog/articulos/`
- **Usar como plantilla:** Cualquier artículo existente en esa carpeta (usan CSS inline, NO Tailwind)
- **Gradientes por categoría:**
  - Finanzas Municipales: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`
  - Alerta: `linear-gradient(135deg, #ef4444 0%, #dc2626 100%)`
  - Economía: `linear-gradient(135deg, #10b981 0%, #059669 100%)`
  - Tecnología: `linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)`
- **Tags de tracking (OBLIGATORIO en el `<head>`):** Incluir GA4 (`G-6ZDGM6LM7J`), Google Ads (`AW-3373421209`) y TikTok Pixel (`D5MHUKBC77UEK8Q4I9B0`) — copiar el bloque de scripts de cualquier artículo existente que ya los tenga

### 2. Actualizar posts.json

- Agregar nueva entrada AL INICIO del array
- Formato:
```json
{
  "title": "Título del artículo",
  "slug": "slug-del-titulo",
  "date": "YYYY-MM-DD",
  "author": "Juan Heriberto Rosas",
  "category": "Categoría",
  "categoryColor": "purple|red|green|blue",
  "image": "",
  "excerpt": "Resumen de 2-3 líneas (máximo 200 caracteres)",
  "url": "blog/articulos/YYYY-MM-DD-slug.html",
  "readTime": "X min",
  "featured": true,
  "keywords": ["keyword 1", "keyword 2", "keyword 3", "keyword 4", "keyword 5"]
}
```

**Keywords para Google Ads (OBLIGATORIO):**
- 5-6 frases que la gente REALMENTE busca en Google relacionadas al tema
- NO extraer palabras del slug mecánicamente
- Pensar: "¿qué escribiría alguien en Google para encontrar este artículo?"
- Incluir ubicación (ej: "deuda tijuana", "minería sinaloa") cuando el artículo habla de un lugar específico
- Incluir el sector/industria + "méxico" (ej: "seguros en méxico", "industria cárnica méxico")
- Máximo 4-5 palabras por keyword
- Los scripts de Google Ads leen este campo automáticamente

### 3. Actualizar index.html

- Buscar la sección de blog en index.html
- El nuevo artículo va como **PRIMERO** de los destacados
- Mover los demás hacia abajo
- **ELIMINAR** el último artículo para mantener solo 3

### 4. Crear borrador LinkedIn

**Ubicación:** `social-drafts/linkedin-YYYY-MM-DD-slug.txt`

**Formato VIRAL CON ESTRUCTURA VISUAL:**

```
[EMOJI_TEMA]🔥 [TÍTULO EN MAYÚSCULAS] 🔥[EMOJI_TEMA]

📊 Nuevo análisis publicado en GDI Data

🇲🇽 [Gancho inicial que genere curiosidad con pregunta] 👇

━━━━━━━━━━━━━━━━━━━━━━

💡 LOS HALLAZGOS CLAVE:

✅ [Punto 1 con DATO DURO en mayúsculas]
✅ [Punto 2 con número impactante]
✅ [Punto 3]
✅ [Punto 4]
✅ [Punto 5]
✅ [Punto 6 si aplica]

━━━━━━━━━━━━━━━━━━━━━━

📈 EL DATO QUE IMPACTA:

🚨 [Dato más sorprendente del artículo]

⚡ [Comparación que dimensione el dato]

━━━━━━━━━━━━━━━━━━━━━━

⚠️ EL PROBLEMA CRÍTICO: (si aplica)

❌ [Problema 1]
❌ [Problema 2]
❌ [Problema 3]

━━━━━━━━━━━━━━━━━━━━━━

💭 LA REFLEXIÓN:

"[Frase memorable o cita del artículo en cursiva]"

🎯 [Conclusión con llamado a la acción]

━━━━━━━━━━━━━━━━━━━━━━

👉 Lee el análisis completo: [URL]

🔄 COMPARTE si crees que [mensaje relacionado al tema]

💬 ¿Qué opinas? [Pregunta que invite al debate]

━━━━━━━━━━━━━━━━━━━━━━

#[25-35 hashtags relevantes separados por espacios]
```

**Reglas LinkedIn ESTRICTAS:**
- **MÍNIMO 25-35 hashtags** (más hashtags = más alcance)
- **Emojis en CADA sección** (mínimo 15-20 emojis en todo el post)
- **Separadores visuales** con ━━━━━━ entre secciones
- **Datos duros en MAYÚSCULAS** para destacar
- **Preguntas** al inicio y final para engagement
- **Llamado a COMPARTIR** explícito
- Usar emojis de banderas cuando menciones países (🇲🇽🇯🇵🇫🇷🇩🇪)
- Usar 🚨⚠️❌ para problemas/alertas
- Usar ✅📈💡🎯 para puntos positivos

**Hashtags base GDI (usar siempre + agregar específicos del tema):**
#INEGI #México #GDIData #AnálisisDeDatos #DatosAbiertos #Transparencia #GobiernoDigital #TransformaciónDigital #BigData #DataAnalytics #DataDriven #OpenData

### 5. Crear borrador Twitter/X

**Ubicación:** `social-drafts/twitter-x-YYYY-MM-DD-slug.txt`

**Formato UN SOLO TWEET VIRAL:**

```
[EMOJI]🔥 [Dato impactante o gancho corto]

[Frase memorable o insight clave] [EMOJI_ALERTA]

👉 [URL]

#[3-5 hashtags] 🇲🇽
```

**Reglas Twitter/X ESTRICTAS:**
- **MÁXIMO 280 caracteres** (contar bien)
- **UN solo tweet**, NUNCA hilo
- **Solo 3-5 hashtags** (Twitter penaliza muchos)
- **Emojis al inicio y final** (mínimo 3-4)
- **Ir al grano** con el dato más impactante
- Terminar con bandera 🇲🇽

### 6. Regenerar sitemap, notificar buscadores y crear Google Ad

**OBLIGATORIO antes del commit.** Ejecutar en orden:

```bash
cd "C:\paginas\GDI"
node scripts/generate-sitemap.js
node scripts/ping-search-engines.js
node scripts/google-ads-publish.js
```

- `generate-sitemap.js` — regenera sitemap.xml desde posts.json
- `ping-search-engines.js` — ping IndexNow (Bing/Yandex)
- `google-ads-publish.js` — crea Ad Group + RSA + Keywords en Google Ads para el último post

Si alguno falla, NO abortes el commit — repórtalo al usuario pero continúa.
Si `.env` no existe o le faltan variables, `google-ads-publish.js` imprime error y sigue.

### 7. Git commit y push

```bash
cd "C:\paginas\GDI"
git add .
git commit -m "Nuevo post: [Título del artículo]"
git push origin main
```

## Checklist final (verificar todo antes de terminar)

- [ ] HTML creado en blog/articulos/
- [ ] posts.json actualizado (entrada al inicio)
- [ ] index.html actualizado (3 artículos, nuevo primero)
- [ ] Borrador LinkedIn con emojis y 15+ hashtags
- [ ] Borrador Twitter/X UN solo tweet
- [ ] sitemap.xml regenerado (node scripts/generate-sitemap.js)
- [ ] Ping a IndexNow ejecutado (node scripts/ping-search-engines.js)
- [ ] Google Ad creado (node scripts/google-ads-publish.js)
- [ ] Git commit y push completado

## Respuesta al usuario

Al terminar, mostrar:
1. Archivos creados/modificados
2. URL del artículo
3. Google Ad creado (o error si falló)
4. Recordatorio de publicar en LinkedIn y Twitter/X manualmente

## Diferencias con LokusData

- GDI usa CSS inline, NO Tailwind
- Colores púrpura/violeta en lugar de azul
- Categorías enfocadas en gobierno/finanzas públicas
- CTA dirige a gdidata.com, no a LokusAnalytics
- Hashtags más enfocados en sector público y transparencia
