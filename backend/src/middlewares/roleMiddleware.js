// Importa os models para podermos consultar o banco de dados
const { Usuario, Perfil } = require('../models');

/**
 * Middleware para verificar se o usuário logado tem o perfil de 'Admin'.
 * DEVE ser usado DEPOIS do middleware 'protect'.
 */
const isAdmin = async (req, res, next) => {
    try {
        // 1. O middleware 'protect' já verificou o token e adicionou 'req.user'.
        //    'req.user' contém os dados do payload do token, como o ID do usuário.
        const idDoUsuarioLogado = req.user.id;

        // 2. Buscamos o usuário no banco de dados para obter suas informações completas,
        //    principalmente seu perfil associado.
        const usuario = await Usuario.findByPk(idDoUsuarioLogado, {
            include: [{
                model: Perfil,
                as: 'perfil',
                attributes: ['nome'] // Só precisamos do nome do perfil para a verificação
            }]
        });

        // 3. Verificamos se o usuário existe e se o nome do seu perfil é 'Admin'.
        //    É importante usar .toLowerCase() para evitar erros com 'Admin', 'admin' ou 'ADMIN'.
        if (usuario && usuario.perfil && usuario.perfil.nome.toLowerCase() === 'administrador') {
            // 4. Se for 'Admin', permite que a requisição prossiga para o controller.
            next();
        } else {
            // 5. Se não for 'Admin', retorna um erro 403 Forbidden (Acesso Proibido).
            return res.status(403).json({ message: 'Acesso negado. Rota exclusiva para administradores.' });
        }

    } catch (error) {
        res.status(500).json({ message: "Erro interno ao verificar permissões de administrador", error: error.message });
    }
};

module.exports = { isAdmin };