const API_URL = 'http://localhost:3000/api';

/**
 * Função auxiliar para criar os cabeçalhos de autenticação.
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
 */
async function handleResponseError(response) {
    if (response.status === 401) {
        alert('A sua sessão expirou ou é inválida. Por favor, faça login novamente.');
        localStorage.clear();
        window.location.href = '../index.html'; // Ajuste o caminho se necessário
        return; // Interrompe a execução
    }
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Ocorreu um erro na requisição.');
}


export const apiCategoriaService = {
    /**
     * Busca todas as categorias, agora enviando o token.
     */
    async pegarTodasCategorias() {
        const response = await fetch(`${API_URL}/categorias`, {
            method: 'GET',
            headers: getAuthHeaders()
        });
        if (!response.ok) {
            await handleResponseError(response);
        }
        return await response.json();
    },

    /**
     * Busca as subcategorias, agora enviando o token.
     * @param {number} id - O ID da categoria pai.
     */
    async pegarSubcategoriasPorCategoriaId(id) {
        const response = await fetch(`${API_URL}/subcategorias/por-categoria/${id}`, {
            method: 'GET',
            headers: getAuthHeaders()
        }); 
        if (!response.ok) {
            await handleResponseError(response);
        }
        return await response.json();
    }
};