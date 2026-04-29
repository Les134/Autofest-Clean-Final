import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "PASTE_REAL_KEY_HERE",
  authDomain: "autofestscoreapp.firebaseapp.com",
  projectId: "autofestscoreapp",
  storageBucket: "autofestscoreapp.appspot.com",
  messagingSenderId: "PASTE_REAL_ID",
  appId: "PASTE_REAL_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
