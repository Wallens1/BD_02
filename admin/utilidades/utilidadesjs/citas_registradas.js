document.addEventListener('DOMContentLoaded', () => {
  const cedulaInput = document.getElementById('searchPaciente');
  const buscarBtn = document.getElementById('buscarCitas');
  const citasBody = document.getElementById('citasBody');
  const buscarPacienteBtn = document.getElementById('buscarPacienteBtn');

  buscarPacienteBtn.addEventListener('click', async () => {
    const cedula = cedulaInput.value.trim();
    if (!cedula) {
      alert('Por favor ingresa una cédula');
      return;
    }

    try {
      const res = await fetch(`http://localhost:3000/paciente/${cedula}`);
      if (res.ok) {
        alert('Paciente existe');
      } else {
        alert('Paciente no existe');
      }
    } catch (err) {
      alert('Paciente no existe');
    }
  });

  buscarBtn.addEventListener('click', async () => {
    const cedula = cedulaInput.value.trim();
    if (!cedula) {
      alert('Por favor ingresa una cédula');
      return;
    }

    try {
      const res = await fetch(`http://localhost:3000/consulta/historial/${cedula}`);
      if (!res.ok) throw new Error('No se encontraron citas');

      const citas = await res.json();
      citasBody.innerHTML = ''; // Limpiar la tabla

      citas.forEach(cita => {
        const fecha = new Date(cita.fechahora);
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${fecha.toLocaleDateString()}</td>
          <td>${fecha.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
          <td>${cita.nombre_medico}</td>
          <td>${cita.especialidad}</td>
          <td>${cita.estado}</td>
          <td>$${cita.costo.toFixed(2)}</td>
          <td>${cita.asistio ? 'Sí' : 'No'}</td>
        `;
        citasBody.appendChild(row);
      });

    } catch (err) {
      console.error('Error cargando citas:', err);
      citasBody.innerHTML = `<tr><td colspan="7">No se encontraron citas para esta cédula</td></tr>`;
    }
  });
});
