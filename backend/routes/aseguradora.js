const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
    const { empresa } = req.query;
    if (!empresa) return res.status(400).json({ error: 'Missing empresa parameter' });

    try {
        const result = await pool.query(
            'SELECT beneficio, descuento FROM aseguradora WHERE LOWER(nombreaseguradora) = LOWER($1)',
            [empresa]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Empresa not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Error fetching convenio' });
    }
});

// PUT /aseguradora/:nombre
router.put('/:nombre', async (req, res) => {
    const { nombre } = req.params;
    const { beneficio, descuento } = req.body;
    if (!beneficio || !descuento) {
        return res.status(400).json({ error: 'Missing beneficio or descuento' });
    }
    try {
        const result = await pool.query(
            'UPDATE aseguradora SET beneficio = $1, descuento = $2 WHERE LOWER(nombreaseguradora) = LOWER($3) RETURNING *',
            [beneficio, descuento, nombre]
        );
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Aseguradora not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Error updating aseguradora' });
    }
});

module.exports = router;
