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
  onSnapshot
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
  listenToCart()
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

document.getElementById("cartBtn").onclick = () => {
  Swal.fire({
    title: "Your Cart",
    html: `
    <div id="cartLoader" class="cartLoader">
      <div class="spinner spinnerSmall"></div>
    </div>
    <div id="cartItems"></div>
  `,
    showCloseButton: true,
    confirmButtonText: "Checkout",
    width: 420,
    customClass: {
      popup: 'cartPopup'
    },
    didOpen: renderCart
  });
};

async function renderCart() {
  const cartItemsDiv = document.getElementById("cartItems");
  const cartLoader = document.getElementById("cartLoader");

  cartItemsDiv.style.display = "none";
  cartLoader.style.display = "flex";

  try {
    const cartRef = doc(db, "carts", currentUserId);
    const cartSnap = await getDoc(cartRef);

    if (!cartSnap.exists()) {
      cartLoader.style.display = "none";
      cartItemsDiv.style.display = "block";
      cartItemsDiv.innerHTML = "<p>Cart is empty</p>";
      return;
    }

    const cart = cartSnap.data();
    const foodIds = Object.keys(cart);

    const foodPromises = foodIds.map(id =>
      getDoc(doc(db, "foods", id))
    );

    const foodSnaps = await Promise.all(foodPromises);

    let total = 0;
    let html = "";

    foodSnaps.forEach((snap, index) => {
      if (!snap.exists()) return;

      const food = snap.data();
      const qty = cart[foodIds[index]];
      const price = food.price * qty;

      total += price;

      html += `
        <div style="display:flex;justify-content:space-between;margin-bottom:8px">
          <span>${food.name} × ${qty}</span>
          <strong>Rs ${price}</strong>
        </div>
      `;
    });

    html += `<hr><h3>Total: Rs ${total}</h3>`;

    cartItemsDiv.innerHTML = html;

  } catch (err) {
    cartItemsDiv.innerHTML = "<p>Failed to load cart</p>";
  } finally {
    cartLoader.style.display = "none";
    cartItemsDiv.style.display = "block";
  }
}


