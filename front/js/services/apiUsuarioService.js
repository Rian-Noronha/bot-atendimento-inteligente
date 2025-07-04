// 1. Importa as funções compartilhadas do nosso novo módulo de utilitários
import { getAuthHeaders, handleResponseError } from '../utils/apiUtils.js';

export const apiUsuarioService = {
    /**
     * Cria um novo usuário.
     */
    async criar(dados) {
        // 2. Usa um caminho relativo para o proxy do Vite funcionar
        const response = await fetch(`/api/usuarios`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(dados)
        });

        if (!response.ok) {
            await handleResponseError(response);
        }
        return await response.json();
    },

    /**
     * Busca todos os usuários.
     */
    async pegarTodos() {
        const response = await fetch(`/api/usuarios`, {
            method: 'GET',
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            await handleResponseError(response);
        }
        return await response.json();
    },

    /**
     * Atualiza um usuário existente.
     */
    async atualizar(id, dados) {
        const response = await fetch(`/api/usuarios/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(dados)
        });

        if (!response.ok) {
            await handleResponseError(response);
        }
        return await response.json();
    },

    /**
     * Deleta um usuário.
     */
    async deletar(id) {
        const response = await fetch(`/api/usuarios/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        if (response.status !== 204 && !response.ok) {
            await handleResponseError(response);
        }
        return true;
    }
};
