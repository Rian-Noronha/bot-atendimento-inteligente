const API_URL = 'http://localhost:3000/api';

export const apiPerfilService = {

    /**
     * Busca todos os perfis do backend.
     * @returns {Promise<Array>} Uma promessa que resolve para um array de perfis.
     */
    async pegarTodos() {
        const response = await fetch(`${API_URL}/perfis`);
        if (!response.ok) {
            throw new Error('Erro ao buscar perfis da API.');
        }
        return await response.json();
    },

    /**
     * Busca um único perfil pelo seu ID.
     * @param {number} id - O ID do perfil a ser buscado.
     * @returns {Promise<object>} Uma promessa que resolve para o objeto do perfil.
     */
    async pegarPorId(id) {
        const response = await fetch(`${API_URL}/perfis/${id}`);
        if (!response.ok) {
            throw new Error('Erro ao buscar o perfil especificado.');
        }
        return await response.json();
    },

    /**
     * Cria um novo perfil.
     * @param {object} dadosPerfil - Um objeto com { nome, descricao }.
     * @returns {Promise<object>} Uma promessa que resolve para o novo perfil criado.
     */
    async criar(dadosPerfil) {
        const response = await fetch(`${API_URL}/perfis`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dadosPerfil)
        });
        if (!response.ok) {
            throw new Error('Falha ao criar o perfil.');
        }
        return await response.json();
    },

    /**
     * Atualiza um perfil existente.
     * @param {number} id - O ID do perfil a ser atualizado.
     * @param {object} novosDados - Um objeto com { nome, descricao }.
     * @returns {Promise<object>} Uma promessa que resolve para o perfil atualizado.
     */
    async atualizar(id, novosDados) {
        const response = await fetch(`${API_URL}/perfis/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(novosDados)
        });
        if (!response.ok) {
            throw new Error('Falha ao atualizar o perfil.');
        }
        return await response.json();
    },

    /**
     * Deleta um perfil.
     * @param {number} id - O ID do perfil a ser deletado.
     * @returns {Promise<boolean>} Retorna true se a operação for bem-sucedida.
     */
    async deletar(id) {
        const response = await fetch(`${API_URL}/perfis/${id}`, {
            method: 'DELETE'
        });
        // Uma resposta DELETE bem-sucedida retorna status 204 (No Content)
        if (response.status !== 204) {
            throw new Error('Falha ao deletar o perfil.');
        }
        return true;
    }
};
