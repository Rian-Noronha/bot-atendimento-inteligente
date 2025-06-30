import { apiChatService } from './services/apiChatService.js';
import { apiCategoriaService } from './services/apiCategoriaService.js';

document.addEventListener('DOMContentLoaded', () => {
    const themeSelect = document.getElementById('select-theme');
    const subthemeSelect = document.getElementById('select-subtheme');
    const inputPergunta = document.getElementById('input-pergunta');
    const askButton = document.getElementById('ask-button');
    const answerArea = document.getElementById('answer-area');
    const feedbackSection = document.getElementById('feedback-section');
    const btnFeedbackSim = document.getElementById('btn-feedback-sim');
    const btnFeedbackNao = document.getElementById('btn-feedback-nao');
    const feedbackStatus = document.getElementById('feedback-status');

    let currentSessaoId = null;
    let currentRespostaId = null; // guardar para o feedback

    async function inicializarChat() {
        const token = localStorage.getItem('authToken');
        if (!token) {
            alert("A sua sessão não foi encontrada. Por favor, inicie sessão.");
            window.location.href = '../index.html';
            return;
        }

        try {
            const response = await apiChatService.iniciarSessao();
            currentSessaoId = response.sessao.id;
            console.log("Sessão de Chat ativa:", currentSessaoId);

            const temas = await apiCategoriaService.pegarTodasCategorias();
            popularTemas(temas);
        } catch (error) {
            console.error("Erro ao inicializar o chat:", error);
            answerArea.value = "Erro ao iniciar o chat. Tente recarregar a página.";
        }
    }

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
        answerArea.value = 'Buscando...';
        feedbackSection.style.display = 'none';
        feedbackStatus.textContent = '';
        btnFeedbackSim.disabled = false;
        btnFeedbackNao.disabled = false;
        
        try {
            const dadosConsulta = { pergunta, sessao_id: currentSessaoId, subcategoria_id };
            const respostaCompleta = await apiChatService.criarConsultaEObterResposta(dadosConsulta);

            // A resposta do backend já contém a resposta da IA e o ID para o feedback
            currentRespostaId = respostaCompleta.resposta_id;
            answerArea.value = respostaCompleta.answer;
            feedbackSection.style.display = 'block';
            
        } catch (error) {
            console.error("Erro no fluxo de pergunta:", error);
            answerArea.value = `Ocorreu um erro: ${error.message}`;
        } finally {
            askButton.disabled = false;
        }
    }

    
    async function handleFeedback(foiUtil) {
        if (!currentRespostaId) return;
        feedbackStatus.textContent = 'A enviar feedback...';
        btnFeedbackSim.disabled = true;
        btnFeedbackNao.disabled = true;
        
        try {
            await apiChatService.criarFeedback({ util: foiUtil, resposta_id: currentRespostaId });
            feedbackStatus.textContent = 'Obrigado pelo seu feedback!';
            if (!foiUtil) {
                feedbackStatus.textContent += ' A sua questão foi registada para análise.';
            }
        } catch (error) {
            console.error("Erro ao enviar feedback:", error);
            feedbackStatus.textContent = 'Erro ao enviar.';
            btnFeedbackSim.disabled = false;
            btnFeedbackNao.disabled = false;
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
        if (e.key === 'Enter') handleAsk();
    });

    btnFeedbackSim.addEventListener('click', () => handleFeedback(true));
    btnFeedbackNao.addEventListener('click', () => handleFeedback(false));

    // --- Inicialização ---
    inicializarChat();
});
