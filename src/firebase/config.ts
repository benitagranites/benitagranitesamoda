// Benita Granites — Firebase Configuration
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyA370TyNEZtgjx9Jk530Ghwugg_9qhcJGs",
  authDomain: "benitagranites.firebaseapp.com",
  projectId: "benitagranites",
  storageBucket: "benitagranites.firebasestorage.app",
  messagingSenderId: "109007515713",
  appId: "1:109007515713:web:862fd4384cd09c088a56c0",
  measurementId: "G-K3SE55671G"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Firestore
export const db = getFirestore(app);

// Utilities
export const getServerTimestamp = () => serverTimestamp();

export default app;
