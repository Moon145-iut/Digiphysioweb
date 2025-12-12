# DigiPhysio Coach

An AI-powered wellness companion application that provides personalized rehabilitation exercises, meal plans, and specialist guidance for users recovering from injuries or managing chronic pain conditions.

**##user flow**
At first the user register with their **Banglalink number** that requires one time caas charge. after that the user puts input of age, pain area, and goal, based that the ml model suggests exercises, diet and some life style habits. The exercise are monitored by one of the most reliable ml model mediapipe, that detects the posture and based on that shows the accuracy score, and voice command the user. At the end of each session AI voice model provide a encouraging message to keep the user motivated. There is another premium option, that is specialist, the specialist take two different session based on that it provides exactly which reason the pain is happening, specifically, thus narrow downs the pain region and causes. Then suggests some medications for it. The specialist requires subscription before using, which is implemented via *Applink API*. So does the *CAAS* service.


## Features

###  Core Features
- **AI Chat Assistant** - Powered by Gemini API for personalized wellness advice
- **Rehabilitation Exercises** - Curated exercise library with proper form guidance using tensorflow.js and curated model only for pose detection and rep count
- **Meal Plans** - Customized nutrition recommendations based on user profile
- **Specialist Consultations** - Connect with healthcare professionals
- **User Profiles** - Personalized experience based on pain areas and fitness goals
- **Subscription Management** - In-app subscription options

###  Authentication
- **Banglalink OTP Registration** - Mobile payment integration via Applink CaaS
- **Email/Password Authentication** - Firebase-based auth
- **Guest Mode** - Try the app without registration
- **Username Customization** - Personalize your profile

###  User Onboarding
- Pain area selection (Knee, Back, Shoulder, Neck, etc.)
- Fitness goal setting (Reduce Pain, Build Strength, Improve Mobility)
- Activity level assessment (Low, Medium, High)
- Age and basic profile information

### Data Management
- Cloud storage via Firebase
- Local profile management
- Avatar upload capability
- Session-based profile caching

## Tech Stack
- **Future directions &** -
- Develop pipeline that give expert suggestions and medical standard medications for very specific issues
- Pipeline that is able to detect the very precise and specific issue
- X-ray scanner, scan x-ray report and provide the result accordingly

## Tech Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **Firebase** - Authentication & storage

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **CORS** - Cross-origin requests
- **Multer** - File upload handling
- **Applink CaaS** - Mobile payment integration (Banglalink)

### APIs
- **Google Gemini API** - AI chat and recommendations
- **Applink CaaS API** - Mobile charging (OTP verification)
- **Firebase Authentication** - User auth

## Project Structure

```
flexiphysio-coach/
├── backend/
│   ├── index.js              # Express server & API endpoints
│   ├── package.json          # Backend dependencies
│   ├── .env                  # Environment variables
│   ├── data/
│   │   └── profile.json      # User profile storage
│   └── uploads/              # User avatar storage
├── screens/
│   ├── AuthScreen.tsx        # Login & registration
│   ├── HomeScreen.tsx        # Dashboard
│   ├── OnboardingScreen.tsx  # User setup
│   ├── ExerciseSessionScreen.tsx  # Workout sessions
│   ├── MealsScreen.tsx       # Nutrition plans
│   ├── DashboardScreen.tsx   # Main dashboard
│   └── SpecialistScreen.tsx  # Professional consultations
├── components/
│   ├── BottomNav.tsx         # Navigation bar
│   ├── GeminiChat.tsx        # AI assistant
│   ├── ProfilePanel.tsx      # User profile
│   └── SubscriptionModal.tsx # Subscription UI
├── services/
│   ├── firebase.ts           # Firebase config
│   ├── geminiService.ts      # Gemini API integration
│   └── storage.ts            # Data persistence
├── data/
│   ├── bdDietPlans.ts        # Nutrition database
│   ├── rehabExerciseLibrary.ts  # Exercise database
│   └── rehabProtocols.ts     # Treatment protocols
├── hooks/
│   └── useProfile.ts         # Profile management hook
├── utils/
│   └── postureUtils.ts       # Posture analysis utilities
├── App.tsx                   # Root component
├── index.tsx                 # Entry point
├── types.ts                  # TypeScript definitions
└── README.md                 # This file
```

## Installation & Setup

### Prerequisites
- Node.js v18+
- npm or yarn
- Git

### Frontend Setup

```bash
# Install dependencies
npm install

# Create .env file with:
VITE_BACKEND_URL=http://localhost:4000
VITE_GEMINI_API_KEY=your_gemini_key
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=public-anon-key
VITE_SUPABASE_BUCKET=profile-avatars

# Start dev server
npm run dev
```

### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file with:
PORT=4000
FRONTEND_ORIGIN=http://localhost:5173
BASE_URL=http://localhost:4000

# Start server
npm start
```

> When deploying, set `FRONTEND_ORIGIN` to your Netlify/Vercel domain so CORS allows the web client to reach the Express API.

### Avatar Storage (Supabase)

1. Create a **public** Storage bucket in Supabase (e.g., `profile-avatars`).
2. Grab the project URL and anon key from the Supabase dashboard.
3. Add `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and `VITE_SUPABASE_BUCKET` to your `.env.local`.
4. Deployments must also expose the same variables so the frontend can talk directly to Supabase Storage.

> The frontend uploads the file straight to Supabase, then posts the returned public URL to `/api/profile`. The backend simply persists the URL inside `backend/data/profile.json`.

## API Endpoints

### Authentication
- `POST /api/auth/request-otp` - Request OTP for Banglalink payment
- `POST /api/auth/verify-otp` - Verify OTP and complete registration

### Profile Management
- `GET /api/profile` - Get user profile
- `POST /api/profile` - Update user profile (name, age, painArea, goal, avatarUrl)
- `POST /api/profile/password` - Change password

### Webhooks
- `POST /caas/chargingNotification` - Payment notification from Applink
- `POST /applink/sms/receive` - Incoming SMS from Applink
- `POST /applink/sms/report` - SMS delivery report

### Health Check
- `GET /api/health` - Server status

## Authentication Flow

### Banglalink OTP Registration
1. User enters phone number
2. Backend requests OTP from Applink CaaS
3. Applink charges ৳1.00 from user's mobile account
4. User receives OTP via SMS
5. User enters OTP to verify
6. Account created with subscription enabled

### Email Registration
1. User enters email and password
2. Firebase creates account
3. User sets username
4. Profile created without subscription

### Guest Mode
- Access app without registration
- Limited features
- doesn't save progress
- Can upgrade to paid account anytime

## Mock Mode

During development (while Applink approves your application), the backend uses mock API responses:

```javascript
// Mock OTP Request - generates fake correlator
POST /api/auth/request-otp
Response: { success: true, requestCorrelator: "MOCK_..." }

// Mock OTP Verify - accepts any 6-digit code
POST /api/auth/verify-otp
Response: { success: true, referenceNo: "MOCK_..." }
```

To switch to real Applink API:
1. Update `.env` with real credentials
2. Uncomment real fetch calls in `backend/index.js`
3. Restart backend

## Deployment

### Frontend (Netlify)
```bash
npm run build
# Deploy dist/ folder to Netlify
```

### Backend (Render.com)
```bash
# Push to GitHub
git push origin main
# Connect repository to Render
# Backend will auto-deploy
```

### Environment Variables
Update these on deployment platform:
- `VITE_BACKEND_URL` - Your deployed backend URL
- `GEMINI_API_KEY` - Google API key
- `FIREBASE_*` - Firebase credentials


## Key Features Explained

### AI Chat Assistant
Uses Google Gemini API to provide:
- Exercise recommendations
- Pain management advice
- Recovery tips
- Personalized wellness guidance

### Exercise Library
Pre-loaded exercises with:
- Difficulty levels
- Form instructions
- Repetition guides
- Recovery protocols

### Meal Plans
Customized nutrition based on:
- User age & fitness level
- Pain areas
- Fitness goals
- Dietary preferences

### Specialist Network
Connect with:
- Physiotherapists
- Nutritionists
- Sports medicine doctors
- Recovery coaches

## Configuration

### Applink CaaS Integration

Your Applink credentials are configured for:
- **App ID**: APP_018679 (physio4)
- **Payment Instrument**: Mobile Account (Banglalink)
- **Amount**: ৳1.00 (configurable)
- **Webhook**: https://digiphysioweb.onrender.com/caas/chargingNotification

### Firebase Setup

Database structure:
```
users/
  {uid}/
    profile.json
    avatarUrl
    preferences
```

### Gemini API

Model: `gemini-pro`
Used for:
- Chat responses
- Exercise recommendations
- Meal planning
- Health advice

## Development

### Available Scripts

```bash
# Frontend
npm run dev      # Start dev server
npm run build    # Build for production
npm run preview  # Preview production build

# Backend
npm start        # Start production server
npm run dev      # Start with nodemon (auto-reload)
```

## Troubleshooting


### OTP Not Working
1. Check Applink application is approved
2. Verify `.env` credentials
3. Check internet connection
4. Verify phone number format: `+8801XXXXXXXXX`

### Firebase Authentication Error
1. Update Firebase credentials in `.env`
2. Enable Email/Password auth in Firebase console
3. Check CORS origin is whitelisted



## Roadmap

- [ ] Applink CaaS approval
- [ ] Real payment integration
- [ ] Appointment scheduling
- [ ] Video consultation feature
- [ ] Wearable device integration
- [ ] Progress tracking dashboard
- [ ] Multi-language support
- [ ] Mobile app (React Native)

## Notes

- Mock API is currently active for testing
- Applink application (physio4 - APP_018679) is pending approval
- Once approved, switch to production credentials in `.env`
- No frontend changes needed - just update credentials
