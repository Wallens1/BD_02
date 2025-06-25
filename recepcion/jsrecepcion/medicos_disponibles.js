document.addEventListener("DOMContentLoaded", async () => {
  const medicosDisponibles = document.getElementById("medicosDisponibles");
  const medicosNoDisponibles = document.getElementById("medicosNoDisponibles");
  const especialidadSelect = document.getElementById("especialidad");
  const searchInput = document.getElementById("search");

  let todosLosMedicos = [];

  async function cargarEspecialidades() {
    try {
      const res = await fetch("http://localhost:3000/especialidades");
      const data = await res.json();
      data.forEach((esp) => {
        const option = document.createElement("option");
        option.value = esp.nombreespecialidad;
        option.textContent = esp.nombreespecialidad;
        especialidadSelect.appendChild(option);
      });
    } catch (err) {
      console.error("Error cargando especialidades", err);
    }
  }

  async function cargarMedicos() {
    try {
      const res = await fetch("http://localhost:3000/medicos");
      const data = await res.json();
      todosLosMedicos = data;
      filtrarYMostrar();
    } catch (err) {
      console.error("Error cargando médicos", err);
    }
  }

  function crearTarjetaMedico(medico) {
    const div = document.createElement("div");
    div.classList.add("medico");
    div.innerHTML = `
      <h2>Dr. ${medico.nombre}</h2>
      <p>Especialidad: ${medico.especialidad}</p>
      <p>Horario: ${new Date(medico.horario).toLocaleString()}</p>
    `;
    return div;
  }

  function filtrarYMostrar() {
    const filtroNombre = document.getElementById("search").value.toLowerCase();
    const filtroEspecialidad = document
      .getElementById("especialidad")
      .value.toLowerCase();

    const disponibles = document.querySelector(".medicos");
    const noDisponibles = document.querySelector(".noDisponibles");

    disponibles.innerHTML = "";
    noDisponibles.innerHTML = "";

    todosLosMedicos.forEach((medico) => {
      const coincideNombre = medico.nombre.toLowerCase().includes(filtroNombre);
      const coincideEspecialidad =
        !filtroEspecialidad ||
        (medico.especialidad &&
          medico.especialidad.toLowerCase() === filtroEspecialidad);

      if (coincideNombre && coincideEspecialidad) {
        const div = document.createElement("div");
        div.classList.add("medico");
        div.innerHTML = `
        <h2>${medico.nombre}</h2>
        <p>Especialidad: ${medico.especialidad}</p>
        <p>Horario: ${new Date(medico.horario).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}</p>
      `;
        if (medico.estadomedico.toLowerCase() === "disponible") {
          disponibles.appendChild(div);
        } else {
          noDisponibles.appendChild(div);
        }
      }
    });
  }

  searchInput.addEventListener("input", filtrarYMostrar);
  especialidadSelect.addEventListener("change", filtrarYMostrar);

  await cargarEspecialidades();
  await cargarMedicos();
});
