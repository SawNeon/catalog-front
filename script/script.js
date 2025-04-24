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

let loadedOrders = [];

function displayOrders(orders) {
    loadedOrders = orders; // GARANTE que loadedOrders é atualizado!

    const ordersList = document.getElementById("ordersList");
    ordersList.innerHTML = `
        <table class="productTable">
            <thead>
                <tr>
                    <th>Unidade Escolar</th>
                    <th>Status</th>
                    <th>Produtos</th>
                    <th>Aprovação</th>
                </tr>
            </thead>
            <tbody>
                ${orders.map(order => `
                    <tr>
                        <td>${order.unidadeEscolar}</td>
                        <td>${order.status}</td>
                        <td>
                            <button class="button" onclick="toggleOrderProducts(${order.id})" id="toggleButton_${order.id}">
                                Mostrar Produtos
                            </button>
                            <div id="orderItems_${order.id}" class="order-items-container" style="display:none; margin-top: 10px;"></div>
                        </td>
                        <td>
                            ${order.status !== "APROVADO" 
                                ? `<button class="button" onclick="approveOrder(${order.id})" id="approveButton_${order.id}">Aprovar</button>` 
                                : `<span class="aprovado">Aprovado</span>`}
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function toggleOrderProducts(orderId) {
    const order = findOrderById(orderId);

    if (!order) {
        alert("Pedido não encontrado! Atualize a página.");
        return;
    }

    const orderItemsDiv = document.getElementById(`orderItems_${orderId}`);
    const toggleButton = document.getElementById(`toggleButton_${orderId}`);

    if (!orderItemsDiv) {
        console.error(`Div de produtos (orderItems_${orderId}) não encontrada!`);
        return;
    }

    if (orderItemsDiv.style.display === "none") {
        orderItemsDiv.style.display = "block";
        toggleButton.textContent = "Ocultar Produtos";

        orderItemsDiv.innerHTML = order.orderItems.length > 0 ? order.orderItems.map(item => `
            <div style="margin-bottom: 10px; border-bottom: 1px solid #ccc; padding-bottom: 5px;">
                <p>Produto: ${item.product.name}</p>
                <p>Quantidade: ${item.quantity}</p>
                <p>Estoque: ${item.product.productStock}</p>
                ${item.product.imgUrl 
                    ? `<img src="http://192.168.37.36:8080/api/products/imgs/${item.product.imgUrl.replace('uploads/', '')}" 
                         alt="${item.product.name}" width="100">` 
                    : `<p>Imagem não disponível</p>`}
            </div>
        `).join('') : `<p>Este pedido não possui produtos.</p>`;
    } else {
        orderItemsDiv.style.display = "none";
        toggleButton.textContent = "Mostrar Produtos";
    }
}


function findOrderById(orderId) {
    return loadedOrders.find(order => order.id === orderId);
}

function approveOrder(orderId) {
    const approveButton = document.getElementById(`approveButton_${orderId}`);
    
    fetch(`http://192.168.37.36:8080/api/orders/approve/${orderId}`, {
        method: "POST"
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Erro ao aprovar o pedido.");
        }
        return response.json();
    })
    .then(() => {
        alert("Pedido aprovado com sucesso!");
        fetchOrders();
    })
    .catch(error => {
        console.error("Erro ao aprovar o pedido: ", error);
        alert("Não foi possível aprovar o pedido.");
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
