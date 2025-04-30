
// Firebase configuration for the app
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration
// Replace with your actual Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDrB_8aniW9X7AgEb1lTlZ3Vt_zBs7wSrc",
  authDomain: "unilink-68d53.firebaseapp.com",
  projectId: "unilink-68d53",
  storageBucket: "unilink-68d53.appspot.com",
  messagingSenderId: "469545062342",
  appId: "1:469545062342:web:e675e5c6f423efb284fa01"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { app, auth };
