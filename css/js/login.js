/*====================================================
  APSAN ERP
  LOGIN
====================================================*/

// Mostrar / ocultar senha
const togglePassword = document.getElementById("togglePassword");
const password = document.getElementById("password");

togglePassword.addEventListener("click", () => {

    const icon = togglePassword.querySelector("i");

    if (password.type === "password") {

        password.type = "text";

        icon.classList.remove("fa-eye");
        icon.classList.add("fa-eye-slash");

    } else {

        password.type = "password";

        icon.classList.remove("fa-eye-slash");
        icon.classList.add("fa-eye");

    }

});

// Login
const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", function(e){

    e.preventDefault();

    const username = document.getElementById("username").value.trim().toLowerCase();

    const senha = document.getElementById("password").value.trim();

    const loader = document.getElementById("loader");

    const usuarios = [

        {
            utilizador:"admin",
            senha:"123456",
            perfil:"Administrador"
        },

        {
            utilizador:"gestor",
            senha:"123456",
            perfil:"Gestor"
        },

        {
            utilizador:"funcionario",
            senha:"123456",
            perfil:"Funcionário"
        }

    ];

    const usuario = usuarios.find(u =>

        u.utilizador === username &&
        u.senha === senha

    );

    if(usuario){

        loader.style.display="flex";

        localStorage.setItem("usuarioAPSAN",JSON.stringify(usuario));

        setTimeout(()=>{

            window.location.href="dashboard.html";

        },1500);

    }else{

        alert("Utilizador ou palavra-passe incorretos.");

    }

});
