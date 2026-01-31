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
      <h2 class="statusHead">Account Under Review</h2>
      <p class="status statusV">Waiting for admin approval.</p>
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
          icon: "warning",
          text: "Enter shop name",
          confirmButtonText: "OK"
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
    <div class="card cardVendor">
      <h2>${shop.name}</h2>

      <h3>Add Food</h3>
      <input id="foodName" placeholder="Food name">
      <input id="foodPrice" type="number" placeholder="Price">
      <input id="foodImage" type="file" accept="image/*">
      
      <button id="addFoodBtn">Add Food</button>

      <h3 style="margin-top:15px">Your Foods</h3>
      <div id="foodList"></div>
    </div>
  `;

  loader.style.display = "none";
  vendorContent.style.display = "block";

  document.getElementById("addFoodBtn").onclick = async () => {
    const name = document.getElementById("foodName").value.trim();
    const price = Number(document.getElementById("foodPrice").value);
    const image = document.getElementById("foodImage").files[0]

    if (!name || price <= 0) {
      Swal.fire({
        icon: "warning",
        text: "Enter valid food data",
        confirmButtonText: "OK"
      });
      return;
    }

    let imageURL = "";

    if (image) {
      loader.style.display = "flex";
      vendorContent.style.display = "none";

      try {
        const fd = new FormData();
        fd.append("file", image);
        fd.append("upload_preset", "default");

        const res = await fetch(
          "https://api.cloudinary.com/v1_1/dwcrdqvyr/image/upload",
          {
            method: "POST",
            body: fd
          }
        );

        const imgData = await res.json();

        if (!imgData.secure_url) {
          throw new Error("Upload failed");
        }

        imageURL = imgData.secure_url;

      } catch (err) {
        Swal.fire({
          icon: "error",
          text: "Image upload failed",
          confirmButtonText: "OK"
        });
        return;
      } finally {
        loader.style.display = "none";
        vendorContent.style.display = "block";
      }
    }

    await addDoc(collection(db, "foods"), {
      name,
      price,
      imageURL,
      shopId,
      createdAt: Date.now()
    });

    document.getElementById("foodName").value = "";
    document.getElementById("foodPrice").value = "";
    document.getElementById("foodImage").value = "";

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

      const placeholder = './assets/fp.png';
      const imgSrc = food.imageURL || placeholder;

      div.innerHTML = `<div class="foodAlign1">
        <img class="foodImg" src="${imgSrc}" alt="food"/>
        <p> ${food.name}</p>
        </div>
        <div class="foodAlign2">
        <strong> Rs ${food.price} </strong>
        </div>`;
      foodList.appendChild(div);
    });
  }

  loadFoods();
});

