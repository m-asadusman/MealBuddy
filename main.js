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
  setDoc,
  updateDoc,
  increment,
  deleteField
} from "./firebase.js";

const shopList = document.getElementById("shopList");
const loader = document.getElementById("loader");

let currentUserId = null;
let foodCache = {};
const placeholder = './assets/fp.png';

function showLoader() {
  loader.style.display = "flex";
  shopList.style.display = "none";
}

function hideLoader() {
  loader.style.display = "none";
  shopList.style.display = "block";
}

function showCartLoader() {
  const cartLoader = document.getElementById("cartLoader");
  const cartItems = document.getElementById("cartItems");

  if (cartLoader) cartLoader.style.display = "flex";
  if (cartItems) cartItems.style.display = "none";
}

function hideCartLoader() {
  const cartLoader = document.getElementById("cartLoader");
  const cartItems = document.getElementById("cartItems");

  if (cartLoader) cartLoader.style.display = "none";
  if (cartItems) cartItems.style.display = "block";
}

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
  showLoader();
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

    if (foodSnap.empty) continue;

    const shopDiv = document.createElement("div");
    shopDiv.classList.add("card", "shop", "cardMain");
    shopDiv.innerHTML = `<h2>${shop.name}</h2>`;

    foodSnap.forEach(foodDoc => {
      const food = foodDoc.data();

      const foodDiv = document.createElement("div");
      foodDiv.classList.add("food");

      foodDiv.innerHTML = `
        <div class="foodAlign1">
          <img class="foodImg" src="${food.imageURL || placeholder}" alt="food"/>
          <div>
            <p> ${food.name}</p>
            <strong> Rs ${food.price} </strong>
          </div>
        </div>
        <div class="foodAlign2">
          <button>Add</button>
        </div>
      `;

      const addBtn = foodDiv.querySelector("button");
      addBtn.onclick = () => addToCart(foodDoc.id, addBtn);

      shopDiv.appendChild(foodDiv);
    });

    shopList.appendChild(shopDiv);
  }

  hideLoader();
}

async function addToCart(foodId, button) {
  button.disabled = true;
  button.innerText = "Adding...";

  const cartRef = doc(db, "carts", currentUserId);

  try {
    await updateDoc(cartRef, {
      [foodId]: increment(1)
    });
  } catch {
    await setDoc(cartRef, { [foodId]: 1 });
  } finally {
    button.disabled = false;
    button.innerText = "Add";
  }

  Swal.fire({
    icon: "success",
    text: "Added to cart",
    timer: 1000,
    showConfirmButton: false
  });
}

document.getElementById("cartBtn").onclick = () => {
  Swal.fire({
    title: "Your Cart",
    html: `
      <div id="cartLoader" class="cartLoader">
        <div class="spinner"></div>
      </div>
      <div id="cartItems"></div>
    `,
    showCloseButton: true,
    confirmButtonText: "Checkout",
    width: 600,
    customClass: {
      popup: 'cartPopup'
    },
    didOpen: renderCart
  });
};

async function renderCart() {
  showCartLoader();

  const cartItemsDiv = document.getElementById("cartItems");
  const cartRef = doc(db, "carts", currentUserId);
  const cartSnap = await getDoc(cartRef);

  if (!cartSnap.exists()) {
    hideCartLoader();
    cartItemsDiv.innerHTML = "<p>Cart is empty</p>";
    return;
  }

  const cart = cartSnap.data();
  const foodIds = Object.keys(cart);

  if (foodIds.length === 0) {
    hideCartLoader();
    cartItemsDiv.innerHTML = "<p>Cart is empty</p>";
    return;
  }

  for (const id of foodIds) {
    if (!foodCache[id]) {
      const snap = await getDoc(doc(db, "foods", id));
      if (snap.exists()) foodCache[id] = snap.data();
    }
  }

  let total = 0;
  let html = "";

  foodIds.forEach(id => {
    const food = foodCache[id];
    if (!food) return;

    const qty = cart[id];
    const price = food.price * qty;
    total += price;

    html += `
      <div class="cartItem">
        <div class="cartItemInfo">
          <span class="cartFoodName">${food.name}</span>
          <strong class="cartFoodPrice">Rs ${price}</strong>
        </div>
        <div class="qtyBox">
          <button class="minusBtn" data-id="${id}">-</button>
          <span class="qty">${qty}</span>
          <button class="plusBtn" data-id="${id}">+</button>
        </div>
      </div>
    `;
  });

  html += `<br><h4 style="color:var(--mainColor)">Total: Rs ${total}</h4>`;
  cartItemsDiv.innerHTML = html;

  document.querySelectorAll(".plusBtn").forEach(btn => {
    btn.onclick = () => updateCart(btn.dataset.id, 1);
  });

  document.querySelectorAll(".minusBtn").forEach(btn => {
    btn.onclick = () => updateCart(btn.dataset.id, -1);
  });

  hideCartLoader();
}

async function updateCart(foodId, change) {
  showCartLoader();

  const cartRef = doc(db, "carts", currentUserId);
  const cartSnap = await getDoc(cartRef);

  if (!cartSnap.exists()) {
    hideCartLoader();
    return;
  }

  const cart = cartSnap.data();
  const qty = cart[foodId] || 0;

  if (change === 1) {
    await updateDoc(cartRef, { [foodId]: increment(1) });
  } else if (qty <= 1) {
    await updateDoc(cartRef, { [foodId]: deleteField() });
  } else {
    await updateDoc(cartRef, { [foodId]: increment(-1) });
  }

  renderCart();
}
