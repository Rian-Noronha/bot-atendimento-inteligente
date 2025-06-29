// js/services/apiPalavraChaveService.js

const API_URL = 'http://localhost:3000/api'; // Certifique-se que o URL base está correto

export const apiPalavraChaveService = {
    /**
     * Envia um array de strings (palavras) para o backend.
     * O backend irá encontrar as que já existem, criar as que são novas,
     * e retornar a lista completa de objetos com seus respectivos IDs.
     * @param {string[]} palavras - Um array de palavras, ex: ["fraude", "segurança", "cartão"].
     */
    async encontrarOuCriarLote(palavras) {
        const response = await fetch(`${API_URL}/palavras-chave/lote`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            // O corpo da requisição é um objeto JSON com uma chave "palavras" que contém o array.
            body: JSON.stringify({ palavras: palavras }) 
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Falha ao processar palavras-chave.');
        }

        return await response.json();
    }
};
