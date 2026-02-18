import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBRBK0TnBJ7ga3H7-DOYUHmQqZXbLJ5LiY",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "amadeusapitest.firebaseapp.com",
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || "https://amadeusapitest-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "amadeusapitest",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "amadeusapitest.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "891661614430",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:891661614430:web:48637a0a8ac59870e4e3cf"
};

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

export { app, db, auth };

// Helpers for backward compatibility if needed, but preferred to use direct exports
export const getFirebaseApp = () => app;
export const getFirebaseDatabase = () => db;
export const getFirebaseAuth = () => auth;

export default app;
