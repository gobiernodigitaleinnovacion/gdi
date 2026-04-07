#!/usr/bin/env node
/**
 * Notifica a buscadores que el sitemap se actualizó.
 * - Google ya descontinuó /ping, pero IndexNow (Bing/Yandex) sí funciona y Google
 *   re-rastrea rápido cuando ve cambios en sitemap referenciado por robots.txt.
 * Uso: node scripts/ping-search-engines.js
 */
const https = require('https');
const fs = require('fs');
const path = require('path');

const SITE_HOST = 'gobiernodigitaleinnovacion.com';
const SITE = `https://${SITE_HOST}`;
const SITEMAP = `${SITE}/sitemap.xml`;

// IndexNow key — archivo público en raíz: <key>.txt con el mismo contenido
const INDEXNOW_KEY = 'gdi-indexnow-key-2026';

const posts = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', 'blog', 'posts.json'), 'utf8')
);

// Tomamos los 3 más recientes para empujarlos
const recent = posts.slice(0, 3).map(
  p => `${SITE}/blog/articulos/${path.basename(p.url, '.html')}`
);

const payload = JSON.stringify({
  host: SITE_HOST,
  key: INDEXNOW_KEY,
  keyLocation: `${SITE}/${INDEXNOW_KEY}.txt`,
  urlList: [SITE + '/', SITEMAP, ...recent],
});

const req = https.request(
  {
    hostname: 'api.indexnow.org',
    path: '/IndexNow',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Length': Buffer.byteLength(payload),
    },
  },
  res => {
    console.log(`IndexNow respondió: ${res.statusCode}`);
    res.on('data', d => process.stdout.write(d));
  }
);

req.on('error', e => console.error('IndexNow error:', e.message));
req.write(payload);
req.end();
