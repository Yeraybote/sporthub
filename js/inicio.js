/* Menú debajo */
//Global variable for starting page
var currentPageId = "page-eventos";
var currentSelectorId = "eventos";

//Function for getting the button ids
function getButtons(){
    //List of button ids
    var list = ["eventos", "crear", "perfil"];
    return list;
}

//Make sure the window is loaded before we add listeners
window.onload = function(){
    var pageIdList = getButtons();
    //Add an event listener to each button
    pageIdList.forEach(function(page){
        document.getElementById(page).addEventListener("click", changePage, false);
    });
}

function changePage(){
    var currentSelector = document.getElementById(currentSelectorId);
    var currentPage = document.getElementById(currentPageId);
    var pageId = "page-"+this.id;
    var page = document.getElementById(pageId);
    var pageSelector = document.getElementById(this.id);
    
    if(page.classList.contains("active")){
        return;
    }

    currentSelector.classList.remove("button-active");
    currentSelector.classList.add("button-inactive");
    currentPage.classList.remove("active");
    currentPage.classList.add("inactive");

    pageSelector.classList.remove("button-inactive");
    pageSelector.classList.add("button-active");

    page.classList.remove("inactive");
    page.classList.add("active");

    //Need to reset the scroll
    window.scrollTo(0,0); 

    currentSelectorId = this.id;
    currentPageId = pageId;
}


// Importar los módulos necesarios desde Firebase 9
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getDatabase, ref, set, get, update } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import { GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js";
import { query, orderByChild, equalTo } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";

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
const database = getDatabase(app);

// Según carge la página, quiero que se le añada el email del usuario autenticado al titulo con id "titulo"
const auth = getAuth();

onAuthStateChanged(auth, (user) => {
  if (user) {
    // Mostramos todos los eventos públicos al cargar la página
    const eventosRef = ref(database, 'eventos');

    get(eventosRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
            const eventos = snapshot.val();
            const eventosPublicos = Object.values(eventos).filter(evento => !evento.privado); // Filtrar eventos públicos

            // Mostrar los eventos en la interfaz
            generarEventosCards(eventosPublicos); // Llamar a la función para generar las cards de eventos

            // Ahora recogemos los eventos en los que el usuario está participando
            const eventosParticipando = Object.values(eventos).filter(evento => 
              evento.participantes && evento.participantes.includes(user.uid)
            );
            console.log("Eventos en los que estás participando:", eventosParticipando);
            
          
        } else {
          console.log("No hay eventos disponibles.");
        }
      })
      .catch((error) => {
        console.error("Error al obtener los eventos:", error);
      });


    // Referencia a la base de datos de usuarios
    const usuariosRef = ref(database, 'usuarios');

    // Filtrar por el email del usuario autenticado
    get(query(usuariosRef, orderByChild('email'), equalTo(user.email)))
      .then((snapshot) => {
        if (snapshot.exists()) {
          const usuarios = snapshot.val();
          const usuario = Object.values(usuarios)[0]; // Ya solo hay uno porque estamos filtrando por el email

          // Mostrar la información del usuario en la interfaz
          document.getElementById("titulo").innerText = "¡Bienvenid@, " + usuario.nombre + "!";
        } else {
          console.log("No se encontró el usuario.");
        }
      })
      .catch((error) => {
        console.error("Error al obtener los datos del usuario:", error);
      });

  } else {
    location.href = "../index.html"; // Redirige al login si no hay un usuario autenticado
  }
});


/* 🔹 Cerrar sesión con confirmación */
document.getElementById("logout").addEventListener("click", async () => {
  Swal.fire({
      title: "¿Seguro que quieres cerrar sesión?",
      text: "Tendrás que volver a iniciar sesión para acceder de nuevo.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, salir",
      cancelButtonText: "Cancelar"
  }).then(async (result) => {
      if (result.isConfirmed) {
          await signOut(auth);
      }
  });
});


/* 🔹 Función para crear un nuevo evento */

const formCrearEvento = document.getElementById("form-crear-evento");
formCrearEvento.addEventListener("submit", async (e) => {
    e.preventDefault(); // Evita el envío del formulario por defecto

    const nombre = document.getElementById("tituloEvento").value;
    const descripcion = document.getElementById("descripcion").value;
    const fecha = document.getElementById("fecha").value;
    const hora = document.getElementById("hora").value;
    const ubicacion = document.getElementById("ubicacion").value;
    const privado = document.getElementById("privado").checked;
    const maxParticipantes = document.getElementById("maxParticipantes").value;
    const deporte = document.getElementById("deporte").value; // Obtener el deporte seleccionado

    // Validar que todos los campos estén completos
    if (!nombre || !fecha || !hora || !ubicacion) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Por favor, completa todos los campos.'
        });
        return;
    }

    // Obtener el usuario autenticado
    const user = auth.currentUser;

    if (user) {
        // Crear un nuevo evento en la base de datos
        const nuevoEventoRef = ref(database, 'eventos/' + Date.now()); // Usar timestamp como ID único
        set(nuevoEventoRef, {
            nombre: nombre,
            deporte: deporte, // Guardar el deporte seleccionado
            descripcion: descripcion,
            fecha: fecha,
            hora: hora,
            ubicacion: ubicacion,
            creador: user.uid, // Guardar el ID del usuario creador
            privado: privado,
            maxParticipantes: maxParticipantes ? parseInt(maxParticipantes) : null, // Convertir a número si se proporciona
            participantes: [user.uid] // Iniciar con el creador como participante
        })
        .then(() => {
            Swal.fire({
                icon: 'success',
                title: 'Éxito',
                text: 'Evento creado correctamente.'
            });
            formCrearEvento.reset(); // Limpiar el formulario
        })
        .catch((error) => {
            console.error("Error al crear el evento:", error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo crear el evento. Inténtalo de nuevo más tarde.'
            });
        });
    } else {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Debes iniciar sesión para crear un evento.'
        });
    }
});

// 🔹 Evento de cuando cambie el select de filtroDeporte
document.getElementById("filtroDeporte").addEventListener("change", function() {
    const deporteSeleccionado = this.value;
    const eventosContainer = document.getElementById("eventos-lista");
    eventosContainer.innerHTML = ""; // Limpiar la lista de eventos

    const filtroFecha = document.getElementById("filtroFecha").value;

    // Obtener todos los eventos
    const eventosRef = ref(database, 'eventos');

    get(eventosRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          const eventos = snapshot.val();
          const eventosFiltrados = Object.values(eventos).filter(evento => 
            !evento.privado && (deporteSeleccionado === "" || evento.deporte === deporteSeleccionado) && (!filtroFecha || evento.fecha === filtroFecha)
          );

          // Mostrar los eventos filtrados
          generarEventosCards(eventosFiltrados); // Llamar a la función para generar las cards de eventos

        } else {
          console.log("No hay eventos disponibles.");
        }
      })
      .catch((error) => {
        console.error("Error al obtener los eventos:", error);
      });
});

// 🔹 Evento de cuando cambie el input de filtroFecha
document.getElementById("filtroFecha").addEventListener("change", function() {
    const filtroFecha = this.value;
    const eventosContainer = document.getElementById("eventos-lista");
    eventosContainer.innerHTML = ""; // Limpiar la lista de eventos

    const deporteSeleccionado = document.getElementById("filtroDeporte").value;

    // Obtener todos los eventos
    const eventosRef = ref(database, 'eventos');

    get(eventosRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          const eventos = snapshot.val();
          const eventosFiltrados = Object.values(eventos).filter(evento => 
            !evento.privado && (deporteSeleccionado === "" || evento.deporte === deporteSeleccionado) && (!filtroFecha || evento.fecha === filtroFecha)
          );

          // Mostrar los eventos filtrados
          generarEventosCards(eventosFiltrados); // Llamar a la función para generar las cards de eventos

        } else {
          console.log("No hay eventos disponibles.");
        }
      })
      .catch((error) => {
        console.error("Error al obtener los eventos:", error);
      });
});

// Función crear los eventos reutilizable
function generarEventosCards(eventos) {
    const eventosContainer = document.getElementById("eventos-lista");
    eventosContainer.innerHTML = ""; // Limpiar la lista de eventos

    eventos.forEach(evento => {
        const eventoCard = document.createElement("div");
        eventoCard.className = "evento-card";

        // Si participo en el evento, añadir un icono de check al lado del nombre en lugar del botón "Unirse"
        eventoCard.innerHTML = `
            <h3>${evento.nombre} <span class="check-icon">${evento.participantes && evento.participantes.includes(auth.currentUser.uid) ? '✔️' : ''}</span></h3> 
            <p>${evento.descripcion}</p>
            <p><strong>Fecha:</strong> ${evento.fecha} a las ${evento.hora}</p>
            <p><strong>Ubicación:</strong> ${evento.ubicacion}</p>
            <p><strong>Participantes:</strong> ${evento.participantes ? evento.participantes.length : 0} / ${evento.maxParticipantes || "∞"}</p>
            <button class="btn unirse" ${evento.participantes && evento.participantes.includes(auth.currentUser.uid) ? 'hidden disabled btn-succes' : ''}>${evento.participantes && evento.participantes.includes(auth.currentUser.uid) ? '✔️' : 'Unirse'}</button>
            <button class="btn detalles">Detalles</button>
        `;
        eventosContainer.appendChild(eventoCard);
    });
}