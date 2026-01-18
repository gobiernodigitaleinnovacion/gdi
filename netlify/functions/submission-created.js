const crypto = require('crypto');

// TikTok Events API Configuration
const TIKTOK_PIXEL_ID = 'D5MHUKBC77UEK8Q4I9B0';
const TIKTOK_API_URL = 'https://business-api.tiktok.com/open_api/v1.3/event/track/';

// Hash function for PII (TikTok requires SHA256)
function hashData(data) {
  if (!data) return null;
  return crypto.createHash('sha256').update(data.toLowerCase().trim()).digest('hex');
}

exports.handler = async (event) => {
  const accessToken = process.env.TIKTOK_ACCESS_TOKEN;

  if (!accessToken) {
    console.error('TIKTOK_ACCESS_TOKEN not configured');
    return { statusCode: 500, body: 'Token not configured' };
  }

  try {
    // Parse form submission data from Netlify
    const payload = JSON.parse(event.body).payload;
    const formData = payload.data;
    const formName = payload.form_name;

    console.log(`Form submission received: ${formName}`);
    console.log('Form data:', JSON.stringify(formData));

    // Extract user data from form
    const email = formData.email || formData.correo || '';
    const phone = formData.telefono || formData.phone || '';

    // Get request context
    const clientIp = event.headers['x-forwarded-for']?.split(',')[0] || event.headers['client-ip'] || '';
    const userAgent = event.headers['user-agent'] || '';

    // Build user object with hashed PII
    const user = {
      ip: clientIp,
      user_agent: userAgent
    };

    if (email) {
      user.email = hashData(email);
    }
    if (phone) {
      const cleanPhone = phone.replace(/\D/g, '');
      if (cleanPhone) {
        user.phone = hashData(cleanPhone);
      }
    }

    // Build TikTok Events API payload (correct format)
    const tiktokPayload = {
      pixel_code: TIKTOK_PIXEL_ID,
      event_source: 'web',
      event_source_id: TIKTOK_PIXEL_ID,
      data: [
        {
          event: 'Lead',
          event_time: Math.floor(Date.now() / 1000),
          event_id: `form_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          user: user,
          page: {
            url: payload.site_url || 'https://gobiernodigitaleinnovacion.com',
            referrer: ''
          },
          properties: {
            content_name: formName || 'contact-form',
            content_type: 'lead_form',
            currency: 'MXN',
            value: 100
          }
        }
      ]
    };

    console.log('Sending to TikTok:', JSON.stringify(tiktokPayload));

    // Send event to TikTok Events API
    const response = await fetch(TIKTOK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Access-Token': accessToken
      },
      body: JSON.stringify(tiktokPayload)
    });

    const result = await response.json();
    console.log('TikTok API Response:', JSON.stringify(result));

    if (result.code === 0) {
      console.log('Event sent successfully to TikTok');
      return { statusCode: 200, body: JSON.stringify({ success: true, tiktok: result }) };
    } else {
      console.error('TikTok API Error:', result.message);
      return { statusCode: 200, body: JSON.stringify({ success: false, error: result.message }) };
    }

  } catch (error) {
    console.error('Error processing submission:', error.message);
    return { statusCode: 200, body: JSON.stringify({ success: false, error: error.message }) };
  }
};
