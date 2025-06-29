// Importa os models e as bibliotecas necessárias
const { Usuario, Perfil } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

/**
 * @description Realiza o login do utilizador, validando as suas credenciais.
 * Se as credenciais forem válidas, retorna um token JWT.
 */
exports.login = async (req, res) => {
    try {
        const { email, senha } = req.body;

        // 1. Verifica se o email e a senha foram fornecidos
        if (!email || !senha) {
            return res.status(400).json({ message: "Email e senha são obrigatórios." });
        }

        // 2. Procura o utilizador na base de dados pelo seu email
        // Incluímos o 'perfil' para adicioná-lo às informações do token
        const usuario = await Usuario.findOne({
            where: { email },
            include: [{ model: Perfil, as: 'perfil' }]
        });

        // 3. Se o utilizador não for encontrado, retorna um erro de credenciais inválidas
        if (!usuario) {
            return res.status(401).json({ message: "Credenciais inválidas." }); // Mensagem genérica por segurança
        }
        
        // 4. Se o utilizador estiver inativo, nega o acesso
        if (!usuario.ativo) {
            return res.status(403).json({ message: "Este utilizador está inativo." });
        }

        // 5. Compara a senha fornecida com o hash guardado na base de dados
        const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);
        if (!senhaValida) {
            return res.status(401).json({ message: "Credenciais inválidas." }); // Mesma mensagem genérica
        }

        // 6. Se a senha for válida, gera um token JWT
        // O "payload" do token contém informações úteis e não sensíveis sobre o utilizador
        const payload = {
            id: usuario.id,
            nome: usuario.nome,
            email: usuario.email,
            perfil: {
                id: usuario.perfil.id,
                nome: usuario.perfil.nome
            }
        };

        // O token é assinado com uma chave secreta que deve estar nas suas variáveis de ambiente
        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET, // Chave secreta
            { expiresIn: '8h' } // Define um tempo de expiração para o token (ex: 8 horas)
        );
        
        // 7. Retorna o token e os dados do utilizador para o frontend
        res.status(200).json({
            token,
            usuario: payload // Envia os dados do utilizador para facilitar o trabalho do frontend
        });

    } catch (error) {
        res.status(500).json({ message: "Erro interno no servidor durante o login.", error: error.message });
    }
};
