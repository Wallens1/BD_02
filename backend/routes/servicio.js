const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM servicio');
    console.log('Servicios encontrados:', result.rows);
    console.log('Número de servicios:', result.rows.length);
    if (result.rows.length > 0) {
      console.log('Estructura del primer servicio:', Object.keys(result.rows[0]));
    }
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener servicios:', error);
    res.status(500).json({ error: 'Error al obtener servicios' });
  }
});

// Ruta adicional para verificar la estructura de la tabla
router.get('/estructura', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'servicio'
      ORDER BY ordinal_position
    `);
    console.log('Estructura de la tabla Servicio:', result.rows);
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener estructura:', error);
    res.status(500).json({ error: 'Error al obtener estructura' });
  }
});

// Ruta para actualizar el costo de un servicio
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { costo } = req.body;
    
    console.log(`Actualizando servicio ID: ${id} con nuevo costo: ${costo}`);
    console.log('Usando columnas: idservicio, costoservicio');
    
    if (!costo || costo <= 0) {
      return res.status(400).json({ error: 'El costo debe ser un número positivo' });
    }
    
    // Primero verificar si el servicio existe
    const checkResult = await pool.query('SELECT * FROM servicio WHERE idservicio = $1', [id]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Servicio no encontrado' });
    }
    
    console.log('Servicio encontrado:', checkResult.rows[0]);
    
    // Actualizar el costo
    const result = await pool.query(
      'UPDATE servicio SET costoservicio = $1 WHERE idservicio = $2 RETURNING *',
      [costo, id]
    );
    
    console.log('Servicio actualizado:', result.rows[0]);
    res.json({ success: true, servicio: result.rows[0] });
    
  } catch (error) {
    console.error('Error al actualizar servicio:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Ruta de debugging temporal
router.get('/debug', async (req, res) => {
  try {
    console.log('=== DEBUG: Probando diferentes consultas ===');
    
    // Probar con diferentes nombres de tabla
    try {
      const result1 = await pool.query('SELECT * FROM servicio LIMIT 1');
      console.log('✅ servicio (minúscula) funciona:', result1.rows[0]);
      res.json({ 
        success: true, 
        tabla: 'servicio',
        columnas: Object.keys(result1.rows[0] || {}),
        datos: result1.rows[0]
      });
      return;
    } catch (error) {
      console.log('❌ servicio (minúscula) falló:', error.message);
    }
    
    try {
      const result2 = await pool.query('SELECT * FROM Servicio LIMIT 1');
      console.log('✅ Servicio (mayúscula) funciona:', result2.rows[0]);
      res.json({ 
        success: true, 
        tabla: 'Servicio',
        columnas: Object.keys(result2.rows[0] || {}),
        datos: result2.rows[0]
      });
      return;
    } catch (error) {
      console.log('❌ Servicio (mayúscula) falló:', error.message);
    }
    
    try {
      const result3 = await pool.query('SELECT * FROM "Servicio" LIMIT 1');
      console.log('✅ "Servicio" (con comillas) funciona:', result3.rows[0]);
      res.json({ 
        success: true, 
        tabla: '"Servicio"',
        columnas: Object.keys(result3.rows[0] || {}),
        datos: result3.rows[0]
      });
      return;
    } catch (error) {
      console.log('❌ "Servicio" (con comillas) falló:', error.message);
    }
    
    res.status(500).json({ error: 'Ninguna variante de nombre de tabla funcionó' });
    
  } catch (error) {
    console.error('Error en debug:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;