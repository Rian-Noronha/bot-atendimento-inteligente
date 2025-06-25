const express = require('express');
const cors = require('cors');

//organizando as rotas
const perfilRoutes = require('./routes/perfilRoutes');


const app = express();

app.use(cors());
app.use(express.json());


app.use('/api', perfilRoutes);


module.exports = app;