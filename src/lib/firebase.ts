import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyArXei1wxR2HsGUOKHqPzrPv5eZfJaa0UI",
  authDomain: "contrato-963a5.firebaseapp.com",
  projectId: "contrato-963a5",
  storageBucket: "contrato-963a5.appspot.com", // Fixed storage bucket URL
  messagingSenderId: "899243058149",
  appId: "1:899243058149:web:9cd8a7ee5b26d0f80d850c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
export default app;