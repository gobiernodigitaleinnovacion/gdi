/**
 * GDI BLOG AUTO-ADS — Google Ads Script
 * ─────────────────────────────────────────────────────────────
 * Este script vive DENTRO de Google Ads (no en Netlify, no en tu PC).
 * Cada vez que corre:
 *   1. Lee https://gobiernodigitaleinnovacion.com/blog/posts.json
 *   2. Para cada post de los últimos 30 días, revisa si ya existe
 *      un Ad Group con el slug del post en la campaña configurada.
 *   3. Si NO existe → crea el Ad Group + Responsive Search Ad +
 *      keywords (broad match) derivadas del slug y categoría.
 *
 * REQUISITOS PREVIOS (los haces UNA sola vez en la UI de Google Ads):
 *   - Crear una campaña Search llamada exactamente: "Blog GDI - Auto"
 *   - Tipo: Búsqueda (Search)
 *   - Presupuesto: $10 MXN/día
 *   - Ubicación: México
 *   - Idioma: Español
 *   - Estrategia de oferta: "Maximizar clics" (Maximize Clicks)
 *   - Dejarla en PAUSA
 *
 * DÓNDE PEGAR ESTE SCRIPT:
 *   Google Ads → Herramientas y configuración → ACCIONES MASIVAS → Scripts
 *   → botón "+" → pega TODO este archivo → Autorizar → Vista previa →
 *   Ejecutar → Programar (Diario, 09:00)
 * ─────────────────────────────────────────────────────────────
 */

// ─── CONFIGURACIÓN ────────────────────────────────────────────
var CONFIG = {
  CAMPAIGN_NAME: 'Blog GDI - Auto',
  POSTS_JSON_URL: 'https://gobiernodigitaleinnovacion.com/blog/posts.json',
  SITE_BASE_URL: 'https://gobiernodigitaleinnovacion.com',
  DAYS_LOOKBACK: 30,           // solo procesa posts de los últimos N días
  MAX_CPC_BID_MICROS: 3000000, // 3 MXN máximo por clic (3 * 1,000,000)
  KEYWORD_MATCH_TYPE: 'PHRASE', // BROAD | PHRASE | EXACT
  DEFAULT_PATH_1: 'blog',
  DEFAULT_PATH_2: 'analisis',
};

// ─── ENTRY POINT ──────────────────────────────────────────────
function main() {
  Logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  Logger.log('GDI Blog Auto-Ads — corrida ' + new Date());
  Logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  var campaign = findCampaign(CONFIG.CAMPAIGN_NAME);
  if (!campaign) {
    Logger.log('❌ No se encontró la campaña "' + CONFIG.CAMPAIGN_NAME + '".');
    Logger.log('   Créala manualmente en la UI con los specs del header del script.');
    return;
  }
  Logger.log('✅ Campaña encontrada: ' + campaign.getName());

  var posts = fetchPosts();
  if (!posts || posts.length === 0) {
    Logger.log('❌ No se pudo leer posts.json o está vacío.');
    return;
  }
  Logger.log('📚 Posts totales en feed: ' + posts.length);

  var recent = filterRecent(posts, CONFIG.DAYS_LOOKBACK);
  Logger.log('📅 Posts dentro de los últimos ' + CONFIG.DAYS_LOOKBACK + ' días: ' + recent.length);

  var created = 0;
  var skipped = 0;
  var repaired = 0;
  var errors = 0;

  for (var i = 0; i < recent.length; i++) {
    var post = recent[i];
    try {
      var adGroupName = 'Post: ' + post.slug;
      var existingAdGroup = getAdGroup(campaign, adGroupName);
      if (existingAdGroup) {
        if (!adGroupHasKeywords(existingAdGroup)) {
          Logger.log('🔧 Reparando keywords: ' + adGroupName);
          addKeywords(existingAdGroup, post);
          repaired++;
        } else {
          Logger.log('⏭️  Ya existe y tiene keywords: ' + adGroupName);
          skipped++;
        }
        continue;
      }
      var adGroup = createAdGroup(campaign, adGroupName);
      createResponsiveSearchAd(adGroup, post);
      addKeywords(adGroup, post);
      Logger.log('🎉 CREADO: ' + adGroupName);
      created++;
    } catch (e) {
      Logger.log('💥 Error con post "' + post.slug + '": ' + e);
      errors++;
    }
  }

  Logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  Logger.log('Resumen: ' + created + ' creados · ' + repaired + ' reparados · ' + skipped + ' ya existían · ' + errors + ' errores');
  Logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

// ─── HELPERS ──────────────────────────────────────────────────

function findCampaign(name) {
  var iter = AdsApp.campaigns()
    .withCondition('Name = "' + name + '"')
    .get();
  return iter.hasNext() ? iter.next() : null;
}

function fetchPosts() {
  try {
    var response = UrlFetchApp.fetch(CONFIG.POSTS_JSON_URL, { muteHttpExceptions: true });
    if (response.getResponseCode() !== 200) {
      Logger.log('HTTP ' + response.getResponseCode() + ' al leer posts.json');
      return null;
    }
    return JSON.parse(response.getContentText());
  } catch (e) {
    Logger.log('Error fetch posts.json: ' + e);
    return null;
  }
}

function filterRecent(posts, days) {
  var cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return posts.filter(function (p) {
    var d = new Date(p.date);
    return d >= cutoff;
  });
}

function getAdGroup(campaign, name) {
  var iter = campaign.adGroups()
    .withCondition('Name = "' + name.replace(/"/g, '\\"') + '"')
    .get();
  return iter.hasNext() ? iter.next() : null;
}

function removeAllKeywords(adGroup) {
  var iter = adGroup.keywords().get();
  var count = 0;
  while (iter.hasNext()) {
    iter.next().remove();
    count++;
  }
  Logger.log('  🗑️ Eliminadas ' + count + ' keywords viejas');
}

function adGroupHasKeywords(adGroup) {
  var iter = adGroup.keywords().get();
  return iter.totalNumEntities() > 0;
}

function createAdGroup(campaign, name) {
  var op = campaign.newAdGroupBuilder()
    .withName(name)
    .withCpc(CONFIG.MAX_CPC_BID_MICROS / 1000000) // CPC en moneda de la cuenta
    .withStatus('ENABLED')
    .build();
  if (!op.isSuccessful()) {
    throw new Error('AdGroup build falló: ' + op.getErrors().join(', '));
  }
  return op.getResult();
}

function createResponsiveSearchAd(adGroup, post) {
  var headlines = buildHeadlines(post);
  var descriptions = buildDescriptions(post);
  var finalUrl = CONFIG.SITE_BASE_URL + '/' + post.url.replace(/\.html$/, '');

  var op = adGroup.newAd().responsiveSearchAdBuilder()
    .withHeadlines(headlines)
    .withDescriptions(descriptions)
    .withFinalUrl(finalUrl)
    .withPath1(CONFIG.DEFAULT_PATH_1)
    .withPath2(CONFIG.DEFAULT_PATH_2)
    .build();
  if (!op.isSuccessful()) {
    throw new Error('RSA build falló: ' + op.getErrors().join(', '));
  }
  return op.getResult();
}

function buildHeadlines(post) {
  // Google requiere mínimo 3, máximo 15 headlines, cada uno ≤30 caracteres
  var title = (post.title || '').replace(/[¿¡!?"]/g, '').trim();
  var category = post.category || 'Análisis';
  var year = (post.date || '').slice(0, 4);

  var raw = [
    truncate(title, 30),
    truncate('GDI Data: ' + title, 30),
    'Análisis ' + category + ' ' + year,
    'Datos abiertos México',
    'Análisis de datos públicos',
    'Inteligencia gubernamental',
    'INEGI · Censo · Datos',
    truncate(category + ' en México', 30),
    'Datos que sí importan',
    'Lee el análisis completo',
    'Transparencia con datos',
    'Gobierno Digital MX',
    truncate('Estudio: ' + title, 30),
    'Decisiones con datos',
    'GDI · Análisis ' + year,
  ];
  // dedupe + filtro vacíos + corte a 30
  var seen = {};
  var out = [];
  for (var i = 0; i < raw.length && out.length < 15; i++) {
    var h = (raw[i] || '').toString().slice(0, 30).trim();
    if (h.length >= 3 && !seen[h]) {
      seen[h] = true;
      out.push(h);
    }
  }
  while (out.length < 3) out.push('GDI Data ' + (out.length + 1));
  return out;
}

function buildDescriptions(post) {
  // Google requiere mínimo 2, máximo 4 descriptions, cada una ≤90 caracteres
  var excerpt = (post.excerpt || '').replace(/\s+/g, ' ').trim();
  var raw = [
    truncate(excerpt, 90),
    'Análisis con datos oficiales del INEGI y fuentes públicas. Lee el reporte en GDI.',
    'Gobierno Digital e Innovación: análisis de datos para mejores decisiones públicas.',
    truncate('Categoría: ' + (post.category || 'Análisis') + '. ' + excerpt, 90),
  ];
  var seen = {};
  var out = [];
  for (var i = 0; i < raw.length && out.length < 4; i++) {
    var d = (raw[i] || '').toString().slice(0, 90).trim();
    if (d.length >= 10 && !seen[d]) {
      seen[d] = true;
      out.push(d);
    }
  }
  while (out.length < 2) out.push('Análisis de datos públicos en GDI Data.');
  return out;
}

function addKeywords(adGroup, post) {
  // Keywords manuales por slug — búsquedas reales que la gente hace
  var KEYWORD_MAP = {
    'chapopote-radiografia-economica-litoral-afectado': [
      'derrame petróleo veracruz', 'chapopote golfo méxico', 'pescadores veracruz',
      'contaminación litoral méxico', 'derrame pemex', 'pescadores tabasco'
    ],
    'pesca-o-granja-la-decision-que-definira-el-mar-de-mexico': [
      'acuicultura méxico', 'pesca en méxico', 'industria pesquera méxico',
      'salario pescadores méxico', 'acuacultura vs pesca', 'pesca artesanal méxico'
    ],
    'los-cabos-84-hospedaje-estatal-depende-un-municipio': [
      'turismo los cabos', 'hoteles baja california sur', 'economía los cabos',
      'empleo hotelero méxico', 'turismo bcs datos', 'hospedaje los cabos'
    ],
    'mapa-vulnerabilidad-municipios-crisis-sectorial': [
      'municipios vulnerables méxico', 'crisis económica municipios',
      'empleo por sector méxico', 'diversificación económica municipal',
      'concentración económica municipios'
    ],
    'seguros-en-mexico-oligopolio-datos-ocultos': [
      'seguros en méxico', 'mercado asegurador méxico', 'aseguradoras méxico',
      'industria seguros datos', 'seguros méxico estadísticas'
    ],
    'trabajar-en-salud-no-garantiza-salario-digno': [
      'sueldos sector salud méxico', 'salario enfermeras méxico',
      'empleo salud méxico', 'cuánto gana un enfermero', 'salarios médicos méxico'
    ],
    'tres-ciudades-tres-estrategias-mapa-industrial-frontera': [
      'maquiladoras frontera norte', 'industria tijuana juárez',
      'manufactura frontera méxico', 'empleo frontera norte', 'maquilas reynosa'
    ],
    'quien-gana-con-la-carne-en-mexico': [
      'industria cárnica méxico', 'ganadería méxico datos',
      'salarios industria carne', 'producción carne méxico', 'rastros en méxico'
    ],
    'mineria-oculta-sinaloa': [
      'minería sinaloa', 'minas oro sinaloa', 'minería méxico datos',
      'oro plata sinaloa', 'sector minero méxico'
    ],
    'que-heredo-diego-rivera-analisis-financiero-tequila': [
      'finanzas tequila jalisco', 'deuda municipio tequila',
      'presupuesto municipal jalisco', 'finanzas públicas jalisco'
    ],
    'tijuana-proyecciones-demograficas-2040': [
      'población tijuana', 'crecimiento poblacional tijuana',
      'demografía tijuana', 'proyecciones población méxico',
      'envejecimiento poblacional méxico'
    ],
    'ia-empresarial-tres-niveles-gobierno': [
      'inteligencia artificial gobierno', 'IA sector público méxico',
      'transformación digital gobierno', 'microsoft fabric gobierno',
      'datos gobierno méxico'
    ],
    'ia-datos-oficiales-municipios': [
      'datos INEGI municipios', 'municipios inteligentes',
      'consultar datos INEGI', 'CONEVAL datos municipales',
      'inteligencia artificial municipios'
    ],
    'renacer-ferroviario-mexico': [
      'ferrocarril méxico', 'trenes de carga méxico',
      'industria ferroviaria méxico', 'transporte ferroviario datos',
      'tren interoceánico datos'
    ],
    'mexico-hackeado-crisis-ciberseguridad': [
      'hackeo gobierno méxico', 'ciberseguridad méxico',
      'ataques cibernéticos gobierno', 'datos hackeados gobierno',
      'seguridad informática gobierno'
    ],
    'toluca-finanzas-publicas-2024': [
      'finanzas toluca', 'presupuesto toluca', 'deuda toluca',
      'gasto público toluca', 'finanzas estado de méxico'
    ],
    'tijuana-municipio-mas-endeudado': [
      'deuda tijuana', 'finanzas públicas tijuana',
      'municipios endeudados méxico', 'deuda pública municipal',
      'presupuesto tijuana'
    ],
    'uruapan-falla-tecnica-deuda-heredada': [
      'deuda uruapan', 'finanzas uruapan michoacán',
      'municipios endeudados michoacán', 'deuda pública uruapan',
      'crisis financiera municipal'
    ],
  };

  // Usar keywords manuales si existen, sino generar automáticas básicas
  var phrases = (post.keywords && post.keywords.length > 0) ? post.keywords : (KEYWORD_MAP[post.slug] || generateFallbackKeywords(post));

  var seen = {};
  var successCount = 0;
  var failCount = 0;

  for (var i = 0; i < phrases.length; i++) {
    var kw = phrases[i].toLowerCase().trim();
    if (!kw || seen[kw]) continue;
    seen[kw] = true;
    var formatted = formatKeyword(kw, CONFIG.KEYWORD_MATCH_TYPE);
    try {
      var op = adGroup.newKeywordBuilder().withText(formatted).build();
      if (op.isSuccessful()) {
        Logger.log('  ✅ Keyword añadida: ' + formatted);
        successCount++;
      } else {
        Logger.log('  ❌ Keyword rechazada "' + formatted + '": ' + op.getErrors().join(', '));
        failCount++;
      }
    } catch (e) {
      Logger.log('  ⚠️  Excepción al agregar keyword "' + formatted + '": ' + e);
      failCount++;
    }
  }

  Logger.log('  📊 Keywords resumen: ' + successCount + ' añadidas, ' + failCount + ' fallidas');
}

// Fallback para posts futuros que no están en KEYWORD_MAP
function generateFallbackKeywords(post) {
  var stopWords = {
    'de': 1, 'la': 1, 'el': 1, 'en': 1, 'y': 1, 'a': 1, 'que': 1, 'los': 1,
    'las': 1, 'un': 1, 'una': 1, 'del': 1, 'al': 1, 'para': 1, 'con': 1,
    'por': 1, 'lo': 1, 'mas': 1, 'no': 1, 'es': 1, 'se': 1, 'sin': 1,
    'como': 1, 'sus': 1, 'les': 1, 'nos': 1, 'este': 1, 'esta': 1,
    'cuando': 1, 'entre': 1, 'sobre': 1, 'tres': 1, 'cual': 1,
  };
  var titleWords = (post.title || '').toLowerCase()
    .replace(/[¿¡!?".:,;()%0-9]/g, '')
    .split(/\s+/)
    .filter(function (w) { return w.length > 3 && !stopWords[w]; });

  var phrases = [];
  // Primeras 2 palabras significativas del título + "méxico"
  if (titleWords.length >= 2) {
    phrases.push(titleWords[0] + ' ' + titleWords[1] + ' méxico');
    phrases.push(titleWords[0] + ' ' + titleWords[1]);
  }
  // Categoría + méxico
  var cat = (post.category || '').toLowerCase();
  if (cat) {
    phrases.push(cat + ' méxico datos');
    phrases.push('análisis ' + cat + ' méxico');
  }
  phrases.push('datos públicos méxico');
  return phrases;
}

function formatKeyword(text, matchType) {
  if (matchType === 'PHRASE') return '"' + text + '"';
  if (matchType === 'EXACT') return '[' + text + ']';
  return text; // BROAD
}

function truncate(s, n) {
  s = (s || '').toString();
  if (s.length <= n) return s;
  // corta en la última palabra completa
  var cut = s.slice(0, n);
  var lastSpace = cut.lastIndexOf(' ');
  if (lastSpace > n * 0.6) cut = cut.slice(0, lastSpace);
  return cut.trim();
}
