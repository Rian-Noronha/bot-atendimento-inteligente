const API_URL = 'http://localhost:3000/api';

/**
 * Função auxiliar para obter os cabeçalhos, incluindo o token JWT.
 * Ela pega o token do localStorage e o adiciona ao cabeçalho 'Authorization'.
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
 * Lida com erros de resposta da API de forma padronizada.
 * Se o erro for 401 (Não Autorizado), desloga o usuário.
 */
async function handleResponseError(response) {
    if (response.status === 401) {
        alert('Sua sessão expirou ou é inválida. Por favor, faça login novamente.');
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = '../index.html'; // Ajuste o caminho para sua página de login
        throw new Error('Não autorizado.'); // Interrompe a execução
    }
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Ocorreu um erro na requisição.');
}


export const apiKnowledgeLibraryService = {
    /**
     * Busca todos os documentos, agora enviando o token.
     */
    async pegarTodos() {
        const response = await fetch(`${API_URL}/documentos`, {
            method: 'GET',
            headers: getAuthHeaders() 
        });
        if (!response.ok) await handleResponseError(response);
        return await response.json();
    },

    /**
     * Busca um documento por ID, agora enviando o token.
     */
    async pegarPorId(id) {
        const response = await fetch(`${API_URL}/documentos/${id}`, {
            method: 'GET',
            headers: getAuthHeaders() 
        });
        if (!response.ok) await handleResponseError(response);
        return await response.json();
    },

    /**
     * Cria um novo documento, agora enviando o token.
     */
    async criar(dados) {
        const response = await fetch(`${API_URL}/documentos`, {
            method: 'POST',
            headers: getAuthHeaders(), 
            body: JSON.stringify(dados)
        });
        if (!response.ok) await handleResponseError(response);
        return await response.json();
    },

    /**
     * Atualiza um documento, agora enviando o token.
     */
    async atualizar(id, dados) {
        const response = await fetch(`${API_URL}/documentos/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(), 
            body: JSON.stringify(dados)
        });
        if (!response.ok) await handleResponseError(response);
        return await response.json();
    },

    /**
     * Deleta um documento, agora enviando o token.
     */
    async deletar(id) {
        const response = await fetch(`${API_URL}/documentos/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders() 
        });
        // DELETE geralmente retorna 204 (No Content), que não tem corpo JSON
        if (response.status !== 204 && !response.ok) {
            await handleResponseError(response);
        }
        return true; // Retorna sucesso
    }
};
