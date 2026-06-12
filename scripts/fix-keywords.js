#!/usr/bin/env node
/**
 * FIX: convierte keywords a BROAD match + elimina las que Google marcó LOW_SEARCH_VOLUME
 * + agrega keywords genéricas de alto volumen a cada ad group.
 */
require('dotenv').config();
const { GoogleAdsApi, enums } = require('google-ads-api');

const GENERIC_KEYWORDS = [
  'datos inegi',
  'datos abiertos méxico',
  'análisis de datos',
  'gobierno digital',
  'estadísticas méxico',
  'datos públicos méxico',
];

(async () => {
  const client = new GoogleAdsApi({
    client_id: process.env.GOOGLE_ADS_CLIENT_ID,
    client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET,
    developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
  });
  const customer = client.Customer({
    customer_id: process.env.GOOGLE_ADS_CUSTOMER_ID,
    login_customer_id: process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID,
    refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN,
  });

  const campaignId = process.env.GOOGLE_ADS_CAMPAIGN_ID;

  // 1) traer todas las keywords actuales
  const current = await customer.query(`
    SELECT ad_group.resource_name, ad_group.name, ad_group.id,
           ad_group_criterion.resource_name,
           ad_group_criterion.keyword.text,
           ad_group_criterion.keyword.match_type,
           ad_group_criterion.system_serving_status
    FROM keyword_view
    WHERE campaign.id = ${campaignId}
  `);

  console.log(`Keywords actuales: ${current.length}`);

  // agrupar por ad_group
  const byAdGroup = {};
  for (const r of current) {
    const ag = r.ad_group.resource_name;
    if (!byAdGroup[ag]) byAdGroup[ag] = { name: r.ad_group.name, keywords: [] };
    byAdGroup[ag].keywords.push(r);
  }

  // 2) por ad group: borrar TODAS las keywords actuales y recrear las de alto volumen en BROAD + genéricas
  let removedCount = 0;
  let addedCount = 0;

  for (const [adGroupResource, data] of Object.entries(byAdGroup)) {
    console.log(`\n📂 ${data.name}`);

    // separar: low_volume vs eligible
    const lowVolume = data.keywords.filter(k => k.ad_group_criterion.system_serving_status === 2);
    const eligible = data.keywords.filter(k => k.ad_group_criterion.system_serving_status !== 2);

    console.log(`  ${lowVolume.length} low_volume · ${eligible.length} eligible`);

    // BORRAR TODAS (Google no permite cambiar match_type directamente)
    const toRemove = data.keywords.map(k => k.ad_group_criterion.resource_name);
    if (toRemove.length > 0) {
      try {
        await customer.adGroupCriteria.remove(toRemove);
        removedCount += toRemove.length;
        console.log(`  🗑️  Eliminadas: ${toRemove.length}`);
      } catch (e) {
        console.log(`  ⚠️  Error eliminando: ${e.errors?.[0]?.message || e.message}`);
      }
    }

    // RECREAR las eligible como BROAD + agregar genéricas
    const textsToAdd = new Set();
    // keywords eligibles que SÍ tenían volumen → reusar texto pero BROAD
    for (const k of eligible) {
      textsToAdd.add(k.ad_group_criterion.keyword.text.toLowerCase().trim());
    }
    // genéricas de alto volumen
    for (const g of GENERIC_KEYWORDS) textsToAdd.add(g);

    const ops = Array.from(textsToAdd).map(text => ({
      ad_group: adGroupResource,
      status: enums.AdGroupCriterionStatus.ENABLED,
      keyword: {
        text,
        match_type: enums.KeywordMatchType.BROAD,
      },
    }));

    if (ops.length > 0) {
      try {
        const res = await customer.adGroupCriteria.create(ops);
        const created = res.results?.length || 0;
        addedCount += created;
        console.log(`  ✅ Añadidas BROAD: ${created}/${ops.length}`);
      } catch (e) {
        const errMsg = e.errors?.[0]?.message || e.message;
        console.log(`  ⚠️  Error batch: ${errMsg}`);
        // retry uno por uno
        for (const op of ops) {
          try {
            await customer.adGroupCriteria.create([op]);
            addedCount++;
          } catch (e2) {
            console.log(`    ❌ "${op.keyword.text}": ${e2.errors?.[0]?.message || e2.message}`);
          }
        }
      }
    }
  }

  console.log(`\n🎯 Resumen: ${removedCount} eliminadas · ${addedCount} creadas BROAD`);
})().catch(e => {
  console.error('ERROR:', e.errors ? JSON.stringify(e.errors, null, 2) : e.message);
  process.exit(1);
});
