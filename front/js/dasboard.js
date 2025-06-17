document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.getElementById('hamburger');
    const aside = document.querySelector('aside');
    const searchInput = document.querySelector('header form input[type="text"]');
    const itemsPerPageInput = document.getElementById('num-items-display');
    const assuntosContainer = document.querySelector('section.assuntos > div');

 
    const assuntoDecisaoModal = document.getElementById('assunto-decisao-modal');
    const assuntoDecisaoIdInput = document.getElementById('assunto-decisao-id'); 
    const assuntoDecisaoCategoria = document.getElementById('assunto-decisao-categoria');
    const assuntoDecisaoSubcategoria = document.getElementById('assunto-decisao-subcategoria');
    const assuntoDecisaoPergunta = document.getElementById('assunto-decisao-pergunta');
    const btnSimCadastrar = document.getElementById('btn-sim-cadastrar'); 
    const btnNaoDescartar = document.getElementById('btn-nao-descartar');


    // --- LÓGICA DE TIMEOUT DE SESSÃO (5 MINUTOS) ---

    const TIMEOUT_DURATION = 5 * 60 * 1000; 
    let timeoutInterval; // Variável para guardar nosso "vigia".

    /**
     * Reseta o contador de inatividade.
     * Esta função é chamada sempre que o usuário interage com a página.
     */
    function resetTimeoutTimer() {
        // Atualiza o localStorage com a hora da atividade mais recente.
        localStorage.setItem('last_activity_time', Date.now());
    }

    /**
     * Função que efetivamente desconecta o usuário.
     */
    function logoutUser() {
        // Para o vigia para não continuar verificando.
        clearInterval(timeoutInterval);

        // Limpa os dados da sessão do localStorage para invalidá-la.
        localStorage.removeItem('active_session_id');
        localStorage.removeItem('last_activity_time');
        localStorage.removeItem('loggedInUser'); // Limpa também o usuário logado

        // Avisa o usuário e o redireciona para a tela de login.
        alert('Sua sessão expirou por inatividade. Por favor, faça login novamente.');
        window.location.href = '../index.html'; // Ajuste o caminho se necessário
    }

    /**
     * O "vigia" que verifica o tempo de inatividade.
     * Roda a cada poucos segundos.
     */
    function checkTimeout() {
        const lastActivityTime = parseInt(localStorage.getItem('last_activity_time') || '0', 10);
        const now = Date.now();

        // Se o tempo desde a última atividade for maior que a nossa duração de timeout...
        if (now - lastActivityTime > TIMEOUT_DURATION) {
            console.log('Sessão expirada! Desconectando...');
            logoutUser();
        }
    }

    /**
     * Inicia o monitoramento de atividade.
     */
    function startTimeoutMonitoring() {
        // Lista de eventos que consideraremos como "atividade do usuário".
        const activityEvents = ['mousemove', 'mousedown', 'keypress', 'scroll', 'touchstart'];

        // Para cada evento da lista, adicionamos um "ouvinte" que chama a função de resetar o tempo.
        activityEvents.forEach(event => {
            window.addEventListener(event, resetTimeoutTimer);
        });

        // Inicia o nosso "vigia" para verificar o timeout a cada 5 segundos.
        timeoutInterval = setInterval(checkTimeout, 5000);
    }

    


    // Inicia o monitoramento assim que a página é carregada.
    startTimeoutMonitoring();


    // Quando a página carrega, ela verifica se a sessão atual ainda é a ativa.
    // Isso impede que uma aba antiga "fechada e reaberta" continue funcionando.
    const currentSessionId = localStorage.getItem('active_session_id');
    if (!sessionStorage.getItem('my_tab_session_id')) {
        // Se esta aba não tem um ID, ela acabou de ser aberta. Vamos atribuir o ID ativo a ela.
        sessionStorage.setItem('my_tab_session_id', currentSessionId);
    } else if (sessionStorage.getItem('my_tab_session_id') !== currentSessionId) {
        // Se o ID da aba é diferente do ID ativo, ela é uma sessão antiga.
        alert('Sua sessão foi encerrada em outra aba. Você será desconectado.');
        window.location.href = '../index.html'; // Use '../' para voltar para a raiz
    }

    // Adiciona o "vigia" para eventos de armazenamento em outras abas
    window.addEventListener('storage', (event) => {
        // Verifica se a chave 'active_session_id' foi alterada em outra aba
        if (event.key === 'active_session_id') {
            // Compara o novo ID da sessão com o ID desta aba
            if (event.newValue !== sessionStorage.getItem('my_tab_session_id')) {
                // Se forem diferentes, significa que um novo login foi feito em outro lugar.
                alert('Sua sessão foi encerrada porque você se conectou em uma nova aba ou janela.');
                // Redireciona esta aba "antiga" para a tela de login.
                window.location.href = '../index.html';
            }
        }
    });


     let mockAssuntos = JSON.parse(localStorage.getItem('mockAssuntos')) || [
        { id: 1, tema: 'Cartão', microtema: 'Bloqueio', pergunta: 'Cliente questiona motivo de bloqueio possuindo uma renegociação (RN) vigente.', status: 'pendente' },
        { id: 2, tema: 'Cartão', microtema: 'Bloqueio', pergunta: 'Como proceder com o desbloqueio por atraso ou falta de utilização do crédito?', status: 'pendente' },
        { id: 3, tema: 'Cartão', microtema: 'Bloqueio', pergunta: 'Meu cartão foi bloqueado por restrição no CPF (SPC/Serasa), o que fazer?', status: 'pendente' },
        { id: 4, tema: 'Cartão', microtema: 'Bloqueio', pergunta: 'Cartão bloqueado por cadastro pendente de atualização. Quais documentos preciso levar?', status: 'pendente' },
        { id: 5, tema: 'Cartão', microtema: 'Bloqueio', pergunta: 'Qual o motivo do bloqueio por "política interna" e como resolver?', status: 'pendente' },
        { id: 6, tema: 'Cartão', microtema: 'Bloqueio', pergunta: 'Meu cartão foi bloqueado por suspeita de fraude. Como faço para desbloquear?', status: 'pendente' },
        { id: 7, tema: 'Cartão', microtema: 'Bloqueio', pergunta: 'O que significa o bloqueio jurídico e como o desbloqueio é analisado?', status: 'pendente' },
        { id: 8, tema: 'SAC', microtema: 'Chamados', pergunta: 'Como consigo acessar minhas milhas?', status: 'pendente' },
        { id: 9, tema: 'SAC', microtema: 'Chamados', pergunta: 'Por que meu limite diminuiu?', status: 'pendente' },
    ];



    // Salva o estado inicial se ainda não estiver no localStorage
    if (!localStorage.getItem('mockAssuntos')) {
        localStorage.setItem('mockAssuntos', JSON.stringify(mockAssuntos));
    }

    function updatePersistentAssuntos() {
        localStorage.setItem('mockAssuntos', JSON.stringify(mockAssuntos));
    }

    //lógica do Hamburger menu sidebar retrátil
    if (hamburger && aside) {
        hamburger.addEventListener('click', () => {
            aside.classList.toggle('open');
        });
        document.addEventListener('click', (event) => {
            const asideElement = document.querySelector('aside');
            const hamburgerElement = document.getElementById('hamburger');
            if (asideElement && hamburgerElement && asideElement.classList.contains('open') &&
                !asideElement.contains(event.target) && !hamburgerElement.contains(event.target)) {
                asideElement.classList.remove('open');
            }
        });
    }

   
    function getBarColor(status) {
        switch (status) {
            case 'pendente':
                return 'linear-gradient(135deg, var(--cor-chamativa), var(--cor-fundo-ah-esquerda))';
            case 'aprovado':
                return 'linear-gradient(135deg, var(--cor-primaria), #009640)';
            case 'descartado':
                return 'linear-gradient(135deg, var(--cor-secundaria-1), var(--cor-secundaria-2))';
            default:
                return 'linear-gradient(135deg, var(--cor-chamativa), var(--cor-fundo-ah-esquerda))';
        }
    }

    function createCardElement(assunto) {
        const cardDiv = document.createElement('div');
        cardDiv.classList.add('card');
        cardDiv.dataset.id = assunto.id;
        cardDiv.dataset.tema = assunto.tema.toLowerCase();
        cardDiv.dataset.microtema = assunto.microtema.toLowerCase();
        cardDiv.dataset.status = assunto.status;
        cardDiv.style.cursor = 'pointer';

        cardDiv.innerHTML = `
            <div class="barra" style="background: ${getBarColor(assunto.status)};"></div>
            <div class="conteudo">
                <h3>${assunto.tema}</h3>
                <h4>${assunto.microtema}</h2>
                <p>${assunto.pergunta}</p>
                <div class="acoes">
                    <button class="btn-decide-assunto" data-id="${assunto.id}" title="Avaliar assunto">
                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="M440-280h80v-240h-80v240Zm40-320q17 0 28.5-11.5T520-640q0-17-11.5-28.5T480-680q-17 0-28.5 11.5T440-640q0 17 11.5 28.5T480-600Zm0 520q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/></svg> 
                    </button>
                </div>
            </div>
        `;
        return cardDiv;
    }

    function renderCards(cardsDataToDisplay) {
        assuntosContainer.innerHTML = '';
        const assuntosAtuais = cardsDataToDisplay.filter(assunto => assunto.status === 'pendente');

        if (assuntosAtuais.length === 0) {
            assuntosContainer.innerHTML = '<p style="text-align: center; color: var(--cor-fonte-fraca);">Nenhum assunto pendente para avaliação encontrado.</p>';
        } else {
            assuntosAtuais.forEach(assunto => {
                const cardElement = createCardElement(assunto);
                assuntosContainer.appendChild(cardElement);
            });
        }
    }

    function applyFiltersAndLimits() {
        let currentFilteredAssuntos = [...mockAssuntos];

        const searchTerm = searchInput.value.toLowerCase().trim();
        if (searchTerm) {
            currentFilteredAssuntos = currentFilteredAssuntos.filter(assunto => {
                const fullText = `${assunto.tema} ${assunto.microtema} ${assunto.pergunta}`.toLowerCase();
                return fullText.includes(searchTerm);
            });
        }

        const itemsPerPage = parseInt(itemsPerPageInput.value);
        if (!isNaN(itemsPerPage) && itemsPerPage > 0) {
            currentFilteredAssuntos = currentFilteredAssuntos.slice(0, itemsPerPage);
        }

        renderCards(currentFilteredAssuntos);
    }

    function openAssuntoDecisaoModal(assuntoId) {
        const assunto = mockAssuntos.find(a => a.id === assuntoId);
        if (assunto) {
            assuntoDecisaoIdInput.value = assunto.id; // Corrigido o nome da variável
            assuntoDecisaoCategoria.value = assunto.tema;
            assuntoDecisaoSubcategoria.value = assunto.microtema;
            assuntoDecisaoPergunta.value = assunto.pergunta;

            btnSimCadastrar.href = `./upload.html?assuntoId=${assunto.id}`;
            console.log(assunto.id);
            assuntoDecisaoModal.style.display = 'flex';
            setTimeout(() => {
                assuntoDecisaoModal.classList.add('active');
            }, 10); 
        }
    }

    function closeAssuntoDecisaoModal() {
        assuntoDecisaoModal.classList.remove('active');
        assuntoDecisaoModal.addEventListener('transitionend', function handler() {
            assuntoDecisaoModal.style.display = 'none';
            assuntoDecisaoModal.removeEventListener('transitionend', handler);
        });
    }




    btnSimCadastrar.addEventListener('click', (event) => {
        const assuntoId = parseInt(assuntoDecisaoIdInput.value);
        const assuntoIndex = mockAssuntos.findIndex(a => a.id === assuntoId);
        
       if (assuntoIndex !== -1) {
            const approvedSubject = { ...mockAssuntos[assuntoIndex] };
            approvedSubject.status = 'aprovado';
            approvedSubject.approvedDate = new Date().toISOString();

            // Salva o assunto aprovado no localStorage para o relatório
            const approvedSubjects = JSON.parse(localStorage.getItem('approvedSubjects')) || [];
            approvedSubjects.push(approvedSubject);
            localStorage.setItem('approvedSubjects', JSON.stringify(approvedSubjects));
            
            // remove o assunto da lista principal
            mockAssuntos = mockAssuntos.filter(a => a.id !== assuntoId); 
            updatePersistentAssuntos();
            
            closeAssuntoDecisaoModal();
            applyFiltersAndLimits();
            
        } else {
            alert('Erro: Assunto não encontrado para aprovação.');
            event.preventDefault(); // previnir navegação se houver erro
        }
    });


    
    btnNaoDescartar.addEventListener('click', () => {
        const assuntoId = parseInt(assuntoDecisaoIdInput.value);
        const assuntoIndex = mockAssuntos.findIndex(a => a.id === assuntoId);
        if (assuntoIndex !== -1) {
            mockAssuntos[assuntoIndex].status = 'descartado';
            alert(`Assunto "${mockAssuntos[assuntoIndex].pergunta}" descartado.`);

          
            mockAssuntos = mockAssuntos.filter(a => a.id !== assuntoId); 

            closeAssuntoDecisaoModal();
            applyFiltersAndLimits(); 
        }
    });

   
    assuntoDecisaoModal.addEventListener('click', (event) => {
        if (event.target === assuntoDecisaoModal) {
            closeAssuntoDecisaoModal();
        }
    });

    
    assuntosContainer.addEventListener('click', (event) => {
        const clickedCard = event.target.closest('.card');
        if (clickedCard) {
            const assuntoId = parseInt(clickedCard.dataset.id);
            if (!isNaN(assuntoId)) {
                openAssuntoDecisaoModal(assuntoId);
            }
        }
    });

    searchInput.addEventListener('input', applyFiltersAndLimits);
    itemsPerPageInput.addEventListener('input', applyFiltersAndLimits);

  
    applyFiltersAndLimits();
});