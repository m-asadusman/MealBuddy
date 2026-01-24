import { auth, db } from "./firebase.js";
import { signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

const logoutBtn = document.getElementById("logoutBtn");
const usernameEl = document.getElementById("username");

onAuthStateChanged(auth, async (user) => {
    if (!user) return;

    const snap = await getDoc(doc(db, "users", user.uid));
    if (!snap.exists()) return;

    const data = snap.data();
    if (usernameEl) {
        usernameEl.textContent = `Hi, ${data.name}`;
    }
});

if (logoutBtn) {
    logoutBtn.onclick = async () => {
        await signOut(auth);
        window.location.href = "./index.html";
    };
}
