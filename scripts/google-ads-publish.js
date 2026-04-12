#!/usr/bin/env node
/**
 * Crea Responsive Search Ads en Google Ads para posts del blog GDI.
 *
 * Uso:
 *   node scripts/google-ads-publish.js                # último post de posts.json
 *   node scripts/google-ads-publish.js --slug=mi-slug # post específico
 *   node scripts/google-ads-publish.js --all          # backfill: todos los que no tengan ad
 *   node scripts/google-ads-publish.js --dry-run      # no envía a Ads, solo imprime
 *
 * Tracking: scripts/.ads-published.json registra qué slugs ya tienen anuncio.
 *
 * Requiere variables en .env
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');

const SITE = 'https://gobiernodigitaleinnovacion.com';
const POSTS_FILE = path.join(__dirname, '..', 'blog', 'posts.json');
const PUBLISHED_FILE = path.join(__dirname, '.ads-published.json');

function loadPublished() {
  try { return JSON.parse(fs.readFileSync(PUBLISHED_FILE, 'utf8')); }
  catch { return {}; }
}
function savePublished(map) {
  fs.writeFileSync(PUBLISHED_FILE, JSON.stringify(map, null, 2));
}

// ---------- Helpers ----------

function truncate(str, max) {
  str = (str || '').replace(/\s+/g, ' ').trim();
  if (str.length <= max) return str;
  return str.slice(0, max - 1).trimEnd() + '…';
}

function dedupe(arr) {
  const seen = new Set();
  return arr.filter(s => {
    const k = s.toLowerCase();
    if (seen.has(k) || !s || s.length < 3) return false;
    seen.add(k);
    return true;
  });
}

function buildHeadlines(post) {
  const title = (post.title || '').replace(/[¿¡!?"]/g, '').trim();
  const cat = post.category || 'Análisis';
  const year = (post.date || '').slice(0, 4);
  const candidates = [
    truncate(title, 30),
    truncate('GDI Data: ' + title, 30),
    truncate('Análisis ' + cat + ' ' + year, 30),
    'Datos abiertos México',
    'Análisis de datos públicos',
    'Inteligencia gubernamental',
    'INEGI · Censo · Datos',
    truncate(cat + ' en México', 30),
    'Datos que sí importan',
    'Lee el análisis completo',
    'Transparencia con datos',
    'Gobierno Digital MX',
    truncate('Estudio: ' + title, 30),
    'Decisiones con datos',
    truncate('GDI · Análisis ' + year, 30),
  ];
  return dedupe(candidates).slice(0, 15);
}

function buildDescriptions(post) {
  const excerpt = (post.excerpt || '').replace(/\s+/g, ' ').trim();
  const candidates = [
    truncate(excerpt, 90),
    truncate('Análisis con datos oficiales del INEGI y fuentes públicas. Lee el reporte en GDI.', 90),
    truncate('Gobierno Digital e Innovación: análisis de datos para mejores decisiones públicas.', 90),
    truncate('Categoría: ' + (post.category || 'Análisis') + '. ' + excerpt, 90),
  ];
  return dedupe(candidates).slice(0, 4);
}

// ---------- Keywords ----------

const STOP_WORDS = new Set([
  'de','la','el','en','y','a','que','los','las','un','una','del','al',
  'para','con','por','lo','mas','no','es','se','sin','como','sus',
]);

function buildKeywords(post) {
  // Use keywords from posts.json if available
  if (post.keywords && post.keywords.length > 0) {
    return post.keywords;
  }
  // Fallback for posts without keywords field
  const cat = (post.category || '').toLowerCase();
  const titleWords = (post.title || '').toLowerCase()
    .replace(/[¿¡!?".:,;()%0-9]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 3 && !STOP_WORDS.has(w));
  const phrases = [];
  if (titleWords.length >= 2) {
    phrases.push(titleWords.slice(0, 2).join(' ') + ' méxico');
    phrases.push(titleWords.slice(0, 2).join(' '));
  }
  if (cat) {
    phrases.push(`${cat} méxico datos`);
    phrases.push(`análisis ${cat} méxico`);
  }
  phrases.push('datos públicos méxico');
  const seen = new Set();
  return phrases.filter(kw => {
    const k = kw.toLowerCase().trim();
    if (!k || seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

async function addKeywords(customer, adGroupResource, post) {
  const keywords = buildKeywords(post);
  for (const kw of keywords) {
    try {
      await customer.adGroupCriteria.create([{
        ad_group: adGroupResource,
        keyword: { text: kw, match_type: 'PHRASE' },
        status: 'ENABLED',
      }]);
      console.log(`  🔑 Keyword: ${kw}`);
    } catch (e) {
      console.log(`  ⚠️  Keyword "${kw}": ${e.errors?.[0]?.message || e.message}`);
    }
  }
}

// ---------- Ad Group + RSA creation ----------

async function createAdGroup(customer, campaignResource, name) {
  const result = await customer.adGroups.create([{
    campaign: campaignResource,
    name,
    status: 'ENABLED',
    type: 'SEARCH_STANDARD',
    cpc_bid_micros: 3_000_000, // $3 MXN max CPC
  }]);
  return result.results?.[0]?.resource_name;
}

function pickPosts(posts, { slug, all, published }) {
  if (slug) {
    const p = posts.find(p => p.slug === slug);
    if (!p) throw new Error(`Post no encontrado: ${slug}`);
    return [p];
  }
  if (all) {
    return posts.filter(p => !published[p.slug]);
  }
  return [posts[0]];
}

async function publishOne(post, { dryRun, customer, campaignResource, published }) {
  const finalUrl = `${SITE}/${post.url}`;

  const headlines = buildHeadlines(post);
  const descriptions = buildDescriptions(post);

  console.log('📝 Post:', post.title);
  console.log('🔗 URL:', finalUrl);
  console.log('📰 Headlines:', headlines.length);
  headlines.forEach((h, i) => console.log(`  ${i + 1}. [${h.length}] ${h}`));
  console.log('📄 Descriptions:', descriptions.length);
  descriptions.forEach((d, i) => console.log(`  ${i + 1}. [${d.length}] ${d}`));

  if (headlines.length < 3 || descriptions.length < 2) {
    throw new Error('Faltan headlines (≥3) o descriptions (≥2)');
  }

  if (dryRun) {
    console.log('  🟡 dry-run, no se envió');
    return { ok: true, dryRun: true };
  }

  const adGroupName = truncate(`Post: ${post.slug}`, 255);
  console.log(`  📂 Creando ad group: ${adGroupName}`);
  const adGroupResource = await createAdGroup(customer, campaignResource, adGroupName);
  console.log(`  📂 Ad group: ${adGroupResource}`);

  try {
    const result = await customer.adGroupAds.create([{
      ad_group: adGroupResource,
      status: 'ENABLED',
      ad: {
        final_urls: [finalUrl],
        responsive_search_ad: {
          headlines: headlines.map(text => ({ text })),
          descriptions: descriptions.map(text => ({ text })),
          path1: 'blog',
          path2: 'analisis',
        },
      },
    }]);
    const resourceName = result.results?.[0]?.resource_name || 'unknown';
    console.log(`  ✅ Creado: ${resourceName}`);
    await addKeywords(customer, adGroupResource, post);
    published[post.slug] = {
      resource_name: resourceName,
      ad_group: adGroupResource,
      created_at: new Date().toISOString(),
      url: finalUrl,
    };
    return { ok: true, resourceName };
  } catch (e) {
    console.error('  ❌ Error:', e.errors ? JSON.stringify(e.errors) : e.message);
    return { ok: false, error: e };
  }
}

// ---------- Main ----------
async function main() {
  const args = process.argv.slice(2);
  const slugArg = args.find(a => a.startsWith('--slug='));
  const slug = slugArg ? slugArg.split('=')[1] : null;
  const all = args.includes('--all');
  const dryRun = args.includes('--dry-run');

  const posts = JSON.parse(fs.readFileSync(POSTS_FILE, 'utf8'));
  const published = loadPublished();
  const targets = pickPosts(posts, { slug, all, published });

  if (!targets.length) {
    console.log('✅ Nada que hacer: todos los posts ya tienen anuncio.');
    return;
  }

  console.log(`📦 ${targets.length} post(s) a procesar${all ? ' (modo backfill)' : ''}`);

  let customer = null, campaignResource = null;
  if (!dryRun) {
    const required = [
      'GOOGLE_ADS_DEVELOPER_TOKEN',
      'GOOGLE_ADS_CLIENT_ID',
      'GOOGLE_ADS_CLIENT_SECRET',
      'GOOGLE_ADS_REFRESH_TOKEN',
      'GOOGLE_ADS_CUSTOMER_ID',
      'GOOGLE_ADS_CAMPAIGN_ID',
    ];
    const missing = required.filter(k => !process.env[k]);
    if (missing.length) {
      console.error(`\n❌ Faltan variables en .env: ${missing.join(', ')}`);
      process.exit(1);
    }
    let GoogleAdsApi;
    try { ({ GoogleAdsApi } = require('google-ads-api')); }
    catch { console.error('❌ Falta dependencia. npm install'); process.exit(1); }

    const client = new GoogleAdsApi({
      client_id: process.env.GOOGLE_ADS_CLIENT_ID,
      client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET,
      developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
    });
    customer = client.Customer({
      customer_id: process.env.GOOGLE_ADS_CUSTOMER_ID,
      login_customer_id: process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID || undefined,
      refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN,
    });
    campaignResource = `customers/${process.env.GOOGLE_ADS_CUSTOMER_ID}/campaigns/${process.env.GOOGLE_ADS_CAMPAIGN_ID}`;
  }

  let ok = 0, fail = 0;
  for (let i = 0; i < targets.length; i++) {
    const post = targets[i];
    console.log(`\n[${i + 1}/${targets.length}] ${post.title}`);
    const r = await publishOne(post, { dryRun, customer, campaignResource, published });
    if (r.ok) ok++; else fail++;
    if (all && i < targets.length - 1) await new Promise(r => setTimeout(r, 1000));
  }

  if (!dryRun) savePublished(published);
  console.log(`\n🎯 Resumen: ${ok} OK, ${fail} fallos`);
  if (fail) process.exit(1);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
