// Import Firebase core and auth
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your Firebase config object
const firebaseConfig = {
  apiKey: "AIzaSyAJkqPGPjgck59QGmXceZsWhtc8kPsFRnw",
  authDomain: "playmi-ticketing.firebaseapp.com",
  projectId: "playmi-ticketing",
  storageBucket: "playmi-ticketing.appspot.com", 
  messagingSenderId: "784307572213",
  appId: "1:784307572213:web:356aea0c25166f9724e4bc",
  measurementId: "G-GKKB0WTR7E"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth and Provider
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider };
