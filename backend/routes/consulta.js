const express = require('express');
const router = express.Router();
const pool = require('../db');

router.post('/', async (req, res) => {
  const { tipoConsulta, fechaHora, asistio, estado, observaciones, idMedico, ccPaciente, servicios, total } = req.body;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const consultaResult = await client.query(`
      INSERT INTO Consulta (tipoConsulta, fechaHora, asistio, estado, observaciones, idMedico, ccPaciente)
      VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING idConsulta
    `, [tipoConsulta, fechaHora, asistio, estado, observaciones, idMedico, ccPaciente]);

    const idConsulta = consultaResult.rows[0].idconsulta;

    for (const servicio of servicios) {
      await client.query('INSERT INTO Incluya (idConsulta, idServicio) VALUES ($1, $2)', [idConsulta, servicio]);
    }

    await client.query(`
      INSERT INTO Factura (tipoPago, costoFactura, saldoFactura, idConsulta)
      VALUES ('pendiente', $1, $2, $3)
    `, [total, total, idConsulta]);

    await client.query('COMMIT');
    res.json({ success: true });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: 'Error al agendar consulta' });
  } finally {
    client.release();
  }
});

module.exports = router;