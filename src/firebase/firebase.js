import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAP9vpHb2amXTJmMlIsI1tRS14bq77oS3E",
  authDomain: "socialxcafe-42367.firebaseapp.com",
  projectId: "socialxcafe-42367",
  storageBucket: "socialxcafe-42367.firebasestorage.app",
  messagingSenderId: "3729380819",
  appId: "1:3729380819:web:0a94358caf379ad6bd8b26",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
