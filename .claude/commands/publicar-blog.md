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
  "featured": true
}
```

### 3. Actualizar index.html

- Buscar la sección de blog en index.html
- El nuevo artículo va como **PRIMERO** de los destacados
- Mover los demás hacia abajo
- **ELIMINAR** el último artículo para mantener solo 3

### 4. Crear borrador LinkedIn

**Ubicación:** `social-drafts/linkedin-YYYY-MM-DD-slug.txt`

**Formato CON MUCHOS EMOJIS y HASHTAGS:**

```
🚀🔥 [TÍTULO EN MAYÚSCULAS] 🔥🚀

📊 Nuevo análisis publicado en GDI Data

[Gancho inicial con emoji relevante]

💡 Los hallazgos clave:

✅ [Punto 1]
✅ [Punto 2]
✅ [Punto 3]
✅ [Punto 4]
✅ [Punto 5]

📈 [Dato impactante destacado]

🎯 [Conclusión o llamado a la acción]

👉 Lee el análisis completo: [URL]

━━━━━━━━━━━━━━━━━━━━━━

#FinanzasPúblicas #GobiernosMunicipales #Transparencia #DatosAbiertos #INEGI #México #AnálisisDeDatos #GDIData #AdministraciónPública #Municipios #Presupuesto #DeudaPública #GestiónPública #Gobierno #PolíticaPública #Accountability #TransparenciaFiscal #[+relevantes al tema]
```

**Reglas LinkedIn:**
- Mínimo 15-20 hashtags
- Emojis en cada sección
- Formato visual con líneas separadoras
- Datos duros destacados con emojis

### 5. Crear borrador Twitter/X

**Ubicación:** `social-drafts/twitter-x-YYYY-MM-DD-slug.txt`

**Formato UN SOLO TWEET (no hilo):**

```
🚀 [Título corto o gancho]

[1-2 datos impactantes máximo]

👉 [URL]

#INEGI #México #FinanzasMunicipales
```

**Reglas Twitter/X:**
- MÁXIMO 280 caracteres
- UN solo tweet, NUNCA hilo
- Solo 3-5 hashtags
- Ir al grano

### 6. Git commit y push

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
- [ ] Git commit y push completado

## Respuesta al usuario

Al terminar, mostrar:
1. Archivos creados/modificados
2. URL del artículo
3. Recordatorio de publicar en LinkedIn y Twitter/X manualmente

## Diferencias con LokusData

- GDI usa CSS inline, NO Tailwind
- Colores púrpura/violeta en lugar de azul
- Categorías enfocadas en gobierno/finanzas públicas
- CTA dirige a gdidata.com, no a LokusAnalytics
- Hashtags más enfocados en sector público y transparencia
