export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { event_name, event_source_url, test_event_code, custom_data } = req.body;

  // Mengambil Token & Pixel ID dengan aman dari System Environment Vercel
  const ACCESS_TOKEN = process.env.kunci_VOICE_AUDIOPROAI;;
  const PIXEL_ID = process.env.META_PIXEL_ID || '1672205417903686';

  if (!ACCESS_TOKEN) {
    return res.status(500).json({ status: 'error', message: 'META_ACCESS_TOKEN belum diset di Vercel Settings!' });
  }

  try {
    const payload = {
      data: [
        {
          event_name: event_name || 'Purchase',
          event_time: Math.floor(Date.now() / 1000),
          action_source: 'website',
          event_source_url: event_source_url,
          custom_data: custom_data || { value: 75000, currency: 'IDR' }
        }
      ]
    };

    if (test_event_code) {
      payload.test_event_code = test_event_code;
    }

    const response = await fetch(
      `https://graph.facebook.com/v19.0/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }
    );

    const result = await response.json();
    return res.status(200).json({ status: 'success', meta_response: result });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
}
