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
    alert("Access denied");
    return;
  }

  loadShopsWithFoods();
});

async function loadShopsWithFoods() {
  shopList.innerHTML = "";

  const shopSnap = await getDocs(collection(db, "shops"));

  for (const shopDoc of shopSnap.docs) {
    const shop = shopDoc.data();
    const shopId = shopDoc.id;

    const shopDiv = document.createElement("div");
    shopDiv.classList.add("card", "shop");
    shopDiv.innerHTML = `<h2>${shop.name}</h2>`;

    const foodQuery = query(
      collection(db, "foods"),
      where("shopId", "==", shopId)
    );

    const foodSnap = await getDocs(foodQuery);

    foodSnap.forEach(foodDoc => {
      const food = foodDoc.data();

      const foodDiv = document.createElement("div");
      foodDiv.classList.add("food");
      foodDiv.innerHTML = `
        ${food.name} - Rs ${food.price}
        <button>Add</button>
      `;

      foodDiv.querySelector("button").onclick = () =>
        addToCart(foodDoc.id);

      shopDiv.appendChild(foodDiv);
    });

    shopList.appendChild(shopDiv);
  }
}

async function addToCart(foodId) {
  const cartRef = doc(db, "carts", currentUserId);
  const cartSnap = await getDoc(cartRef);

  let cart = {};
  if (cartSnap.exists()) cart = cartSnap.data();

  cart[foodId] = (cart[foodId] || 0) + 1;
  await setDoc(cartRef, cart);

  alert("Added to cart");
}

