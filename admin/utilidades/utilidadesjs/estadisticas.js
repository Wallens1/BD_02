let graficoServiciosChart = null;

document.addEventListener("DOMContentLoaded", () => {
  fetch("http://localhost:3000/estadisticas")
    .then(res => {
      if (!res.ok) throw new Error("Error de red");
      return res.json();
    })
    .then(datos => {
      console.log("Datos recibidos:", datos);
      actualizarResumen(datos);
      renderGraficoServicios(datos.serviciosPopularesDetalles);
    })
    .catch(error => {
      console.error("Error mostrando estadísticas:", error);
      alert("No se pudieron cargar las estadísticas.");
    });
});

function actualizarResumen(datos) {
  document.getElementById("totalPacientes").textContent = datos.totalPacientes;
  document.getElementById("citasHoy").textContent = datos.citasHoy;
  document.getElementById("ingresosMes").textContent = `$${datos.ingresosMes.toLocaleString()}`;
  document.getElementById("serviciosPopulares").textContent = datos.serviciosPopulares.join(", ");
}

function renderGraficoServicios(servicios) {
  const canvas = document.getElementById("graficoServicios");

  // Si no existe el canvas, lo creamos dinámicamente
  if (!canvas) {
    const contenedor = document.querySelector(".grafico-placeholder");
    const nuevoCanvas = document.createElement("canvas");
    nuevoCanvas.id = "graficoServicios";
    contenedor.innerHTML = ""; // Limpia el placeholder
    contenedor.appendChild(nuevoCanvas);
  }

  const ctx = document.getElementById("graficoServicios").getContext("2d");

  // Destruir gráfico anterior si existe
  if (graficoServiciosChart) {
    graficoServiciosChart.destroy();
  }

  graficoServiciosChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: servicios.map(s => s.nombre),
      datasets: [{
        label: "Servicios más usados",
        data: servicios.map(s => s.cantidad),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}
