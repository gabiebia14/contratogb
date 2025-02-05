import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyArXei1wxR2HsGUOKHqPzrPv5eZfJaa0UI",
  authDomain: "contrato-963a5.firebaseapp.com",
  projectId: "contrato-963a5",
  storageBucket: "contrato-963a5.firebasestorage.app",
  messagingSenderId: "899243058149",
  appId: "1:899243058149:web:9cd8a7ee5b26d0f80d850c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;