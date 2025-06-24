const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/:cedula', async (req, res) => {
  const cedula = req.params.cedula;
  try {
    const result = await pool.query(`
      SELECT p.nombrePaciente, a.nombreAseguradora, a.beneficio, a.descuento, p.categoriaPaciente
      FROM Paciente p
      JOIN Aseguradora a ON p.idAseguradora = a.idAseguradora
      WHERE p.ccPaciente = $1
    `, [cedula]);

    if (result.rows.length === 0) return res.status(404).json({ error: 'Paciente no encontrado' });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error al buscar paciente' });
  }
});

module.exports = router;