// 1. Importa as funções compartilhadas do nosso novo módulo de utilitários
import { getAuthHeaders, handleResponseError } from '../utils/apiUtils.js';

export const apiChatService = {

    /**
     * Inicia uma nova sessão de chat.
     */
    async iniciarSessao() {
        // 2. A URL agora é um caminho relativo, que será interceptado pelo proxy do Vite
        const response = await fetch(`/api/chat/iniciar-sessao`, {
            method: 'POST',
            headers: getAuthHeaders()
        });
        if (!response.ok) await handleResponseError(response);
        return await response.json();
    },

    /**
     * Envia uma nova pergunta (consulta) para o backend.
     * @param {object} dadosConsulta - Contém pergunta, sessao_id e subcategoria_id.
     */
    async criarConsultaEObterResposta(dadosConsulta) {
        const response = await fetch(`/api/chat/consultas`, {
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
        const response = await fetch(`/api/feedbacks`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(dadosFeedback)
        });
        if (!response.ok) await handleResponseError(response);
        return await response.json();
    }
};
