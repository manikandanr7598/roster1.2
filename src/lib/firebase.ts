// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBhfA_04Geqiu-wuchMTJ5LhWy_Wq64_pQ",
  authDomain: "whmsdb.firebaseapp.com",
  projectId: "whmsdb",
  storageBucket: "whmsdb.firebasestorage.app",
  messagingSenderId: "499837100479",
  appId: "1:499837100479:web:50fa6867b9d5df3596c10a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
