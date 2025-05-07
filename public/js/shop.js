let categories = [];
let products = [];

document.addEventListener("DOMContentLoaded", () => {
  // Fetch the categories from the server
  fetch("/api/categories")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok " + response.statusText);
      }
      return response.json();
    })
    .then((data) => {
      categories = data;
      initializeCategoriesNav();
    })
    .catch((error) => {
      console.error(
        "There has been a problem with your fetch operation:",
        error
      );
    });

  // Fetch the products from the server
  fetch("/api/items")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok " + response.statusText);
      }
      return response.json();
    })
    .then((data) => {
      products = data;
    })
    .catch((error) => {
      console.error(
        "There has been a problem with your fetch operation:",
        error
      );
    });
});

function initializeCategoriesNav() {
  const categoriesNav = document.getElementById("categoriesNav");

  categories.forEach((category) => {
    const button = document.createElement("button");
    button.classList.add("btn", "btn-outline-primary", "me-2");
    button.textContent = category.category;
    button.addEventListener("click", () => {
      displayProductsByCategory(category.category);
    });
    categoriesNav.appendChild(button);
  });
}

function createProductCard(product) {
  const card = document.createElement("div");
  card.classList.add("card", "mb-4");
  card.style.width = "18rem";

  const productImage = document.createElement("img");
  productImage.src = product.featureImage;
  productImage.classList.add("card-img-top");
  card.appendChild(productImage);

  const cardBody = document.createElement("div");
  cardBody.classList.add("card-body");

  const cardTitle = document.createElement("h5");
  cardTitle.classList.add("card-title");
  cardTitle.textContent = product.title;
  cardBody.appendChild(cardTitle);

  const cardText = document.createElement("p");
  cardText.classList.add("card-text");
  cardText.textContent = product.body;
  cardBody.appendChild(cardText);

  const productPrice = document.createElement("p");
  productPrice.classList.add("card-text", "fw-bold");
  productPrice.textContent = `$${product.price.toFixed(2)}`;
  cardBody.appendChild(productPrice);

  card.appendChild(cardBody);
  return card;
}

function displayProductsByCategory(categoryName) {
  const productContainer = document.getElementById("product-container");
  productContainer.innerHTML = "";

  const filteredProducts = products.filter(
    (product) => product.category === categoryName && product.published
  );

  filteredProducts.forEach((product) => {
    const productCard = createProductCard(product);
    productContainer.appendChild(productCard);
  });
}
