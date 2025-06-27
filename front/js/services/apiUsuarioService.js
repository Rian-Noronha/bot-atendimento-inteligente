const API_URL = 'http://localhost:3000/api';

export const apiUsuarioService = {
    
    async criar(dados) {
        const response = await fetch(`${API_URL}/usuarios`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });

        // Verifique se a resposta foi bem-sucedida (status 201 Created é comum para POST)
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Erro desconhecido ao criar usuário.' }));
            throw new Error(errorData.message || 'Falha ao criar usuário.');
        }
        return await response.json();
    },

    async pegarTodos() {
        const response = await fetch(`${API_URL}/usuarios`);
        if (!response.ok) {
            throw new Error('Erro ao buscar usuários.');
        }
        return await response.json();
    },

    async atualizar(id, dados) {
        const response = await fetch(`${API_URL}/usuarios/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });
        if (!response.ok) {
            throw new Error('Falha ao atualizar usuário.');
        }
        return await response.json();
    },

    async deletar(id) {
        const response = await fetch(`${API_URL}/usuarios/${id}`, {
            method: 'DELETE'
        });
        if (response.status !== 204) {
             throw new Error('Falha ao excluir usuário.');
        }
        return true;
    }
};