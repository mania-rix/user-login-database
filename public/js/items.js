document.addEventListener("DOMContentLoaded", () => {
    const itemsList = document.getElementById("items-list");

    // Fetch the data from the server
    fetch("/api/items")
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            "Network response was not ok " + response.statusText
          );
        }
        return response.json();
      })
      .then((data) => {
        console.log("Fetched items data:", data);
        populateItems(data);
      })
      .catch((error) => {
        console.error(
          "There has been a problem with your fetch operation:",
          error
        );
      });

    // Function to populate the items list
    function populateItems(items) {
      if (!itemsList) {
        console.error("itemsList element not found.");
        return;
      }

      itemsList.innerHTML = "";

      items.forEach((item) => {
        const listItem = document.createElement("li");
        listItem.textContent = `${item.title} (${item.category}) - ${item.body}`;
        itemsList.appendChild(listItem);
      });
    }
  });