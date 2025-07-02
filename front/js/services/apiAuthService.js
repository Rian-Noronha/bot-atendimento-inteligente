const API_URL = 'http://localhost:3000/api/auth';

/**
 * Função auxiliar para criar os cabeçalhos de autenticação com o token.
 */
function getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    const headers = {
        'Content-Type': 'application/json',
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
}

/**
 * Lida com erros da API, incluindo o logout automático em caso de erro 401.
 */
async function handleResponseError(response) {
    if (response.status === 401) {
        alert('Sua sessão expirou ou é inválida. Por favor, faça login novamente.');
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = '../index.html'; // ou o caminho correto para seu login
        throw new Error('Não autorizado.'); // Interrompe a execução
    }
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Ocorreu um erro no servidor.');
}

export const apiAuthService = {
    /**
     * Realiza o login do usuário.
     * @param {string} email 
     * @param {string} senha 
     */
    async login(email, senha) {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha })
        });
        if (!response.ok) await handleResponseError(response);
        return await response.json();
    },

    /**
     * Busca os dados do usuário logado.
     */
    async getMe() {
        const response = await fetch(`${API_URL}/me`, {
            method: 'GET',
            headers: getAuthHeaders() // Requer autenticação
        });
        if (!response.ok) await handleResponseError(response);
        return await response.json();
    },

    /**
     * Inicia o processo de recuperação de senha.
     * @param {string} email 
     */
    async esqueciSenha(email) {
        const response = await fetch(`${API_URL}/esqueci-senha`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        if (!response.ok) await handleResponseError(response);
        return await response.json();
    },

    /**
     * Finaliza a redefinição de senha com o token.
     * @param {string} token 
     * @param {string} senha 
     */
    async redefinirSenha(token, senha) {
        const response = await fetch(`${API_URL}/redefinir-senha`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, senha })
        });
        if (!response.ok) await handleResponseError(response);
        return await response.json();
    },

    /**
     * Invalida a sessão do usuário no servidor.
     */
    async logout() {
        const response = await fetch(`${API_URL}/logout`, {
            method: 'POST',
            headers: getAuthHeaders() // Envia o token para ser invalidado
        });
        if (!response.ok) {
            console.error("A chamada de logout no servidor falhou, mas o cliente será deslogado.");
        }
        return response.json();
    },

    /**
     * Envia a senha atual e a nova senha para o backend para atualização.
     * @param {string} senhaAtual 
     * @param {string} novaSenha 
     */
    async updatePassword(senhaAtual, novaSenha) {
        const response = await fetch(`${API_URL}/update-password`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ senhaAtual, novaSenha })
        });
        if (!response.ok) {
            await handleResponseError(response);
        }
        return await response.json();
    }
};