const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT m.idmedico, m.nombre, m.estadomedico, m.horario, e.nombreespecialidad AS especialidad
      FROM medico m
      JOIN especialidad e ON m.idespecialidad = e.idespecialidad
    `);

    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener médicos', err);
    res.status(500).json({ error: 'Error al obtener médicos' });
  }
});

module.exports = router;