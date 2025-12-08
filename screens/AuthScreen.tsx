import React, { useState } from 'react';
import { UserProfile } from '../types';
import { Smartphone, User, Mail, LogIn } from 'lucide-react';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { loadUser } from '../services/storage';

interface AuthScreenProps {
  onLogin: (user: UserProfile) => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const [step, setStep] = useState<'LANDING' | 'PHONE' | 'OTP' | 'EMAIL_SIGNUP' | 'EMAIL_SIGNIN' | 'USERNAME'>('LANDING');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [pendingProfile, setPendingProfile] = useState<UserProfile | null>(null);

  const handleGuest = () => {
    const guestUser: UserProfile = {
      id: `guest-${Date.now()}`,
      name: 'Guest',
      isGuest: true,
      age: 0, // Will set in onboarding
      mode: 'GENERAL',
      painAreas: [],
      goals: [],
      activityLevel: 'MEDIUM',
      onboardingComplete: false,
      isSubscribed: false
    };
    onLogin(guestUser);
  };

  const handleSendOtp = () => {
    if (phone.length < 3) return alert("Please enter a valid number");
    setStep('OTP');
    // Simulate SMS API
    console.log("OTP Sent");
  };

  const goToUsernameCapture = (profile: UserProfile) => {
    setPendingProfile(profile);
    setUsername('');
    setStep('USERNAME');
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) return alert("Enter any 6 digits for demo");
    setVerifying(true);
    try {
      const remoteUser = await loadUser(phone);
      if (remoteUser) {
        onLogin(remoteUser);
        return;
      }
      const user: UserProfile = {
        id: phone,
        name: '',
        isGuest: false,
        age: 0,
        mode: 'GENERAL',
        painAreas: [],
        goals: [],
        activityLevel: 'MEDIUM',
        onboardingComplete: false,
        isSubscribed: false
      };
      goToUsernameCapture(user);
    } finally {
      setVerifying(false);
    }
  };

  const handleEmailSignup = async () => {
    if (!email || !password || !confirm) return alert("Fill all fields");
    if (password !== confirm) return alert("Passwords do not match");
    setLoading(true);
    try {
      const auth = getAuth();
      const res = await createUserWithEmailAndPassword(auth, email, password);
      const user: UserProfile = {
        id: res.user.uid,
        name: '',
        isGuest: false,
        age: 0,
        mode: 'GENERAL',
        painAreas: [],
        goals: [],
        activityLevel: 'MEDIUM',
        onboardingComplete: false,
        isSubscribed: false
      };
      goToUsernameCapture(user);
    } catch (e: any) {
      alert(e.message || "Sign up failed");
    }
    setLoading(false);
  };

  const handleEmailSignin = async () => {
    if (!email || !password) return alert("Enter both email and password");
    setLoading(true);
    try {
      const auth = getAuth();
      const res = await signInWithEmailAndPassword(auth, email, password);
      const stored = await loadUser(res.user.uid);
      if (stored) {
        onLogin(stored);
      } else {
        const user: UserProfile = {
          id: res.user.uid,
          name: res.user.email || 'User',
          isGuest: false,
          age: 0,
          mode: 'GENERAL',
          painAreas: [],
          goals: [],
          activityLevel: 'MEDIUM',
          onboardingComplete: false,
          isSubscribed: false
        };
        onLogin(user);
      }
    } catch (e: any) {
      alert(e.message || "Sign in failed");
    } finally {
      setLoading(false);
    }
  };

  const handleUsernameSubmit = () => {
    if (!pendingProfile) return;
    if (!username.trim()) return alert("Please enter a username");
    onLogin({ ...pendingProfile, name: username.trim() });
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center items-center p-6 text-center">
      <div className="mb-8">
        <div className="w-20 h-20 bg-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <span className="text-4xl">🧘</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">DigiPhysio</h1>
        <p className="text-gray-500">Your AI-powered wellness companion.</p>
      </div>

      {step === 'LANDING' && (
        <div className="w-full max-w-sm space-y-4">
          <button 
            onClick={() => setStep('PHONE')}
            className="w-full py-3 px-4 bg-teal-600 text-white rounded-xl font-medium shadow-lg hover:bg-teal-700 transition-all flex items-center justify-center gap-2"
          >
            <Smartphone size={20} />
            Login with Phone
          </button>
          
          <button 
            onClick={() => setStep('EMAIL_SIGNUP')}
            className="w-full py-3 px-4 bg-white border border-gray-300 text-gray-600 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-gray-50 transition-all"
          >
             <Mail size={20} />
             Sign up with Email
          </button>

          <button 
            onClick={() => setStep('EMAIL_SIGNIN')}
            className="w-full py-3 px-4 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
          >
             <LogIn size={20} />
             Sign in with Email
          </button>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or</span>
            </div>
          </div>

          <button 
            onClick={handleGuest}
            className="w-full py-3 px-4 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
          >
            <User size={20} />
            Continue as Guest
          </button>
        </div>
      )}

      {step === 'EMAIL_SIGNUP' && (
        <div className="w-full max-w-sm text-left space-y-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input 
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-xl mb-2 focus:ring-2 focus:ring-teal-500 outline-none"
            placeholder="you@email.com"
            autoComplete="email"
          />
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input 
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-xl mb-2 focus:ring-2 focus:ring-teal-500 outline-none"
            placeholder="Password"
            autoComplete="new-password"
          />
          <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
          <input 
            type="password"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-xl mb-4 focus:ring-2 focus:ring-teal-500 outline-none"
            placeholder="Confirm Password"
            autoComplete="new-password"
          />
          <button 
            onClick={handleEmailSignup}
            disabled={loading}
            className="w-full py-3 bg-teal-600 text-white rounded-xl font-bold"
          >
            {loading ? "Signing up..." : "Sign Up"}
          </button>
          <button onClick={() => setStep('LANDING')} className="w-full mt-4 text-gray-500 text-sm">Cancel</button>
        </div>
      )}

      {step === 'EMAIL_SIGNIN' && (
        <div className="w-full max-w-sm text-left space-y-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input 
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-xl mb-2 focus:ring-2 focus:ring-teal-500 outline-none"
            placeholder="you@email.com"
            autoComplete="email"
          />
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input 
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-xl mb-4 focus:ring-2 focus:ring-teal-500 outline-none"
            placeholder="Password"
            autoComplete="current-password"
          />
          <button 
            onClick={handleEmailSignin}
            disabled={loading}
            className="w-full py-3 bg-teal-600 text-white rounded-xl font-bold"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
          <button onClick={() => setStep('LANDING')} className="w-full mt-4 text-gray-500 text-sm">Cancel</button>
        </div>
      )}

      {step === 'PHONE' && (
        <div className="w-full max-w-sm text-left">
          <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
          <input 
            type="tel" 
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-xl mb-4 focus:ring-2 focus:ring-teal-500 outline-none"
            placeholder="+1 555 000 0000"
          />
          <button 
            onClick={handleSendOtp}
            className="w-full py-3 bg-teal-600 text-white rounded-xl font-bold"
          >
            Send OTP
          </button>
          <button onClick={() => setStep('LANDING')} className="w-full mt-4 text-gray-500 text-sm">Cancel</button>
        </div>
      )}

      {step === 'OTP' && (
        <div className="w-full max-w-sm text-left">
          <label className="block text-sm font-medium text-gray-700 mb-1">Enter code (Any 6 digits)</label>
          <input 
            type="text" 
            value={otp}
            maxLength={6}
            onChange={(e) => setOtp(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-xl mb-4 text-center tracking-widest text-2xl focus:ring-2 focus:ring-teal-500 outline-none"
            placeholder="000000"
          />
          <button 
            onClick={handleVerifyOtp}
            disabled={verifying}
            className="w-full py-3 bg-teal-600 text-white rounded-xl font-bold disabled:opacity-60"
          >
            {verifying ? "Checking..." : "Verify & Continue"}
          </button>
        </div>
      )}

      {step === 'USERNAME' && pendingProfile && (
        <div className="w-full max-w-sm text-left space-y-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">Choose a username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-xl mb-4 focus:ring-2 focus:ring-teal-500 outline-none"
            placeholder="Enter a display name"
          />
          <button 
            onClick={handleUsernameSubmit}
            className="w-full py-3 bg-teal-600 text-white rounded-xl font-bold"
          >
            Continue
          </button>
        </div>
      )}
    </div>
  );
};

export default AuthScreen;
