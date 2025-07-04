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



export const apiPalavraChaveService = {
    /**
     * Envia um array de strings (palavras) para o backend.
     */
    async encontrarOuCriarLote(palavras) {
        const response = await fetch(`${API_URL}/palavras-chave/lote`, {
            method: 'POST',
            headers: getAuthHeaders(), 
            body: JSON.stringify({ palavras: palavras }) 
        });

        if (!response.ok) {
            await handleResponseError(response);
        }

        return await response.json();
    }

};
