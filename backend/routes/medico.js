// backend/routes/medico.js
const express = require('express');
const router = express.Router();
const pool = require('../db');

// backend/routes/medico.js
router.get('/', async (req, res) => {
  try {
    const { especialidad } = req.query;
    let result;
    if (especialidad) {
      result = await pool.query(
          `SELECT m.idmedico, m.nombre, m.estadomedico, m.horario, e.nombreespecialidad AS especialidad
           FROM medico m
                  JOIN especialidad e ON m.idespecialidad = e.idespecialidad
           WHERE e.nombreespecialidad = $1 AND m.estadomedico = 'Disponible'`,
          [especialidad]
      );
    } else {
      result = await pool.query(
          `SELECT m.idmedico, m.nombre, m.estadomedico, m.horario, e.nombreespecialidad AS especialidad
           FROM medico m
                  JOIN especialidad e ON m.idespecialidad = e.idespecialidad
           WHERE m.estadomedico = 'Disponible'`
      );
    }
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener médicos', err);
    res.status(500).json({ error: 'Error al obtener médicos' });
  }
});

router.get('/:medicoId/fechas', async (req, res) => {
  const { medicoId } = req.params;
  try {
    const result = await pool.query(
        'SELECT horario FROM medico WHERE idmedico = $1',
        [medicoId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Medico not found' });
    }
    // Assuming horario is a string, e.g., "Monday 9-12, Tuesday 14-17"
    res.json([result.rows[0].horario]);
  } catch (err) {
    console.error('Error fetching horario for medico', err);
    res.status(500).json({ error: 'Error fetching horario' });
  }
});

router.get('/ocupado', async (req, res) => {
  try {
    const { especialidad } = req.query;
    let result;
    if (especialidad) {
      result = await pool.query(
          `SELECT m.idmedico, m.nombre, m.estadomedico, m.horario, e.nombreespecialidad AS especialidad
           FROM medico m
                  JOIN especialidad e ON m.idespecialidad = e.idespecialidad
           WHERE e.nombreespecialidad = $1 AND m.estadomedico = 'Ocupado'`,
          [especialidad]
      );
    } else {
      result = await pool.query(
          `SELECT m.idmedico, m.nombre, m.estadomedico, m.horario, e.nombreespecialidad AS especialidad
           FROM medico m
                  JOIN especialidad e ON m.idespecialidad = e.idespecialidad
           WHERE m.estadomedico = 'Ocupado'`
      );
    }
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener médicos', err);
    res.status(500).json({ error: 'Error al obtener médicos' });
  }
});

module.exports = router;