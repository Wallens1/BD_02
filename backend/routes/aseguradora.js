const express = require('express');
const router = express.Router();
const pool = require('../db');

// Obtener todas las aseguradoras
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM aseguradora ORDER BY nombreaseguradora');
    console.log('Aseguradoras encontradas:', result.rows);
    console.log('Número de aseguradoras:', result.rows.length);
    if (result.rows.length > 0) {
      console.log('Estructura de la primera aseguradora:', Object.keys(result.rows[0]));
    }
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener aseguradoras:', error);
    res.status(500).json({ error: 'Error al obtener aseguradoras' });
  }
});

// Obtener una aseguradora específica por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM aseguradora WHERE idaseguradora = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Aseguradora no encontrada' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al obtener aseguradora:', error);
    res.status(500).json({ error: 'Error al obtener aseguradora' });
  }
});

// Actualizar beneficio y descuento de una aseguradora
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { beneficio, descuento } = req.body;
    
    console.log(`Actualizando aseguradora ID: ${id}`);
    console.log('Nuevo beneficio:', beneficio);
    console.log('Nuevo descuento:', descuento);
    
    if (!beneficio || descuento === undefined || descuento < 0 || descuento > 100) {
      return res.status(400).json({ error: 'Datos inválidos. El descuento debe estar entre 0 y 100.' });
    }
    
    // Verificar si la aseguradora existe
    const checkResult = await pool.query('SELECT * FROM aseguradora WHERE idaseguradora = $1', [id]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Aseguradora no encontrada' });
    }
    
    // Actualizar beneficio y descuento
    const result = await pool.query(
      'UPDATE aseguradora SET beneficio = $1, descuento = $2 WHERE idaseguradora = $3 RETURNING *',
      [beneficio, descuento, id]
    );
    
    console.log('Aseguradora actualizada:', result.rows[0]);
    res.json({ success: true, aseguradora: result.rows[0] });
    
  } catch (error) {
    console.error('Error al actualizar aseguradora:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;
