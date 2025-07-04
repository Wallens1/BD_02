// archivo: js/registro_asistencia.js

document.addEventListener('DOMContentLoaded', () => {
  const cedulaInput = document.getElementById('cedula');
  const consultaSelect = document.getElementById('consultaSelect');
  const fechaInput = document.getElementById('fecha');
  const horaInput = document.getElementById('hora');
  const costoInput = document.getElementById('costo');
  const pagoSelect = document.getElementById('pago');
  const btnRegistrar = document.getElementById('registrarAsistencia');

  let consultas = [];

  cedulaInput.addEventListener('blur', async () => {
    const cedula = cedulaInput.value.trim();
    if (!cedula) return;

    try {
      const res = await fetch(`http://localhost:3000/consulta/pendiente/${cedula}`);
      if (!res.ok) throw new Error('No se encontraron consultas');
      consultas = await res.json();

      // Clear previous options
      consultaSelect.innerHTML = '<option value="">Seleccione una consulta</option>';

      consultas.forEach(consulta => {
        const option = document.createElement('option');
        option.value = consulta.idconsulta;
        option.textContent = `${consulta.nombre_medico}`;
        consultaSelect.appendChild(option);
      });
    } catch (err) {
      console.error('Error loading consultas:', err);
      consultaSelect.innerHTML = '<option value="">No hay consultas</option>';
      consultas = [];
    }

    fechaInput.value = '';
    horaInput.value = '';
    costoInput.value = '';
  });

  consultaSelect.addEventListener('change', () => {
    const selectedId = consultaSelect.value;
    const consulta = consultas.find(c => String(c.idconsulta) === selectedId);
    if (consulta) {
      fechaInput.value = consulta.fechahora.slice(0, 10);
      horaInput.value = consulta.fechahora.slice(11, 16);
      costoInput.value = parseFloat(consulta.costo).toFixed(2);
    } else {
      fechaInput.value = '';
      horaInput.value = '';
      costoInput.value = '';
    }
  });

  btnRegistrar.addEventListener('click', async () => {
    const selectedId = consultaSelect.value;
    const consultaPendiente = consultas.find(c => c.idconsulta === selectedId);
    if (!consultaPendiente) {
      alert('Debe cargar una consulta válida.');
      return;
    }

    const pago = pagoSelect.value;

    try {
      const res = await fetch(`http://localhost:3000/consulta/asistencia`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idConsulta: consultaPendiente.idconsulta,
          tipoPago: pago
        })
      });

      if (!res.ok) throw new Error('Fallo al registrar asistencia');

      alert('Asistencia registrada con éxito');
      location.reload();
    } catch (err) {
      console.error('Error registrando asistencia:', err);
      alert('No se pudo registrar la asistencia');
    }
  });
});

/*
document.addEventListener('DOMContentLoaded', () => {
  const cedulaInput = document.getElementById('cedula');
  const fechaInput = document.getElementById('fecha');
  const horaInput = document.getElementById('hora');
  const costoInput = document.getElementById('costo');
  const pagoSelect = document.getElementById('pago');
  const btnRegistrar = document.getElementById('registrarAsistencia');
  const infoMedicoDiv = document.getElementById('infoMedico');

  let consultaPendiente = null;

  cedulaInput.addEventListener('blur', async () => {
    const cedula = cedulaInput.value.trim();
    if (!cedula) return;

    try {
      const res = await fetch(`http://localhost:3000/consulta/pendiente/${cedula}`);
      if (!res.ok) throw new Error('No se encontró consulta');

      const consulta = await res.json();
      consultaPendiente = consulta;

      // Mostrar info del médico
      infoMedicoDiv.innerHTML = `
        <h2>${consulta.nombre_medico}</h2>
        <p>Especialidad: ${consulta.especialidad}</p>
        <p>Horario: ${new Date(consulta.fechahora).toLocaleString()}</p>
      `;

      // Mostrar info consulta
      fechaInput.value = consulta.fechahora.slice(0, 10);
      horaInput.value = consulta.fechahora.slice(11, 16);
      costoInput.value = parseFloat(consulta.costo).toFixed(2);

    } catch (err) {
      console.error('Error cargando consulta:', err);
      infoMedicoDiv.innerHTML = '<p>No hay consultas pendientes.</p>';
      consultaPendiente = null;
      fechaInput.value = '';
      horaInput.value = '';
      costoInput.value = '';
    }
  });

  btnRegistrar.addEventListener('click', async () => {
    if (!consultaPendiente) {
      alert('Debe cargar una consulta válida.');
      return;
    }

    const pago = pagoSelect.value;

    try {
      const res = await fetch(`http://localhost:3000/consulta/asistencia`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idConsulta: consultaPendiente.idconsulta,
          tipoPago: pago
        })
      });

      if (!res.ok) throw new Error('Fallo al registrar asistencia');

      alert('Asistencia registrada con éxito');
      location.reload();
    } catch (err) {
      console.error('Error registrando asistencia:', err);
      alert('No se pudo registrar la asistencia');
    }
  });
});*/