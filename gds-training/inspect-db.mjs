
import { initializeApp } from "firebase/app";
import { getDatabase, ref, get } from "firebase/database";

const firebaseConfig = {
    apiKey: "AIzaSyBRBK0TnBJ7ga3H7-DOYUHmQqZXbLJ5LiY",
    authDomain: "amadeusapitest.firebaseapp.com",
    databaseURL: "https://amadeusapitest-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "amadeusapitest",
    storageBucket: "amadeusapitest.firebasestorage.app",
    messagingSenderId: "891661614430",
    appId: "1:891661614430:web:48637a0a8ac59870e4e3cf"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

async function check() {
    try {
        const snapshot = await get(ref(db, "courses"));
        const val = snapshot.val();
        console.log("STRUCTURE_START");
        console.log(JSON.stringify({
            type: Array.isArray(val) ? "array" : typeof val,
            keys: val ? Object.keys(val) : []
        }));
        console.log("STRUCTURE_END");
    } catch (error) {
        console.error("Error:", error);
    }
}

check().then(() => process.exit());
