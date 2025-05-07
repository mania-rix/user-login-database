document.addEventListener("DOMContentLoaded", () => {
    const categoriesList = document.getElementById("categories-list");

    // Fetch the data from the server
    fetch("/api/categories")
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            "Network response was not ok " + response.statusText
          );
        }
        return response.json();
      })
      .then((data) => {
        console.log("Fetched categories data:", data);
        populateCategories(data);
      })
      .catch((error) => {
        console.error(
          "There has been a problem with your fetch operation:",
          error
        );
      });

    // Function to populate the categories list
    function populateCategories(categories) {
      if (!categoriesList) {
        console.error("categoriesList element not found.");
        return;
      }
      categoriesList.innerHTML = "";

      categories.forEach((category) => {
        const listItem = document.createElement("li");
        listItem.textContent = category.category;
        categoriesList.appendChild(listItem);
      });
    }
  });