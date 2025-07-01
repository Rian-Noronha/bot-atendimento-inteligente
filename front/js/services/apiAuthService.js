const API_URL = 'http://localhost:3000/api/auth';

/**
 * Lida com erros da API, extraindo a mensagem do backend.
 * @param {Response} response - A resposta do fetch.
 */
async function handleResponseError(response) {
    const errorData = await response.json().catch(() => ({})); // Tenta ler o JSON, se falhar, retorna objeto vazio
    throw new Error(errorData.message || `Ocorreu um erro no servidor.`);
}

export const apiAuthService = {
    /**
     * Chama o endpoint para solicitar a recuperação de senha.
     * @param {string} email 
     */
    async esqueciSenha(email) {
        const response = await fetch(`${API_URL}/esqueci-senha`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: email })
        });
        if (!response.ok) {
            await handleResponseError(response);
        }
        return await response.json();
    },

    /**
     * Chama o endpoint para redefinir a senha com o token.
     * @param {string} token 
     * @param {string} senha 
     */
    async redefinirSenha(token, senha) {
        const response = await fetch(`${API_URL}/redefinir-senha`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token, senha })
        });
        if (!response.ok) {
            await handleResponseError(response);
        }
        return await response.json();
    }
};