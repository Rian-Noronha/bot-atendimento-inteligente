import { apiKnowledgeLibraryService } from './services/apiKnowledgeLibraryService.js';
import { apiPalavraChaveService } from './services/apiPalavraChaveService.js';
import { apiAuthService } from './services/apiAuthService.js';

// 2. Importa o nosso novo gerenciador de sessão centralizado
import { startSessionManagement } from './utils/sessionManager.js';

document.addEventListener('DOMContentLoaded', () => {
    // 3. Inicia toda a lógica de segurança (timeout, abas, etc.) com uma única chamada
    startSessionManagement();

    // --- SELEÇÃO DE ELEMENTOS ESPECÍFICOS DA PÁGINA ---
    const hamburger = document.getElementById('hamburger');
    const aside = document.querySelector('aside');
    const searchInput = document.getElementById('knowledge-library-search-input-header');
    const numDocumentsDisplayInput = document.getElementById('num-documents-display');
    const knowledgeLibraryTableBody = document.querySelector('#knowledge-library-table tbody');
    const noKnowledgeLibrarysMessage = document.getElementById('no-knowledge-librarys-message');
    const addKnowledgeLibraryButton = document.getElementById('add-knowledge-library-button');
    const logoutButton = document.getElementById('logout-btn');

    // Seletores do Modal de Edição
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

    // Variável para guardar todos os documentos da API
    let allDocuments = [];

    // Lógica do Hamburger Menu
    if (hamburger && aside) {
        hamburger.addEventListener('click', () => aside.classList.toggle('open'));
        document.addEventListener('click', (event) => {
            if (aside.classList.contains('open') && !aside.contains(event.target) && !hamburger.contains(event.target)) {
                aside.classList.remove('open');
            }
        });
    }

    // Lógica do botão de logout
    if (logoutButton) {
        logoutButton.addEventListener('click', async (event) => {
            event.preventDefault();
            try {
                await apiAuthService.logout();
            } catch (error) {
                console.error('Erro ao encerrar sessão no servidor:', error);
            } finally {
                localStorage.clear();
                sessionStorage.clear();
                window.location.href = '../index.html';
            }
        });
    }

    /**
     * Busca e renderiza os documentos.
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
     * Renderiza a tabela com base nos dados filtrados.
     */
    function renderDocuments() {
        knowledgeLibraryTableBody.innerHTML = '';
        
        // filtrar por texto
        const searchTerm = searchInput.value.toLowerCase().trim();
        let filteredDocuments = allDocuments.filter(doc => {
            const palavrasChaveString = doc.palavrasChave.map(p => p.palavra).join(' ');
            return (
                doc.subcategoria?.categoria?.nome.toLowerCase().includes(searchTerm) ||
                doc.subcategoria?.nome.toLowerCase().includes(searchTerm) ||
                doc.titulo.toLowerCase().includes(searchTerm) ||
                (doc.descricao && doc.descricao.toLowerCase().includes(searchTerm)) ||
                (doc.solucao && doc.solucao.toLowerCase().includes(searchTerm)) ||
                palavrasChaveString.toLowerCase().includes(searchTerm)
            );
        });

        // filtrar de quantidade de itens a serem exibidos
        const numToDisplay = parseInt(numDocumentsDisplayInput.value);
        if (!isNaN(numToDisplay) && numToDisplay > 0) {
            filteredDocuments = filteredDocuments.slice(0, numToDisplay);
        }

        if (filteredDocuments.length === 0) {
            const message = searchTerm ? 'Nenhum documento encontrado para sua busca.' : 'Nenhum documento cadastrado.';
            noKnowledgeLibrarysMessage.textContent = message;
            noKnowledgeLibrarysMessage.style.display = 'block';
            knowledgeLibraryTableBody.style.display = 'none';
        } else {
            noKnowledgeLibrarysMessage.style.display = 'none';
            knowledgeLibraryTableBody.style.display = 'table-row-group';
            
            filteredDocuments.forEach(doc => {
                const row = knowledgeLibraryTableBody.insertRow();
                const keywordsDisplay = doc.palavrasChave.map(p => p.palavra).join(', ');

                row.innerHTML = `
                    <td data-label="Tema">${doc.subcategoria?.categoria?.nome || '<span class="text-danger">Sem Tema</span>'}</td>
                    <td data-label="Micro-tema">${doc.subcategoria?.nome || '<span class="text-danger">Sem Micro-tema</span>'}</td>
                    <td data-label="Título">${doc.titulo}</td>
                    <td data-label="Descrição">${doc.descricao || ''}</td>
                    <td data-label="Solução">${doc.solucao || `<a href="${doc.urlArquivo}" target="_blank">Ver Anexo</a>`}</td>
                    <td data-label="Palavras-chave">${keywordsDisplay}</td>
                    <td data-label="Ações" class="user-actions">
                        <button class="btn-edit" data-id="${doc.id}" title="Editar documento"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000"><path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z"/></svg></button>
                        <button class="btn-delete" data-id="${doc.id}" title="Excluir documento"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000"><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/></svg></button>
                    </td>
                `;
            });
        }
    }

    
    function openEditModal(docId) {
        const doc = allDocuments.find(d => d.id === docId);
        if (!doc) return;

        editDocumentId.value = doc.id;
        editDocumentTema.value = doc.subcategoria?.categoria?.nome || 'N/A';
        editDocumentMicrotema.value = doc.subcategoria?.nome || 'N/A';
        editDocumentTitle.value = doc.titulo;
        editDocumentDescription.value = doc.descricao || '';
        editDocumentSolution.value = doc.solucao || (doc.urlArquivo ? `Arquivo: ${doc.urlArquivo}` : '');
        editDocumentSolution.readOnly = !!doc.urlArquivo;
        editDocumentKeywords.value = doc.palavrasChave.map(p => p.palavra).join(', ');

        editModal.style.display = 'flex';
        setTimeout(() => editModal.classList.add('active'), 10);
    }
    
    function closeEditModal() {
        editModal.classList.remove('active');
        setTimeout(() => {
            editModal.style.display = 'none';
        }, 300);
    }
    
    async function handleDeleteDocument(docId) {
        if (!confirm('Tem certeza de que deseja excluir este documento? Esta ação não pode ser desfeita.')) {
            return;
        }
        try {
            await apiKnowledgeLibraryService.deletar(docId);
            alert('Documento excluído com sucesso!');
            allDocuments = allDocuments.filter(d => d.id !== docId);
            renderDocuments();
        } catch (error) {
            alert(`Erro ao excluir o documento: ${error.message}`);
        }
    }
    
    editForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const docId = parseInt(editDocumentId.value);
        try {
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
                solucao: editDocumentSolution.readOnly ? undefined : editDocumentSolution.value.trim(),
                palavrasChaveIds: palavrasChaveIds,
            };
            await apiKnowledgeLibraryService.atualizar(docId, updatedData);
            alert('Documento atualizado com sucesso!');
            closeEditModal();
            fetchAndRenderDocuments();
        } catch (error) {
            alert(`Erro ao atualizar o documento: ${error.message}`);
        }
    });

    // --- Listeners de Eventos ---
    knowledgeLibraryTableBody.addEventListener('click', (event) => {
        const editButton = event.target.closest('.btn-edit');
        const deleteButton = event.target.closest('.btn-delete');

        if (editButton) {
            const docId = parseInt(editButton.dataset.id, 10);
            openEditModal(docId);
            return;
        }

        if (deleteButton) {
            const docId = parseInt(deleteButton.dataset.id, 10);
            handleDeleteDocument(docId);
            return;
        }
    });

    addKnowledgeLibraryButton.addEventListener('click', () => window.location.href = './upload.html');
    btnCancelDocument.addEventListener('click', closeEditModal);
    searchInput.addEventListener('input', renderDocuments);
    //listener para o input de quantidade
    if (numDocumentsDisplayInput) {
        numDocumentsDisplayInput.addEventListener('input', renderDocuments);
    }
    editModal.addEventListener('click', (event) => { if (event.target === editModal) closeEditModal(); });
    window.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeEditModal(); });

    // --- Chamada Inicial ---
    fetchAndRenderDocuments();
});