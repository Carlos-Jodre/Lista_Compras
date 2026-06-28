import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
apiKey: "AIzaSyDfq4oVaFxhGaqipx52itBxUARcajJhHfA",
authDomain: "tareas-casa-11c7b.firebaseapp.com",
projectId: "tareas-casa-11c7b",
storageBucket: "tareas-casa-11c7b.firebasestorage.app",
messagingSenderId: "956111451974",
appId: "1:956111451974:web:aab85979e536d5770e1747"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
