
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBZFTbjU-1ZtXuHyACLNqSQ9d9wSTgn4NU",
  authDomain: "unilink-app.firebaseapp.com",
  projectId: "unilink-app",
  storageBucket: "unilink-app.appspot.com",
  messagingSenderId: "156094658472",
  appId: "1:156094658472:web:10ef8b7d75f40dfe123456",
  measurementId: "G-LEKNWEDM4F"
};

// Initialize Firebase
let firebaseApp;
try {
  firebaseApp = initializeApp(firebaseConfig);
} catch (error) {
  console.error("Firebase initialization error:", error);
}

// Initialize Firebase Auth
export const auth = getAuth(firebaseApp);
export default firebaseApp;
