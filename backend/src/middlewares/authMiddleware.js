const jwt = require('jsonwebtoken');
// Importe os models necessários, incluindo o novo
const { Usuario, SessaoAtiva } = require('../models');

// O 'protect' é o middleware de autenticação (versão final)
exports.protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // 1. Extrai o token da string 'Bearer <token>'
            token = req.headers.authorization.split(' ')[1];

            // 2. Verifica se o token é válido e decodifica o payload
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // --- VERIFICAÇÃO DE SESSÃO ATIVA (A PARTE QUE FALTAVA) ---
            // 3. Verifica se a sessão contida no token ainda existe no nosso banco.
            const sessaoAtual = await SessaoAtiva.findOne({
                where: {
                    session_id: decoded.sessionId, // Compara o ID da sessão do token
                    usuario_id: decoded.id       // E o ID do usuário, por segurança
                }
            });

            // 4. Se a sessão não for encontrada, significa que um novo login foi feito em outro lugar.
            if (!sessaoAtual) {
                return res.status(401).json({ message: 'Sessão inválida. Por favor, inicie sessão novamente.' });
            }

            // 5. Se a sessão é válida, anexa os dados do usuário do token à requisição.
            // Não precisamos buscar o usuário novamente, pois os dados já estão no payload do token.
            req.user = decoded;
            
            // 6. Chama o próximo middleware
            next();

        } catch (error) {
            // Este catch agora lida com tokens malformados, expirados pelo tempo ou de sessão inválida
            return res.status(401).json({ message: 'Não autorizado, token inválido ou sessão expirada.' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Não autorizado, nenhum token fornecido.' });
    }
};