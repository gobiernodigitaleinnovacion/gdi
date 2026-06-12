#!/usr/bin/env node
require('dotenv').config();
const { GoogleAdsApi } = require('google-ads-api');

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

  console.log('=== KEYWORDS (status + quality) ===');
  const kws = await customer.query(`
    SELECT ad_group.name, ad_group_criterion.keyword.text,
           ad_group_criterion.keyword.match_type,
           ad_group_criterion.status,
           ad_group_criterion.system_serving_status,
           ad_group_criterion.approval_status,
           ad_group_criterion.quality_info.quality_score,
           metrics.impressions, metrics.clicks
    FROM keyword_view
    WHERE campaign.id = ${campaignId}
    ORDER BY ad_group.name
  `);

  console.log(`Total keywords: ${kws.length}\n`);
  const byServing = {};
  kws.forEach(r => {
    const s = r.ad_group_criterion.system_serving_status;
    byServing[s] = (byServing[s] || 0) + 1;
  });
  console.log('system_serving_status counts:', byServing);
  console.log('(enum: 2=RARELY_SERVED/LOW_SEARCH_VOLUME, 3=ELIGIBLE)\n');

  console.log('Sample (first 20):');
  kws.slice(0, 20).forEach(r => {
    console.log(`  [serve=${r.ad_group_criterion.system_serving_status}] [approval=${r.ad_group_criterion.approval_status}] qs=${r.ad_group_criterion.quality_info?.quality_score || 'N/A'} · ${r.ad_group_criterion.keyword.text}`);
  });
})().catch(e => {
  console.error('ERROR:', e.errors ? JSON.stringify(e.errors, null, 2) : e.message);
  process.exit(1);
});
