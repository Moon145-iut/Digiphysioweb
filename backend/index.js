require('dotenv').config();


const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

// --- Initialize Express app ---
const app = express();

// --- AI & API Configuration ---
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
let geminiClient = null;
if (GEMINI_API_KEY) {
  geminiClient = new GoogleGenerativeAI(GEMINI_API_KEY);
}

const API_NINJAS_URL = 'https://api.api-ninjas.com/v1/nutrition';
const API_NINJAS_KEY = process.env.API_NINJAS_KEY;


const PORT = process.env.PORT || 4000;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;
const APPLINK_ENDPOINT = process.env.APPLINK_ENDPOINT || 'https://api.applink.com.bd/sms/send';
const APPLINK_APP_ID = process.env.APPLINK_APP_ID || 'APP_XXXXXX';
const APPLINK_PASSWORD = process.env.APPLINK_PASSWORD || 'password';
const APPLINK_SOURCE_ADDRESS = process.env.APPLINK_SOURCE_ADDRESS || 'tel:+8801XXXXXX';
const CAAS_DIRECT_DEBIT =
  process.env.CAAS_DIRECT_DEBIT || 'https://api.applink.com.bd/caas/direct/debit';
const CAAS_OTP_VERIFY =
  process.env.CAAS_OTP_VERIFY || 'https://api.applink.com.bd/caas/otp/verify';
const CAAS_APP_ID = process.env.CAAS_APP_ID || APPLINK_APP_ID;
const CAAS_PASSWORD = process.env.CAAS_PASSWORD || APPLINK_PASSWORD;
const CAAS_PAYMENT_INSTRUMENT = process.env.CAAS_PAYMENT_INSTRUMENT || 'Mobile Account';
const CAAS_AMOUNT = process.env.CAAS_AMOUNT || '1.00';
const CAAS_CURRENCY = process.env.CAAS_CURRENCY || 'BDT';
const DATA_DIR = path.join(__dirname, 'data');
const UPLOAD_DIR = path.join(__dirname, 'uploads');
const PROFILE_PATH = path.join(DATA_DIR, 'profile.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const defaultProfile = {
  id: 'demo-user',
  name: 'Guest',
  age: 25,
  painArea: 'KNEE',
  goal: 'REDUCE_PAIN',
  avatarUrl: null,
  password: 'hackathon',
};

const readProfile = () => {
  try {
    const raw = fs.readFileSync(PROFILE_PATH, 'utf-8');
    const parsed = JSON.parse(raw);
    if (!parsed.password) parsed.password = defaultProfile.password;
    return parsed;
  } catch {
    return { ...defaultProfile };
  }
};

const writeProfile = (profile) => {
  fs.writeFileSync(PROFILE_PATH, JSON.stringify(profile, null, 2));
};

let profile = readProfile();
const caasStore = new Map();

const normalizePhone = (value = '') => {
  let trimmed = value.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('tel:')) return trimmed;
  if (!trimmed.startsWith('+')) {
    trimmed = `+${trimmed.replace(/^\+?/, '')}`;
  }
  return `tel:${trimmed}`;
};

const generateExternalTrxId = () =>
  `${Date.now()}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;

const sanitizeProfile = (data) => {
  const { password, ...rest } = data;
  return rest;
};

app.use(
  cors({
    origin: FRONTEND_ORIGIN,
  })
);
app.use(express.json());
app.use('/uploads', express.static(UPLOAD_DIR));

const storage = multer.diskStorage({
  destination: (_, __, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (_, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${file.fieldname}${ext}`);
  },
});


const upload = multer({ storage });

app.get('/api/health', (_, res) => {
  res.json({ 
    ok: true,
    credentials: 'configured',
    appId: CAAS_APP_ID,
    caasEndpoint: CAAS_DIRECT_DEBIT
  });
});

app.get('/api/profile', (_, res) => {
  res.json(sanitizeProfile(profile));
});

app.post('/api/profile', (req, res) => {
  const { name, age, painArea, goal } = req.body;
  profile = {
    ...profile,
    ...(name !== undefined ? { name } : {}),
    ...(age !== undefined ? { age: Number(age) || profile.age } : {}),
    ...(painArea !== undefined ? { painArea } : {}),
    ...(goal !== undefined ? { goal } : {}),
  };
  writeProfile(profile);
  res.json(sanitizeProfile(profile));
});


app.post('/api/profile/password', (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current and new password required' });
  }
  if (profile.password && profile.password !== currentPassword) {
    return res.status(403).json({ error: 'Current password is incorrect' });
  }
  profile = { ...profile, password: newPassword };
  writeProfile(profile);
  res.json({ success: true });
});

// ===== FOOD NUTRITION ANALYSIS =====

// Text-based nutrition analysis via API Ninjas
app.post('/api/food/nutrition', async (req, res) => {
  const { query } = req.body;
  
  if (!query || !query.trim()) {
    return res.status(400).json({ 
      success: false,
      error: 'Food query required' 
    });
  }

  if (!API_NINJAS_KEY) {
    return res.status(503).json({
      success: false,
      error: 'API Ninjas key not configured',
      name: 'Unknown food',
      calories: 'Unknown',
      protein: '-',
      fat: '-',
      carbs: '-',
      fiber: '-',
      ingredients: [],
      healthTips: 'API not configured. Try again later.',
      tags: ['error'],
      balanced: false,
      summary: 'Service unavailable'
    });
  }

  try {
    // Call API Ninjas nutrition endpoint
    const apiResponse = await fetch(`${API_NINJAS_URL}?query=${encodeURIComponent(query)}`, {
      method: 'GET',
      headers: {
        'X-Api-Key': API_NINJAS_KEY,
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });

    if (!apiResponse.ok) {
      throw new Error(`API Ninjas returned ${apiResponse.status}`);
    }

    const nutritionData = await apiResponse.json();

    if (!nutritionData || !Array.isArray(nutritionData) || nutritionData.length === 0) {
      return res.status(200).json({
        success: false,
        name: query,
        calories: 'Unknown',
        protein: '-',
        fat: '-',
        carbs: '-',
        fiber: '-',
        ingredients: [query],
        healthTips: 'Could not find nutrition data for this meal. Try a simpler description.',
        tags: ['not-found'],
        balanced: false,
        summary: 'No data available'
      });
    }

    // Use first result
    const item = nutritionData[0];
    const calories = item.calories ? Math.round(item.calories).toString() : 'Unknown';
    const protein = item.protein_g ? `${Math.round(item.protein_g * 10) / 10}g` : '-';
    const fat = item.fat_total_g ? `${Math.round(item.fat_total_g * 10) / 10}g` : '-';
    const carbs = item.carbohydrates_total_g ? `${Math.round(item.carbohydrates_total_g * 10) / 10}g` : '-';
    const fiber = item.fiber_g ? `${Math.round(item.fiber_g * 10) / 10}g` : '-';

    return res.json({
      success: true,
      name: item.name || query,
      calories,
      protein,
      fat,
      carbs,
      fiber,
      ingredients: [item.name || query],
      healthTips: `This meal contains approximately ${calories} calories. ${protein !== '-' ? `Protein: ${protein}. ` : ''}Good source of nutrients.`,
      tags: ['api-ninjas'],
      balanced: item.calories && item.calories < 600,
      summary: `${item.name} - ${calories} cal`
    });

  } catch (error) {
    console.error('API Ninjas error:', error);
    return res.status(500).json({
      success: false,
      error: 'Nutrition analysis failed',
      detail: error.message,
      name: query,
      calories: 'Unknown',
      protein: '-',
      fat: '-',
      carbs: '-',
      fiber: '-',
      ingredients: [],
      healthTips: 'Could not analyze this meal. Please try again or describe it differently.',
      tags: ['error'],
      balanced: false,
      summary: 'Analysis failed'
    });
  }
});

// ===== END FOOD NUTRITION ANALYSIS =====

app.post('/api/auth/request-otp', async (req, res) => {
  const { phone, amount } = req.body;
  const msisdn = normalizePhone(phone);
  const externalTrxId = generateExternalTrxId();
  
  // Mock response for testing
  console.log('Mock OTP Request:', { phone, msisdn, amount });
  
  const mockCorrelator = `MOCK_${Date.now()}`;
  
  caasStore.set(msisdn, {
    externalTrxId,
    requestCorrelator: mockCorrelator,
    internalTrxId: `MOCK_TRX_${externalTrxId}`,
  });
  
  // Return success with mock correlator
  res.json({ 
    success: true, 
    requestCorrelator: mockCorrelator,
    message: 'Mock OTP sent successfully',
    phone: msisdn 
  });
});

app.post('/api/auth/verify-otp', async (req, res) => {
  const { phone, otp } = req.body;
  const msisdn = normalizePhone(phone);
  const record = caasStore.get(msisdn);
  
  // Mock OTP verification
  console.log('Mock OTP Verify:', { msisdn, otp, hasRecord: !!record });

  // In mock mode, accept any 6-digit OTP
  if (!otp || otp.length !== 6) {
    return res.json({ 
      success: false, 
      error: 'OTP must be 6 digits' 
    });
  }

  if (!record) {
    return res.json({ 
      success: false, 
      error: 'No OTP request found. Please request OTP first.' 
    });
  }

  // Mock success response
  caasStore.delete(msisdn);
  res.json({ 
    success: true, 
    referenceNo: record.requestCorrelator,
    message: 'Mock OTP verified successfully',
    phone: msisdn 
  });
});

app.post('/applink/sms/receive', (req, res) => {
  console.log('Incoming MO SMS from Applink:', req.body);
  res.json({ statusCode: 'S1000', statusDetail: 'Success.' });
});

app.post('/applink/sms/report', (req, res) => {
  console.log('Delivery report from Applink:', req.body);
  res.json({ statusCode: 'S1000', statusDetail: 'Success.' });
});

app.post('/caas/chargingNotification', (req, res) => {
  console.log('CaaS charging notification:', req.body);
  res.json({ statusCode: 'S1000', statusDetail: 'Notification received.' });
});

// ===== START SERVER =====
app.listen(PORT, () => {
  console.log(`Backend listening on port ${PORT}`);
  console.log(`Frontend origin: ${FRONTEND_ORIGIN}`);
  if (API_NINJAS_KEY) {
    console.log('API Ninjas configured');
  } else {
    console.log('⚠️  API Ninjas key not configured - food nutrition analysis will be limited');
  }
  if (GEMINI_API_KEY) {
    console.log('Gemini API configured');
  } else {
    console.log('⚠️  Gemini API key not configured');
  }
});
