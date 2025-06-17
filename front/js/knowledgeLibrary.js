document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.getElementById('hamburger');
    const aside = document.querySelector('aside');

    const knowledgeLibrarySearchInputHeader = document.getElementById('knowledge-library-search-input-header');
    const knowledgeLibrarySearchInput = document.getElementById('knowledge-library-search-input'); 
    const numDocumentsDisplayInput = document.getElementById('num-documents-display'); 
    const knowledgeLibraryTableBody = document.querySelector('#knowledge-library-table tbody');
    const noKnowledgeLibrarysMessage = document.getElementById('no-knowledge-librarys-message');
    const addKnowledgeLibraryButton = document.getElementById('add-knowledge-library-button');

    // --- Seletores do Modal ---
    const editDocumentModal = document.getElementById('edit-document-modal');
    const editDocumentForm = document.getElementById('edit-document-form');
    const editDocumentId = document.getElementById('edit-document-id');
    // Adicionados campos de tema e micro-tema
    const editDocumentTema = document.getElementById('edit-document-tema');
    const editDocumentMicrotema = document.getElementById('edit-document-microtema');
    const editDocumentTitle = document.getElementById('edit-document-title');
    const editDocumentDescription = document.getElementById('edit-document-description');
    const editDocumentSolution = document.getElementById('edit-document-solution');
    const editDocumentKeywords = document.getElementById('edit-document-keywords');
    const btnSaveDocument = editDocumentModal.querySelector('.btn-save'); 
    const btnCancelDocument = editDocumentModal.querySelector('.btn-cancel');

    // --- LÓGICA DE TIMEOUT DE SESSÃO (5 MINUTOS) ---
    const TIMEOUT_DURATION = 5 * 60 * 1000; 
    let timeoutInterval; 

    function resetTimeoutTimer() {
        localStorage.setItem('last_activity_time', Date.now());
    }

    function logoutUser() {
        clearInterval(timeoutInterval);
        localStorage.removeItem('active_session_id');
        localStorage.removeItem('last_activity_time');
        localStorage.removeItem('loggedInUser');
        alert('Sua sessão expirou por inatividade. Por favor, faça login novamente.');
        window.location.href = '../index.html';
    }

    function checkTimeout() {
        const lastActivityTime = parseInt(localStorage.getItem('last_activity_time') || '0', 10);
        const now = Date.now();
        if (now - lastActivityTime > TIMEOUT_DURATION) {
            console.log('Sessão expirada! Desconectando...');
            logoutUser();
        }
    }

    function startTimeoutMonitoring() {
        const activityEvents = ['mousemove', 'mousedown', 'keypress', 'scroll', 'touchstart'];
        activityEvents.forEach(event => {
            window.addEventListener(event, resetTimeoutTimer);
        });
        timeoutInterval = setInterval(checkTimeout, 5000);
    }

    startTimeoutMonitoring();

    const currentSessionId = localStorage.getItem('active_session_id');
    if (!sessionStorage.getItem('my_tab_session_id')) {
        sessionStorage.setItem('my_tab_session_id', currentSessionId);
    } else if (sessionStorage.getItem('my_tab_session_id') !== currentSessionId) {
        alert('Sua sessão foi encerrada em outra aba. Você será desconectado.');
        window.location.href = '../index.html';
    }

    window.addEventListener('storage', (event) => {
        if (event.key === 'active_session_id') {
            if (event.newValue !== sessionStorage.getItem('my_tab_session_id')) {
                alert('Sua sessão foi encerrada porque você se conectou em uma nova aba ou janela.');
                window.location.href = '../index.html';
            }
        }
    });


    // --- DADOS MOCK ATUALIZADOS ---
        let mockDocuments = [
        { 
            id: 1, 
            tema: 'Cartão de Crédito', 
            microtema: 'Bloqueio', 
            title: 'Bloqueio por Renegociação', 
            description: 'O bloqueio ocorre quando o cliente possui uma renegociação de dívida (RN) vigente e ativa no sistema.', 
            solutionText: 'Após a quitação completa do acordo, o cliente deve se dirigir a uma loja física para solicitar uma nova reavaliação de crédito.', 
            keywords: 'renegociação, rn, acordo, dívida, quitação, parcelamento',
            fileName: '' 
        },
        { 
            id: 2, 
            tema: 'Cartão de Crédito', 
            microtema: 'Bloqueio', 
            title: 'Bloqueio por Suspensão de Crédito', 
            description: 'O crédito do cliente é suspenso por apresentar atrasos nos pagamentos da fatura ou por um longo período de inatividade.', 
            solutionText: 'O desbloqueio é realizado de forma automática pelo sistema após a regularização. O cliente deve aguardar.', 
            keywords: 'suspensão, atraso, inativo, falta de uso, automático',
            fileName: ''
        },
        { 
            id: 3, 
            tema: 'Cartão de Crédito', 
            microtema: 'Bloqueio', 
            title: 'Bloqueio por Restrição (SPC/Serasa)', 
            description: 'O bloqueio é efetuado quando o CPF do cliente apresenta restrições nos órgãos de proteção ao crédito.', 
            solutionText: 'O desbloqueio só é possível após a regularização do CPF. Depois, é necessária uma atualização cadastral em loja física.', 
            keywords: 'spc, serasa, cpf, restrito, nome sujo',
            fileName: ''
        },
        { 
            id: 4, 
            tema: 'Cartão de Crédito', 
            microtema: 'Bloqueio', 
            title: 'Bloqueio para Reavaliação Cadastral', 
            description: 'Ocorre quando o sistema identifica um cadastro com informações pendentes de atualização.', 
            solutionText: 'O cliente deve comparecer a uma loja física para reavaliação, portando documento com foto, comprovante de renda e residência.', 
            keywords: 'reavaliação, cadastro, atualização, documentos',
            fileName: ''
        },
        { 
            id: 5, 
            tema: 'Cartão de Crédito', 
            microtema: 'Bloqueio', 
            title: 'Bloqueio por Política Interna', 
            description: 'O cartão do cliente foi bloqueado preventivamente devido a alguma política interna de risco ou segurança.', 
            solutionText: 'O desbloqueio pode ser solicitado mediante uma nova reavaliação de crédito em uma das nossas lojas físicas.', 
            keywords: 'política interna, regras, risco, análise',
            fileName: ''
        },
        { 
            id: 6, 
            tema: 'Cartão de Crédito', 
            microtema: 'Bloqueio', 
            title: 'Bloqueio por Suspeita de Fraude', 
            description: 'A conta apresenta uma suspeita de fraude ou uma fraude já foi confirmada pela equipe de segurança.', 
            solutionText: 'O desbloqueio da conta é realizado mediante uma atualização cadastral completa e segura em uma loja física.', 
            keywords: 'fraude, suspeita, segurança, compra indevida, clonado',
            fileName: ''
        },
        { 
            id: 7, 
            tema: 'Cartão de Crédito', 
            microtema: 'Bloqueio', 
            title: 'Bloqueio Jurídico', 
            description: 'O bloqueio ocorre quando o cliente possui um processo judicial em andamento contra a empresa, ou vice-versa.', 
            solutionText: 'O desbloqueio da conta só ocorrerá mediante uma análise e parecer favorável do departamento jurídico.', 
            keywords: 'jurídico, processo, ação judicial, advogado',
            fileName: ''
        }
    ];
    
    // --- LÓGICA DO MENU HAMBÚRGUER ---
    if (hamburger && aside) {
        hamburger.addEventListener('click', () => {
            aside.classList.toggle('open');
        });
        document.addEventListener('click', (event) => {
            if (aside.classList.contains('open') && !aside.contains(event.target) && !hamburger.contains(event.target)) {
                aside.classList.remove('open');
            }
        });
    }

    // --- FUNÇÃO DE RENDERIZAÇÃO DA TABELA (ATUALIZADA) ---
    function renderDocuments() {
        knowledgeLibraryTableBody.innerHTML = ''; 
        let filteredDocuments = [...mockDocuments];
        const currentSearchInput = knowledgeLibrarySearchInput || knowledgeLibrarySearchInputHeader;
        const searchTerm = currentSearchInput ? currentSearchInput.value.toLowerCase().trim() : '';

        if (searchTerm) {
            filteredDocuments = filteredDocuments.filter(doc =>
                doc.tema.toLowerCase().includes(searchTerm) ||
                doc.microtema.toLowerCase().includes(searchTerm) ||
                doc.title.toLowerCase().includes(searchTerm) ||
                doc.description.toLowerCase().includes(searchTerm) ||
                doc.keywords.toLowerCase().includes(searchTerm) ||
                doc.solutionText.toLowerCase().includes(searchTerm)
            );
        }

        const numToDisplay = parseInt(numDocumentsDisplayInput.value);
        if (!isNaN(numToDisplay) && numToDisplay > 0) {
            filteredDocuments = filteredDocuments.slice(0, numToDisplay);
        }

        if (filteredDocuments.length === 0) {
            noKnowledgeLibrarysMessage.style.display = 'block';
            knowledgeLibraryTableBody.style.display = 'none';
        } else {
            noKnowledgeLibrarysMessage.style.display = 'none';
            knowledgeLibraryTableBody.style.display = 'table-row-group';
            
            const headers = Array.from(document.querySelectorAll('#knowledge-library-table thead th')).map(th => th.dataset.label || th.textContent);

            filteredDocuments.forEach(doc => {
                const row = knowledgeLibraryTableBody.insertRow();
                row.dataset.documentId = doc.id;

                // Células na ordem correta do thead
                const cellsData = [
                    doc.tema,
                    doc.microtema,
                    doc.title,
                    doc.description,
                    doc.solutionText || 'N/A',
                    doc.keywords || 'N/A'
                ];

                cellsData.forEach((data, index) => {
                    const cell = row.insertCell();
                    cell.dataset.label = headers[index];
                    cell.innerHTML = `<span class="td-value">${data}</span>`;
                });

                // Célula de Ações
                const actionsCell = row.insertCell();
                actionsCell.dataset.label = headers[headers.length - 1]; // "Ações"
                actionsCell.classList.add('user-actions');
                actionsCell.innerHTML = `
                    <button class="btn-edit" data-id="${doc.id}" title="Editar documento"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000"><path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z"/></svg></button>
                    <button class="btn-delete" data-id="${doc.id}" title="Excluir documento"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000"><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/></svg></button>
                `;
            });
        }
    }

    // --- LÓGICA DO MODAL (ATUALIZADA) ---
    function openEditDocumentModal(docId) {
        const doc = mockDocuments.find(d => d.id === docId);
        if (doc) {
            editDocumentId.value = doc.id;
            editDocumentTema.value = doc.tema; // Preenche o tema
            editDocumentMicrotema.value = doc.microtema; // Preenche o micro-tema
            editDocumentTitle.value = doc.title;
            editDocumentDescription.value = doc.description;
            editDocumentSolution.value = doc.solutionText;
            editDocumentKeywords.value = doc.keywords;

            editDocumentModal.style.display = 'flex';
            setTimeout(() => {
                editDocumentModal.classList.add('active');
            }, 10);
        }
    }

    function closeEditDocumentModal() {
        editDocumentModal.classList.remove('active');
        editDocumentModal.addEventListener('transitionend', function handler() {
            editDocumentModal.style.display = 'none';
            editDocumentModal.removeEventListener('transitionend', handler);
        });
        editDocumentForm.reset();
    }

    // --- Listener de SUBMIT do Formulário (ATUALIZADO) ---
    editDocumentForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const docId = parseInt(editDocumentId.value);
        const updatedTema = editDocumentTema.value.trim();
        const updatedMicrotema = editDocumentMicrotema.value.trim();
        const updatedTitle = editDocumentTitle.value.trim();
        const updatedDescription = editDocumentDescription.value.trim();
        const updatedSolution = editDocumentSolution.value.trim();
        const updatedKeywords = editDocumentKeywords.value.trim();

        if (!updatedTema || !updatedMicrotema || !updatedTitle) {
            alert('Os campos Tema, Micro-tema e Título não podem ser vazios.');
            return;
        }

        const docIndex = mockDocuments.findIndex(d => d.id === docId);
        if (docIndex !== -1) {
            mockDocuments[docIndex] = {
                ...mockDocuments[docIndex],
                tema: updatedTema,
                microTema: updatedMicrotema,
                title: updatedTitle,
                description: updatedDescription,
                solutionText: updatedSolution,
                keywords: updatedKeywords
            };
            alert('Documento atualizado com sucesso!');
            closeEditDocumentModal();
            renderDocuments();
        } else {
            alert('Erro: Documento não encontrado para atualização.');
        }
    });

    btnCancelDocument.addEventListener('click', closeEditDocumentModal);

    // --- LISTENERS DE EVENTOS ---
    knowledgeLibraryTableBody.addEventListener('click', (event) => {
        const targetButton = event.target.closest('button');
        if (!targetButton) return;

        const docId = parseInt(targetButton.dataset.id);
        if (isNaN(docId)) return;

        if (targetButton.classList.contains('btn-edit')) {
            openEditDocumentModal(docId);
        } else if (targetButton.classList.contains('btn-delete')) {
            if (confirm(`Tem certeza que deseja excluir o documento "${mockDocuments.find(d => d.id === docId)?.title}"?`)) {
                mockDocuments = mockDocuments.filter(doc => doc.id !== docId);
                alert('Documento excluído com sucesso!');
                renderDocuments();
            }
        }
    });

    if (addKnowledgeLibraryButton) {
        addKnowledgeLibraryButton.addEventListener('click', () => {
            window.location.href = './upload.html';
        });
    }

    if (knowledgeLibrarySearchInput) {
        knowledgeLibrarySearchInput.addEventListener('input', renderDocuments);
    }
    if (knowledgeLibrarySearchInputHeader) {
        knowledgeLibrarySearchInputHeader.addEventListener('input', renderDocuments);
    }
    if (numDocumentsDisplayInput) {
        numDocumentsDisplayInput.addEventListener('input', renderDocuments);
    }

    // --- RENDERIZAÇÃO INICIAL ---
    renderDocuments();
});