// js/services/apiLoginService.js

// A URL base da sua API
const API_URL = 'http://localhost:3000/api';

/**
 * Contém todas as funções relacionadas à autenticação.
 */
export const apiLoginService = {
    /**
     * Envia as credenciais para o backend para tentar fazer o login.
     * @param {string} email - O email do utilizador.
     * @param {string} senha - A senha do utilizador.
     * @returns {Promise<object>} - Uma promessa que resolve para os dados de sucesso (token e utilizador).
     * @throws {Error} - Lança um erro se o login falhar.
     */
    async login(email, senha) {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, senha }) // Envia os dados no formato que o backend espera
        });

        // Se a resposta não for 'ok' (ex: status 401, 403, 500), trata como um erro.
        if (!response.ok) {
            // Tenta ler a mensagem de erro do corpo da resposta da API
            const errorData = await response.json().catch(() => ({}));
            // Lança um erro com a mensagem do servidor ou uma mensagem padrão
            throw new Error(errorData.message || 'Falha na autenticação.');
        }

        // Se a resposta for 'ok' (status 200), retorna os dados (token e utilizador)
        return await response.json();
    }
};
