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

function loadProducts() {
    fetch("http://localhost:8080/api/products")
        .then(response => response.json())
        .then(products => {
            const productList = document.getElementById("tableProduct");
            productList.innerHTML = "";

            products.forEach(product => {
                const productRow = document.createElement("div");
                productRow.innerHTML = `
                    <p><strong>${product.name}</strong> - ${product.description} - Estoque: ${product.productStock}</p>
                    <button class="button-white" onclick="editProduct(${product.id})">Editar</button>
                    <button class="button-red" onclick="deleteProduct(${product.id})">Excluir</button>
                `;
                productList.appendChild(productRow);
            });
        })
        .catch(error => console.error("Erro ao carregar produtos:", error));
}

document.getElementById("productForm").addEventListener("submit", function (event) {
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

function fetchOrders() {
    fetch("http://localhost:8080/api/orders")
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
        orderTitle.textContent = `Unidade Escolar: ${order.unidadeEscolar}`;
        orderContainer.appendChild(orderTitle);

        const toggleButton = document.createElement("button");
        toggleButton.textContent = "Mostrar Produtos";
        toggleButton.classList.add("button");
        orderContainer.appendChild(toggleButton);

        const approveButton = document.createElement("button");
        approveButton.textContent = "aprovar";
        approveButton.classList.add("button");
        orderContainer.appendChild(approveButton);

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
            productImage.src = `http://localhost:8080/api/products/imgs/${imageUrl}`;
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

        approveButton.addEventListener("click", () =>{
            fetch(`http://localhost:8080/api/orders/approve/${order.id}`,{
                method: "POST"
            })
            .then(response => {
                if(!response.ok){
                    throw new Error("Error approve the order.");
                }
                return response.json();
            })
            .then(data => {
                console.log("successful order approved", data);
                approveButton.disabled = true;
                approveButton.textContent = "Approved";
                approveButton.classList.add("aprovado");
            })
            .catch(error => {
                console.error("Error approve the order: ", error);
                alert("Não foi possível aprovar o pedido.");
            })

        })

        orderContainer.appendChild(orderItemsList);
        ordersList.appendChild(orderContainer);
    });
}
