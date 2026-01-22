const total = 0;
const totalText = document.querySelector(".cart strong");

document.querySelectorAll(".add-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const price = parseInt(btn.getAttribute("data-price"));
    total += price;
    totalText.innerText = `Total: PKR ${total}`;
  });
});

const searchInput = document.querySelector(".search input");
const items = document.querySelectorAll(".item");

searchInput.addEventListener("keyup", () => {
  const value = searchInput.value.toLowerCase();

  items.forEach(item => {
    const name = item.querySelector("h4").innerText.toLowerCase();
    if (name.includes(value)) {
      item.style.display = "block";
    } else {
      item.style.display = "none";
    }
  });
});


let cart = [];

// const cartBox = document.querySelector(".cart-items");
// const totalEl = document.getElementById("total");

// document.querySelectorAll(".add-wrapper").forEach(wrapper => {
//   const button = wrapper.querySelector(".add-btn");
//   const countEl = wrapper.querySelector(".count");

//   button.addEventListener("click", () => {
//     const name = button.dataset.name;
//     const price = Number(button.dataset.price);

//     let item = cart.find(i => i.name === name);

//     if (item) {
//       item.qty += 1;
//     } else {
//       item = { name, price, qty: 1 };
//       cart.push(item);
//     }

//     // SHOW NUMBER ON BUTTON
//     countEl.style.display = "flex";
//     countEl.innerText = item.qty;

//     renderCart();
//   });
// });


document.querySelectorAll(".add-wrapper").forEach(wrapper => {
  const btn = wrapper.querySelector(".add-btn");
  const badge = wrapper.querySelector(".qty-badge");

  btn.addEventListener("click", () => {
    const name = btn.dataset.name;
    const price = Number(btn.dataset.price);

    let item = cart.find(i => i.name === name);

    if (item) {
      item.qty++;
    } else {
      item = { name, price, qty: 1 };
      cart.push(item);
    }

    // UPDATE BADGE
    badge.innerText = item.qty;
    badge.classList.add("active");

    // BUTTON FEEDBACK
    btn.innerText = "Add More";
  });
});

