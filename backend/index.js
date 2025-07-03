const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Rutas separadas
app.use('/paciente', require('./routes/paciente'));
app.use('/especialidades', require('./routes/especialidad'));
app.use('/medicos', require('./routes/medico'));
app.use('/servicios', require('./routes/servicio'));
app.use('/consulta', require('./routes/consulta'));
app.use('/estadisticas', require('./routes/estadistica'));
app.use('/tipoconsulta', require('./routes/tipo_diversa_consulta'));
app.use('/convenios', require('./routes/aseguradora'));

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});