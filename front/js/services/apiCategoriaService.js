// 1. Importa as funções compartilhadas do nosso novo módulo de utilitários
import { getAuthHeaders, handleResponseError } from '../utils/apiUtils.js';

export const apiCategoriaService = {
    /**
     * Busca todas as categorias, agora usando um caminho relativo e cabeçalhos centralizados.
     */
    async pegarTodasCategorias() {
        // 2. A URL agora é um caminho relativo, que será interceptado pelo proxy do Vite
        const response = await fetch(`/api/categorias`, {
            method: 'GET',
            headers: getAuthHeaders()
        });
        if (!response.ok) {
            await handleResponseError(response);
        }
        return await response.json();
    },

    /**
     * Busca as subcategorias de uma categoria específica.
     * @param {number} id - O ID da categoria pai.
     */
    async pegarSubcategoriasPorCategoriaId(id) {
        const response = await fetch(`/api/subcategorias/por-categoria/${id}`, {
            method: 'GET',
            headers: getAuthHeaders()
        }); 
        if (!response.ok) {
            await handleResponseError(response);
        }
        return await response.json();
    }
};
