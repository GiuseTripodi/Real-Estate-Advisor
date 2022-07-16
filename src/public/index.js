var currentCondo

function categoryFilterSelectionListener() {
  let categoryFilter = document.getElementById('category-filter');
  let priceSelection = document.getElementById('price-filter');
  let calculations = document.getElementById('calculations');
  let similarityContainer = document.getElementById('similarityContainer');
  
  if (categoryFilter.value == "Condo") {
      priceSelection.style.display = "block"
      calculations.style.display = "block"
      similarityContainer.style.display = "block"
  }
  else {
      priceSelection.style.display = "none"
      calculations.style.display = "none"
      similarityContainer.style.display = "none"
  }
}

let categoryFilter = document.getElementById('category-filter');
categoryFilter.addEventListener("change", categoryFilterSelectionListener);

filterGraph()