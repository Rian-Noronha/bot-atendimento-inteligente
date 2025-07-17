import { apiChatService } from './services/apiChatService.js';
import { apiCategoriaService } from './services/apiCategoriaService.js';
import { startSessionManagement, logoutUser } from './utils/sessionManager.js';

document.addEventListener('DOMContentLoaded', () => {
    startSessionManagement();

    // --- SELEÇÃO DE ELEMENTOS ESPECÍFICOS DA PÁGINA ---
    const themeSelect = document.getElementById('select-theme');
    const subthemeSelect = document.getElementById('select-subtheme');
    const inputPergunta = document.getElementById('input-pergunta');
    const askButton = document.getElementById('ask-button');
    const answerArea = document.getElementById('answer-area');
    const sourceLinkArea = document.getElementById('source-link-area');
    const feedbackSection = document.getElementById('feedback-section');
    const btnFeedbackSim = document.getElementById('btn-feedback-sim');
    const btnFeedbackNao = document.getElementById('btn-feedback-nao');
    const feedbackStatus = document.getElementById('feedback-status');
    const logoutButton = document.getElementById('logout-btn');
    const backButton = document.getElementById('back-button');
    const feedbackModal = document.getElementById('feedback-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const stars = document.querySelectorAll('.star');
    const feedbackComment = document.getElementById('feedback-comment');
    const submitFeedbackBtn = document.getElementById('submit-feedback-btn');

    let currentSessaoId = null;
    let currentRespostaId = null;
    let currentConsultaId = null;
    let feedbackIsUtil = null;    
    let currentRating = 0;  

    // --- LÓGICA ESPECÍFICA DA PÁGINA ---
   
    if (logoutButton) {
        logoutButton.addEventListener('click', (e) => {
            e.preventDefault();
            if (currentSessaoId) {
                apiChatService.encerrarSessao(currentSessaoId);
            }
            logoutUser(); 
        });
    }

    
    if (backButton) {
        backButton.addEventListener('click', (e) => {
            e.preventDefault(); // Impede que o link seja seguido diretamente
            
            // Pega os dados do usuário salvos no login
            const userDataString = localStorage.getItem('loggedInUser');
            
            if (userDataString) {
                try {
                    const userData = JSON.parse(userDataString);
                    const userRole = userData.perfil?.nome?.toLowerCase();

                    // Se for admin, volta para o dashboard
                    if (userRole === 'administrador') {
                        window.location.href = './dashboard.html';
                    } else {
                        // Se for qualquer outro perfil (operador, etc.), faz logout
                        logoutUser();
                    }
                } catch (error) {
                    console.error("Erro ao processar dados do usuário:", error);
                    logoutUser("Ocorreu um erro ao verificar seu perfil.");
                }
            } else {
                // Se, por algum motivo, não encontrar os dados, faz logout por segurança
                logoutUser("Não foi possível verificar seu perfil. A fazer logout.");
            }
        });
    }


     // --- LÓGICA DE ABERTURA E FECHAMENTO DO MODAL (NOVA) ---
    function openFeedbackModal(wasUseful) {
        feedbackIsUtil = wasUseful; // Salva o valor do clique (true/false)
        feedbackModal.style.display = 'flex'; // Mostra o modal
    }

     function closeFeedbackModal() {
        feedbackModal.style.display = 'none'; // Esconde o modal
        // Reseta os campos para a próxima avaliação
        currentRating = 0;
        feedbackComment.value = '';
        stars.forEach(star => star.classList.remove('selected'));
    }


     // --- LÓGICA DAS ESTRELAS (NOVA) ---
    stars.forEach(star => {
        star.addEventListener('click', () => {
            currentRating = parseInt(star.getAttribute('data-value'));
            // Atualiza a aparência das estrelas
            stars.forEach(s => {
                s.classList.toggle('selected', parseInt(s.getAttribute('data-value')) <= currentRating);
            });
        });
    });


    // --- LÓGICA DE SUBMISSÃO DO FEEDBACK (NOVA FUNÇÃO) ---
    async function submitFeedback() {
        if (!currentRespostaId || !currentConsultaId) return;
        
        const comentario = feedbackComment.value.trim();
        feedbackStatus.textContent = 'A enviar feedback...';
        
        // Desabilita os botões principais de Sim/Não
        btnFeedbackSim.disabled = true;
        btnFeedbackNao.disabled = true;

        try {
            // Envia todos os dados para a API
            await apiChatService.criarFeedback({ 
                util: feedbackIsUtil,
                nota: currentRating,
                comentario: comentario,
                resposta_id: currentRespostaId,
                consulta_id: currentConsultaId 
            });

            feedbackStatus.textContent = 'Obrigado pelo seu feedback!';
            if (!feedbackIsUtil) {
                feedbackStatus.textContent += ' A sua questão foi registada para análise.';
            }
        } catch (error) {
            console.error("Erro ao enviar feedback:", error);
            feedbackStatus.textContent = 'Erro ao enviar.';
            btnFeedbackSim.disabled = false; // Reabilita em caso de erro
            btnFeedbackNao.disabled = false;
        } finally {
            closeFeedbackModal(); // Fecha o modal após o envio
        }
    }

    /**
     * Inicia a sessão de chat e carrega os temas iniciais.
     */
    async function inicializarChat() {
        try {
            const response = await apiChatService.iniciarSessao();
            currentSessaoId = response.sessao.id;
            console.log("Sessão de Chat ativa:", currentSessaoId);

            const temas = await apiCategoriaService.pegarTodasCategorias();
            popularTemas(temas);
        } catch (error) {
            console.error("Erro ao inicializar o chat:", error);
            answerArea.value = "Erro ao iniciar o chat. A sua sessão pode ter expirado. Tente recarregar a página.";
            themeSelect.disabled = true;
            subthemeSelect.disabled = true;
            inputPergunta.disabled = true;
            askButton.disabled = true;
        }
    }

    // As funções abaixo permanecem as mesmas
    function popularTemas(temas) {
        themeSelect.innerHTML = '<option value="" disabled selected>Selecione um tema...</option>';
        temas.forEach(tema => {
            const option = new Option(tema.nome, tema.id);
            themeSelect.add(option);
        });
    }

    async function handleThemeChange() {
        const categoriaId = themeSelect.value;
        subthemeSelect.innerHTML = '<option value="" disabled selected>Buscando...</option>';
        subthemeSelect.disabled = true;
        inputPergunta.disabled = true;
        askButton.disabled = true;

        if (categoriaId) {
            try {
                const subtemas = await apiCategoriaService.pegarSubcategoriasPorCategoriaId(categoriaId);
                subthemeSelect.innerHTML = '<option value="" disabled selected>Selecione um micro-tema...</option>';
                subtemas.forEach(sub => {
                    const option = new Option(sub.nome, sub.id);
                    subthemeSelect.add(option);
                });
                subthemeSelect.disabled = false;
            } catch (error) {
                console.error("Erro ao carregar micro-temas:", error);
                subthemeSelect.innerHTML = '<option value="">Erro ao carregar</option>';
            }
        }
    }

    async function handleAsk() {
        const pergunta = inputPergunta.value.trim();
        const subcategoria_id = subthemeSelect.value;
        if (!pergunta || !subcategoria_id) {
            alert("Por favor, selecione os temas e digite a sua pergunta.");
            return;
        }
        
        askButton.disabled = true;
        answerArea.value = 'Buscando a melhor resposta...';
        sourceLinkArea.style.display = 'none';
        feedbackSection.style.display = 'none';
        feedbackStatus.textContent = '';
        btnFeedbackSim.disabled = false;
        btnFeedbackNao.disabled = false;
        
        try {
            const dadosConsulta = { pergunta, sessao_id: currentSessaoId, subcategoria_id };
            const respostaCompleta = await apiChatService.criarConsultaEObterResposta(dadosConsulta);

            currentRespostaId = respostaCompleta.resposta_id;
            currentConsultaId = respostaCompleta.consulta_id;
            
            
            answerArea.value = respostaCompleta.answer;

            if (respostaCompleta.url_fonte) {
                sourceLinkArea.innerHTML = `<b>Fonte:</b> <a href="${respostaCompleta.url_fonte}" target="_blank" rel="noopener noreferrer">${respostaCompleta.titulo_fonte}</a>`;
                sourceLinkArea.style.display = 'block';
            }

            feedbackSection.style.display = 'block';
            
        } catch (error) {
            console.error("Erro no fluxo de pergunta:", error);
            answerArea.value = `Ocorreu um erro: ${error.message}`;
        } finally {
            askButton.disabled = false;
        }
    }

    async function handleFeedback(foiUtil) {
         if (!currentRespostaId || !currentConsultaId) return;
        
        const comentario = feedbackComment.value.trim();
        feedbackStatus.textContent = 'A enviar feedback...';
        
        // Desabilita os botões principais de Sim/Não
        btnFeedbackSim.disabled = true;
        btnFeedbackNao.disabled = true;
        
        try {
            await apiChatService.criarFeedback({ 
                util: feedbackIsUtil,
                nota: currentRating,
                comentario: comentario,
                resposta_id: currentRespostaId,
                consulta_id: currentConsultaId 
            });

            feedbackStatus.textContent = 'Obrigado pelo seu feedback!';
            if (!foiUtil) {
                feedbackStatus.textContent += ' A sua questão foi registada para análise.';
            }
        } catch (error) {
            console.error("Erro ao enviar feedback:", error);
            feedbackStatus.textContent = 'Erro ao enviar.';
            btnFeedbackSim.disabled = false; // Reabilita em caso de erro
            btnFeedbackNao.disabled = false;
        } finally {
            closeFeedbackModal(); // Fecha o modal após o envio
        }
    }

    // --- Event Listeners ---
    themeSelect.addEventListener('change', handleThemeChange);
    subthemeSelect.addEventListener('change', () => {
        if (subthemeSelect.value) {
            inputPergunta.disabled = false;
            askButton.disabled = false;
        }
    });

    askButton.addEventListener('click', handleAsk);
    inputPergunta.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAsk();
        }
    });

    
    // <<-- 2. MUDANÇA: AGORA OS BOTÕES ABREM O MODAL EM VEZ DE ENVIAR O FEEDBACK -->>
    btnFeedbackSim.addEventListener('click', () => openFeedbackModal(true));
    btnFeedbackNao.addEventListener('click', () => openFeedbackModal(false));

    // <<-- 3. NOVOS LISTENERS PARA CONTROLAR O MODAL -->>
    closeModalBtn.addEventListener('click', closeFeedbackModal);
    submitFeedbackBtn.addEventListener('click', submitFeedback);
    
    // Fecha o modal se o usuário clicar fora da caixa de conteúdo
    window.addEventListener('click', (event) => {
        if (event.target == feedbackModal) {
            closeFeedbackModal();
        }
    });

    window.addEventListener('beforeunload', () => {
        if (currentSessaoId) {
            apiChatService.encerrarSessao(currentSessaoId);
        }
    });

    // --- Inicialização ---
    inicializarChat();
});
