// Importar Firebase (Asegurar que usas la misma versión en todo)
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getDatabase, ref, get, set } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAfdizEASjDgOhzU1n9EVcyz-daxB1tOT0",
  authDomain: "sporthub-97e60.firebaseapp.com",
  projectId: "sporthub-97e60",
  storageBucket: "sporthub-97e60.firebasestorage.app",
  messagingSenderId: "961290047608",
  appId: "1:961290047608:web:6a54535e619ef694015d8d",
  measurementId: "G-EWB7RLPW7D"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

/* 🔹 Registrar Usuario */
document.getElementById("registerUser").addEventListener("click", async () => {
    const nombre = document.getElementById("nombre").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const fechaNacimiento = document.getElementById("fechaNacimiento").value;
    const province = document.getElementById("province").value;

    // Validación: Comprobar que los campos no estén vacíos
    if (!nombre || !email || !password || !fechaNacimiento || !province) {
        Swal.fire({
            icon: "warning",
            title: "Campos vacíos",
            text: "Por favor, completa todos los campos antes de continuar.",
        });
        return;
    }

    // Validación: Comprobar que el email sea válido
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        Swal.fire({
            icon: "warning",
            title: "Email inválido",
            text: "Por favor, introduce un email válido.",
        });
        return;
    }

    // Validación: Comprobar que la contraseña tenga al menos 6 caracteres
    if (password.length < 6) {
        Swal.fire({
            icon: "warning",
            title: "Contraseña débil",
            text: "La contraseña debe tener al menos 6 caracteres.",
        });
        return;
    }

    // Validación: Comprobar que la fecha de nacimiento sea válida
    const fechaNacimientoDate = new Date(fechaNacimiento);
    if (isNaN(fechaNacimientoDate.getTime())) {
        Swal.fire({
            icon: "warning",
            title: "Fecha de nacimiento inválida",
            text: "Por favor, introduce una fecha de nacimiento válida.",
        });
        return;
    }

    // Validación: Comprobar que la provincia no esté vacía
    const ciudad = province.trim();
    if (!ciudad) {
        Swal.fire({
            icon: "warning",
            title: "Provincia vacía",
            text: "Por favor, selecciona una provincia.",
        });
        return;
    }


    try {
        /* Crear usuario en Firebase Auth */
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const userId = userCredential.user.uid; 

        console.log("Datos que vamos a guardar en la base de datos:", {
            nombre: nombre,
            email: email,
            fechaNacimiento: fechaNacimiento,
            provincia: province,
        });

        // Guardar datos en Firebase Database
        await set(ref(db, "usuarios/" + userId), {
            nombre: nombre,
            email: email,
            fechaNacimiento: fechaNacimiento,
            provincia: province,
        });

        Swal.fire({
            icon: "success",
            title: "¡Registro exitoso!",
            text: "Tu cuenta ha sido creada correctamente.",
            confirmButtonText: "OK"
        }).then(() => {
            window.location.href = "./inicio.html"; // Redirigir al login
        });

    } catch (error) {
        console.error("Error en registro:", error);
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Error en registro: " + error.message,
        });
    }
});

document.getElementById("goToLogin").addEventListener("click", () => {
    window.location.href = "../index.html";
});

// Al darle al logo quiero que me lleve a la página de index.html
document.getElementById("logo").addEventListener("click", () => {
    location.href = "../index.html";
});