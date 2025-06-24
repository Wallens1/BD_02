const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  const filtro = req.query.especialidad;
  let query = 'SELECT m.idMedico, m.estadoMedico, m.horario FROM Medico m';
  const values = [];

  if (filtro) {
    query += ' JOIN Especialidad e ON e.idEspecialidad = m.idEspecialidad WHERE e.nombreEspecialidad = $1';
    values.push(filtro);
  }

  const result = await pool.query(query, values);
  res.json(result.rows);
});

module.exports = router;