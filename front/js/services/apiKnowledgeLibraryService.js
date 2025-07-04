// 1. Importa as funções compartilhadas do nosso módulo de utilitários
import { getAuthHeaders, handleResponseError } from '../utils/apiUtils.js';

// Padronizando o nome para apiDocumentoService para maior clareza
export const apiDocumentoService = {
    /**
     * Busca todos os documentos, agora usando um caminho relativo e cabeçalhos centralizados.
     */
    async pegarTodos() {
        const response = await fetch(`/api/documentos`, {
            method: 'GET',
            headers: getAuthHeaders()
        });
        if (!response.ok) await handleResponseError(response);
        return await response.json();
    },

    /**
     * Busca um documento por ID.
     */
    async pegarPorId(id) {
        const response = await fetch(`/api/documentos/${id}`, {
            method: 'GET',
            headers: getAuthHeaders()
        });
        if (!response.ok) await handleResponseError(response);
        return await response.json();
    },

    /**
     * Cria um novo documento.
     */
    async criar(dados) {
        const response = await fetch(`/api/documentos`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(dados)
        });
        if (!response.ok) await handleResponseError(response);
        return await response.json();
    },

    /**
     * Atualiza um documento existente.
     */
    async atualizar(id, dados) {
        const response = await fetch(`/api/documentos/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(dados)
        });
        if (!response.ok) await handleResponseError(response);
        return await response.json();
    },

    /**
     * Deleta um documento.
     */
    async deletar(id) {
        const response = await fetch(`/api/documentos/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        if (response.status !== 204 && !response.ok) {
            await handleResponseError(response);
        }
        return true;
    },

    /**
     * Envia a URL de um arquivo para o backend iniciar o processamento automático.
     */
    async iniciarProcessamento(dados) {
        const response = await fetch(`/api/documentos/iniciar-processamento`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(dados)
        });
        if (!response.ok) await handleResponseError(response);
        return await response.json();
    }
};
