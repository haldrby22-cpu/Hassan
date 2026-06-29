// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // ضروري لقاعدة البيانات
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyA1VXi1E-Pq8bzEmenHgH3XBLtQVDebAQY",
  authDomain: "tlpat-farshout-25c82.firebaseapp.com",
  projectId: "tlpat-farshout-25c82",
  storageBucket: "tlpat-farshout-25c82.firebasestorage.app",
  messagingSenderId: "1018256076768",
  appId: "1:1018256076768:web:6294f10402dab350bf0585",
  measurementId: "G-9HBBBT7MH6"
};

// تهيئة الخدمة
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app); // تصدير db لاستخدامه في الصفحات
export const analytics = getAnalytics(app);
