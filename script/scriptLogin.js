const validPassword = "ti141516";
const validUser = "admin"

document.getElementById("loginForm").addEventListener("submit", function(event) {
 
    event.preventDefault();
    const password = document.getElementById("pswd").value;
    const user = document.getElementById("user").value;


    if(password === validPassword && validUser === user){
        window.location.href = "adminPage.html";
    }else{
        alert("Senha ou úsuario incorreto. Tente novamente.");
    }
});