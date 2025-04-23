let cartItems = [];

function fetchProducts() {
    fetch('http://192.168.37.36:8080/api/products')
        .then(response => response.json())
        .then(products => {
            displayProducts(products);
        })
        .catch(error => {
            console.error('Erro ao carregar produtos:', error);
        });
}

function displayProducts(products) {
    const productList = document.getElementById('productList');
    productList.innerHTML = ''; 

    products.forEach(product => {
        const productItem = document.createElement('div');
        productItem.classList.add('product-item');


        let imageUrl = product.imgUrl;
        if (imageUrl.startsWith('uploads/')) {
            imageUrl = imageUrl.replace('uploads/', '');
        }

        const fullImageUrl = `http://192.168.37.36:8080/api/products/imgs/${imageUrl}`;
        console.log('URL da Imagem:', fullImageUrl);

        productItem.innerHTML = `
            <img src="${fullImageUrl}" alt="${product.name}">
            <h4>${product.name}</h4>
            <p>${product.description}</p>
            <button onclick="addToCart(${product.id}, '${product.name}')">Adicionar ao Pedido</button>
        `;

        productList.appendChild(productItem);
    });
}

// Função para adicionar produto ao carrinho
function addToCart(productId, productName, productPrice) {
    const existingItem = cartItems.find(item => item.productId === productId);
    if (existingItem) {
        existingItem.quantity++;
    } else {
        const product = { productId, productName, productPrice, quantity: 1 };
        cartItems.push(product);
    }
    updateCart();
}

// Função para atualizar o carrinho de pedidos na tela
function updateCart() {
    const cartItemsList = document.getElementById('cartItems');
    cartItemsList.innerHTML = '';  // Limpar lista anterior

    cartItems.forEach(item => {
        const cartItem = document.createElement('li');
        cartItem.classList.add('cart-item');
        cartItem.innerHTML = `${item.quantity} x ${item.productName}`;
        cartItemsList.appendChild(cartItem);
    });

    updateTotal();
}


function updateTotal() {
    const totalAmount = cartItems.reduce((total, item) => total + (item.productPrice * item.quantity), 0);
    document.getElementById('totalAmount').innerText = totalAmount.toFixed(2);
}

function createOrder() {
    const unidadeEscolar = document.getElementById('unidadeEscolar').value;
    if (!unidadeEscolar) {
        alert("Por favor, informe a unidade escolar.");
        return;
    }

    const orderItems = cartItems.map(item => ({
        product: { id: item.productId }, 
        quantity: item.quantity
    }));

    const orderData = {
        unidadeEscolar: unidadeEscolar,
        orderItems: orderItems,  
        total: cartItems.reduce((total, item) => total + (item.productPrice * item.quantity), 0)  // 
    };

    fetch('http://192.168.37.36:8080/api/orders', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
    })
    .then(response => response.json())
    .then(order => {
        alert('Pedido realizado com sucesso!');
        console.log(order);
        cartItems = []; 
        updateCart(); 
        document.getElementById('unidadeEscolar').value = '';
    })
    .catch(error => {
        console.error('Erro ao realizar o pedido:', error);
    });
}

window.onload = function() {
    fetchProducts();
};
