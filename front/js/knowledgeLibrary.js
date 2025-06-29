// js/knowledgeLibrary.js

// Importa todos os serviços de API necessários
import { apiKnowledgeLibraryService } from './services/apiKnowledgeLibraryService.js';
import { apiPalavraChaveService } from './services/apiPalavraChaveService.js'; 

document.addEventListener('DOMContentLoaded', () => {
    // --- Seletores de Elementos da Página ---
    const hamburger = document.getElementById('hamburger');
    const aside = document.querySelector('aside');
    const searchInput = document.getElementById('knowledge-library-search-input-header');
    const knowledgeLibraryTableBody = document.querySelector('#knowledge-library-table tbody');
    const noKnowledgeLibrarysMessage = document.getElementById('no-knowledge-librarys-message');
    const addKnowledgeLibraryButton = document.getElementById('add-knowledge-library-button');

    // --- Seletores do Modal de Edição ---
    const editModal = document.getElementById('edit-document-modal');
    const editForm = document.getElementById('edit-document-form');
    const editDocumentId = document.getElementById('edit-document-id');
    const editDocumentTema = document.getElementById('edit-document-tema');
    const editDocumentMicrotema = document.getElementById('edit-document-microtema');
    const editDocumentTitle = document.getElementById('edit-document-title');
    const editDocumentDescription = document.getElementById('edit-document-description');
    const editDocumentSolution = document.getElementById('edit-document-solution');
    const editDocumentKeywords = document.getElementById('edit-document-keywords');
    const btnCancelDocument = editModal.querySelector('.btn-cancel');

    // Variável para guardar todos os documentos da API, evitando chamadas repetidas.
    let allDocuments = [];

    // --- LÓGICA DE SESSÃO E TIMEOUT (Mantida como está) ---
    // ... O seu código de sessão e timeout está correto e pode ser mantido aqui ...

    /**
     * Busca todos os documentos da API, guarda-os na variável `allDocuments`,
     * e depois chama a função para renderizar a tabela.
     */
    async function fetchAndRenderDocuments() {
        try {
            noKnowledgeLibrarysMessage.textContent = 'A carregar documentos...';
            noKnowledgeLibrarysMessage.style.display = 'block';
            knowledgeLibraryTableBody.style.display = 'none';

            const documentsFromAPI = await apiKnowledgeLibraryService.pegarTodos();
            allDocuments = documentsFromAPI;
            renderDocuments();
        } catch (error) {
            console.error('Falha ao carregar documentos:', error);
            noKnowledgeLibrarysMessage.textContent = 'Falha ao carregar dados do servidor. Tente novamente mais tarde.';
        }
    }

    /**
     * Renderiza a tabela de documentos com base nos dados guardados em `allDocuments`
     * e no termo de pesquisa atual.
     */
    function renderDocuments() {
        knowledgeLibraryTableBody.innerHTML = '';
        const searchTerm = searchInput.value.toLowerCase().trim();

        // Filtra os documentos com base no termo de pesquisa
        const filteredDocuments = allDocuments.filter(doc => {
            // Cria uma string com todas as palavras-chave para facilitar a pesquisa
            const palavrasChaveString = doc.palavrasChave.map(p => p.palavra).join(' ');

            // Verifica se o termo de pesquisa existe em qualquer um dos campos relevantes
            return (
                doc.subcategoria?.categoria?.nome.toLowerCase().includes(searchTerm) ||
                doc.subcategoria?.nome.toLowerCase().includes(searchTerm) ||
                doc.titulo.toLowerCase().includes(searchTerm) ||
                (doc.descricao && doc.descricao.toLowerCase().includes(searchTerm)) ||
                doc.solucao.toLowerCase().includes(searchTerm) ||
                palavrasChaveString.toLowerCase().includes(searchTerm)
            );
        });

        if (filteredDocuments.length === 0) {
            noKnowledgeLibrarysMessage.textContent = 'Nenhum documento encontrado.';
            noKnowledgeLibrarysMessage.style.display = 'block';
            knowledgeLibraryTableBody.style.display = 'none';
        } else {
            noKnowledgeLibrarysMessage.style.display = 'none';
            knowledgeLibraryTableBody.style.display = 'table-row-group';
            
            filteredDocuments.forEach(doc => {
                const row = knowledgeLibraryTableBody.insertRow();
                row.dataset.documentId = doc.id;

                const keywordsDisplay = doc.palavrasChave.map(p => p.palavra).join(', ');

                // Insere os dados nas células, acedendo aos objetos aninhados com segurança
                row.innerHTML = `
                    <td data-label="Tema">${doc.subcategoria?.categoria?.nome || '<span class="text-danger">Sem Tema</span>'}</td>
                    <td data-label="Micro-tema">${doc.subcategoria?.nome || '<span class="text-danger">Sem Micro-tema</span>'}</td>
                    <td data-label="Título">${doc.titulo}</td>
                    <td data-label="Descrição">${doc.descricao || ''}</td>
                    <td data-label="Solução">${doc.solucao}</td>
                    <td data-label="Palavras-chave">${keywordsDisplay}</td>
                    <td data-label="Ações" class="user-actions">
                        <button class="btn-edit" data-id="${doc.id}" title="Editar documento"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000"><path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z"/></svg></button>
                        <button class="btn-delete" data-id="${doc.id}" title="Excluir documento"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000"><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/></svg></button>
                    </td>
                `;
            });
        }
    }

    /**
     * Abre o modal de edição e preenche os campos com os dados do documento selecionado.
     * @param {number} docId - O ID do documento a ser editado.
     */
    async function openEditModal(docId) {
        const doc = allDocuments.find(d => d.id === docId);
        if (!doc) {
            alert("Documento não encontrado. Tente recarregar a página.");
            return;
        }

        editDocumentId.value = doc.id;
        // Campos de categoria são apenas para leitura para simplificar a UI de edição
        editDocumentTema.value = doc.subcategoria?.categoria?.nome || 'N/A';
        editDocumentTema.readOnly = true; 
        editDocumentMicrotema.value = doc.subcategoria?.nome || 'N/A';
        editDocumentMicrotema.readOnly = true;

        editDocumentTitle.value = doc.titulo;
        editDocumentDescription.value = doc.descricao || '';
        editDocumentSolution.value = doc.solucao || '';
        editDocumentKeywords.value = doc.palavrasChave.map(p => p.palavra).join(', ');

        editModal.style.display = 'flex';
        editModal.classList.add('active');
    }

    function closeEditModal() {
        editModal.classList.remove('active');
        editForm.reset();
        editDocumentTema.readOnly = false;
        editDocumentMicrotema.readOnly = false;
    }

    // --- Listeners de Eventos ---

    // Delega os eventos de clique na tabela para os botões de editar e excluir
    knowledgeLibraryTableBody.addEventListener('click', (event) => {
        const targetButton = event.target.closest('button');
        if (!targetButton) return;
        const docId = parseInt(targetButton.dataset.id);

        if (targetButton.classList.contains('btn-edit')) {
            openEditModal(docId);
        } else if (targetButton.classList.contains('btn-delete')) {
            const docToDelete = allDocuments.find(d => d.id === docId);
            if (confirm(`Tem a certeza que deseja excluir o documento "${docToDelete.titulo}"?`)) {
                handleDeleteDocument(docId);
            }
        }
    });

    /**
     * Lida com a exclusão de um documento.
     * @param {number} docId - O ID do documento a ser excluído.
     */
    async function handleDeleteDocument(docId) {
        try {
            await apiKnowledgeLibraryService.deletar(docId);
            alert('Documento excluído com sucesso!');
            fetchAndRenderDocuments(); // Atualiza a lista após a exclusão
        } catch (error) {
            alert(`Erro ao excluir documento: ${error.message}`);
            console.error("Erro ao excluir documento:", error);
        }
    }

    // Lida com a submissão do formulário de edição
    editForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const docId = parseInt(editDocumentId.value);
        
        try {
            // Processa as palavras-chave da mesma forma que na criação
            const keywordsString = editDocumentKeywords.value.trim();
            let palavrasChaveIds = [];
            if (keywordsString) {
                const palavrasArray = keywordsString.split(',').map(p => p.trim()).filter(Boolean);
                if(palavrasArray.length > 0) {
                    const palavrasChaveSalvas = await apiPalavraChaveService.encontrarOuCriarLote(palavrasArray);
                    palavrasChaveIds = palavrasChaveSalvas.map(p => p.id);
                }
            }

            const updatedData = {
                titulo: editDocumentTitle.value.trim(),
                descricao: editDocumentDescription.value.trim(),
                solucao: editDocumentSolution.value.trim(),
                palavrasChaveIds: palavrasChaveIds, // Envia o array de IDs para serem atualizados
            };

            await apiKnowledgeLibraryService.atualizar(docId, updatedData);
            alert('Documento atualizado com sucesso!');
            closeEditModal();
            fetchAndRenderDocuments(); // Atualiza a tabela com os novos dados

        } catch (error) {
            alert(`Erro ao atualizar o documento: ${error.message}`);
            console.error("Erro ao atualizar documento:", error);
        }
    });

    // Outros listeners
    addKnowledgeLibraryButton.addEventListener('click', () => window.location.href = './upload.html');
    btnCancelDocument.addEventListener('click', closeEditModal);
    searchInput.addEventListener('input', renderDocuments);

    // --- Chamada Inicial ---
    fetchAndRenderDocuments();
});
