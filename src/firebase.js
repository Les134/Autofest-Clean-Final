import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "PASTE_YOUR_REAL_KEY",
  authDomain: "autofest-burnout-judging.firebaseapp.com",
  projectId: "autofest-burnout-judging",
  storageBucket: "autofest-burnout-judging.appspot.com",
  messagingSenderId: "PASTE_REAL_ID",
  appId: "PASTE_REAL_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
