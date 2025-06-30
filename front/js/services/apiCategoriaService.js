const API_URL = 'http://localhost:3000/api';

export const apiCategoriaService = {
    async pegarTodasCategorias() {
        const response = await fetch(`${API_URL}/categorias`);
        if (!response.ok) {
            throw new Error('Falha ao buscar as categorias.');
        }
        return await response.json();
    },

    /**
     * Busca as subcategorias (Micro-temas) de uma categoria específica.
     * @param {number} id - O ID da categoria pai.
     */
    async pegarSubcategoriasPorCategoriaId(id) {
        const response = await fetch(`${API_URL}/subcategorias/por-categoria/${id}`); 
        if (!response.ok) {
            throw new Error('Falha ao buscar as subcategorias.');
        }
        return await response.json();
    }
};
