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
const emailInput = document.getElementById("email");
const savedEmail = localStorage.getItem("prefillEmail");

if (emailInput && savedEmail) {
  emailInput.value = savedEmail;
}

if (signupBtn) {
  signupBtn.onclick = async () => {
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const role = document.getElementById("role").value;

    if (!name || !email || !password) {
      Swal.fire({
        icon: "warning",
        text: "Please fill all the fields",
        confirmButtonText: "OK"
      });
      return;
    }

    if (password.length < 6) {
      Swal.fire({
        icon: "warning",
        text: "Password must be atleast 6 characters",
        confirmButtonText: "OK"
      });
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

      localStorage.setItem("prefillEmail", email);
      Swal.fire({
        icon: "success",
        text: "Account created successfully",
        confirmButtonText: "OK"
      });
      window.location.href = "./login.html";

    } catch (err) {
      Swal.fire({
        icon: "error",
        text: err.message,
        confirmButtonText: "OK"
      });
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
      Swal.fire({
        icon: "warning",
        text: "Please fill all the fields",
        confirmButtonText: "OK"
      });
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
        Swal.fire({
          icon: "error",
          text: "User data not found",
          confirmButtonText: "OK"
        });
        return;
      }

      const user = snap.data();

      localStorage.removeItem("prefillEmail");

      if (user.role === "admin") {
        window.location.href = "./admin.html";
      } else if (user.role === "vendor") {
        window.location.href = "./vendor.html";
      } else {
        window.location.href = "./main.html";
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        text: err.message,
        confirmButtonText: "OK"
      });
    } finally {
      loginBtn.disabled = false;
      loginBtn.textContent = "Login";
    }
  };
}
