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
  <div class="card shadow-sm  overflow-hidden">
    <div class="d-flex align-items-center justify-content-between p-3">
      <div class="d-flex align-items-center gap-3">
        <div>
          <h3 class="mb-0">${evento.nombre}</h3>
          <div class="mt-1">
            <span class="badge badge-primary mr-1">${evento.deporte}</span>
            <span class="badge badge-light border">${evento.privado ? "Privado" : "Público"}</span>
          </div>
        </div>
      </div>
      <div class="text-right pr-2">
        <div class="small text-muted">Capacidad</div>
        <div class="h5 mb-0">${(evento.participantes?.length || 0)} / ${evento.maxParticipantes || "∞"}</div>
      </div>
    </div>

    <div class="p-4">
      <div class="row">
        <div class="col-md-7">
          <ul class="list-unstyled mb-4">
            <li class="mb-2"><strong>📅 Fecha:</strong> ${evento.fecha} a las ${evento.hora}</li>
            <li class="mb-2"><strong>📍 Ubicación:</strong> ${evento.ubicacion}</li>
            <li class="mb-2"><strong>📝 Descripción:</strong> ${evento.descripcion || "Sin descripción"}</li>
          </ul>

          <div class="mb-3">
            <div class="font-weight-bold mb-2">👥 Participantes</div>
            <div class="list-group list-group-flush">
              ${listaParticipantesHTML
                .replace("<ul>","")
                .replace("</ul>","")
                .split("</li>").filter(Boolean).map(li =>
                  `<div class="list-group-item px-0">${li.replace("<li>","• ")}</div>`
                ).join("")}
            </div>
          </div>
        </div>

        <div class="col-md-5">
          <div class="p-3 rounded ">
            <div class="small text-muted mb-2">Acciones</div>

            ${esCreador ? `
              <div class="btn-group btn-group-sm mb-2 d-flex" role="group" aria-label="Acciones del creador">
                <button class="btn btn-outline-info" id="editar-evento">Editar</button>
                <button class="btn btn-outline-danger" id="eliminar-evento">Eliminar</button>
              </div>
            ` : `
              <p class="text-muted small mb-2">Creador: ${evento.creadorNombre || "Desconocido"}</p>
            `}

            <button class="btn btn-${yaInscrito ? 'danger' : 'success'} btn-block" id="accion-evento">
              ${yaInscrito ? 'Salir del evento' : 'Unirse al evento'}
            </button>

            <button class="btn btn-secondary btn-block mt-2" id="volver-btn">← Volver</button>
          </div>
        </div>
      </div>
    </div>
  </div>
`;


  if (esCreador) {
  document.getElementById("editar-evento").addEventListener("click", () => {
    // Redirige a la página de edición con el ID del evento como parámetro en la URL
    window.location.href = `editar.html?eventoId=${evento.id}`;
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

  // Volver: si hay historial, retrocede; si no, ve a inicio.html
const volverBtn = document.getElementById("volver-btn");
if (volverBtn) {
  volverBtn.addEventListener("click", (e) => {
    e.preventDefault();
    if (history.length > 1) {
      history.back();
    } else {
      window.location.href = "inicio.html";
    }
  });
}

});
