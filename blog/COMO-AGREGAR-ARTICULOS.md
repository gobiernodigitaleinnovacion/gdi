# Cómo Agregar Artículos al Blog de GDI

## Pasos Rápidos

### 1. Crear el archivo HTML del artículo

Ubicación: `blog/articulos/YYYY-MM-DD-nombre-del-articulo.html`

Ejemplo: `blog/articulos/2025-12-13-toluca-finanzas-publicas-2024.html`

### 2. Actualizar posts.json

Agregar al inicio del array en `blog/posts.json`:

```json
{
  "title": "Título del Artículo",
  "slug": "nombre-del-articulo",
  "date": "2025-12-13",
  "author": "Juan Heriberto Rosas",
  "category": "Finanzas Municipales",
  "categoryColor": "purple",
  "image": "",
  "excerpt": "Descripción corta del artículo (máximo 200 caracteres)",
  "url": "blog/articulos/2025-12-13-nombre-del-articulo.html",
  "readTime": "10 min",
  "featured": true
}
```

### 3. Actualizar index.html (opcional)

Si quieres que el artículo aparezca en la página principal, actualiza la sección de blog en `index.html`.

### 4. Crear borradores para redes sociales

Ubicación: `social-drafts/`
- `linkedin-YYYY-MM-DD-nombre.txt`
- `twitter-x-YYYY-MM-DD-nombre.txt`

### 5. Git commit y push

```bash
cd C:\paginas\GDI
git add .
git commit -m "Nuevo post: [Título del artículo]"
git push
```

## Categorías Disponibles

| Categoría | Color | Uso |
|-----------|-------|-----|
| Finanzas Municipales | purple | Análisis de finanzas públicas |
| Alerta | red | Situaciones críticas/problemas |
| Economía | green | Datos económicos generales |
| Tecnología | blue | Innovación y transformación digital |

## Estilo GDI

El blog de GDI usa:
- **Colores primarios:** #667eea (púrpura) y #764ba2 (violeta)
- **Gradientes:** `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`
- **Fuente:** Inter, system fonts
- **Iconos:** Font Awesome 6.5

## Checklist Final

- [ ] Archivo HTML creado en `blog/articulos/`
- [ ] Entrada agregada a `blog/posts.json`
- [ ] Sección blog en `index.html` actualizada (si aplica)
- [ ] Borradores para redes sociales creados
- [ ] Git commit y push
