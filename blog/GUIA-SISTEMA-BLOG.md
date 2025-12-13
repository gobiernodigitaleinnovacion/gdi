# Guía del Sistema de Blog - GDI

## Estructura del Blog

```
C:\paginas\GDI\
├── blog.html              # Página de listado de artículos
├── blog/
│   ├── posts.json         # Base de datos de artículos
│   ├── articulos/         # Carpeta con los artículos HTML
│   │   ├── 2025-12-13-toluca-finanzas-publicas-2024.html
│   │   ├── 2025-12-06-tijuana-municipio-mas-endeudado.html
│   │   └── 2025-11-22-uruapan-falla-tecnica-deuda-heredada.html
│   ├── COMO-AGREGAR-ARTICULOS.md
│   └── GUIA-SISTEMA-BLOG.md
├── social-drafts/         # Borradores para redes sociales
└── index.html             # Página principal (incluye sección blog)
```

## Cómo Funciona

### 1. posts.json

El archivo `blog/posts.json` es la "base de datos" del blog. Contiene un array JSON con todos los artículos ordenados del más reciente al más antiguo.

```json
[
  {
    "title": "Título del artículo",
    "slug": "slug-url-amigable",
    "date": "YYYY-MM-DD",
    "author": "Autor",
    "category": "Categoría",
    "categoryColor": "purple|red|green|blue",
    "excerpt": "Descripción corta",
    "url": "ruta/al/articulo.html",
    "readTime": "X min",
    "featured": true|false
  }
]
```

### 2. blog.html

La página de listado carga dinámicamente los artículos desde `posts.json` usando JavaScript:

```javascript
async function loadPosts() {
    const response = await fetch('blog/posts.json');
    const posts = await response.json();
    // Renderiza las tarjetas de artículos
}
```

### 3. Plantilla de Artículo

Los artículos individuales son archivos HTML estáticos ubicados en `blog/articulos/`. Cada artículo incluye:

- Header con navegación
- Metadatos (fecha, categoría, tiempo de lectura)
- Contenido del artículo
- CTA box hacia la plataforma GDI
- Footer

## Estilo Visual GDI

### Paleta de Colores

```css
--primary-color: #667eea;     /* Púrpura principal */
--secondary-color: #764ba2;   /* Violeta secundario */
--danger-color: #ef4444;      /* Rojo para alertas */
--dark-color: #1e293b;        /* Texto oscuro */
--light-gray: #f8fafc;        /* Fondo claro */
--medium-gray: #64748b;       /* Texto secundario */
```

### Gradientes

```css
--gradient-primary: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
--gradient-danger: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
```

### Componentes Reutilizables

1. **Callout boxes:**
   - `.callout-info` - Información general (púrpura)
   - `.callout-warning` - Advertencias (amarillo)
   - `.callout-danger` - Alertas críticas (rojo)
   - `.callout-success` - Datos positivos (verde)

2. **Tablas de datos:**
   - `.data-table` - Tabla con header gradiente

3. **CTA Box:**
   - `.cta-box` - Caja de llamada a acción

## Diferencias con LokusData

| Aspecto | LokusData | GDI |
|---------|-----------|-----|
| Color principal | Azul (#2563eb) | Púrpura (#667eea) |
| Estilo | Más comercial | Más gubernamental |
| CTA | LokusAnalytics | gdidata.com |
| CSS | Tailwind | CSS inline |

## Flujo de Publicación

1. **Redactar contenido** en formato de artículo
2. **Crear archivo HTML** siguiendo la plantilla
3. **Actualizar posts.json** con la nueva entrada
4. **Actualizar index.html** si es artículo destacado
5. **Crear borradores** para LinkedIn y Twitter
6. **Commit y push** a GitHub
7. **Publicar en redes sociales**

## Mantenimiento

### Agregar nuevo artículo
Ver: `COMO-AGREGAR-ARTICULOS.md`

### Modificar diseño
Editar los estilos inline en cada archivo HTML o crear un archivo CSS global.

### Actualizar categorías
Modificar el posts.json y los estilos correspondientes.
