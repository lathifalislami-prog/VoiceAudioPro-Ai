export default async function handler(req, res) {
  // Izinkan CORS untuk keamanan akses lintas domain jika diperlukan
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Parsing body jika dikirim sebagai string (text/plain) dari frontend
    let bodyData = req.body;
    if (typeof bodyData === 'string') {
      bodyData = JSON.parse(bodyData);
    }

    const { event_name, event_source_url, event_id, custom_data } = bodyData;
    
    // Ambil Token dari Environment Variables Vercel
    const ACCESS_TOKEN = process.env.kunci_VOICE_AUDIOPROAI; 
    const PIXEL_ID = '1672205417903686'; // ID Dataset Meta kamu

    // --- AMBIL IP & USER AGENT OTOMATIS DARI HEADER VERCEL ---
    const clientIp = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];

    const payload = {
      data: [
        {
          event_name: event_name,
          event_time: Math.floor(Date.now() / 1000),
          event_id: event_id || undefined, // Mendukung deduplikasi event dari browser
          event_source_url: event_source_url,
          action_source: 'website',
          user_data: {
            client_ip_address: clientIp,
            client_user_agent: userAgent
          },
          custom_data: custom_data || {}
        }
      ]
    };

    // Kirim data secara Server-to-Server ke Meta Graph API
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
