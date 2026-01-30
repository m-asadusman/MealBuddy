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
  getDocs,
  deleteDoc, 
  updateDoc  

} from "./firebase.js";

const vendorContent = document.getElementById("vendorContent");
const loader = document.getElementById("loader");

onAuthStateChanged(auth, async (user) => {
  loader.style.display = "flex";
  vendorContent.style.display = "none";

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
    loader.style.display = "none";
    vendorContent.style.display = "block";
    vendorContent.className = 'card'
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
    loader.style.display = "none";
    vendorContent.style.display = "block";

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
        Swal.fire({
          title: "Enter Shop name!",
          icon: "error",
          draggable: false
        });
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

      <h3 style="margin-top:15px">Your Foods</h3>
      <div id="foodList">
      </div>
    </div>
  `;

  loader.style.display = "none";
  vendorContent.style.display = "block";

  document.getElementById("addFoodBtn").onclick = async () => {
    const name = document.getElementById("foodName").value.trim();
    const price = Number(document.getElementById("foodPrice").value);

    if (!name || price <= 0) {
      Swal.fire({
        title: "Enter a valid data!",
        icon: "error",
        draggable: false
      });
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
    foodList.innerHTML = `
      <div class="spinner-wrap">
        <div class="spinner"></div>
      </div>
    `;

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


    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.style.marginLeft = "10px";
    editBtn.onclick = async () => {
      const newName = prompt("Edit Food Name:", food.name);
      const newPrice = prompt("Edit Price:", food.price);

   if (newName && newPrice > 0) {
     await updateDoc(doc(db, "foods", foodId), {
       name: newName,
       price: Number(newPrice)
     });
     loadFoods();
   }
 };

 const deleteBtn = document.createElement("button");
 deleteBtn.textContent = "Delete";
 deleteBtn.style.marginLeft = "5px";
 deleteBtn.onclick = async () => {
   if (confirm("Are you sure?")) {
     await deleteDoc(doc(db, "foods", foodId));
     loadFoods();
   }
 };

 div.appendChild(editBtn);
 div.appendChild(deleteBtn);
 foodList.appendChild(div);
 });
}

  loadFoods();
});
