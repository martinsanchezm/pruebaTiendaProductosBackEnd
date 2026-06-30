const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const itemsRouter = require('./src/routes/items');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir los archivos subidos de forma estática
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rutas
app.use('/api/items', itemsRouter);

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Servidor funcionando' });
});

// Manejador de errores de multer y genérico
app.use((err, req, res, next) => {
  if (err.name === 'MulterError') {
    return res.status(422).json({ errors: [{ field: 'media', message: err.message }] });
  }
  if (err) {
    return res.status(422).json({ errors: [{ field: 'media', message: err.message }] });
  }
  next();
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
