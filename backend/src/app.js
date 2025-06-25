const express = require('express');
const cors = require('cors');

//organizando as rotas
const perfilRoutes = require('./routes/perfilRoutes');
const categoriaRoutes = require('./routes/categoriaRoutes');
const palavraChaveRoutes = require('./routes/palavraChaveRoutes');


const app = express();

app.use(cors());
app.use(express.json());


app.use('/api', perfilRoutes);
app.use('/api', categoriaRoutes);
app.use('/api', palavraChaveRoutes);


module.exports = app;