const express = require('express');
const router = express.Router();
const pool = require('../db');

router.post('/', async (req, res) => {
  console.log('BODY recibido para agendar:', req.body);

  const {
    tipoConsulta, fechaHora, asistio, estado,
    observaciones, idMedico, ccPaciente,
    servicios, total
  } = req.body;

  if (!tipoConsulta || !fechaHora || !idMedico || !ccPaciente || !servicios || servicios.length === 0 || !total) {
    return res.status(400).json({ error: 'Datos incompletos' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const consultaResult = await client.query(`
      INSERT INTO Consulta (tipoConsulta, fechaHora, asistio, estado, observaciones, idMedico, ccPaciente)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING idConsulta
    `, [tipoConsulta, fechaHora, asistio, estado, observaciones, idMedico, ccPaciente]);

    const idConsulta = consultaResult.rows[0].idconsulta;

    for (const idServicio of servicios) {
      await client.query('INSERT INTO Incluya (idConsulta, idServicio) VALUES ($1, $2)', [idConsulta, idServicio]);
    }

    await client.query(`
      INSERT INTO Factura (tipoPago, costoFactura, saldoFactura, idConsulta)
      VALUES ('pendiente', $1, $2, $3)
    `, [total, total, idConsulta]);

    await client.query('COMMIT');
    res.json({ success: true });
  } catch (err) {
    console.error('Error agendando consulta:', err);
    await client.query('ROLLBACK');
    res.status(500).json({ error: 'Error al agendar consulta' });
  } finally {
    client.release();
  }
});

router.get('/pendiente/:cedula', async (req, res) => {
  const cedula = req.params.cedula;

  try {
    const result = await pool.query(`
      SELECT c.idconsulta, c.fechahora, c.estado, c.asistio, c.observaciones,
             m.nombre AS nombre_medico, e.nombreespecialidad AS especialidad,
             t.costoConsulta AS costoconsulta,
             COALESCE(SUM(s.costoServicio), 0) AS total_servicios,
             (t.costoConsulta + COALESCE(SUM(s.costoServicio), 0)) AS costo
      FROM consulta c
      JOIN medico m ON c.idmedico = m.idmedico
      JOIN especialidad e ON m.idespecialidad = e.idespecialidad
      JOIN tipo_diversa_consulta t ON c.tipoconsulta = t.tipoconsulta
      LEFT JOIN incluya i ON c.idconsulta = i.idconsulta
      LEFT JOIN servicio s ON i.idservicio = s.idservicio
      WHERE c.ccpaciente = $1 AND c.asistio = false AND c.estado = 'Pendiente'
        GROUP BY c.idconsulta, m.nombre, e.nombreespecialidad, t.costoConsulta, c.fechahora, c.estado, c.asistio, c.observaciones
      ORDER BY c.fechahora ASC
    `, [cedula]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No hay consultas pendientes para este paciente' });
    }

    res.json(result.rows);
  } catch (error) {
    console.error('Error buscando consulta pendiente:', error);
    res.status(500).json({ error: 'Error al buscar consulta pendiente' });
  }
});



router.put('/asistencia', async (req, res) => {
  const { idConsulta, tipoPago } = req.body;

  if (!idConsulta || !tipoPago) {
    return res.status(400).json({ error: 'Datos incompletos' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query(`
      UPDATE consulta
      SET asistio = true, estado = 'Realizada'
      WHERE idconsulta = $1
    `, [idConsulta]);

    await client.query(`
      UPDATE factura
      SET tipoPago = $1, saldoFactura = 0
      WHERE idconsulta = $2
    `, [tipoPago, idConsulta]);

    await client.query('COMMIT');
    res.json({ success: true });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error registrando asistencia:', error);
    res.status(500).json({ error: 'Error al registrar asistencia' });
  } finally {
    client.release();
  }
});

router.get('/historial/:cedula', async (req, res) => {
  const cedula = req.params.cedula;

  try {
    const result = await pool.query(`
      SELECT c.fechahora, c.estado, c.asistio,
             m.nombre AS nombre_medico,
             e.nombreespecialidad AS especialidad,
             t.costoConsulta AS costo
      FROM consulta c
      JOIN medico m ON c.idmedico = m.idmedico
      JOIN especialidad e ON m.idespecialidad = e.idespecialidad
      JOIN tipo_diversa_consulta t ON c.tipoconsulta = t.tipoconsulta
      WHERE c.ccpaciente = $1
      ORDER BY c.fechahora DESC
    `, [cedula]);

    res.json(result.rows);
  } catch (err) {
    console.error('Error cargando historial de citas:', err);
    res.status(500).json({ error: 'Error al consultar historial' });
  }
});

router.get('/ingresos/mensuales', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        TO_CHAR(c.fechahora, 'YYYY-MM') AS mes,
        SUM(COALESCE(s.costoServicio, 0)) AS ingresos
      FROM consulta c
      LEFT JOIN incluya i ON c.idconsulta = i.idconsulta
      LEFT JOIN servicio s ON i.idservicio = s.idservicio
      GROUP BY mes
      ORDER BY mes
    `);

    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching monthly incomes:', err);
    res.status(500).json({ error: 'Error fetching monthly incomes' });
  }
});

module.exports = router;
