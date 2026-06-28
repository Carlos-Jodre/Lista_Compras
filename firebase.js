import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCCT6LrlykJaC-YVSIcIn28pEQeznoV9G4",
  authDomain: "lista-compras-jm.firebaseapp.com",
  projectId: "lista-compras-jm",
  storageBucket: "lista-compras-jm.firebasestorage.app",
  messagingSenderId: "541192537878",
  appId: "1:541192537878:web:910b4f6b57429de6d1b237"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
