import {
  auth,
  db,
  onAuthStateChanged,
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc
} from "./firebase.js";

const vendorList = document.getElementById("vendorList");
const loader = document.getElementById("loader");

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "./login.html";
    return;
  }

  loader.style.display = "flex";
  vendorList.style.display = "none";

  const snap = await getDoc(doc(db, "users", user.uid));
  if (!snap.exists() || snap.data().role !== "admin") {
    Swal.fire({
      icon: "error",
      text: "Access Denied",
      confirmButtonText: "OK"
    });
    window.location.href = "./main.html";
    return;
  }

  loadVendors();
  loader.style.display = "none";
  vendorList.style.display = "block";
});

async function loadVendors() {
  vendorList.innerHTML = `
    <div class="spinner-wrap">
      <div class="spinner"></div>
    </div>
  `;

  const snapshot = await getDocs(collection(db, "users"));
  vendorList.innerHTML = "";

  snapshot.forEach(docSnap => {
    const user = docSnap.data();

    if (user.role === "vendor") {
      const div = document.createElement("div");
      div.classList.add("card", "cardAdmin");

      div.innerHTML = `
        <strong>${user.name}</strong> (${user.email})<br>
        Status: ${user.verified ? "Verified" : "Pending"}
      `;

      div.appendChild(document.createElement("br"));

      if (!user.verified) {
        const verifyBtn = document.createElement("button");
        verifyBtn.className = "primary prim";
        verifyBtn.textContent = "Verify";

        verifyBtn.onclick = async () => {
          verifyBtn.disabled = true;
          verifyBtn.innerText = "Verifying...";

          try {
            await updateDoc(doc(db, "users", docSnap.id), {
              verified: true
            });
            loadVendors();
          } catch (err) {
            Swal.fire({
              icon: "error",
              text: "Failed to verify vendor"
            });
          } finally {
            verifyBtn.disabled = false;
            verifyBtn.innerText = "Verify";
          }
        };

        div.appendChild(verifyBtn);
      } else {
        const unverifyBtn = document.createElement("button");
        unverifyBtn.className = "secondary sec";
        unverifyBtn.textContent = "Unverify";

        unverifyBtn.onclick = async () => {
          unverifyBtn.disabled = true;
          unverifyBtn.innerText = "Unverifying...";

          try {
            await updateDoc(doc(db, "users", docSnap.id), {
              verified: false
            });
            loadVendors();
          } catch (err) {
            Swal.fire({
              icon: "error",
              text: "Failed to unverify vendor"
            });
          } finally {
            unverifyBtn.disabled = false;
            unverifyBtn.innerText = "Unverify";
          }
        };

        div.appendChild(unverifyBtn);
      }

      vendorList.appendChild(div);
    }
  });
}