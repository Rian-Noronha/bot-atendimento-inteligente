const express = require('express');
const cors = require('cors');

//organizando as rotas
const perfilRoutes = require('./routes/perfilRoutes');
const categoriaRoutes = require('./routes/categoriaRoutes');
const palavraChaveRoutes = require('./routes/palavraChaveRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');
const subcategoriaRoutes = require('./routes/subcategoriaRoutes');
const documentoRoutes = require('./routes/documentoRoutes');
const chatSessaoRoutes = require('./routes/chatSessaoRoutes');
const chatConsultaRoutes = require('./routes/chatConsultaRoutes');
const chatRespostaRoutes = require('./routes/chatRespostaRoutes');
const assuntoPendenteRoutes = require('./routes/assuntoPendenteRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');

const app = express();

app.use(cors());
app.use(express.json());


app.use('/api', perfilRoutes);
app.use('/api', categoriaRoutes);
app.use('/api', palavraChaveRoutes);
app.use('/api', usuarioRoutes);
app.use('/api', subcategoriaRoutes);
app.use('/api', documentoRoutes);
app.use('/api', chatSessaoRoutes);
app.use('/api', chatConsultaRoutes);
app.use('/api', chatRespostaRoutes);
app.use('/api', assuntoPendenteRoutes);
app.use('/api', feedbackRoutes);


module.exports = app;