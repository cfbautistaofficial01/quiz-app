// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// PASTE YOUR FIREBASE CONFIG OBJECT HERE
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBLsReufwwfJUkFHLeaAV1iEEfsTvxAZxQ",
  authDomain: "threat-quiz-pwa.firebaseapp.com",
  projectId: "threat-quiz-pwa",
  storageBucket: "threat-quiz-pwa.firebasestorage.app",
  messagingSenderId: "115808968280",
  appId: "1:115808968280:web:98b165fea3bba8555f742d"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);