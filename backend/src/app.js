const express = require('express');
const cors = require('cors');

//organizando as rotas
const perfilRoutes = require('./routes/perfilRoutes');
const categoriaRoutes = require('./routes/categoriaRoutes');
const palavraChaveRoutes = require('./routes/palavraChaveRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');
const subcategoriaRoutes = require('./routes/subcategoriaRoutes');


const app = express();

app.use(cors());
app.use(express.json());


app.use('/api', perfilRoutes);
app.use('/api', categoriaRoutes);
app.use('/api', palavraChaveRoutes);
app.use('/api', usuarioRoutes);
app.use('/api', subcategoriaRoutes);


module.exports = app;