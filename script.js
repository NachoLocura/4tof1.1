const CONTRASENA = "60604020"; // ← cambia esto por tu contraseña real
let modoAdmin = false;
const EVENTOS = JSON.parse(localStorage.getItem("eventosGuardados") || "[]");

const HORARIO = {
  "Lunes": [
    { materia: "Software II", inicio: "07:00", fin: "08:20", turno: "mañana" },
    { materia: "Hardware II", inicio: "08:30", fin: "11:15", turno: "mañana" },
    { materia: "Química", inicio: "14:00", fin: "16:10", turno: "tarde" },
    { materia: "Técnicas Digitales I", inicio: "16:10", fin: "18:20", turno: "tarde" }
  ],
  "Martes": [
    { materia: "Redes", inicio: "09:10", fin: "11:15", turno: "mañana" },
    { materia: "Ética", inicio: "14:00", fin: "16:10", turno: "tarde" },
    { materia: "Análisis Matemático", inicio: "16:10", fin: "18:20", turno: "tarde" }
  ],
  "Miércoles": [
    { materia: "Lengua", inicio: "14:00", fin: "16:10", turno: "tarde" },
    { materia: "Inglés", inicio: "16:10", fin: "18:20", turno: "tarde" },
    { materia: "Base de Datos I", inicio: "18:20", fin: "20:40", turno: "noche" }
  ],
  "Jueves": [
    { materia: "Sistema Operativo II", inicio: "07:00", fin: "09:00", turno: "mañana" },
    { materia: "Software II", inicio: "09:00", fin: "11:20", turno: "mañana" },
    { materia: "Programación I", inicio: "14:00", fin: "15:20", turno: "tarde" },
    { materia: "Gestión de Organizaciones", inicio: "15:20", fin: "16:50", turno: "tarde" },
    { materia: "Análisis Matemático", inicio: "17:00", fin: "18:20", turno: "tarde" }
  ],
  "Viernes": [
    { materia: "Programación I", inicio: "14:00", fin: "15:20", turno: "tarde" },
    { materia: "Gestión de Organizaciones", inicio: "15:20", fin: "16:50", turno: "tarde" }
  ]
};

// Devuelve true si el día es lunes a viernes
function esDiaHabil(fecha) {
  const dia = fecha.getDay();
  return dia >= 1 && dia <= 5; // lunes a viernes
}

// Genera array con días hábiles (lunes a viernes) del mes y año indicados
function generarDiasHabiles(mes, anio) {
  const dias = [];
  const fecha = new Date(anio, mes, 1);

  while (fecha.getMonth() === mes) {
    if (esDiaHabil(fecha)) dias.push(new Date(fecha));
    fecha.setDate(fecha.getDate() + 1);
  }

  return dias;
}

// Renderiza calendario con separación de turnos
function renderizarCalendario(mes, anio) {
  // Si no pasan mes y año, toma actuales
  if (mes === undefined || anio === undefined) {
    const hoy = new Date();
    mes = hoy.getMonth();
    anio = hoy.getFullYear();
  }

  const contenedor = document.getElementById("calendario");
  contenedor.innerHTML = "";

  const diasHabiles = generarDiasHabiles(mes, anio);

  // Para actualizar el selector de días en admin
  if (modoAdmin) {
    actualizarSelectorDias(diasHabiles);
  }

  diasHabiles.forEach(fecha => {
    const celda = document.createElement("div");
    celda.className = "celda-dia";

    const diaSemanaNombre = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
    const diaSemana = diaSemanaNombre[fecha.getDay()];
    const diaNumero = fecha.getDate();
    const fechaTexto = `${diaSemana} ${diaNumero < 10 ? "0" + diaNumero : diaNumero}/${(mes + 1) < 10 ? "0" + (mes + 1) : (mes + 1)}`;

    const header = document.createElement("h3");
    header.textContent = fechaTexto;
    celda.appendChild(header);

    // Filtrar eventos que coinciden con fecha
    const eventosDelDia = EVENTOS.filter(ev => ev.fecha === fechaTexto);

    if (eventosDelDia.length === 0) {
      const def = document.createElement("div");
      def.className = "evento";
      def.textContent = "Día corriente";
      celda.appendChild(def);
    } else {
      // Separar eventos por turno para mostrar con clase distinta
      eventosDelDia.slice(0, 6).forEach(ev => {
        const el = document.createElement("div");
        // Clase evento + clase turno
        el.className = `evento ${ev.tipo.toLowerCase().replace(/\s+/g, '')} turno-${ev.turno}`;

        el.textContent = `${ev.turno} - ${ev.materia}: ${ev.tipo}` + (ev.tipo === "Ausencia" ? ` (Ingreso: ${ev.hora})` : "");
        celda.appendChild(el);
      });
    }

    contenedor.appendChild(celda);
  });
}

// Actualiza el select "día-seleccion" para que muestre solo números de días hábiles del mes actual
function actualizarSelectorDias(diasHabiles) {
  const select = document.getElementById("dia-seleccion");
  select.innerHTML = "";
  diasHabiles.forEach(fecha => {
    const diaNumero = fecha.getDate();
    const diaSemanaNombre = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
    const diaSemana = diaSemanaNombre[fecha.getDay()];
    // Opción con valor número y texto "2 (Lunes)"
    const option = document.createElement("option");
    option.value = diaNumero;
    option.textContent = `${diaNumero} (${diaSemana})`;
    select.appendChild(option);
  });
}

// Cuando se carga un evento, usa el día seleccionado para armar la fecha completa automáticamente
function cargarFormularioEvento() {
  const diaNum = parseInt(document.getElementById("dia-seleccion").value);
  const materiaSel = document.getElementById("materia-seleccion").value;
  const tipoSel = document.getElementById("tipo-evento").value;
  const horaAusencia = document.getElementById("hora-ausencia").value;

  // Obtener mes y año actuales
  const hoy = new Date();
  const mes = hoy.getMonth();
  const anio = hoy.getFullYear();

  // Generar días hábiles para validar y obtener día semana
  const diasHabiles = generarDiasHabiles(mes, anio);
  const fechaSeleccionada = diasHabiles.find(f => f.getDate() === diaNum);

  if (!fechaSeleccionada) {
    alert("Día seleccionado inválido.");
    return;
  }

  const diaSemanaNombre = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  const diaSemana = diaSemanaNombre[fechaSeleccionada.getDay()];

  // Buscar materia en horario para obtener turno
  const materiaInfo = HORARIO[diaSemana].find(m => m.materia === materiaSel);

  if (!materiaInfo) {
    alert("La materia no corresponde al día seleccionado.");
    return;
  }

  // Formatear fecha como "Lunes 02/06"
  const diaString = diaNum < 10 ? "0" + diaNum : diaNum;
  const mesString = (mes + 1) < 10 ? "0" + (mes + 1) : (mes + 1);
  const fechaTexto = `${diaSemana} ${diaString}/${mesString}`;

  const evento = {
    fecha: fechaTexto,
    materia: materiaSel,
    tipo: tipoSel,
    turno: materiaInfo.turno,
    hora: tipoSel === "Ausencia" ? horaAusencia : ""
  };

  EVENTOS.push(evento);
  guardarEventos();
  renderizarCalendario();
  actualizarEventosActivos();
}

function guardarEventos() {
  localStorage.setItem("eventosGuardados", JSON.stringify(EVENTOS));
}

function actualizarEventosActivos() {
  const lista = document.getElementById("eventos-activos");
  lista.innerHTML = "";

  EVENTOS.forEach((ev, idx) => {
    const item = document.createElement("li");
    item.textContent = `${ev.fecha}: ${ev.materia} - ${ev.tipo}`;
    const btnDel = document.createElement("button");
    btnDel.textContent = "Eliminar";
    btnDel.onclick = () => {
      EVENTOS.splice(idx, 1);
      guardarEventos();
      renderizarCalendario();
      actualizarEventosActivos();
    };
    item.appendChild(btnDel);
    lista.appendChild(item);
  });
}

function login() {
  const tipoUsuario = prompt("¿Eres Alumno o Administrador?").toLowerCase();
  if (tipoUsuario === "administrador") {
    const ingreso = prompt("Ingrese la contraseña:");
    if (ingreso === CONTRASENA) {
      modoAdmin = true;
      document.getElementById("panel-admin").style.display = "block";
      renderizarCalendario();
      actualizarEventosActivos();
    } else {
      alert("Contraseña incorrecta");
      renderizarCalendario();
    }
  } else {
    renderizarCalendario();
  }
}

window.onload = () => {
  login();
};
