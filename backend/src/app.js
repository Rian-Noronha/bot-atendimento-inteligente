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
const authRoutes= require('./routes/authRoutes');



const app = express();
const corsOptions = {
  origin: '*', // Permite qualquer origem.
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
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
app.use('/api/auth', authRoutes);



module.exports = app;