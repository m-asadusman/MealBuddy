import {
  auth,
  db,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  doc,
  setDoc,
  getDoc
} from "./firebase.js";

const signupBtn = document.getElementById("signupBtn");

if (signupBtn) {
  signupBtn.onclick = async () => {
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const role = document.getElementById("role").value;

    if (!name || !email || !password) {
      alert("Please fill all fields");
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    signupBtn.disabled = true;
    signupBtn.textContent = "Creating account...";

    try {
      const userCred = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const uid = userCred.user.uid;

      await setDoc(doc(db, "users", uid), {
        name,
        email,
        role,
        verified: role === "vendor" ? false : true,
        createdAt: Date.now()
      });

      alert("Account created successfully");
      window.location.href = "./login.html";
    } catch (err) {
      alert(err.message);
    } finally {
      signupBtn.disabled = false;
      signupBtn.textContent = "Sign up";
    }
  };
}

const loginBtn = document.getElementById("loginBtn");

if (loginBtn) {
  loginBtn.onclick = async () => {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (!email || !password) {
      alert("Please fill all fields");
      return;
    }

    loginBtn.disabled = true;
    loginBtn.textContent = "Logging in...";

    try {
      const userCred = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      const uid = userCred.user.uid;
      const snap = await getDoc(doc(db, "users", uid));

      if (!snap.exists()) {
        alert("User data not found");
        return;
      }

      const user = snap.data();

      if (user.role === "admin") {
        window.location.href = "./admin.html";
      } else if (user.role === "vendor") {
        window.location.href = "./vendor.html";
      } else {
        window.location.href = "./main.html";
      }
    } catch (err) {
      alert(err.message);
    } finally {
      loginBtn.disabled = false;
      loginBtn.textContent = "Login";
    }
  };
}
