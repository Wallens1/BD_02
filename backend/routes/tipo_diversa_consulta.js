const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /tipoconsulta
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM tipo_diversa_consulta');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Error fetching tipos de consulta' });
    }
});

// PUT /tipoconsulta/:tipoconsulta
router.put('/:tipoconsulta', async (req, res) => {
    const { tipoconsulta } = req.params;
    const { costoconsulta } = req.body;
    try {
        const result = await pool.query(
            'UPDATE tipo_diversa_consulta SET costoconsulta = $1 WHERE tipoconsulta = $2 RETURNING *',
            [costoconsulta, tipoconsulta]
        );
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Tipo de consulta no encontrado' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Error updating costoconsulta' });
    }
});

module.exports = router;