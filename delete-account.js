const https = require('https');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }

  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.replace('Bearer ', '');
  if (!token) { res.status(401).json({ error: 'No token' }); return; }

  const serviceKey = process.env.SUPABASE_SERVICE_KEY;
  const supabaseUrl = process.env.SUPABASE_URL || 'https://kfgtrrbbevcjkzofrxxl.supabase.co';
  
  if (!serviceKey) { res.status(500).json({ error: 'Service key not configured' }); return; }

  const { user_id } = req.body;
  if (!user_id) { res.status(400).json({ error: 'user_id required' }); return; }

  // Delete user via Supabase Admin API
  const options = {
    hostname: new URL(supabaseUrl).hostname,
    path: `/auth/v1/admin/users/${user_id}`,
    method: 'DELETE',
    headers: {
      'apikey': serviceKey,
      'Authorization': `Bearer ${serviceKey}`,
    }
  };

  const request = https.request(options, (response) => {
    let data = '';
    response.on('data', chunk => data += chunk);
    response.on('end', () => {
      if (response.statusCode === 200 || response.statusCode === 204) {
        res.status(200).json({ success: true });
      } else {
        res.status(response.statusCode).json({ error: data });
      }
    });
  });

  request.on('error', (e) => res.status(500).json({ error: e.message }));
  request.end();
};