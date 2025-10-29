// Import the functions you need from the SDKs you need
import { initializeApp} from "firebase/app";
import { getAuth } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBi4ZnK25ixHPrSoqNBpcqBTEv4CHEMQi4",
  authDomain: "astra-1f748.firebaseapp.com",
  projectId: "astra-1f748",
  storageBucket: "astra-1f748.firebasestorage.app",
  messagingSenderId: "303234111800",
  appId: "1:303234111800:web:fa587631fdc095015349cd",
  measurementId: "G-MTQZTKC299"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);


export { auth };