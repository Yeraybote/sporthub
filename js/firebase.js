// js/firebase.js  (v11.3.1)
import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyAfdizEASjDgOhzU1n9EVcyz-daxB1tOT0",
  authDomain: "sporthub-97e60.firebaseapp.com",
  projectId: "sporthub-97e60",
  storageBucket: "sporthub-97e60.firebasestorage.app",
  messagingSenderId: "961290047608",
  appId: "1:961290047608:web:6a54535e619ef694015d8d",
  measurementId: "G-EWB7RLPW7D"
};

// evita doble inicialización
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getDatabase(app);