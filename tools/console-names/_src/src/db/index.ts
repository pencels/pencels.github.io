// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { collection, doc, getDoc, getFirestore, increment, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAcp71VApQs8oYzyIc4GdTNIueoYrrRA-c",
    authDomain: "pency-tools-1750494005620.firebaseapp.com",
    projectId: "pency-tools-1750494005620",
    storageBucket: "pency-tools-1750494005620.firebasestorage.app",
    messagingSenderId: "841540777959",
    appId: "1:841540777959:web:0159519a2a69a1bb93ef42"
};

// Initialize Firebase
initializeApp(firebaseConfig);

export const db = getFirestore();

export function normalizeName(name: string): string {
    // Case insensitive, single spaces for whitespace, no leading/trailing whitespace
    return name.toLowerCase().replace(/\s{2,}/g, ' ').trim();
}

export async function addName(name: string) {
    try {
        const id = normalizeName(name);
        const docRef = doc(collection(db, "console-names"), id);
        const docSnap = await getDoc(docRef);

        // Increment count if already exists, otherwise create doc for name
        if (docSnap.exists()) {
            updateDoc(docRef, {
                count: increment(1),
            });
        } else {
            await setDoc(docRef, {
                name,
                discovered: serverTimestamp(),
            });
        }
        console.log("Document written with ID: ", id);
    } catch (e) {
        console.error("Error adding document: ", e);
    }
}