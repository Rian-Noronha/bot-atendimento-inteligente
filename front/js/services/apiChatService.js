// js/services/apiChatService.js

const API_URL = 'http://localhost:3000/api';

/**
 * Função auxiliar para obter os cabeçalhos de autenticação.
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
        alert('A sua sessão expirou. Por favor, inicie sessão novamente.');
        window.location.href = '/index.html'; 
    }
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Ocorreu um erro: ${response.statusText}`);
}

export const apiChatService = {

    /**
     * Inicia uma nova sessão de chat. O backend identifica o utilizador pelo token.
     */
    async iniciarSessao() {
        const response = await fetch(`${API_URL}/chat/iniciar-sessao`, {
            method: 'POST',
            headers: getAuthHeaders()
        });
        if (!response.ok) await handleResponseError(response);
        return await response.json();
    },

    /**
     * Envia uma nova pergunta (consulta) para o backend.
     * O backend irá orquestrar a chamada para a IA, salvar a pergunta e a resposta,
     * e retornar a resposta final da IA.
     * @param {object} dadosConsulta - Contém pergunta, sessao_id e subcategoria_id.
     */
    async criarConsultaEObterResposta(dadosConsulta) {
        const response = await fetch(`${API_URL}/chat/consultas`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(dadosConsulta)
        });
        if (!response.ok) await handleResponseError(response);
        return await response.json();
    },

    /**
     * Envia o feedback do utilizador sobre uma resposta.
     * @param {object} dadosFeedback - Contém util (true/false) e resposta_id.
     */
    async criarFeedback(dadosFeedback) {
        const response = await fetch(`${API_URL}/feedbacks`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(dadosFeedback)
        });
        if (!response.ok) await handleResponseError(response);
        return await response.json();
    }
};
