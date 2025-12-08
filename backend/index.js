const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();

const PORT = process.env.PORT || 4000;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;
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
};

const readProfile = () => {
  try {
    const raw = fs.readFileSync(PROFILE_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return { ...defaultProfile };
  }
};

const writeProfile = (profile) => {
  fs.writeFileSync(PROFILE_PATH, JSON.stringify(profile, null, 2));
};

let profile = readProfile();

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
  res.json({ ok: true });
});

app.get('/api/profile', (_, res) => {
  res.json(profile);
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
  res.json(profile);
});

app.post('/api/profile/avatar', upload.single('avatar'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const fileUrl = `${BASE_URL}/uploads/${req.file.filename}`;
  profile = { ...profile, avatarUrl: fileUrl };
  writeProfile(profile);
  res.json({ avatarUrl: fileUrl });
});

app.listen(PORT, () => {
  console.log(`Backend listening on port ${PORT}`);
});
