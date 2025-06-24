const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json()); 

// Conexión a la base de datos
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'BDFINAL',
  password: '1113036325',
  port: 5432, 
});

pool.connect()
  .then(client => {
    console.log('Conexión exitosa a la base de datos');
  });

// 1. Obtener datos del paciente
app.get('/paciente/:cedula', async (req, res) => {
  const cedula = req.params.cedula;
  try {
    const query = `
      SELECT p.nombrePaciente, a.nombreAseguradora, a.beneficio, a.descuento, p.categoriaPaciente
      FROM Paciente p
      JOIN Aseguradora a ON p.idAseguradora = a.idAseguradora
      WHERE p.ccPaciente = $1
    `;
    const result = await pool.query(query, [cedula]);

    if (result.rows.length === 0) return res.status(404).json({ error: 'Paciente no encontrado' });

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error al buscar paciente' });
  }
});

// 2. Obtener especialidades
app.get('/especialidades', async (req, res) => {
  const result = await pool.query('SELECT nombreEspecialidad FROM Especialidad');
  res.json(result.rows);
});

// 3. Obtener médicos por especialidad (opcional)
app.get('/medicos', async (req, res) => {
  const filtro = req.query.especialidad;
  let query = 'SELECT idMedico, estadoMedico, horario FROM Medico';
  const values = [];

  if (filtro) {
    query += ' JOIN Especialidad e ON e.idEspecialidad = Medico.idEspecialidad WHERE e.nombreEspecialidad = $1';
    values.push(filtro);
  }

  const result = await pool.query(query, values);
  res.json(result.rows);
});

// 4. Obtener servicios
app.get('/servicios', async (req, res) => {
  const result = await pool.query('SELECT * FROM Servicio');
  res.json(result.rows);
});

// 5. Agendar consulta
app.post('/consulta', async (req, res) => {
  const { tipoConsulta, fechaHora, asistio, estado, observaciones, idMedico, ccPaciente, servicios, total } = req.body;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const consultaInsert = `
      INSERT INTO Consulta (tipoConsulta, fechaHora, asistio, estado, observaciones, idMedico, ccPaciente)
      VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING idConsulta
    `;

    const consultaResult = await client.query(consultaInsert, [
      tipoConsulta, fechaHora, asistio, estado, observaciones, idMedico, ccPaciente
    ]);

    const idConsulta = consultaResult.rows[0].idconsulta;

    for (const servicio of servicios) {
      await client.query('INSERT INTO Incluya (idConsulta, idServicio) VALUES ($1, $2)', [idConsulta, servicio]);
    }

    await client.query('INSERT INTO Factura (tipoPago, costoFactura, saldoFactura, idConsulta) VALUES ($1, $2, $3, $4)', ['pendiente', total, total, idConsulta]);

    await client.query('COMMIT');
    res.json({ success: true });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: 'Error al agendar consulta' });
  } finally {
    client.release();
  }
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});


