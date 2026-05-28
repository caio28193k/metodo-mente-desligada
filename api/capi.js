const PIXEL_ID = '1501804971693052';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://metodo-mente-desligada.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const token = process.env.META_CAPI_TOKEN;
  if (!token) return res.status(500).json({ error: 'token not configured' });

  const ip =
    (req.headers['x-forwarded-for'] || '').split(',')[0].trim() ||
    req.socket?.remoteAddress ||
    null;

  const body = req.body;

  if (body.data && Array.isArray(body.data)) {
    body.data = body.data.map(function (event) {
      if (!event.user_data) event.user_data = {};
      if (ip && !event.user_data.client_ip_address) {
        event.user_data.client_ip_address = ip;
      }
      return event;
    });
  }

  try {
    const r = await fetch(
      `https://graph.facebook.com/v19.0/${PIXEL_ID}/events?access_token=${token}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }
    );
    const data = await r.json();
    return res.status(r.ok ? 200 : 400).json(data);
  } catch (e) {
    return res.status(500).json({ error: 'fetch failed' });
  }
}
