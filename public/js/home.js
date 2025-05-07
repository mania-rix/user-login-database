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
      console.log("Fetched categories data:", data);
      categories = data; // Assign fetched data to categories
    })
    .catch((error) => {
      console.error("There has been a problem with your fetch operation:", error);
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
      console.log("Fetched products data:", data);
      products = data; // Assign fetched data to products
      displayFirstProducts(products); // Display the first product of each category
    })
    .catch((error) => {
      console.error("There has been a problem with your fetch operation:", error);
    });
});

function createProductCard(product) {
  const card = document.createElement("article");
  card.classList.add("card");

  const productImage = document.createElement("img");
  productImage.src = product.featureImage; // image source
  productImage.classList.add("card-image");
  card.appendChild(productImage);

  const header3 = document.createElement("h3");
  header3.textContent = product.title;
  card.appendChild(header3);

  const productPrice = document.createElement("footer");
  productPrice.textContent = "$" + product.price.toFixed(2);
  card.appendChild(productPrice);

  return card;
}

function displayFirstProducts(products) {
  const mainContentDiv = document.getElementById("main-content");
  mainContentDiv.innerHTML = "";

  // Filter products that have an ID ending in 1 because it's the first product of each category
  const firstProducts = products.filter((product) => product.id % 10 === 1);

  firstProducts.forEach((product) => {
    const productCard = createProductCard(product);
    mainContentDiv.appendChild(productCard);
  });
}