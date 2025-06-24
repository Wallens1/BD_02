let descuento = 0;
let servicios = [];
let fechaSeleccionada = null;

async function cargarEspecialidades() {
  const res = await fetch("http://localhost:3000/especialidades");
  const data = await res.json();
  const select = document.getElementById("especialidad");
  data.forEach((e) => {
    const opt = document.createElement("option");
    opt.value = e.nombreespecialidad;
    opt.textContent = e.nombreespecialidad;
    select.appendChild(opt);
  });
}

async function cargarMedicos(especialidad) {
  const res = await fetch(
    `http://localhost:3000/medicos?especialidad=${encodeURIComponent(
      especialidad
    )}`
  );
  const data = await res.json();
  const select = document.getElementById("medico");
  select.innerHTML = '<option value="">Seleccione un médico</option>';
  data.forEach((medico) => {
    const opt = document.createElement("option");
    opt.value = medico.idmedico;
    opt.textContent = `ID ${medico.idmedico} - ${medico.estadomedico}`;
    opt.dataset.fecha = medico.horario;
    select.appendChild(opt);
  });
}

function mostrarFechaDeMedico(fechaISO) {
  const tbody = document.getElementById("tabla-fechas");
  tbody.innerHTML = "";
  const tr = document.createElement("tr");
  const td = document.createElement("td");
  td.textContent = new Date(fechaISO).toLocaleDateString();
  td.style.cursor = "pointer";
  td.addEventListener("click", () => {
    fechaSeleccionada = fechaISO;
    td.style.backgroundColor = "#b0f2b6";
  });
  tr.appendChild(td);
  tbody.appendChild(tr);
}

async function cargarServicios() {
  const res = await fetch("http://localhost:3000/servicios");
  const data = await res.json();
  servicios = data;

  const costoSpan = document.getElementById("costo");
  const descuentoSpan = document.getElementById("descuento");
  const totalSpan = document.getElementById("total");

  let costoTotal = servicios.reduce((s, sv) => s + sv.costoservicio, 0);
  let valorDescuento = costoTotal * (descuento / 100);
  let totalFinal = costoTotal - valorDescuento;

  costoSpan.textContent = `$${costoTotal.toFixed(2)}`;
  descuentoSpan.textContent = `$${valorDescuento.toFixed(2)}`;
  totalSpan.textContent = `$${totalFinal.toFixed(2)}`;
}

document.getElementById("cedula").addEventListener("change", async (e) => {
  const cedula = e.target.value;
  try {
    const res = await fetch(`http://localhost:3000/paciente/${cedula}`);
    const data = await res.json();
    document.getElementById("beneficios").textContent = data.beneficio;
    document.getElementById("estado").textContent =
      data.nombreaseguradora + " (" + data.categoriapaciente + ")";
    descuento = data.descuento;
    await cargarServicios(); // Recalcula costos
  } catch {
    document.getElementById("beneficios").textContent = "Sin beneficios";
    document.getElementById("estado").textContent = "Particular";
  }
});

document
  .getElementById("especialidad")
  .addEventListener("change", async (e) => {
    const especialidad = e.target.value;
    if (especialidad) {
      await cargarMedicos(especialidad);
    }
  });

document.getElementById("medico").addEventListener("change", (e) => {
  const selected = e.target.selectedOptions[0];
  const fecha = selected?.dataset?.fecha;
  if (fecha) {
    mostrarFechaDeMedico(fecha);
  }
});

document.getElementById("agendar").addEventListener("click", async () => {
  const cedula = document.getElementById("cedula").value;
  const medicoId = document.getElementById("medico").value;
  const tipoConsulta = "General";

  if (!cedula || !medicoId || !fechaSeleccionada) {
    alert("Debes ingresar todos los datos: cédula, médico y fecha.");
    return;
  }

  const total = servicios.reduce((s, sv) => s + sv.costoservicio, 0);
  const descuentoAplicado = total * (descuento / 100);
  const totalFinal = total - descuentoAplicado;

  const body = {
    tipoConsulta,
    fechaHora: fechaSeleccionada,
    asistio: false,
    estado: "Pendiente",
    observaciones: "Consulta agendada",
    idMedico: medicoId,
    ccPaciente: cedula,
    servicios: servicios.map((s) => s.idservicio),
    total: totalFinal,
  };

  const res = await fetch("http://localhost:3000/consulta", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (res.ok) {
    alert("Consulta agendada exitosamente.");
  } else {
    alert("Error al agendar consulta.");
  }
});

window.addEventListener("DOMContentLoaded", cargarEspecialidades);
