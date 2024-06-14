let productForm = document.forms[0];
let productNameInput = document.getElementById("productName");
let productPriceInput = document.getElementById("productPrice");
let productDescriptionInput = document.getElementById("productDescription");
let productCategoryInput = document.getElementById("productCategory");
let productImageInput = document.getElementById("productImage");
let searchProductInput = document.getElementById("searchProduct");
let addProductBtn = document.getElementById("addProduct");
let updateProductBtn = document.getElementById("updateProduct");
let productsList = document.getElementById("productsList");
let currentIndex;

let inputsRegex = {
  productName: {
    status: false,
    regex: /^[a-zA-Z0-9][a-zA-Z0-9\s'-]{1,48}[a-zA-Z0-9]$/,
  },
  productPrice: {
    status: false,
    regex: /^(10000|[1-9]\d{3})$/,
  },
  productDescription: {
    status: false,
    regex: /^[\w\s.,'-]{10,200}$/,
  },
  productCategory: {
    status: false,
    regex: /^(smartphones|laptops|tablets|televisions|cameras)$/,
  },
  productImage: {
    status: false,
  },
};

function validateInput(element) {
  function validation(condition) {
    inputsRegex[elementID].status = condition;
    element.classList.add(`is-${condition ? "" : "in"}valid`);
    element.classList.remove(`is-${condition ? "in" : ""}valid`);
  }
  let elementID = element.id;
  if (
    (element.type == "file" && element.files.length == 1) ||
    inputsRegex[elementID].regex.test(element.value)
  )
    validation(true);
  else validation(false);

  validateForm();
}

function validateForm() {
  if (Object.values(inputsRegex).every((input) => input.status))
    addProductBtn.disabled = false;
  else addProductBtn.disabled = true;
}

function resetForm() {
  productForm.reset();
  productNameInput.classList.remove("is-valid");
  productPriceInput.classList.remove("is-valid");
  productCategoryInput.classList.remove("is-valid");
  productDescriptionInput.classList.remove("is-valid");
  productImageInput.classList.remove("is-valid");
  addProductBtn.disabled = true;
  Object.keys(inputsRegex).forEach(
    (input) => (inputsRegex[input].status = false)
  );
}

function getProducts() {
  const products = localStorage.getItem("products");
  return products ? JSON.parse(products) : [];
}

function saveProducts(products) {
  localStorage.setItem("products", JSON.stringify(products));
}

function addProduct(event) {
  event.preventDefault();

  const newProduct = {
    name: productNameInput.value,
    price: productPriceInput.value,
    description: productDescriptionInput.value,
    category: productCategoryInput.value,
  };

  let file = productImageInput.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (event) {
      newProduct.image = event.target.result;

      const products = getProducts();
      products.push(newProduct);
      saveProducts(products);

      resetForm();

      displayProduct(newProduct, products.length - 1);
    };
    reader.readAsDataURL(file);
  } else {
    const products = getProducts();
    products.push(newProduct);
    saveProducts(products);

    resetForm();

    displayProduct(newProduct, products.length - 1);
  }
}

function deleteProduct(element) {
  let product = element.closest(".col-md-4");
  let index = product.dataset.index;
  product.remove();
  let products = getProducts();
  products.splice(index, 1);
  saveProducts(products);
}

function prepareProductToUpdate(element) {
  resetForm();
  let product = element.closest(".col-md-4");
  currentIndex = product.dataset.index;
  productNameInput.value = product.querySelector(".card-title").innerHTML;
  productPriceInput.value = product.querySelector(".price").innerHTML.slice(1);
  productDescriptionInput.value = product.querySelector(".card-text").innerHTML;
  productCategoryInput.value = product.querySelector(".category").innerHTML;
  addProductBtn.classList.add("d-none");
  updateProductBtn.classList.remove("d-none");
}

function updateProduct() {
  validateInput(productNameInput);
  validateInput(productPriceInput);
  validateInput(productCategoryInput);
  validateInput(productDescriptionInput);
  if (
    inputsRegex[productNameInput.id].status &&
    inputsRegex[productCategoryInput.id].status &&
    inputsRegex[productDescriptionInput.id].status &&
    inputsRegex[productPriceInput.id].status
  ) {
    let products = getProducts();
    products[currentIndex].name = productNameInput.value;
    products[currentIndex].category = productCategoryInput.value;
    products[currentIndex].description = productDescriptionInput.value;
    products[currentIndex].price = productPriceInput.value;
    if (productImageInput.files.length == 1)
      products[
        currentIndex
      ].image = `images/${productImageInput.files[0].name}`;
    saveProducts(products);
    productsList.innerHTML = "";
    displayProducts();
    resetForm();
    updateProductBtn.classList.add("d-none");
    addProductBtn.classList.remove("d-none");
  }
}

function displayProduct(product, index) {
  let parentDiv = document.createElement("div");
  parentDiv.className = "col-md-4";
  parentDiv.dataset.index = index;
  parentDiv.innerHTML = `
  <div class="card">
    <img src="${product.image}" class="card-img-top" alt="${product.name}" />
    <div class="card-body">
      <div class="d-flex align-items-center justify-content-between">
        <div>
          <h5 class="card-title">${product.name}</h5>
          <p class="category small mb-2">${product.category}</p>
        </div>
        <span class="price fs-1 text-success-emphasis fw-bold">$${product.price}</span>
      </div>
      <p class="card-text">${product.description}</p>
      <button class="update btn btn-outline-warning mb-3 w-100 fw-bold border-2">Edit</button>
      <button class="delete btn btn-outline-danger w-100 fw-bold border-2">Delete</button>
    </div>
  </div>`;
  parentDiv.addEventListener("click", function (event) {
    let target = event.target;
    if (target.classList.contains("update")) prepareProductToUpdate(target);
    if (target.classList.contains("delete")) deleteProduct(target);
  });
  productsList.appendChild(parentDiv);
}

function displayProducts() {
  const products = getProducts();
  products.forEach((product, index) => displayProduct(product, index));
}

function searchProduct(event) {
  const searchValue = event.target.value.toLowerCase();
  const products = getProducts();
  productsList.innerHTML = "";
  products.forEach((product, index) => {
    if (product.name.toLowerCase().includes(searchValue)) {
      displayProduct(product, index);
    }
  });
}

displayProducts();

productForm.addEventListener("submit", addProduct);

productNameInput.addEventListener("input", function (event) {
  validateInput(event.target);
});
productPriceInput.addEventListener("input", function (event) {
  validateInput(event.target);
});
productDescriptionInput.addEventListener("input", function (event) {
  validateInput(event.target);
});
productCategoryInput.addEventListener("input", function (event) {
  validateInput(event.target);
});
productImageInput.addEventListener("change", function (event) {
  validateInput(event.target);
});
updateProductBtn.addEventListener("click", updateProduct);

searchProductInput.addEventListener("input", searchProduct);
