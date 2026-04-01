const { RtcTokenBuilder, RtcRole } = require('agora-token');

const APP_ID = process.env.AGORA_APP_ID;
const APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE;

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  const { channel, uid } = req.query;

  if (!channel) {
    return res.status(400).json({ error: 'Channel name is required' });
  }

  try {
    const uid_int = parseInt(uid) || 0;
    const expireTime = 3600 * 24; // 24 hours
    const currentTime = Math.floor(Date.now() / 1000);
    const privilegeExpireTime = currentTime + expireTime;

    const token = RtcTokenBuilder.buildTokenWithUid(
      APP_ID,
      APP_CERTIFICATE,
      channel,
      uid_int,
      RtcRole.PUBLISHER,
      privilegeExpireTime,
      privilegeExpireTime
    );

    return res.status(200).json({ token, channel, uid: uid_int });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};
```

**Step 3** — Add these to your Vercel environment variables. Go to **Vercel → your project → Settings → Environment Variables** and add:
```
AGORA_APP_ID = 5e972a5ba048430980f63dd3a549880b
AGORA_APP_CERTIFICATE = 99fb9566a82e4827937ab62d1297781d