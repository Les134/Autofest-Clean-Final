import { initializeApp } from "firebase/app";
import {
  getFirestore,
  enableIndexedDbPersistence
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "autofestscoreapp.firebaseapp.com",
  projectId: "autofestscoreapp",
  storageBucket: "autofestscoreapp.appspot.com",
  messagingSenderId: "YOUR_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ✅ SAFE (won’t crash app if it fails)
enableIndexedDbPersistence(db).catch((err) => {
  console.log("Persistence error:", err);
});

export { db };
