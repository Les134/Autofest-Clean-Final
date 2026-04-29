import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "YOUR_REAL_API_KEY",
  authDomain: "autofest-burnout-judging.firebaseapp.com",
  projectId: "autofest-burnout-judging",
  storageBucket: "autofest-burnout-judging.appspot.com",
  messagingSenderId: "YOUR_REAL_ID",
  appId: "YOUR_REAL_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// ✅ THIS LINE IS CRITICAL
const db = getFirestore(app);

// ✅ THIS EXPORT FIXES YOUR ERROR
export { db };
