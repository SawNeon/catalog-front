function showProducts() {
    document.getElementById("productsContent").style.display = "block";
    document.getElementById("ordersContent").style.display = "none";
    loadProducts();
}

function showOrders() {
    document.getElementById("productsContent").style.display = "none";
    document.getElementById("ordersContent").style.display = "block";
    fetchOrders();
}

function showAddProductForm() {
    document.getElementById("addProductForm").style.display = "block";
    document.getElementById("ordersContent").style.display = "none";
}

function cancelAddProductForm() {
    document.getElementById("addProductForm").style.display = "none";
    document.getElementById("productsContent").style.display = "block";
}
function editProduct(){
    document.getElementById("updateProductForm").style.display = "block";
}

function cancelUpdateProduct(){
    document.getElementById("updateProductForm").style.display = "none";
}

let allProducts = [];
let currentPage = 1;
const itemsPerPage = 10;

function loadProducts() {
    fetch("http://192.168.37.36:8080/api/products")
        .then(response => response.json())
        .then(products => {
            allProducts = products;
            currentPage = 1;
            renderProductTable();
        })
        .catch(error => console.error("Erro ao carregar produtos:", error));
}

function renderProductTable() {
    const productList = document.getElementById("tableProduct");
    productList.innerHTML = "";

    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedProducts = allProducts.slice(start, end);

    let tableHTML = `
        <table class="productTable">
            <thead>
                <tr>
                    <th>Nome</th>
                    <th>Descrição</th>
                    <th>Estoque</th>
                    <th>Ações</th>
                </tr>
            </thead>
            <tbody>
                ${paginatedProducts.map(product => `
                    <tr>
                        <td>${product.name}</td>
                        <td>${product.description}</td>
                        <td>${product.productStock}</td>
                        <td>
                            <button class="button-white" onclick="editProduct(${product.id})">Editar</button>
                            <button class="button-red" onclick="deleteProduct(${product.id})">Excluir</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        <div id="paginationControls" style="text-align:center; margin-top: 15px;"></div>
    `;

    productList.innerHTML = tableHTML;

    renderPaginationControls();
}

function renderPaginationControls() {
    const totalPages = Math.ceil(allProducts.length / itemsPerPage);
    const controls = document.getElementById("paginationControls");

    let paginationHTML = "";

    if (currentPage > 1) {
        paginationHTML += `<button class="button" onclick="changePage(${currentPage - 1})">Anterior</button>`;
    } else {
        paginationHTML += `<button class="button" disabled>Anterior</button>`;
    }

    paginationHTML += `<span style="margin: 0 10px;">Página ${currentPage} de ${totalPages}</span>`;

    if (currentPage < totalPages) {
        paginationHTML += `<button class="button" onclick="changePage(${currentPage + 1})">Próximo</button>`;
    } else {
        paginationHTML += `<button class="button" disabled>Próximo</button>`;
    }

    controls.innerHTML = paginationHTML;
}

function changePage(newPage) {
    currentPage = newPage;
    renderProductTable();
}


document.getElementById("productForm").addEventListener("submit", function (event) {
    event.preventDefault();

    const formData = new FormData();
    formData.append("name", document.getElementById("name").value);
    formData.append("description", document.getElementById("description").value);
    formData.append("productStock", document.getElementById("productStock").value);
    formData.append("img", document.getElementById("img").files[0]);

    fetch("http://192.168.37.36:8080/api/products", {
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

function fetchOrders() {
    fetch("http://192.168.37.36:8080/api/orders")
        .then(response => response.json())
        .then(orders => {
            displayOrders(orders);
        })
        .catch(error => {
            console.error("Erro ao carregar pedidos:", error);
        });
}

function displayOrders(orders) {
    const ordersList = document.getElementById("ordersList");
    ordersList.innerHTML = "";

    orders.forEach(order => {
        const orderContainer = document.createElement("div");
        orderContainer.classList.add("order-container");

        const orderTitle = document.createElement("h3");
        orderTitle.innerHTML = `Unidade Escolar: ${order.unidadeEscolar}<br>Status: ${order.status}`;
        orderContainer.appendChild(orderTitle);

        const toggleButton = document.createElement("button");
        toggleButton.textContent = "Mostrar Produtos";
        toggleButton.classList.add("button");
        orderContainer.appendChild(toggleButton);

        if (order.status !== "APROVADO") {
            const approveButton = document.createElement("button");
            approveButton.textContent = "aprovar";
            approveButton.classList.add("button");
            orderContainer.appendChild(approveButton);

            approveButton.addEventListener("click", () => {
                fetch(`http://192.168.37.36:8080/api/orders/approve/${order.id}`, {
                    method: "POST"
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error("Erro ao aprovar o pedido.");
                    }
                    return response.json();
                })
                .then(data => {
                    console.log("Pedido aprovado com sucesso", data);
                    approveButton.disabled = true;
                    approveButton.textContent = "Aprovado";
                    approveButton.classList.add("aprovado");
                })
                .catch(error => {
                    console.error("Erro ao aprovar o pedido: ", error);
                    alert("Não foi possível aprovar o pedido.");
                });
            });
        }
        const orderItemsList = document.createElement("ul");
        orderItemsList.style.display = "none";

        order.orderItems.forEach(item => {
            const orderItem = document.createElement("li");
            orderItem.classList.add("order-item");

            const productName = document.createElement("p");
            productName.textContent = `Produto: ${item.product.name}`;
            orderItem.appendChild(productName);

            const productQuantity = document.createElement("p");
            productQuantity.textContent = `Quantidade: ${item.quantity}`;
            orderItem.appendChild(productQuantity);

            let imageUrl = item.product.imgUrl;
            imageUrl = imageUrl.replace("uploads/", "");

            const productImage = document.createElement("img");
            productImage.src = `http://192.168.37.36:8080/api/products/imgs/${imageUrl}`;
            productImage.alt = item.product.name;
            productImage.width = 100;

            const productStock = document.createElement("p");
            productStock.textContent = `Quantidade em estoque: ${item.product.productStock}`;
            orderItem.appendChild(productStock);
            orderItem.appendChild(productImage);

            orderItemsList.appendChild(orderItem);
            
        });

        toggleButton.addEventListener("click", () => {
            const isHidden = orderItemsList.style.display === "none";
            orderItemsList.style.display = isHidden ? "block" : "none";
            toggleButton.textContent = isHidden ? "Ocultar Produtos" : "Mostrar Produtos";
        });

        orderContainer.appendChild(orderItemsList);
        ordersList.appendChild(orderContainer);
    });
}

let editingProductId = null;

function editProduct(id) {
    fetch(`http://192.168.37.36:8080/api/products/${id}`)
        .then(response => response.json())
        .then(product => {
            editingProductId = id;
            document.getElementById("editName").value = product.name;
            document.getElementById("editProductStock").value = product.productStock;
            document.getElementById("editDescription").value = product.description;
            document.getElementById("updateProductForm").style.display = "block";
        })
        .catch(error => console.error("Erro ao carregar produto:", error));
}

document.getElementById("formEditProduct").addEventListener("submit", function (event) {
    event.preventDefault();

    const formData = new FormData();
    formData.append("name", document.getElementById("editName").value);
    formData.append("description", document.getElementById("editDescription").value);
    formData.append("productStock", document.getElementById("editProductStock").value);

    const img = document.getElementById("editImg").files[0];
    if (img) formData.append("img", img);

    fetch(`http://192.168.37.36:8080/api/products/${editingProductId}`, {
        method: "PUT",
        body: formData
    })
        .then(response => {
            if (!response.ok) throw new Error("Erro ao atualizar produto");
            return response.json();
        })
        .then(() => {
            alert("Produto atualizado com sucesso!");
            document.getElementById("updateProductForm").style.display = "none";
            loadProducts();
        })
        .catch(error => {
            console.error("Erro ao atualizar produto:", error);
        });
});

function deleteProduct(id) {
    const confirmDelete = confirm("Tem certeza que deseja excluir este produto?");
    if (!confirmDelete) return;

    fetch(`http://192.168.37.36:8080/api/products/${id}`, {
        method: "DELETE"
    })
    .then(response => {
        if (response.ok) {
            alert("Produto excluído com sucesso!");
            loadProducts();
        } else {
            throw new Error("Error delete product.");
        }
    })
    .catch(error => {
        console.error("Error Delete product:", error);
        alert("Não foi possível excluir o produto.");
    });
}
