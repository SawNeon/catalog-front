// Função para exibir a imagem antes de enviar o formulário
document.getElementById("img").addEventListener("change", function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById("imagePreview").src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
});

// Enviar o formulário para a API
document.getElementById("productForm").addEventListener("submit", function(event) {
    event.preventDefault(); // Evitar envio padrão do formulário

    const formData = new FormData();
    formData.append("name", document.getElementById("name").value);
    formData.append("description", document.getElementById("description").value);
    formData.append("img", document.getElementById("img").files[0]);
    formData.append("productStock", document.getElementById("productStock").value);

    fetch("http://localhost:8080/api/products", {
        method: "POST",
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.id) {
            alert("Produto cadastrado com sucesso!");
            console.log(data); // Aqui você pode exibir a resposta completa, se necessário.
        }
    })
    .catch(error => {
        console.error("Erro ao cadastrar produto:", error);
    });
});
