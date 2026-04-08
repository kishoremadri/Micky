// ============================================================
// MICKYMARVELS LLC - Twilio SMS & WhatsApp Proxy
// FILE: twilio-proxy/index.js
//
// WHAT THIS DOES:
//   Browser → This proxy → Twilio API → SMS/WhatsApp
//   We need this proxy because Twilio's API has CORS restrictions
//   that block direct browser calls.
//
// DEPLOY FREE ON VERCEL:
//   1. npm install (in this folder)
//   2. vercel login
//   3. vercel deploy
//   4. Copy the Vercel URL → paste into index.html TWILIO_PROXY_URL
// ============================================================

const express    = require('express');
const twilio     = require('twilio');
const cors       = require('cors');

const app = express();
app.use(express.json());

// Allow your website domain (replace with your actual domain)
app.use(cors({
  origin: ['http://localhost:3000', 'https://mickymarvels.com', 'https://www.mickymarvels.com', '*'],
  methods: ['POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
}));

// ── TWILIO CREDENTIALS ─────────────────────────────────────
// Set these as environment variables in Vercel dashboard:
//   TWILIO_ACCOUNT_SID  = ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
//   TWILIO_AUTH_TOKEN   = your_auth_token
//   TWILIO_FROM_PHONE   = +1XXXXXXXXXX  (your Twilio phone number)
//   TWILIO_WA_FROM      = whatsapp:+14155238886  (Twilio sandbox number)
const ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const AUTH_TOKEN  = process.env.TWILIO_AUTH_TOKEN;
const FROM_PHONE  = process.env.TWILIO_FROM_PHONE;
const FROM_WA     = process.env.TWILIO_WA_FROM || 'whatsapp:+14155238886';

// ── HEALTH CHECK ──────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ status: 'MickyMarvels Twilio Proxy is live', version: '1.0.0' });
});

// ── SEND SMS ───────────────────────────────────────────────
app.post('/send-sms', async (req, res) => {
  const { to, message } = req.body;

  if (!to || !message) {
    return res.status(400).json({ success: false, error: 'Missing to or message' });
  }
  if (!ACCOUNT_SID || !AUTH_TOKEN || !FROM_PHONE) {
    return res.status(500).json({ success: false, error: 'Twilio credentials not configured in environment variables' });
  }

  try {
    const client = twilio(ACCOUNT_SID, AUTH_TOKEN);
    const msg = await client.messages.create({
      body: message,
      from: FROM_PHONE,
      to: to,
    });
    console.log('[SMS] Sent to', to, '| SID:', msg.sid);
    res.json({ success: true, sid: msg.sid });
  } catch (err) {
    console.error('[SMS] Error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── SEND WHATSAPP ──────────────────────────────────────────
app.post('/send-whatsapp', async (req, res) => {
  const { to, message } = req.body;

  if (!to || !message) {
    return res.status(400).json({ success: false, error: 'Missing to or message' });
  }
  if (!ACCOUNT_SID || !AUTH_TOKEN) {
    return res.status(500).json({ success: false, error: 'Twilio credentials not configured' });
  }

  // Format: whatsapp:+1XXXXXXXXXX
  const toWA = to.startsWith('whatsapp:') ? to : 'whatsapp:' + to;

  try {
    const client = twilio(ACCOUNT_SID, AUTH_TOKEN);
    const msg = await client.messages.create({
      body: message,
      from: FROM_WA,
      to: toWA,
    });
    console.log('[WhatsApp] Sent to', to, '| SID:', msg.sid);
    res.json({ success: true, sid: msg.sid });
  } catch (err) {
    console.error('[WhatsApp] Error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── START SERVER ───────────────────────────────────────────
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log('MickyMarvels Twilio Proxy running on port', PORT);
});

module.exports = app; // Required for Vercel
