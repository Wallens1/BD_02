const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get("/", async (req, res) => {
  try {
    const [pacientes, citasHoy, ingresos, servicios] = await Promise.all([
      pool.query("SELECT COUNT(*) FROM Paciente"),
      pool.query(
        "SELECT COUNT(*) FROM Consulta WHERE DATE(fechaHora) = CURRENT_DATE"
      ),
      pool.query(`
        SELECT COALESCE(SUM(costoFactura), 0) as total 
        FROM Factura 
        WHERE EXTRACT(MONTH FROM CURRENT_DATE) = EXTRACT(MONTH FROM CURRENT_DATE)
          AND EXTRACT(YEAR FROM CURRENT_DATE) = EXTRACT(YEAR FROM CURRENT_DATE)
      `),
      pool.query(`
        SELECT s.nombreServicio, COUNT(*) as cantidad
        FROM Incluya i
        JOIN Servicio s ON i.idServicio = s.idServicio
        GROUP BY s.nombreServicio
        ORDER BY cantidad DESC
        LIMIT 3
      `),
    ]);

    res.json({
      totalPacientes: parseInt(pacientes.rows[0].count),
      citasHoy: parseInt(citasHoy.rows[0].count),
      ingresosMes: parseFloat(ingresos.rows[0].total),
      serviciosPopulares: servicios.rows.map((s) => s.nombreservicio),
      serviciosPopularesDetalles: servicios.rows.map((s) => ({
        nombre: s.nombreservicio,
        cantidad: parseInt(s.cantidad),
      })),
    });
  } catch (error) {
    console.error("Error obteniendo estadísticas:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

module.exports = router;
