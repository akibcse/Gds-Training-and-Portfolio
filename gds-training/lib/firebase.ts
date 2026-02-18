import { initializeApp, getApps } from 'firebase/app';
import { getDatabase, Database } from 'firebase/database';

let dbInstance: Database | null = null;

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBRBK0TnBJ7ga3H7-DOYUHmQqZXbLJ5LiY",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "amadeusapitest.firebaseapp.com",
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || "https://amadeusapitest-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "amadeusapitest",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "amadeusapitest.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "891661614430",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:891661614430:web:48637a0a8ac59870e4e3cf"
};

export const getFirebaseDatabase = (): Database | null => {
  if (!dbInstance) {
    try {
      const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
      dbInstance = getDatabase(app);
    } catch (error) {
      console.error('Firebase initialization error:', error);
      return null;
    }
  }
  return dbInstance;
};

export const database = {
  get ref() {
    return getFirebaseDatabase();
  }
};

export default () => getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
