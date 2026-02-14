import { initializeApp, getApps } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyBRBK0TnBJ7ga3H7-DOYUHmQqZXbLJ5LiY",
  authDomain: "amadeusapitest.firebaseapp.com",
  databaseURL: "https://amadeusapitest-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "amadeusapitest",
  storageBucket: "amadeusapitest.firebasestorage.app",
  messagingSenderId: "891661614430",
  appId: "1:891661614430:web:48637a0a8ac59870e4e3cf",
  measurementId: "G-DX8LHXQRJJ"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const database = getDatabase(app);
export default app;
