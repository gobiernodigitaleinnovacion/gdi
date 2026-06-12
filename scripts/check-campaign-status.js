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

  console.log('\n=== CAMPAÑA ===');
  const camp = await customer.query(`
    SELECT campaign.id, campaign.name, campaign.status, campaign.serving_status,
           campaign.primary_status, campaign.primary_status_reasons,
           campaign_budget.amount_micros, campaign.bidding_strategy_type,
           metrics.impressions, metrics.clicks, metrics.cost_micros
    FROM campaign
    WHERE campaign.id = ${campaignId}
  `);
  console.log(JSON.stringify(camp, null, 2));

  console.log('\n=== AD GROUPS ===');
  const ags = await customer.query(`
    SELECT ad_group.id, ad_group.name, ad_group.status,
           ad_group.primary_status, ad_group.primary_status_reasons,
           metrics.impressions, metrics.clicks
    FROM ad_group
    WHERE campaign.id = ${campaignId}
  `);
  console.log(`Total ad groups: ${ags.length}`);
  ags.forEach(r => console.log(`  [${r.ad_group.status}] [${r.ad_group.primary_status}] ${r.ad_group.name} · imp=${r.metrics.impressions} clicks=${r.metrics.clicks} · reasons=${JSON.stringify(r.ad_group.primary_status_reasons)}`));

  console.log('\n=== ADS ===');
  const ads = await customer.query(`
    SELECT ad_group_ad.ad.id, ad_group_ad.status, ad_group_ad.policy_summary.approval_status,
           ad_group_ad.policy_summary.review_status, ad_group_ad.primary_status,
           ad_group_ad.primary_status_reasons, ad_group.name
    FROM ad_group_ad
    WHERE campaign.id = ${campaignId}
  `);
  console.log(`Total ads: ${ads.length}`);
  ads.forEach(r => console.log(`  [${r.ad_group_ad.status}] approval=${r.ad_group_ad.policy_summary?.approval_status} review=${r.ad_group_ad.policy_summary?.review_status} · ${r.ad_group.name} · reasons=${JSON.stringify(r.ad_group_ad.primary_status_reasons)}`));

  console.log('\n=== CUENTA (billing/status) ===');
  const cust = await customer.query(`
    SELECT customer.id, customer.descriptive_name, customer.status,
           customer.currency_code, customer.time_zone, customer.auto_tagging_enabled
    FROM customer
  `);
  console.log(JSON.stringify(cust, null, 2));
})().catch(e => {
  console.error('ERROR:', e.errors ? JSON.stringify(e.errors, null, 2) : e.message);
  process.exit(1);
});
