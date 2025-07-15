// 1. Importa os serviços de API necessários para a página
import { apiAssuntoPendenteService } from './services/apiAssuntoPendenteService.js';
import { apiAuthService } from './services/apiAuthService.js';

// 2. Importa o nosso novo gerenciador de sessão centralizado
import { startSessionManagement } from './utils/sessionManager.js';

document.addEventListener('DOMContentLoaded', () => {
    // 3. Inicia toda a lógica de segurança (timeout, abas, etc.) com uma única chamada
    startSessionManagement();

    // --- SELEÇÃO DE ELEMENTOS ESPECÍFICOS DA PÁGINA ---
    const hamburger = document.getElementById('hamburger');
    const aside = document.querySelector('aside');
    const searchInput = document.querySelector('header form input[type="text"]');
    const itemsPerPageInput = document.getElementById('num-items-display');
    const assuntosContainer = document.querySelector('section.assuntos > div');


    // Elementos do Modal
    const assuntoDecisaoModal = document.getElementById('assunto-decisao-modal');
    const assuntoDecisaoIdInput = document.getElementById('assunto-decisao-id');
    const assuntoDecisaoCategoria = document.getElementById('assunto-decisao-categoria');
    const assuntoDecisaoSubcategoria = document.getElementById('assunto-decisao-subcategoria');
    const assuntoDecisaoPergunta = document.getElementById('assunto-decisao-pergunta');
    const btnSimCadastrar = document.getElementById('btn-sim-cadastrar');
    const btnNaoDescartar = document.getElementById('btn-nao-descartar');
    const logoutButton = document.getElementById('logout-btn');
    const TIMEOUT_DURATION = 20 * 1000;
    let timeoutInterval; 

    
    // Variável para guardar os dados da API
    let assuntos = [];

    // --- LÓGICA ESPECÍFICA DA PÁGINA (O CÓDIGO QUE NÃO SE REPETE) ---

    // Lógica do Hamburger menu
    if (hamburger && aside) {
        hamburger.addEventListener('click', () => aside.classList.toggle('open'));
        document.addEventListener('click', (event) => {
            if (aside.classList.contains('open') && !aside.contains(event.target) && !hamburger.contains(event.target)) {
                aside.classList.remove('open');
            }
        });
    }

    // Lógica do botão de logout (agora mais simples)
    if (logoutButton) {
        logoutButton.addEventListener('click', async (e) => {
            e.preventDefault();
            try {
                await apiAuthService.logout();
            } catch (error) {
                console.error("Erro ao notificar o servidor sobre o logout:", error);
            } finally {
                // A lógica de limpar o storage e redirecionar já está no sessionManager,
                // mas podemos garantir que aconteça aqui também.
                localStorage.clear();
                sessionStorage.clear();
                window.location.href = '../index.html';
            }
        });
    }

    // Funções para renderizar os cards de assuntos pendentes
    function getBarColor(status) {
        switch (status) {
            case 'pendente': return 'linear-gradient(135deg, var(--cor-chamativa), var(--cor-fundo-ah-esquerda))';
            case 'aprovado': return 'linear-gradient(135deg, var(--cor-primaria), #009640)';
            case 'descartado': return 'linear-gradient(135deg, var(--cor-secundaria-1), var(--cor-secundaria-2))';
            default: return 'linear-gradient(135deg, var(--cor-chamativa), var(--cor-fundo-ah-esquerda))';
        }
    }

    function createCardElement(assunto) {
        const cardDiv = document.createElement('div');
        cardDiv.classList.add('card');
        const tema = assunto.subcategoria?.categoria?.nome || 'Tema Desconhecido';
        const microtema = assunto.subcategoria?.nome || 'Microtema Desconhecido';
        const pergunta = assunto.consulta?.pergunta || assunto.texto_assunto || 'Pergunta não disponível';
        const status = assunto.status || 'pendente';
        cardDiv.dataset.id = assunto.id;
        cardDiv.dataset.tema = tema.toLowerCase();
        cardDiv.dataset.microtema = microtema.toLowerCase();
        cardDiv.dataset.status = status;
        cardDiv.style.cursor = 'pointer';
        cardDiv.innerHTML = `
            <div class="barra" style="background: ${getBarColor(status)};"></div>
            <div class="conteudo">
                <h3>${tema}</h3>
                <h4>${microtema}</h4>
                <p>${pergunta}</p>
                <div class="acoes">
                    <button class="btn-decide-assunto" data-id="${assunto.id}" title="Avaliar assunto">
                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="M440-280h80v-240h-80v240Zm40-320q17 0 28.5-11.5T520-640q0-17-11.5-28.5T480-680q-17 0-28.5 11.5T440-640q0 17 11.5 28.5T480-600Zm0 520q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/></svg>
                    </button>
                </div>
            </div>`;
        return cardDiv;
    }

    function renderCards(cardsDataToDisplay) {
        assuntosContainer.innerHTML = '';
        const assuntosAtuais = cardsDataToDisplay.filter(assunto => assunto.status === 'pendente');
        if (assuntosAtuais.length === 0) {
            assuntosContainer.innerHTML = '<p class="no-results">Nenhum assunto pendente para avaliação encontrado.</p>';
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
            assuntosContainer.innerHTML = '<p class="no-results">Falha ao carregar dados do servidor.</p>';
        }
    }

    function applyFiltersAndLimits() {
        let currentFilteredAssuntos = [...assuntos];
        const searchTerm = searchInput.value.toLowerCase().trim();
        if (searchTerm) {
            currentFilteredAssuntos = currentFilteredAssuntos.filter(assunto => {
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
        const assunto = assuntos.find(a => a.id === assuntoId);
        if (assunto) {
            const tema = assunto.subcategoria?.categoria?.nome || '';
            const microtema = assunto.subcategoria?.nome || '';
            const pergunta = assunto.consulta?.pergunta || assunto.texto_assunto || '';
            assuntoDecisaoIdInput.value = assunto.id;
            assuntoDecisaoCategoria.value = tema;
            assuntoDecisaoSubcategoria.value = microtema;
            assuntoDecisaoPergunta.value = pergunta;
            btnSimCadastrar.href = `./upload.html?assuntoId=${assunto.id}`;
            assuntoDecisaoModal.style.display = 'flex';
            setTimeout(() => assuntoDecisaoModal.classList.add('active'), 10);
        }
    }

    function closeAssuntoDecisaoModal() {
        assuntoDecisaoModal.classList.remove('active');
        assuntoDecisaoModal.addEventListener('transitionend', function handler() {
            assuntoDecisaoModal.style.display = 'none';
            assuntoDecisaoModal.removeEventListener('transitionend', handler);
        });
    }

    // --- EVENT LISTENERS ESPECÍFICOS DA PÁGINA ---
    btnSimCadastrar.addEventListener('click', async (event) => {
        event.preventDefault();
        const assuntoId = parseInt(assuntoDecisaoIdInput.value);
        try {
            await apiAssuntoPendenteService.atualizarStatus(assuntoId, 'aprovado');
            const assuntoIndex = assuntos.findIndex(a => a.id === assuntoId);
            if (assuntoIndex !== -1) {
                const approvedSubject = { ...assuntos[assuntoIndex], status: 'aprovado', approvedDate: new Date().toISOString() };
                const approvedSubjects = JSON.parse(localStorage.getItem('approvedSubjects')) || [];
                approvedSubjects.push(approvedSubject);
                localStorage.setItem('approvedSubjects', JSON.stringify(approvedSubjects));
                assuntos = assuntos.filter(a => a.id !== assuntoId);
                closeAssuntoDecisaoModal();
                applyFiltersAndLimits();
                window.location.href = `./upload.html?assuntoId=${assuntoId}`;
            }
        } catch (error) {
            console.error('Erro ao aprovar assunto:', error);
            alert('Não foi possível aprovar o assunto.');
        }
    });

    btnNaoDescartar.addEventListener('click', async () => {
        const assuntoId = parseInt(assuntoDecisaoIdInput.value);
        try {
            await apiAssuntoPendenteService.atualizarStatus(assuntoId, 'descartado');
            assuntos = assuntos.filter(a => a.id !== assuntoId);
            alert(`Assunto descartado com sucesso.`);
            closeAssuntoDecisaoModal();
            applyFiltersAndLimits();
        } catch (error) {
            console.error('Erro ao descartar assunto:', error);
            alert('Não foi possível descartar o assunto.');
        }
    });

    assuntoDecisaoModal.addEventListener('click', (event) => { if (event.target === assuntoDecisaoModal) closeAssuntoDecisaoModal(); });
    assuntosContainer.addEventListener('click', (event) => {
        const clickedCard = event.target.closest('.card');
        if (clickedCard) {
            const assuntoId = parseInt(clickedCard.dataset.id);
            if (!isNaN(assuntoId)) openAssuntoDecisaoModal(assuntoId);
        }
    });
    searchInput.addEventListener('input', applyFiltersAndLimits);
    itemsPerPageInput.addEventListener('input', applyFiltersAndLimits);

    // --- INICIALIZAÇÃO DA PÁGINA ---
    fetchAndRenderAssuntos();
});
