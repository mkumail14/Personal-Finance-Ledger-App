import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBVzpfggl4PDCowxsKdPP1_7J9CEVC48kY",
  authDomain: "myfinanceapp-99d8e.firebaseapp.com",
  projectId: "myfinanceapp-99d8e",
  storageBucket: "myfinanceapp-99d8e.firebasestorage.app",
  messagingSenderId: "677314226393",
  appId: "1:677314226393:web:464797d6c5483d6d8376c8",
  measurementId: "G-ZECM0GBWD2"
};

export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const db = getFirestore(app);
