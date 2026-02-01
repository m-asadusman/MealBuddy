import {
  auth,
  db,
  onAuthStateChanged,
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
  setDoc
} from "./firebase.js";

const shopList = document.getElementById("shopList");
const loader = document.getElementById("loader");
let currentUserId = null;

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "./login.html";
    return;
  }

  currentUserId = user.uid;

  const snap = await getDoc(doc(db, "users", user.uid));
  if (!snap.exists()) return;

  if (snap.data().role !== "user") {
    Swal.fire({
      icon: "error",
      text: "Access Denied",
      confirmButtonText: "OK"
    });
    return;
  }

  loadShopsWithFoods();
});

async function loadShopsWithFoods() {
  loader.style.display = "flex";
  shopList.style.display = "none";

  shopList.innerHTML = "";

  const shopSnap = await getDocs(collection(db, "shops"));

  for (const shopDoc of shopSnap.docs) {
    const shop = shopDoc.data();
    const shopId = shopDoc.id;

    const foodQuery = query(
      collection(db, "foods"),
      where("shopId", "==", shopId)
    );
    const foodSnap = await getDocs(foodQuery);

    if (foodSnap.empty) continue

    const shopDiv = document.createElement("div");
    shopDiv.classList.add("card", "shop", "cardMain");
    shopDiv.innerHTML = `<h2>${shop.name}</h2>`;

    foodSnap.forEach(foodDoc => {
      const food = foodDoc.data();

      const foodDiv = document.createElement("div");
      foodDiv.classList.add("food");

      const placeholder = './assets/fp.png';
      const imgSrc = food.imageURL || placeholder;

      foodDiv.innerHTML = `
        <div class="foodAlign1">
        <img class="foodImg" src="${imgSrc}" alt="food"/>
        <p> ${food.name}</p>
        </div>
        <div class="foodAlign2">
        <strong> Rs ${food.price} </strong>
        <button>Add</button>
        </div>
        
      `;

      const addBtn = foodDiv.querySelector("button");
      addBtn.onclick = () => addToCart(foodDoc.id, addBtn);

      shopDiv.appendChild(foodDiv);
    });

    shopList.appendChild(shopDiv);
  } 
  loader.style.display = "none";
  shopList.style.display = "block";
}

async function addToCart(foodId, button) {
  button.disabled = true;
  button.innerText = "Adding...";

  try {
    const cartRef = doc(db, "carts", currentUserId);
    const cartSnap = await getDoc(cartRef);

    let cart = {};
    if (cartSnap.exists()) cart = cartSnap.data();

    cart[foodId] = (cart[foodId] || 0) + 1;
    await setDoc(cartRef, cart);

    Swal.fire({
      icon: "success",
      text: "Added to cart",
      timer: 1000,
      showConfirmButton: false
    });

  } catch (err) {
    Swal.fire({
      icon: "error",
      text: "Failed to add item"
    });
  } finally {
    button.disabled = false;
    button.innerText = "Add";
  }
}


