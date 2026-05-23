import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAvrYLqZcgpUAT5pwsZenKH4B7cfdCZ0r8",
  authDomain: "golf-app-web.firebaseapp.com",
  projectId: "golf-app-web",
  storageBucket: "golf-app-web.firebasestorage.app",
  messagingSenderId: "23013498391",
  appId: "1:23013498391:web:a3e5065344bad9163d8652"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);