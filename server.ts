import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Firebase Web SDK for Server-Side proxy
let db: any = null;
try {
  const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
  if (fs.existsSync(configPath)) {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const firebaseApp = initializeApp({
      apiKey: config.apiKey,
      authDomain: config.authDomain,
      projectId: config.projectId,
      storageBucket: config.storageBucket,
      messagingSenderId: config.messagingSenderId,
      appId: config.appId
    });
    db = getFirestore(firebaseApp, config.firestoreDatabaseId || '(default)');
    console.log('Firebase Web SDK initialized successfully on backend!');
  } else {
    console.warn('WARNING: firebase-applet-config.json not found. DB features will operate in offline/fallback mode.');
  }
} catch (error) {
  console.error('Error initializing Firebase Web SDK on backend:', error);
}

// API Routes
// 1. Get Customer from Firestore
app.post('/api/customers/get', async (req, res) => {
  const { phone } = req.body;
  if (!phone) {
    return res.status(400).json({ error: 'Phone number is required' });
  }

  if (!db) {
    return res.status(503).json({ error: 'Firebase Database is not configured' });
  }

  try {
    const docRef = doc(db, 'customers', phone.trim());
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return res.json(docSnap.data());
    }
    return res.json(null);
  } catch (error: any) {
    console.error('Error fetching customer from Firestore:', error);
    return res.status(500).json({ error: error.message || 'Database error' });
  }
});

// 2. Save/Update Customer in Firestore
app.post('/api/customers/save', async (req, res) => {
  const { name, phone, address } = req.body;
  if (!phone || !name || !address) {
    return res.status(400).json({ error: 'Name, phone, and address are required' });
  }

  if (!db) {
    return res.status(503).json({ error: 'Firebase Database is not configured' });
  }

  try {
    const docRef = doc(db, 'customers', phone.trim());
    const customerData = {
      name: name.trim(),
      phone: phone.trim(),
      address: address.trim(),
      updatedAt: new Date().toISOString()
    };
    await setDoc(docRef, customerData, { merge: true });
    return res.json({ success: true, customer: customerData });
  } catch (error: any) {
    console.error('Error saving customer to Firestore:', error);
    return res.status(500).json({ error: error.message || 'Database error' });
  }
});

// 3. Send OTP Message
app.post('/api/send-otp', async (req, res) => {
  const { phone, code, name, address } = req.body;
  if (!phone || !code) {
    return res.status(400).json({ error: 'Phone number and verification code are required' });
  }

  console.log(`[OTP Engine] Generating verification code ${code} for phone ${phone}`);

  const messageText = `طلبات فرشوط 🛵\nكود تفعيل حسابك هو: [ ${code} ]\nشكراً لتسجيلك معنا!`;

  // Check for Twilio Credentials
  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioFrom = process.env.TWILIO_PHONE_NUMBER || process.env.TWILIO_MESSAGING_SERVICE_SID;

  // Check for custom WhatsApp Gateway (e.g. UltraMsg)
  const ultraMsgInstanceId = process.env.ULTRAMSG_INSTANCE_ID;
  const ultraMsgToken = process.env.ULTRAMSG_TOKEN;

  // Check for other Egyptian SMS Providers (VictoryLink or any other custom API via URL)
  const customSmsUrl = process.env.CUSTOM_SMS_URL; // e.g. "https://api.sms-provider.com/send?apikey=X&to={to}&message={message}"

  try {
    let sentVia = 'Console/Logger fallback';
    let success = false;

    // Normalize Egyptian phone number for sending (Egyptian country code is +2)
    let formattedPhone = phone.trim();
    if (formattedPhone.startsWith('01')) {
      formattedPhone = '+2' + formattedPhone;
    } else if (formattedPhone.startsWith('1')) {
      formattedPhone = '+20' + formattedPhone;
    }

    if (twilioSid && twilioToken && twilioFrom) {
      // Send real SMS via Twilio
      const basicAuth = Buffer.from(`${twilioSid}:${twilioToken}`).toString('base64');
      const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`;
      
      const bodyParams = new URLSearchParams();
      bodyParams.append('To', formattedPhone);
      bodyParams.append('From', twilioFrom);
      bodyParams.append('Body', messageText);

      const response = await fetch(twilioUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${basicAuth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: bodyParams
      });

      const data = await response.json();
      if (response.ok) {
        success = true;
        sentVia = 'Twilio SMS';
      } else {
        console.error('Twilio sending failed:', data);
      }
    } else if (ultraMsgInstanceId && ultraMsgToken) {
      // Send real WhatsApp message via UltraMsg
      const whatsappPhone = formattedPhone.replace('+', ''); // UltraMsg expects phone numbers without '+'
      const ultraMsgUrl = `https://api.ultramsg.com/${ultraMsgInstanceId}/messages/chat`;
      
      const response = await fetch(ultraMsgUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          token: ultraMsgToken,
          to: whatsappPhone,
          body: messageText,
          priority: 10
        })
      });

      const data = await response.json();
      if (response.ok && (data.sent === 'true' || data.success)) {
        success = true;
        sentVia = 'UltraMsg WhatsApp';
      } else {
        console.error('UltraMsg sending failed:', data);
      }
    } else if (customSmsUrl) {
      // Send custom HTTP-based SMS gateway
      const urlToSend = customSmsUrl
        .replace('{to}', encodeURIComponent(formattedPhone))
        .replace('{message}', encodeURIComponent(messageText));

      const response = await fetch(urlToSend);
      if (response.ok) {
        success = true;
        sentVia = 'Custom SMS Provider';
      } else {
        console.error('Custom SMS Provider sending failed');
      }
    }

    if (success) {
      return res.json({ success: true, provider: sentVia });
    } else {
      // Return details that message was logged. They need to set up credentials in .env
      return res.json({ 
        success: true, 
        provider: 'Simulator/Log fallback', 
        simulated: true,
        message: 'تم توليد كود التحقق بنجاح ومحاكاته في الكونسول. لربط إرسال حقيقي تلقائي، يرجى تفعيل إحدى الخدمات (Twilio أو UltraMsg) في ملف البيئة .env.' 
      });
    }
  } catch (err: any) {
    console.error('Error in send-otp API endpoint:', err);
    return res.status(500).json({ error: err.message || 'Error processing OTP' });
  }
});

// Health/Connection check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    databaseConnected: db !== null,
    provider: db ? 'Firebase Service Account' : 'None'
  });
});

// Vite/Static Setup
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
