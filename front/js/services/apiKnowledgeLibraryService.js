const API_URL = 'http://localhost:3000/api';

export const apiKnowledgeLibraryService = {
    async pegarTodos() {
        const response = await fetch(`${API_URL}/documentos`); // Supondo endpoint /api/documentos
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Erro desconhecido ao buscar documentos.' }));
            throw new Error(errorData.message || 'Falha ao buscar documentos.');
        }
        return await response.json();
    },

    async pegarPorId(id) {
        const response = await fetch(`${API_URL}/documentos/${id}`);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Erro desconhecido ao buscar documento.' }));
            throw new Error(errorData.message || 'Falha ao buscar documento.');
        }
        return await response.json();
    },

    async criar(dados) {
        const response = await fetch(`${API_URL}/documentos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Erro desconhecido ao criar documento.' }));
            throw new Error(errorData.message || 'Falha ao criar documento.');
        }
        return await response.json();
    },

    async atualizar(id, dados) {
        const response = await fetch(`${API_URL}/documentos/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Erro desconhecido ao atualizar documento.' }));
            throw new Error(errorData.message || 'Falha ao atualizar documento.');
        }
        return await response.json();
    },

    async deletar(id) {
        const response = await fetch(`${API_URL}/documentos/${id}`, {
            method: 'DELETE'
        });
        if (response.status !== 204) { 
            const errorData = await response.json().catch(() => ({ message: 'Erro desconhecido ao excluir documento.' }));
            throw new Error(errorData.message || 'Falha ao excluir documento.');
        }
        return true;
    }
};