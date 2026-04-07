#!/usr/bin/env node
/**
 * Genera sitemap.xml a partir de blog/posts.json + páginas estáticas.
 * Uso: node scripts/generate-sitemap.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SITE = 'https://gobiernodigitaleinnovacion.com';

const staticPages = [
  { loc: '/',           changefreq: 'weekly',  priority: '1.0' },
  { loc: '/blog.html',  changefreq: 'daily',   priority: '0.9' },
  { loc: '/pdf.html',   changefreq: 'monthly', priority: '0.5' },
];

const posts = JSON.parse(fs.readFileSync(path.join(ROOT, 'blog', 'posts.json'), 'utf8'));

const today = new Date().toISOString().slice(0, 10);

const urls = [
  ...staticPages.map(p => ({
    loc: SITE + p.loc,
    lastmod: today,
    changefreq: p.changefreq,
    priority: p.priority,
  })),
  ...posts.map(p => ({
    // URL pública SIN .html (regla CLAUDE.md)
    loc: `${SITE}/blog/articulos/${path.basename(p.url, '.html')}`,
    lastmod: p.date,
    changefreq: 'monthly',
    priority: '0.8',
  })),
];

const xml =
  `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  urls.map(u =>
    `  <url>\n` +
    `    <loc>${u.loc}</loc>\n` +
    `    <lastmod>${u.lastmod}</lastmod>\n` +
    `    <changefreq>${u.changefreq}</changefreq>\n` +
    `    <priority>${u.priority}</priority>\n` +
    `  </url>`
  ).join('\n') +
  `\n</urlset>\n`;

fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), xml);
console.log(`✅ sitemap.xml generado con ${urls.length} URLs`);
