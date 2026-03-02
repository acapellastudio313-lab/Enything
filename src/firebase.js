import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Konfigurasi Firebase Anda yang sudah aktif
const firebaseConfig = {
  apiKey: "AIzaSyC4JiCzv-rK2jtlgzXC1ZLS45bgyTS6bBA",
  authDomain: "pwaa-156d4.firebaseapp.com",
  projectId: "pwaa-156d4",
  storageBucket: "pwaa-156d4.firebasestorage.app",
  messagingSenderId: "255936810600",
  appId: "1:255936810600:web:6e9ed7b1ac4d9cea45f5dd",
  measurementId: "G-YZPRRPBGF0"
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);

// Ekspor layanan yang dibutuhkan aplikasi
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
