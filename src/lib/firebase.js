import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBf-aRPQbA_KoM4H2qyeyIoKGcKezFuPdw",
  authDomain: "socialxcafe-eb967.firebaseapp.com",
  projectId: "socialxcafe-eb967",
  storageBucket: "socialxcafe-eb967.firebasestorage.app",
  messagingSenderId: "1015729525508",
  appId: "1:1015729525508:web:c31cff25cd3e730b507651",
  measurementId: "G-6JP50JY73S",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
