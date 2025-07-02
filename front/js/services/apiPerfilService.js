const API_URL = 'http://localhost:3000/api';

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

async function handleResponseError(response) {
    if (response.status === 401) {
        alert('Sua sessão expirou ou é inválida. Por favor, faça login novamente.');
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = '../index.html';
        throw new Error('Não autorizado.');
    }
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Ocorreu um erro na requisição.');
}

// --- Serviço de API ---

export const apiPerfilService = {
    async pegarTodos() {
        const response = await fetch(`${API_URL}/perfis`, {
            headers: getAuthHeaders() 
        });
        if (!response.ok) await handleResponseError(response);
        return await response.json();
    },

    async pegarPorId(id) {
        const response = await fetch(`${API_URL}/perfis/${id}`, {
            headers: getAuthHeaders() 
        });
        if (!response.ok) await handleResponseError(response);
        return await response.json();
    },

    async criar(dadosPerfil) {
        const response = await fetch(`${API_URL}/perfis`, {
            method: 'POST',
            headers: getAuthHeaders(), 
            body: JSON.stringify(dadosPerfil)
        });
        if (!response.ok) await handleResponseError(response);
        return await response.json();
    },

    async atualizar(id, novosDados) {
        const response = await fetch(`${API_URL}/perfis/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(), 
            body: JSON.stringify(novosDados)
        });
        if (!response.ok) await handleResponseError(response);
        return await response.json();
    },

    async deletar(id) {
        const response = await fetch(`${API_URL}/perfis/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders() 
        });
        if (response.status !== 204 && !response.ok) {
            await handleResponseError(response);
        }
        return true;
    }
};
