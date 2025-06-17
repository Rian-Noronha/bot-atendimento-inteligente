document.addEventListener('DOMContentLoaded', () => {
    // --- SELEÇÃO DOS ELEMENTOS ---
    const themeSelect = document.getElementById('select-theme');
    const subthemeSelect = document.getElementById('select-subtheme');
    const inputPergunta = document.getElementById('input-pergunta');
    const askButton = document.getElementById('ask-button');
    const answerArea = document.getElementById('answer-area');
    const btnNao = document.getElementById('btn-nao');
    const respostaSolucao = document.getElementById('resp-solucao');

    let ultimaPerguntaFeita = '';

    // --- LÓGICA DE SESSÃO E TIMEOUT ---
    function setupSessionManagement() {
        // Lógica de Timeout por Inatividade
        const TIMEOUT_DURATION = 5 * 60 * 1000;
        let timeoutInterval;

        function resetTimeoutTimer() {
            localStorage.setItem('last_activity_time', Date.now());
        }

        function logoutUser() {
            clearInterval(timeoutInterval);
            localStorage.clear(); // Limpa todo o localStorage para encerrar a sessão
            sessionStorage.clear(); // Limpa também o sessionStorage
            alert('Sua sessão expirou por inatividade. Por favor, faça login novamente.');
            window.location.href = '../index.html';
        }

        function checkTimeout() {
            const lastActivityTime = parseInt(localStorage.getItem('last_activity_time') || '0', 10);
            if (Date.now() - lastActivityTime > TIMEOUT_DURATION) {
                logoutUser();
            }
        }

        const activityEvents = ['mousemove', 'mousedown', 'keypress', 'scroll', 'touchstart'];
        activityEvents.forEach(event => window.addEventListener(event, resetTimeoutTimer));
        timeoutInterval = setInterval(checkTimeout, 5000);

        // Lógica de Sessão Simultânea
        const currentSessionId = localStorage.getItem('active_session_id');
        if (!sessionStorage.getItem('my_tab_session_id')) {
            sessionStorage.setItem('my_tab_session_id', currentSessionId);
        } else if (sessionStorage.getItem('my_tab_session_id') !== currentSessionId) {
            alert('Sua sessão foi encerrada em outra aba. Você será desconectado.');
            window.location.href = '../index.html';
        }

        window.addEventListener('storage', (event) => {
            if (event.key === 'active_session_id' && event.newValue !== sessionStorage.getItem('my_tab_session_id')) {
                alert('Sua sessão foi encerrada porque você se conectou em uma nova aba ou janela.');
                window.location.href = '../index.html';
            }
        });
    }

    // --- ESTRUTURAS DE DADOS (MOCK ATUALIZADO) ---
    const themesAndSubthemes = {
        "Cartão": {
            "Bloqueio": [1, 7],         // IDs para "Como bloquear?" e "Suspeita de fraude"
            "Empréstimo": [4],          // ID para "Aumento de limite"
            "Data base": [3, 10, 11]    // IDs para "2ª via", "Extrato" e "Valor errado"
        },
        "SAC": {
            "Chamados": [6, 8]          // IDs para "Canais de atendimento" e "Mudar e-mail"
        },
        "Benefícios": {                 // Mantido para outros exemplos
            "Pontos e Milhas": [2],
            "Cashback": [5]
        }
    };

    const mockQA = [
        { id: 1, question: "Como bloquear o cartão?", keywords: ["bloquear", "bloqueio", "perdi", "roubo"], answer: "Para bloquear seu cartão, acesse o aplicativo Verdecard, vá em 'Cartões' e selecione a opção 'Bloqueio'. Em caso de roubo ou perda, entre em contato imediatamente com a central de atendimento." },
        { id: 2, question: "Como consultar milhas?", keywords: ["milhas", "pontos", "saldo", "resgate"], answer: "Você pode consultar seu saldo de milhas diretamente no aplicativo Verdecard, na seção 'Programa de Pontos', onde também encontrará parceiros para resgate." },
        { id: 3, question: "Preciso da segunda via da fatura.", keywords: ["segunda via", "2ª via", "fatura", "boleto", "pagar", "pdf", "data base"], answer: "Para emitir a segunda via da sua fatura, acesse a área do cliente no site ou aplicativo. A opção 'Faturas' permitirá baixar o PDF ou copiar o código de barras." },
        { id: 4, question: "Como pedir aumento de limite?", keywords: ["aumento", "limite", "aumentar", "consultar", "emprestimo"], answer: "A solicitação de aumento de limite pode ser feita pelo aplicativo Verdecard, na seção 'Limites'. A análise é automática e leva em consideração seu histórico de uso." },
        { id: 5, question: "O que é o cashback?", keywords: ["cashback", "dinheiro de volta"], answer: "Cashback é um benefício que retorna parte do valor gasto em suas compras. Verifique os termos do seu cartão Verdecard no aplicativo para saber mais sobre o programa." },
        { id: 6, question: "Quais são os canais de atendimento?", keywords: ["atendimento", "falar", "contato", "ajuda", "suporte", "chamado", "sac"], answer: "Nossos canais de atendimento incluem o telefone 0800 123 4567, chat online no site e aplicativo, e as redes sociais." },
        { id: 7, question: "Suspeita de fraude no cartão.", keywords: ["fraude", "suspeita", "compra desconhecida", "clonaram", "bloqueio"], answer: "Se suspeitar de fraude, bloqueie seu cartão imediatamente pelo aplicativo ou ligue para a central de atendimento e conteste as compras desconhecidas." },
        { id: 8, question: "Como mudar meu e-mail?", keywords: ["mudar", "alterar", "email", "e-mail", "cadastro", "dados", "chamado", "sac"], answer: "Para alterar seu e-mail de cadastro, acesse a área logada no site ou aplicativo, vá em 'Meu Perfil' ou 'Dados Cadastrais' e siga as instruções." },
        { id: 10, question: "Onde consigo meu extrato?", keywords: ["extrato", "lançamentos", "gastos", "data base"], answer: "Seu extrato pode ser visualizado e baixado no aplicativo Verdecard ou na área do cliente em nosso site, na seção 'Extratos e Lançamentos'." },
        { id: 11, question: "Minha fatura está com valor errado.", keywords: ["valor errado", "compra indevida", "contestar", "reclamar", "data base"], answer: "Se você não reconhece um lançamento na sua fatura, entre em contato imediatamente com nossa central de atendimento para que possamos analisar e, se for o caso, contestar a compra." }
    ];

    function populateThemes() {
        Object.keys(themesAndSubthemes).forEach(theme => {
            const option = document.createElement('option');
            option.value = theme;
            option.textContent = theme;
            themeSelect.appendChild(option);
        });
    }

    function handleThemeChange() {
        const selectedTheme = themeSelect.value;
        subthemeSelect.innerHTML = '<option value="" disabled selected>Aguardando tema...</option>';
        subthemeSelect.disabled = true;
        inputPergunta.disabled = true;
        askButton.disabled = true;

        if (selectedTheme && themesAndSubthemes[selectedTheme]) {
            subthemeSelect.innerHTML = '<option value="" disabled selected>Selecione...</option>';
            Object.keys(themesAndSubthemes[selectedTheme]).forEach(subtheme => {
                const option = document.createElement('option');
                option.value = subtheme;
                option.textContent = subtheme;
                subthemeSelect.appendChild(option);
            });
            subthemeSelect.disabled = false;
        }
    }

    function handleSubthemeChange() {
        if (subthemeSelect.value) {
            inputPergunta.disabled = false;
            askButton.disabled = false;
            inputPergunta.focus();
        }
    }

    function getAnswer(userQuestion, theme, subtheme) {
        const relevantIds = themesAndSubthemes[theme]?.[subtheme] || [];
        if (relevantIds.length === 0) return "Não encontrei informações para este assunto.";

        const qaSet = mockQA.filter(qa => relevantIds.includes(qa.id));
        if (qaSet.length === 0) return "Ocorreu um erro ao buscar respostas para este assunto.";

        if (!userQuestion.trim()) {
            return qaSet[0].answer;
        }

        const questionWords = userQuestion.toLowerCase().trim().split(/\s+/);
        let bestMatch = { score: -1, answer: qaSet[0].answer };

        qaSet.forEach(qa => {
            let currentScore = 0;
            questionWords.forEach(word => {
                if (word.length > 2 && qa.keywords.some(kw => kw.includes(word))) {
                    currentScore++;
                }
            });
            if (currentScore > bestMatch.score) {
                bestMatch = { score: currentScore, answer: qa.answer };
            }
        });
        return bestMatch.answer;
    }

    function handleAsk() {
        const selectedTheme = themeSelect.value;
        const selectedSubtheme = subthemeSelect.value;
        if (!selectedTheme || !selectedSubtheme) {
            alert("Por favor, selecione um tema e um assunto.");
            return;
        }
        const userQuestion = inputPergunta.value;
        ultimaPerguntaFeita = `${selectedTheme} > ${selectedSubtheme}: ${userQuestion}`;
        const answer = getAnswer(userQuestion, selectedTheme, selectedSubtheme);
        answerArea.value = answer;
        respostaSolucao.innerHTML = '';
    }
    
    function handleNaoUtil() {
        if (!ultimaPerguntaFeita) return;
        const naoCadastrados = JSON.parse(localStorage.getItem('mockAssuntos')) || [];
        const jaExiste = naoCadastrados.some(item => item.pergunta.toLowerCase() === ultimaPerguntaFeita.toLowerCase());

        if (!jaExiste) {
            const novoAssunto = { id: Date.now(), categoria: 'Não Categorizado', subcategoria: 'Chatbot', pergunta: ultimaPerguntaFeita, status: 'pendente' };
            naoCadastrados.push(novoAssunto);
            localStorage.setItem('mockAssuntos', JSON.stringify(naoCadastrados));
            respostaSolucao.innerHTML = "<i>Registrada como assunto não cadastrado.</i>";
        } else {
            respostaSolucao.innerHTML = "<i>Pergunta já feita, será analisada!.</i>";
        }
        ultimaPerguntaFeita = '';
    }

    // --- EVENT LISTENERS E INICIALIZAÇÃO ---
    setupSessionManagement();
    populateThemes();
    themeSelect.addEventListener('change', handleThemeChange);
    subthemeSelect.addEventListener('change', handleSubthemeChange);
    askButton.addEventListener('click', handleAsk);
    inputPergunta.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleAsk(); });
    btnNao.addEventListener('click', handleNaoUtil);
});