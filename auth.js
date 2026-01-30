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
      Swal.fire("Plz fill all fieald");
       return;
    }

    if (password.length < 6) {
      Swal.fire("Password Must Be At Least 6 Character");
;
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
        title: "Account Created Successfull",
        icon: "success",
        draggable: true
      });
      window.location.href = "./login.html";

    } catch (err) {
      Swal.fire({
        icon: "error",
        title: err.message,
      });}
       finally {
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
        icon: "question",
        title: "Please fill all fieald",
      });return;
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
          title: "user data not found",
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
        title: err.message,
      });
    } finally {
      loginBtn.disabled = false;
      loginBtn.textContent = "Login";
    }
  };
}