function showProducts() {
    document.getElementById("productsContent").style.display = "block";
    document.getElementById("ordersContent").style.display = "none";
    loadProducts(); 
}

function showOrders() {
    document.getElementById("productsContent").style.display = "none";
    document.getElementById("ordersContent").style.display = "block";
}

function showAddProductForm() {
    document.getElementById("addProductForm").style.display = "block";
    document.getElementById("ordersContent").style.display = "none";
}

function cancelAddProductForm() {
    document.getElementById("addProductForm").style.display = "none";
    document.getElementById("productsContent").style.display = "block";
}


function loadProducts() {
    fetch("http://localhost:8080/api/products")
        .then(response => response.json())
        .then(products => {
            const productList = document.getElementById('tableProduct');
            productList.innerHTML = '';

            products.forEach(product => {
                const productRow = document.createElement('div');
                productRow.innerHTML = `
                    <p><strong>${product.name}</strong> - ${product.description} - Estoque: ${product.productStock}</p>
                    <button onclick="editProduct(${product.id})">Editar</button>
                    <button onclick="deleteProduct(${product.id})">Excluir</button>
                `;
                productList.appendChild(productRow);
            });
        })
        .catch(error => console.error("Erro ao carregar produtos:", error));
}

document.getElementById("productForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const formData = new FormData();
    formData.append("name", document.getElementById("name").value);
    formData.append("description", document.getElementById("description").value);
    formData.append("productStock", document.getElementById("productStock").value);
    formData.append("img", document.getElementById("img").files[0]);

    fetch("http://localhost:8080/api/products", {
        method: "POST",
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        alert("Produto cadastrado com sucesso!");
        showProducts();  
    })
    .catch(error => console.error("Erro ao cadastrar produto:", error));
});
