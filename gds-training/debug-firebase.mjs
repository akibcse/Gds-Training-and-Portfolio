
import { initializeApp } from "firebase/app";
import { getDatabase, ref, get } from "firebase/database";
import dotenv from "dotenv";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env.local') });

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

async function check() {
    try {
        const snapshot = await get(ref(db, "courses"));
        const val = snapshot.val();
        console.log("--- Firebase Data Structure ---");
        console.log("Type:", Array.isArray(val) ? "array" : typeof val);
        if (val) {
            const keys = Object.keys(val);
            console.log("Keys found:", keys.slice(0, 5), keys.length > 5 ? "..." : "");
            console.log("First item:", JSON.stringify(val[keys[0]], null, 2));
        } else {
            console.log("No data found in 'courses'");
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

check().then(() => process.exit());
