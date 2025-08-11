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
            const hoy = new Date().toISOString().split("T")[0]; // formato "YYYY-MM-DD"

            const eventosPublicos = Object.entries(eventos)
              .filter(([id, evento]) => {
                return (
                  !evento.privado &&
                  evento.fecha &&
                  evento.fecha >= hoy // solo hoy o fechas futuras
                );
              })
              .map(([id, evento]) => ({ ...evento, id }));


            // Mostrar los eventos en la interfaz
            generarEventosCards(eventosPublicos); // Llamar a la función para generar las cards de eventos

            // Ahora recogemos los eventos activos en los que el usuario está participando
            const eventosParticipando = Object.values(eventos).filter(evento => 
              evento.participantes &&
              evento.participantes.includes(user.uid) &&
              evento.fecha && evento.fecha >= hoy // solo hoy o futuros
            ).sort((a, b) => new Date(a.fecha) - new Date(b.fecha)); // ordenar por fecha ascendente;

            console.log("Eventos activos en los que estás participando:", eventosParticipando);

            generarMisEventosCards(eventosParticipando);
            // Llamar a la función para generar las cards de eventos en los que el usuario está participando
            
          
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

          // Cargar y pre-rellenar el perfil
          const $ = (id) => document.getElementById(id);
          $("perfil-nombre").value = usuario.nombre || "";
          $("perfil-email").value = usuario.email || user.email || "";
          $("perfil-fecha").value = usuario.fechaNacimiento || "";
          $("perfil-provincia").value = usuario.provincia || "";

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

function generarMisEventosCards(lista) {
  const cont = document.getElementById("eventos-apuntados");
  cont.innerHTML = "";

  if (!lista || lista.length === 0) {
    cont.innerHTML = `<p class="text-muted">No estás apuntado a ningún evento.</p>`;
    return;
  }

  lista.forEach(ev => {
    const card = document.createElement("div");
    card.className = "evento-card";
    card.innerHTML = `
      <h4 class="mb-1">${ev.nombre}</h4>
      <p class="mb-1"><strong>Fecha:</strong> ${ev.fecha}${ev.hora ? " a las " + ev.hora : ""}</p>
      <p class="mb-1"><strong>Ubicación:</strong> ${ev.ubicacion}</p>
      <p class="mb-1"><strong>Deporte:</strong> ${ev.deporte || "-"}</p>
      <div class="mt-2">
        <a href="detalle.html?id=${ev.id}" class="btn btn-sm btn-outline-primary mr-2">Ver detalle</a>
        <button class="btn btn-sm btn-outline-danger salir-evento" data-id="${ev.id}">Salir</button>
      </div>
    `;
    cont.appendChild(card);
  });

  // Listeners para salir
  cont.querySelectorAll(".salir-evento").forEach(btn => {
    btn.addEventListener("click", async function () {
      const eventoId = this.dataset.id;
      await salirDelEvento(eventoId); // reutiliza tu función existente
    });
  });
}



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
        const eventoId = Date.now(); // Generamos ID único
        const nuevoEventoRef = ref(database, 'eventos/' + Date.now()); // Usar timestamp como ID único
        set(nuevoEventoRef, {
            id: eventoId, // Guardar el ID único del evento
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
// Función crear los eventos reutilizable
function generarEventosCards(eventos) {
  const eventosContainer = document.getElementById("eventos-lista");
  eventosContainer.innerHTML = ""; // Limpiar lista

  eventos.forEach(evento => {
    const eventoCard = document.createElement("div");
    eventoCard.className = "evento-card";

    const eventoId = evento.id;
    const yaInscrito = evento.participantes && evento.participantes.includes(auth.currentUser.uid);

    // badge por deporte (Bootstrap 4)
    const badgePorDeporte = (deporte) => {
      switch ((deporte || "").toLowerCase()) {
        case "pádel":
        case "padel":       return "badge-success";
        case "fútbol":
        case "futbol":     return "badge-primary";
        case "running":    return "badge-warning";
        case "baloncesto": return "badge-info";
        case "otro":       return "badge-dark";
        default:           return "badge-secondary";
      }
    };

    const claseBadge = badgePorDeporte(evento.deporte);
    const textoDeporte = evento.deporte || "Otro";

    eventoCard.innerHTML = `
      <h5 class="mb-1">
        ${evento.nombre}
        <span class="badge ${claseBadge} ml-2">${textoDeporte}</span>
      </h5>
      <p class="mb-2">${evento.descripcion || ""}</p>
      <p class="mb-1"><strong>Fecha:</strong> ${evento.fecha} a las ${evento.hora}</p>
      <p class="mb-1"><strong>Ubicación:</strong> ${evento.ubicacion}</p>
      <p class="mb-2"><strong>Participantes:</strong> ${evento.participantes ? evento.participantes.length : 0} / ${evento.maxParticipantes || "∞"}</p>

      <button class="btn unirse" data-id="${eventoId}" ${yaInscrito ? "disabled" : ""}>
        ${yaInscrito ? "✔️" : "Unirse"}
      </button>
      <a href="detalle.html?id=${eventoId}" class="btn detalles">Detalles</a>
    `;
    eventosContainer.appendChild(eventoCard);
  });

  // Listeners para los botones "Unirse"
  document.querySelectorAll(".btn.unirse").forEach(btn => {
    btn.addEventListener("click", async function () {
      const eventoId = this.dataset.id;
      if (!eventoId) return;
      await unirseAlEvento(eventoId);
    });
  });

  // (Nota: el enlace Detalles ya navega por href; si no necesitas manejo extra,
  // podrías eliminar el listener manual de '.btn.detalles')
}



async function unirseAlEvento(eventoId) {
    const user = auth.currentUser;
    if (!user) {
        Swal.fire("Error", "Debes iniciar sesión para unirte a un evento.", "error");
        return;
    }

    const eventoRef = ref(database, 'eventos/' + eventoId);
    try {
        const snapshot = await get(eventoRef);
        if (!snapshot.exists()) {
            Swal.fire("Error", "Evento no encontrado.", "error");
            return;
        }

        const evento = snapshot.val();

        if (evento.participantes && evento.participantes.includes(user.uid)) {
            Swal.fire("Ya estás unido", "Ya formas parte de este evento.", "info");
            return;
        }

        if (evento.maxParticipantes && evento.participantes?.length >= evento.maxParticipantes) {
            Swal.fire("Límite alcanzado", "Este evento ya está completo.", "warning");
            return;
        }

        const nuevosParticipantes = evento.participantes
            ? [...evento.participantes, user.uid]
            : [user.uid];

        await update(eventoRef, {
            participantes: nuevosParticipantes
        });

        Swal.fire("¡Unido!", "Te has unido correctamente al evento.", "success").then(() => {
            location.reload(); // Actualizamos UI
        });

    } catch (error) {
        console.error("Error al unirse al evento:", error);
        Swal.fire("Error", "No se pudo unir al evento.", "error");
    }
};




function mostrarDetalleEvento(evento) {
    const detalle = document.getElementById("detalle-evento");
    const contenido = document.getElementById("contenido-detalle");

    const yaInscrito = evento.participantes && evento.participantes.includes(auth.currentUser.uid);

    contenido.innerHTML = `
        <h3>${evento.nombre}</h3>
        <p><strong>Fecha:</strong> ${evento.fecha} a las ${evento.hora}</p>
        <p><strong>Ubicación:</strong> ${evento.ubicacion}</p>
        <p><strong>Deporte:</strong> ${evento.deporte}</p>
        <p><strong>Descripción:</strong> ${evento.descripcion || "Sin descripción"}</p>
        <p><strong>Participantes:</strong> ${evento.participantes?.length || 0} / ${evento.maxParticipantes || "∞"}</p>
        <button class="btn ${yaInscrito ? 'btn-danger' : 'btn-success'}" id="accion-evento">
            ${yaInscrito ? 'Salir del evento' : 'Unirse al evento'}
        </button>
    `;

    document.getElementById("accion-evento").addEventListener("click", () => {
        if (yaInscrito) {
            salirDelEvento(evento.id);
        } else {
            unirseAlEvento(evento.id);
        }
    });

    // Mostrar el detalle y ocultar lista
    document.getElementById("page-eventos").classList.add("inactive");
    detalle.classList.remove("inactive");
};

document.getElementById("cerrar-detalle").addEventListener("click", () => {
    document.getElementById("detalle-evento").classList.add("inactive");
    document.getElementById("page-eventos").classList.remove("inactive");
});


async function salirDelEvento(eventoId) {
    const user = auth.currentUser;
    if (!user) {
        Swal.fire("Error", "Debes iniciar sesión para salir del evento.", "error");
        return;
    }

    const eventoRef = ref(database, 'eventos/' + eventoId);

    try {
        const snapshot = await get(eventoRef);
        if (!snapshot.exists()) {
            Swal.fire("Error", "Evento no encontrado.", "error");
            return;
        }

        const evento = snapshot.val();

        if (!evento.participantes || !evento.participantes.includes(user.uid)) {
            Swal.fire("Info", "No estás inscrito en este evento.", "info");
            return;
        }

        const nuevosParticipantes = evento.participantes.filter(uid => uid !== user.uid);

        await update(eventoRef, {
            participantes: nuevosParticipantes
        });

        Swal.fire("¡Saliste del evento!", "Tu inscripción ha sido cancelada.", "success").then(() => {
            location.reload();
        });

    } catch (error) {
        console.error("Error al salir del evento:", error);
        Swal.fire("Error", "No se pudo salir del evento. Intenta de nuevo.", "error");
    }
};

// Guardar cambios del perfil
document.getElementById("form-perfil").addEventListener("submit", async (e) => {
  e.preventDefault();
  const user = auth.currentUser;
  if (!user) return;

  const nombre = document.getElementById("perfil-nombre").value.trim();
  const fechaNacimiento = document.getElementById("perfil-fecha").value || null;
  const provincia = document.getElementById("perfil-provincia").value.trim() || null;

  console.log("Guardando perfil:", {
    nombre,
    fechaNacimiento,
    provincia
  });

  try {
    await update(ref(database, 'usuarios/' + user.uid), {
      nombre,
      fechaNacimiento,
      provincia
    });

    Swal.fire("Guardado", "Perfil actualizado correctamente.", "success");
  } catch (err) {
    console.error(err);
    Swal.fire("Error", "No se pudieron guardar los cambios.", "error");
  }
});