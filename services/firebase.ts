import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDkZjlhayUoh8Kvu6MQSMU4akJ3HIRGOu8",
  authDomain: "physio-web-c6c57.firebaseapp.com",
  projectId: "physio-web-c6c57",
  storageBucket: "physio-web-c6c57.firebasestorage.app",
  messagingSenderId: "740634395330",
  appId: "1:740634395330:web:40e87261c2b1dda1e8315b",
  measurementId: "G-K3LTYB2CWH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const analytics = getAnalytics(app);