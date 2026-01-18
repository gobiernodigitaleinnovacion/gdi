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
  // Get access token from environment variable
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

    // Extract user data from form
    const email = formData.email || formData.correo || '';
    const phone = formData.telefono || formData.phone || '';
    const name = formData.nombre || formData.name || '';

    // Get request context
    const clientIp = payload.human_fields?.ip || event.headers['x-forwarded-for'] || '';
    const userAgent = event.headers['user-agent'] || '';

    // Build TikTok event payload
    const tiktokPayload = {
      pixel_code: TIKTOK_PIXEL_ID,
      event: 'SubmitForm',
      event_id: `form_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      context: {
        user_agent: userAgent,
        ip: clientIp,
        page: {
          url: payload.site_url || 'https://gobiernodigitaleinnovacion.com',
          referrer: ''
        }
      },
      properties: {
        content_name: formName,
        content_type: 'contact_form',
        description: `Contact form submission from ${name}`
      }
    };

    // Add hashed user data (TikTok requires SHA256 hashing for PII)
    if (email) {
      tiktokPayload.context.user = tiktokPayload.context.user || {};
      tiktokPayload.context.user.email = hashData(email);
    }
    if (phone) {
      tiktokPayload.context.user = tiktokPayload.context.user || {};
      // Remove non-numeric characters and hash
      const cleanPhone = phone.replace(/\D/g, '');
      tiktokPayload.context.user.phone = hashData(cleanPhone);
    }

    // Send event to TikTok Events API
    const response = await fetch(TIKTOK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Access-Token': accessToken
      },
      body: JSON.stringify({
        pixel_code: TIKTOK_PIXEL_ID,
        event: tiktokPayload.event,
        event_id: tiktokPayload.event_id,
        timestamp: tiktokPayload.timestamp,
        context: tiktokPayload.context,
        properties: tiktokPayload.properties
      })
    });

    const result = await response.json();
    console.log('TikTok API Response:', JSON.stringify(result));

    if (result.code === 0) {
      console.log('Event sent successfully to TikTok');
      return { statusCode: 200, body: 'Event sent to TikTok' };
    } else {
      console.error('TikTok API Error:', result.message);
      return { statusCode: 200, body: 'Event processed with warnings' };
    }

  } catch (error) {
    console.error('Error processing submission:', error);
    // Return 200 to not block form submission
    return { statusCode: 200, body: 'Error logged' };
  }
};
