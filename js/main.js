import { auth } from "./firebase.js";
import { GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

/* 🔹 Función para iniciar sesión con Google
document.getElementById("googleLogin").addEventListener("click", async () => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    console.log("Usuario autenticado:", result.user);
    alert("Sesión iniciada con Google");
  } catch (error) {
    console.error("Error en Google Login:", error);
  }
}); */

// 🔹 Verificar si el usuario ya inició sesión, si eso, lo redirigimos a inicio.html
onAuthStateChanged(auth, (user) => {
  if (user) {
    location.href = "views/inicio.html";
  }
});


document.getElementById("emailLogin").addEventListener("click", async () => {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  // Validación: Comprobar que los campos no estén vacíos
  if (!email || !password) {
    Swal.fire({
      icon: "warning",
      title: "Campos vacíos",
      text: "Por favor, completa todos los campos antes de continuar.",
    });
    return; // Detiene la ejecución si hay campos vacíos
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    // console.log("Usuario autenticado:", userCredential.user);

    /* Swal.fire({
      icon: "success",
      title: "¡Éxito!",
      text: "Sesión iniciada correctamente",
      confirmButtonText: "OK"
    }).then(() => {
      location.href = "views/inicio.html";
    }); */

  } catch (error) {
    console.error("Error en login:", error);
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Creedenciales incorrectas, por favor intenta de nuevo.",
    });
  }
});


document.getElementById("register").addEventListener("click",() => {
  location.href = "views/register.html";
});


// Agregar un evento para detectar la tecla Enter en el campo de contraseña
document.getElementById('password').addEventListener('keypress', function(event) {
    // Verificar si la tecla presionada es Enter (código de tecla 13)
    if (event.key === 'Enter') {
        // Evitar el comportamiento por defecto (si es necesario)
        event.preventDefault();
        
        // Llamar al botón de "Iniciar sesión"
        document.getElementById('emailLogin').click();
    }
});
