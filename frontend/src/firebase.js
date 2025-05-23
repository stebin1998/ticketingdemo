import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAUDdVzDPydcRUny0XY1CrOWOutsQ8lMfM",
  authDomain: "playmi-auth-demo.firebaseapp.com",
  projectId: "playmi-auth-demo",
  storageBucket: "playmi-auth-demo.firebasestorage.app",
  messagingSenderId: "900163434315",
  appId: "1:900163434315:web:38d6fc42980862084c5ace"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };
