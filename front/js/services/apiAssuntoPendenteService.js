const API_URL = 'http://localhost:3000/api';

/**
 * Função auxiliar para obter os cabeçalhos de autenticação.
 */
function getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    const headers = { 'Content-Type': 'application/json' };
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
        alert('A sua sessão expirou. Por favor, inicie sessão novamente.');
        window.location.href = '/index.html'; 
    }
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Ocorreu um erro: ${response.statusText}`);
}

export const apiAssuntoPendenteService = {
    async pegarTodosPendentes() {
        const response = await fetch(`${API_URL}/assuntos-pendentes`, {
            method: 'GET',
            headers: getAuthHeaders()
        });
        if (!response.ok) await handleResponseError(response);
        return await response.json();
    },

    /**
     * Atualiza o status de um assunto pendente (ex: para 'aprovado' ou 'descartado').
     * @param {number} id - O ID do assunto a ser atualizado.
     * @param {string} status - O novo status ('aprovado' ou 'descartado').
     */
    async atualizarStatus(id, status) {
        const response = await fetch(`${API_URL}/assuntos-pendentes/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ status: status })
        });
        if (!response.ok) await handleResponseError(response);
        return await response.json();
    }
};
