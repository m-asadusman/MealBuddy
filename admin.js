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

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "./login.html";
    return;
  }

  const snap = await getDoc(doc(db, "users", user.uid));
  if (!snap.exists() || snap.data().role !== "admin") {
    alert("Access denied");
    window.location.href = "./main.html";
    return;
  }

  loadVendors();
});

async function loadVendors() {
  vendorList.innerHTML = "";

  const snapshot = await getDocs(collection(db, "users"));

  snapshot.forEach(docSnap => {
    const user = docSnap.data();

    if (user.role === "vendor") {
      const div = document.createElement("div");
      div.classList.add("card");

      div.innerHTML = `
        <strong>${user.name}</strong> (${user.email})<br>
        Status: ${user.verified ? "Verified" : "Pending"}
      `;

      if (!user.verified) {
        const btn = document.createElement("button");
        btn.textContent = "Verify";

        btn.onclick = async () => {
          await updateDoc(doc(db, "users", docSnap.id), {
            verified: true
          });
          loadVendors();
        };

        div.appendChild(document.createElement("br"));
        div.appendChild(btn);
      }

      vendorList.appendChild(div);
    }
  });
}
