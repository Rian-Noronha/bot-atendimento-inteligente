// 1. Importa a função de tratamento de erro do nosso módulo de utilitários
import { handleResponseError } from '../utils/apiUtils.js';

export const apiLoginService = {
    /**
     * Envia as credenciais para o backend para tentar fazer o login.
     * @param {string} email - O email do utilizador.
     * @param {string} senha - A senha do utilizador.
     * @returns {Promise<object>} - Uma promessa que resolve para os dados de sucesso (token e utilizador).
     */
    async login(email, senha) {
        // 2. A URL agora é um caminho relativo, que será interceptado pelo proxy do Vite.
        // O proxy irá redirecionar esta chamada para http://localhost:3000/api/auth/login
        const response = await fetch(`/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, senha })
        });

        // 3. Usa a função de tratamento de erro padronizada.
        if (!response.ok) {
            await handleResponseError(response);
        }

        return await response.json();
    }
};
