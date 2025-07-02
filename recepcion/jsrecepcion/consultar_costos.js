let descuento = 0;
let servicios = [];
let fechaSeleccionada = null;

const selected = Array.from(document.querySelectorAll('input[name="servicio"]:checked')).map(cb => cb.value);

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

// Fetch and populate servicios
async function cargarServicios() {
  const res = await fetch('http://localhost:3000/servicios');
  const servicios = await res.json();
  const container = document.getElementById('servicios-checkboxes');
  container.innerHTML = '';
  servicios.forEach(servicio => {
    const label = document.createElement('label');
    label.style.display = 'block';
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.value = servicio.idservicio;
    checkbox.name = 'servicio';
    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(' ' + servicio.nombreservicio));
    container.appendChild(label);
  });
}

async function cargarMedicosDisponibles(especialidad = "") {
  let url = "http://localhost:3000/medicos?estadomedico=Disponible";
  if (especialidad) {
    url += `&especialidad=${encodeURIComponent(especialidad)}`;
  }
  const res = await fetch(url);
  const medicos = await res.json();
  const select = document.getElementById("medico");
  select.innerHTML = '<option value="">Seleccione un médico disponible</option>';
  medicos.forEach(medico => {
    const option = document.createElement("option");
    option.value = medico.idmedico;
    option.textContent = `ID ${medico.idmedico} - ${medico.nombre}`;
    select.appendChild(option);
  });
}

function mostrarHorarioDeMedico(horario) {
  const tbody = document.getElementById("tabla-fechas");
  tbody.innerHTML = "";
  const tr = document.createElement("tr");
  const td = document.createElement("td");
  // Format the date for better readability
  const date = new Date(horario);
  td.textContent = date.toLocaleString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
  td.style.cursor = "pointer";
  td.addEventListener("click", () => {
    fechaSeleccionada = horario;
    td.style.backgroundColor = "#b0f2b6";
  });
  tr.appendChild(td);
  tbody.appendChild(tr);
}

async function actualizarTotal() {
  const selectedIds = Array.from(document.querySelectorAll('input[name="servicio"]:checked')).map(cb => cb.value);
  if (selectedIds.length === 0) {
    document.getElementById('costo').textContent = '0';
    document.getElementById('descuento').textContent = '0';
    document.getElementById('total').textContent = '0';
    return;
  }
  // Fetch all servicios
  const res = await fetch('http://localhost:3000/servicios');
  const servicios = await res.json();

  // Sum costoservicio for selected
  const costo = servicios
      .filter(s => selectedIds.includes(String(s.idservicio)))
      .reduce((sum, s) => sum + Number(s.costoservicio), 0);

  let descuentoText = 0; // Default to total if no discount
  if (descuento && descuento > 0) {
    descuentoText = costo * descuento / 100;
  }

  let total = costo - descuentoText;

  document.getElementById('total').textContent = total.toFixed(2);
  document.getElementById('costo').textContent = costo.toFixed(2);
  document.getElementById('descuento').textContent = descuentoText.toFixed(2);
}

document.addEventListener('DOMContentLoaded', cargarEspecialidades);
document.addEventListener('DOMContentLoaded', cargarServicios);
document.addEventListener("DOMContentLoaded", () => {
  cargarMedicosDisponibles();
  document.getElementById("especialidad").addEventListener("change", (e) => {
    cargarMedicosDisponibles(e.target.value);
  });
});
document.getElementById("cedula").addEventListener("change", async (e) => {
  const cedula = e.target.value;
  try {
    const res = await fetch(`http://localhost:3000/paciente/${cedula}`);
    const data = await res.json();
    // Show insurer in 'beneficios'
    document.getElementById("beneficios").textContent = data.nombreaseguradora || "Sin aseguradora";
    // Show status in 'estado'
    document.getElementById("estado").textContent = data.categoriapaciente || "Sin estado";
    descuento = data.descuento;
    // Optionally, update costs or other UI here
  } catch {
    document.getElementById("beneficios").textContent = "Sin aseguradora";
    document.getElementById("estado").textContent = "Sin estado";
  }
});
document.getElementById("medico").addEventListener("change", async (e) => {
  const medicoId = e.target.value;
  const fechasTable = document.getElementById("tabla-fechas");
  fechasTable.innerHTML = "";

  if (!medicoId) return;

  try {
    const res = await fetch(`http://localhost:3000/medicos/${medicoId}/fechas`);
    const fechas = await res.json();

    if (fechas.length === 0) {
      fechasTable.textContent = "No available dates.";
      return;
    }

    mostrarHorarioDeMedico(fechas[0]);
  } catch {
    fechasTable.textContent = "Error loading dates.";
  }
});
document.getElementById('servicios-checkboxes').addEventListener('change', actualizarTotal);
document.getElementById("agendar").addEventListener("click", async () => {
  const cedula = document.getElementById("cedula").value;
  const medicoId = document.getElementById("medico").value;
  const tipoConsulta = "General";

  if (!cedula || !medicoId || !fechaSeleccionada) {
    alert("Debes ingresar todos los datos: cédula, médico y fecha.");
    return;
  }

  // Get selected servicios from checkboxes
  const selectedIds = Array.from(document.querySelectorAll('input[name="servicio"]:checked')).map(cb => cb.value);

  // Fetch all servicios to get their costs
  const resServicios = await fetch('http://localhost:3000/servicios');
  const allServicios = await resServicios.json();
  const selectedServicios = allServicios.filter(s => selectedIds.includes(String(s.idservicio)));

  const total = selectedServicios.reduce((s, sv) => s + Number(sv.costoservicio), 0);
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
    servicios: selectedIds,
    total: totalFinal,
  };

  // POST consulta
  const res = await fetch("http://localhost:3000/consulta", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (res.ok) {
    const consulta = await res.json(); // Should return the created consulta with idconsulta
    const idconsulta = consulta.idconsulta;

    // POST each servicio to incluyas
    for (const idservicio of selectedIds) {
      await fetch("http://localhost:3000/incluya", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idconsulta, idservicio }),
      });
    }

    alert("Consulta agendada exitosamente.");
  } else {
    alert("Error al agendar consulta.");
  }
});