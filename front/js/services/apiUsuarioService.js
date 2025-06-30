const API_URL = 'http://localhost:3000/api';

/**
 * Função auxiliar reutilizável para criar os cabeçalhos da requisição,
 * incluindo o token de autenticação JWT.
 * @returns {HeadersInit} Os cabeçalhos para a requisição fetch.
 */
function getAuthHeaders() {
    // Pega o token que foi guardado no localStorage durante o login
    const token = localStorage.getItem('authToken');
    const headers = {
        'Content-Type': 'application/json',
    };
    // Se o token existir, adiciona-o ao cabeçalho de Autorização no formato 'Bearer'
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
}

/**
 * Lida com erros de resposta da API de forma padronizada.
 * @param {Response} response - O objeto de resposta do fetch.
 */
async function handleResponseError(response) {
    // Se a resposta for 401, o token pode ter expirado ou ser inválido.
    if (response.status === 401) {
        // Remover os dados de autenticação inválidos
        localStorage.removeItem('authToken');
        localStorage.removeItem('loggedInUser');
        // Redirecionar para o login com uma mensagem
        alert('A sua sessão expirou. Por favor, inicie sessão novamente.');
        window.location.href = '/index.html'; 
    }
    
    // Tenta ler a mensagem de erro do corpo da resposta
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Ocorreu um erro: ${response.statusText}`);
}


export const apiUsuarioService = {
    /**
     * Cria um novo utilizador.
     */
    async criar(dados) {
        const response = await fetch(`${API_URL}/usuarios`, {
            method: 'POST',
            headers: getAuthHeaders(), // Mesmo que a rota seja pública, é boa prática enviar
            body: JSON.stringify(dados)
        });

        if (!response.ok) {
            await handleResponseError(response);
        }
        return await response.json();
    },

    /**
     * Busca todos os utilizadores. Rota protegida que requer autenticação.
     */
    async pegarTodos() {
        const response = await fetch(`${API_URL}/usuarios`, {
            method: 'GET',
            headers: getAuthHeaders() // Usa os cabeçalhos com o token
        });

        if (!response.ok) {
            await handleResponseError(response);
        }
        return await response.json();
    },

    /**
     * Atualiza um utilizador existente. Rota protegida.
     */
    async atualizar(id, dados) {
        const response = await fetch(`${API_URL}/usuarios/${id}`, {
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
     * Deleta um utilizador. Rota protegida.
     */
    async deletar(id) {
        const response = await fetch(`${API_URL}/usuarios/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        if (response.status !== 204 && !response.ok) {
            await handleResponseError(response);
        }
        // Retorna true para indicar sucesso, pois não há corpo para retornar
        return true;
    }
};
