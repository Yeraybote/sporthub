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
const auth = getAuth();
const db = getDatabase(app);

// 🧾 Leer ID del evento de la URL
const params = new URLSearchParams(window.location.search);
const eventoId = params.get("id");

// Esperamos a que haya sesión iniciada
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    location.href = "../index.html";
    return;
  }

  if (!eventoId) {
    document.getElementById("contenido-detalle").innerHTML = "<p>Evento no encontrado.</p>";
    return;
  }

  const eventoRef = ref(db, "eventos/" + eventoId);
  const snapshot = await get(eventoRef);

  if (!snapshot.exists()) {
    document.getElementById("contenido-detalle").innerHTML = "<p>Evento no encontrado.</p>";
    return;
  }

  const evento = snapshot.val();
  const yaInscrito = evento.participantes?.includes(user.uid);
  const esCreador = evento.creador === user.uid;

  // 🔄 Obtener nombres de los participantes
  let listaParticipantesHTML = "<ul>";
  if (evento.participantes && evento.participantes.length > 0) {
    for (const uid of evento.participantes) {
      const userSnapshot = await get(ref(db, "usuarios/" + uid));
      if (userSnapshot.exists()) {
        const usuario = userSnapshot.val();
        listaParticipantesHTML += `<li>${usuario.nombre}</li>`;
      } else {
        listaParticipantesHTML += `<li>Usuario desconocido (${uid})</li>`;
      }
    }
  } else {
    listaParticipantesHTML += "<li>No hay participantes aún.</li>";
  }
  listaParticipantesHTML += "</ul>";

  // 🔄 Mostrar evento
  document.getElementById("contenido-detalle").innerHTML = `
    <h3>${evento.nombre}</h3>
    <p><strong>Fecha:</strong> ${evento.fecha} a las ${evento.hora}</p>
    <p><strong>Ubicación:</strong> ${evento.ubicacion}</p>
    <p><strong>Deporte:</strong> ${evento.deporte}</p>
    <p><strong>Descripción:</strong> ${evento.descripcion || "Sin descripción"}</p>
    <p><strong>Participantes:</strong> ${evento.participantes?.length || 0} / ${evento.maxParticipantes || "∞"}</p>
    ${listaParticipantesHTML}

    ${esCreador
    ? `<div class="mt-3">
            <button class="btn btn-info me-2" id="editar-evento">Editar evento</button>
            <button class="btn btn-danger" id="eliminar-evento">Eliminar evento</button>
        </div>`
    : `<p class="text-muted">Creador: ${evento.creadorNombre || "Desconocido"}</p>`
    }
    <button class="btn mt-2 ${yaInscrito ? 'btn-danger' : 'btn-success'}" id="accion-evento">
      ${yaInscrito ? 'Salir del evento' : 'Unirse al evento'}
    </button>
  `;

  if (esCreador) {
  document.getElementById("editar-evento").addEventListener("click", () => {
    Swal.fire({
      icon: "info",
      title: "Función en desarrollo",
      text: "Pronto podrás editar el evento."
    });
  });

  document.getElementById("eliminar-evento").addEventListener("click", async () => {
    const confirm = await Swal.fire({
      title: "¿Eliminar evento?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar"
    });

    if (confirm.isConfirmed) {
        console.log("Eliminando evento:", eventoId);
      
        await set(ref(db, "eventos/" + eventoId), null);

        Swal.fire("Eliminado", "El evento ha sido eliminado.", "success").then(() => {
            location.href = "inicio.html";
        });
    }
  });
} else {

  // Si NO es creador, gestionar botón Unirse/Salir
  document.getElementById("accion-evento").addEventListener("click", async () => {
    let nuevos;
    if (yaInscrito) {
      nuevos = evento.participantes.filter(uid => uid !== user.uid);
    } else {
      nuevos = evento.participantes ? [...evento.participantes, user.uid] : [user.uid];
    }

    await update(eventoRef, { participantes: nuevos });
    Swal.fire("Actualizado", "", "success").then(() => location.reload());
  });
}

  // 🔁 Acción unirse/salir
  document.getElementById("accion-evento").addEventListener("click", async () => {
    let nuevos;
    if (yaInscrito) {
      nuevos = evento.participantes.filter(uid => uid !== user.uid);
    } else {
      nuevos = evento.participantes ? [...evento.participantes, user.uid] : [user.uid];
    }

    await update(eventoRef, { participantes: nuevos });
    Swal.fire({
      icon: "success",
      title: yaInscrito ? "¡Saliste del evento!" : "¡Unido al evento!",
    }).then(() => location.reload());
  });
});
