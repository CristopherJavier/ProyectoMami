// ============================================================
// MedRecord Pro - Firebase Configuration
// ============================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { 
    getFirestore, 
    collection, 
    addDoc, 
    getDocs, 
    doc, 
    getDoc, 
    setDoc, 
    updateDoc, 
    deleteDoc, 
    query, 
    where, 
    orderBy, 
    serverTimestamp,
    onSnapshot,
    enableIndexedDbPersistence 
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { 
    getAuth, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword,
    onAuthStateChanged, 
    signOut,
    updateProfile,
    sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyDJLpOi6fN3X-jajx8DY2761BdS2_AZ0cg",
    authDomain: "recordmedico.firebaseapp.com",
    projectId: "recordmedico",
    storageBucket: "recordmedico.firebasestorage.app",
    messagingSenderId: "983403744566",
    appId: "1:983403744566:web:823e602a185becc70bb797",
    measurementId: "G-7X7YZV639G"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Enable offline persistence
enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
        console.warn('Persistencia offline no disponible: múltiples pestañas abiertas');
    } else if (err.code === 'unimplemented') {
        console.warn('Persistencia offline no soportada en este navegador');
    }
});

// Export everything needed
export { 
    app, 
    db, 
    auth,
    collection, 
    addDoc, 
    getDocs, 
    doc, 
    getDoc, 
    setDoc, 
    updateDoc, 
    deleteDoc, 
    query, 
    where, 
    orderBy, 
    serverTimestamp,
    onSnapshot,
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword,
    onAuthStateChanged, 
    signOut,
    updateProfile,
    sendPasswordResetEmail
};
