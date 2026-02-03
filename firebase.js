import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";

import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

import {
    getFirestore,
    doc,
    setDoc,
    getDoc,
    collection,
    getDocs,
    updateDoc,
    addDoc,
    query,
    where,
    deleteDoc,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCTRUp7spjQkeaush050ZuzLF13EBsYzMU",
    authDomain: "mealbuddy-96a46.firebaseapp.com",
    projectId: "mealbuddy-96a46",
    storageBucket: "mealbuddy-96a46.firebasestorage.app",
    messagingSenderId: "29053278359",
    appId: "1:29053278359:web:4650ddff8cf5771bdfb1d2"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export {
    auth,
    db,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut,
    doc,
    setDoc,
    getDoc,
    collection,
    getDocs,
    updateDoc,
    addDoc,
    query,
    where,
    deleteDoc,
    onSnapshot
}