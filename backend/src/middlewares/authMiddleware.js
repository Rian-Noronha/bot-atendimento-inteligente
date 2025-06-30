const jwt = require('jsonwebtoken');
const { Usuario } = require('../models');

// O 'protect' é o middleware de autenticação
exports.protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // 2. Extrai o token da string 'Bearer <token>'
            token = req.headers.authorization.split(' ')[1];

            // 3. Verifica se o token é válido usando a chave secreta
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // 4. Se o token for válido, procura o utilizador na base de dados pelo ID contido no token
            // Anexa o objeto do utilizador (sem a senha) ao objeto 'req'
            
            req.user = await Usuario.findByPk(decoded.id, {
                attributes: { exclude: ['senha_hash'] }
            });
            
            if (!req.user) {
                 return res.status(401).json({ message: 'Não autorizado, utilizador do token não encontrado.' });
            }
            // 5. Chama o próximo middleware ou a função do controller
            next();

        } catch (error) {
            console.error('Erro de autenticação:', error);
            res.status(401).json({ message: 'Não autorizado, token inválido.' });
        }
    }

    // Se não houver token, retorna um erro
    if (!token) {
        res.status(401).json({ message: 'Não autorizado, nenhum token fornecido.' });
    }
};