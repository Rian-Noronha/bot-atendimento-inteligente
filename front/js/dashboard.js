import { apiAssuntoPendenteService } from './services/apiAssuntoPendenteService.js';
import { apiAuthService } from './services/apiAuthService.js';
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
    const logoutButton = document.getElementById('logout-btn');
    const TIMEOUT_DURATION = 5 * 60 * 1000;
    let timeoutInterval; 



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
        localStorage.removeItem('authToken'); // Clear authentication token

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

    let assuntos = []; // Armazenará os assuntos buscados da API

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

        // Acessando as propriedades aninhadas da resposta da API
        const tema = assunto.subcategoria?.categoria?.nome || 'Tema Desconhecido';
        const microtema = assunto.subcategoria?.nome || 'Microtema Desconhecido';
        // Usamos consulta.pergunta ou texto_assunto como fallback
        const pergunta = assunto.consulta?.pergunta || assunto.texto_assunto || 'Pergunta não disponível';
        const status = assunto.status || 'pendente'; // Garante que o status tenha um valor padrão

        cardDiv.dataset.id = assunto.id;
        cardDiv.dataset.tema = tema.toLowerCase();
        cardDiv.dataset.microtema = microtema.toLowerCase();
        cardDiv.dataset.status = status; // Não precisa de .toLowerCase() aqui
        cardDiv.style.cursor = 'pointer';

        cardDiv.innerHTML = `
            <div class="barra" style="background: ${getBarColor(status)};"></div>
            <div class="conteudo">
                <h3>${tema}</h3>
                <h4>${microtema}</h2>
                <p>${pergunta}</p>
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

    async function fetchAndRenderAssuntos() {
        try {
            assuntos = await apiAssuntoPendenteService.pegarTodosPendentes();
            applyFiltersAndLimits();
        } catch (error) {
            console.error('Erro ao buscar assuntos pendentes:', error);
            alert('Não foi possível carregar os assuntos pendentes. Por favor, tente novamente.');
        }
    }

    function applyFiltersAndLimits() {
        let currentFilteredAssuntos = [...assuntos]; // Use the fetched 'assuntos'

        const searchTerm = searchInput.value.toLowerCase().trim();
        if (searchTerm) {
            currentFilteredAssuntos = currentFilteredAssuntos.filter(assunto => {
                // Acessa as propriedades como elas vêm da API para a busca
                const tema = assunto.subcategoria?.categoria?.nome || '';
                const microtema = assunto.subcategoria?.nome || '';
                const pergunta = assunto.consulta?.pergunta || assunto.texto_assunto || '';

                const fullText = `${tema} ${microtema} ${pergunta}`.toLowerCase();
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
        const assunto = assuntos.find(a => a.id === assuntoId); // Use 'assuntos'
        if (assunto) {
            // Acessando as propriedades aninhadas para preencher o modal
            const tema = assunto.subcategoria?.categoria?.nome || '';
            const microtema = assunto.subcategoria?.nome || '';
            const pergunta = assunto.consulta?.pergunta || assunto.texto_assunto || '';

            assuntoDecisaoIdInput.value = assunto.id;
            assuntoDecisaoCategoria.value = tema;
            assuntoDecisaoSubcategoria.value = microtema;
            assuntoDecisaoPergunta.value = pergunta;

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


    btnSimCadastrar.addEventListener('click', async (event) => {
        event.preventDefault(); // Prevent default navigation to handle approval logic first
        const assuntoId = parseInt(assuntoDecisaoIdInput.value);

        try {
            // Update status via API
            await apiAssuntoPendenteService.atualizarStatus(assuntoId, 'aprovado');

            // Find the approved subject in the local 'assuntos' array
            const assuntoIndex = assuntos.findIndex(a => a.id === assuntoId);
            if (assuntoIndex !== -1) {
                // Prepara o objeto aprovado com a estrutura esperada para o relatório, se necessário
                const approvedSubject = {
                    id: assuntos[assuntoIndex].id,
                    tema: assuntos[assuntoIndex].subcategoria?.categoria?.nome || '',
                    microtema: assuntos[assuntoIndex].subcategoria?.nome || '',
                    pergunta: assuntos[assuntoIndex].consulta?.pergunta || assuntos[assuntoIndex].texto_assunto || '',
                    status: 'aprovado',
                    approvedDate: new Date().toISOString(),
                    // Você pode adicionar outras propriedades originais se forem relevantes para o relatório
                };

                // Salva o assunto aprovado no localStorage para o relatório
                const approvedSubjects = JSON.parse(localStorage.getItem('approvedSubjects')) || [];
                approvedSubjects.push(approvedSubject);
                localStorage.setItem('approvedSubjects', JSON.stringify(approvedSubjects));

                // Remove o assunto da lista local de assuntos pendentes
                assuntos = assuntos.filter(a => a.id !== assuntoId);

                closeAssuntoDecisaoModal();
                applyFiltersAndLimits(); // Re-render cards
                window.location.href = `./upload.html?assuntoId=${assuntoId}`; // Navigate after successful update
            } else {
                alert('Erro: Assunto não encontrado localmente após aprovação.');
            }
        } catch (error) {
            console.error('Erro ao aprovar assunto:', error);
            alert('Não foi possível aprovar o assunto. Por favor, tente novamente.');
        }
    });


    btnNaoDescartar.addEventListener('click', async () => {
        const assuntoId = parseInt(assuntoDecisaoIdInput.value);
        try {
            // Update status via API
            await apiAssuntoPendenteService.atualizarStatus(assuntoId, 'descartado');

            // Remove o assunto da lista local de assuntos pendentes
            assuntos = assuntos.filter(a => a.id !== assuntoId);

            alert(`Assunto descartado com sucesso.`);
            closeAssuntoDecisaoModal();
            applyFiltersAndLimits(); // Re-render cards
        } catch (error) {
            console.error('Erro ao descartar assunto:', error);
            alert('Não foi possível descartar o assunto. Por favor, tente novamente.');
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

    if (logoutButton) {
        logoutButton.addEventListener('click', async (event) => {
            // Impede a navegação padrão do link, pois o JS controlará o fluxo
            event.preventDefault();

            try {
                // Tenta fazer o logout no servidor para invalidar a sessão no banco
                await apiAuthService.logout();
                console.log('Sessão encerrada no servidor com sucesso.');
            } catch (error) {
                // Mesmo que a chamada à API falhe, ainda deslogamos do frontend
                console.error('Erro ao encerrar sessão no servidor:', error);
            } finally {
                // O bloco 'finally' SEMPRE é executado, garantindo o logout local.
                // Limpa todos os dados de autenticação do navegador
                localStorage.clear();
                sessionStorage.clear();
                // Redireciona para a página de login
                window.location.href = '../index.html';
            }
        });
    }

    fetchAndRenderAssuntos();
});