import { ref, get } from "firebase/database";
import { getFirebaseDatabase } from "../lib/firebase";

async function listRootKeys() {
    const db = getFirebaseDatabase();
    if (!db) return;

    const snapshot = await get(ref(db));
    if (snapshot.exists()) {
        console.log("Root keys:", Object.keys(snapshot.val()));
    } else {
        console.log("No root data found.");
    }
}

listRootKeys().then(() => process.exit(0));
