import {
  auth,
  db,
  onAuthStateChanged,
  doc,
  getDoc,
  collection,
  addDoc,
  query,
  where,
  getDocs
} from "./firebase.js";

const vendorContent = document.getElementById("vendorContent");

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "./login.html";
    return;
  }

  const userSnap = await getDoc(doc(db, "users", user.uid));
  if (!userSnap.exists()) return;

  const vendor = userSnap.data();

  if (vendor.role !== "vendor") {
    window.location.href = "./main.html";
    return;
  }

  if (!vendor.verified) {
    vendorContent.innerHTML = `
      <h2>Account Under Review</h2>
      <p class="status">Waiting for admin approval.</p>
    `;
    return;
  }

  const shopQuery = query(
    collection(db, "shops"),
    where("vendorId", "==", user.uid)
  );

  const shopSnap = await getDocs(shopQuery);

  if (shopSnap.empty) {
    vendorContent.innerHTML = `
      <div class="card">
        <h2>Create Your Shop</h2>

        <input id="shopName" placeholder="Shop name">
        <button id="createShopBtn">Create Shop</button>
      </div>
    `;

    document.getElementById("createShopBtn").onclick = async () => {
      const shopName = document.getElementById("shopName").value.trim();

      if (!shopName) {
        alert("Enter shop name");
        return;
      }

      await addDoc(collection(db, "shops"), {
        name: shopName,
        vendorId: user.uid,
        createdAt: Date.now()
      });

      location.reload();
    };

    return;
  }

  const shopDoc = shopSnap.docs[0];
  const shop = shopDoc.data();
  const shopId = shopDoc.id;

  vendorContent.innerHTML = `
    <div class="card">
      <h2>${shop.name}</h2>

      <h3>Add Food</h3>
      <input id="foodName" placeholder="Food name">
      <input id="foodPrice" type="number" placeholder="Price">
      <button id="addFoodBtn">Add Food</button>

      <h3>Your Foods</h3>
      <div id="foodList"></div>
    </div>
  `;

  document.getElementById("addFoodBtn").onclick = async () => {
    const name = document.getElementById("foodName").value.trim();
    const price = Number(document.getElementById("foodPrice").value);

    if (!name || price <= 0) {
      alert("Enter valid food data");
      return;
    }

    await addDoc(collection(db, "foods"), {
      name,
      price,
      shopId,
      createdAt: Date.now()
    });

    document.getElementById("foodName").value = "";
    document.getElementById("foodPrice").value = "";

    loadFoods();
  };

  async function loadFoods() {
    const foodList = document.getElementById("foodList");
    foodList.innerHTML = "Loading...";

    const foodQuery = query(
      collection(db, "foods"),
      where("shopId", "==", shopId)
    );

    const foodSnap = await getDocs(foodQuery);
    foodList.innerHTML = "";

    foodSnap.forEach(docSnap => {
      const food = docSnap.data();

      const div = document.createElement("div");
      div.classList.add("food");
      div.textContent = `${food.name} - Rs ${food.price}`;
      foodList.appendChild(div);
    });
  }

  loadFoods();
});
