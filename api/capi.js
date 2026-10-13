export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { event_name, event_source_url, custom_data } = req.body;

    // Ambil token dari Environment Variables Vercel
    const ACCESS_TOKEN = process.env.kunci__VOICE_AUDIOPROAI;
    const PIXEL_ID = '1672205417903686'; // Sesuai ID Dataset Meta lu

    const payload = {
      data: [
        {
          event_name: event_name,
          event_time: Math.floor(Date.now() / 1000),
          event_source_url: event_source_url,
          action_source: 'website',
          custom_data: custom_data || {}
        }
      ]
    };

    const response = await fetch(`https://graph.facebook.com/v19.0/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    return res.status(200).json({ success: true, result });
  } catch (err) {
    console.error('CAPI Server Error:', err);
    return res.status(500).json({ error: err.message });
  }
}
