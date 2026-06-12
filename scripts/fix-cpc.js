#!/usr/bin/env node
require('dotenv').config();
const { GoogleAdsApi } = require('google-ads-api');

const NEW_CPC_MICROS = 8_000_000; // 8 MXN

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

  // 1) campaign-level CPC ceiling (Maximize Clicks)
  await customer.campaigns.update([{
    resource_name: `customers/${process.env.GOOGLE_ADS_CUSTOMER_ID}/campaigns/${campaignId}`,
    maximize_clicks: { cpc_bid_ceiling_micros: NEW_CPC_MICROS },
  }]);
  console.log(`✅ Campaña: CPC ceiling = ${NEW_CPC_MICROS / 1e6} MXN`);

  // 2) todos los ad groups
  const ags = await customer.query(`
    SELECT ad_group.resource_name, ad_group.name
    FROM ad_group WHERE campaign.id = ${campaignId}
  `);
  const updates = ags.map(r => ({
    resource_name: r.ad_group.resource_name,
    cpc_bid_micros: NEW_CPC_MICROS,
  }));
  await customer.adGroups.update(updates);
  console.log(`✅ ${updates.length} ad groups: CPC = ${NEW_CPC_MICROS / 1e6} MXN`);
})().catch(e => {
  console.error('ERROR:', e.errors ? JSON.stringify(e.errors, null, 2) : e.message);
  process.exit(1);
});
