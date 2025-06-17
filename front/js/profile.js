document.addEventListener('DOMContentLoaded', () => {


    const hamburger = document.getElementById('hamburger');
    const aside = document.querySelector('aside');

    // --- Simulação de um usuário logado ---
    // Em uma aplicação real, estes dados viriam do backend após o login.
    const loggedInUser = {
        id: 101,
        name: 'User Verdecard',
        email: 'user.@verdecard.com',
        accessType: 'Administrador' 
    };

    // --- Seleção dos Elementos do Formulário ---
    const profileForm = document.getElementById('profile-form');
    const nameInput = document.getElementById('profile-name');
    const emailInput = document.getElementById('profile-email');
    const accessTypeInput = document.getElementById('profile-access-type');
    const currentPasswordInput = document.getElementById('current-password');
    const newPasswordInput = document.getElementById('new-password');


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

    /**
     * Preenche o formulário com os dados do usuário mockado.
     */
    function populateForm() {
        if (loggedInUser) {
            nameInput.value = loggedInUser.name;
            emailInput.value = loggedInUser.email;
            accessTypeInput.value = loggedInUser.accessType;
        }
    }

    /**
     * Lida com o envio do formulário.
     */
    function handleProfileUpdate(event) {
        event.preventDefault(); // Impede o recarregamento da página

        // --- Atualiza Dados Pessoais ---
        const newName = nameInput.value.trim();
        const newEmail = emailInput.value.trim();

        if (!newName || !newEmail) {
            alert('Nome e E-mail são campos obrigatórios.');
            return;
        }

        // Atualiza os dados do nosso usuário simulado
        loggedInUser.name = newName;
        loggedInUser.email = newEmail;
        console.log('Dados atualizados:', loggedInUser);
        
        // --- Lógica para Alteração de Senha ---
        const currentPassword = currentPasswordInput.value;
        const newPassword = newPasswordInput.value;

        // A alteração de senha só é tentada se o campo "Nova Senha" for preenchido
        if (newPassword.length > 0) {
            if (currentPassword.length === 0) {
                alert('Para alterar a senha, você precisa fornecer sua senha atual.');
                return;
            }
            // Simulação: em um app real, a senha atual seria verificada no servidor.
            // Aqui, vamos apenas assumir que qualquer coisa digitada é válida para a simulação.
            if (newPassword.length < 6) {
                alert('A nova senha deve ter no mínimo 6 caracteres.');
                return;
            }
            
            console.log('Simulação: Senha alterada com sucesso!');
        }

        alert('Perfil atualizado com sucesso!');
        // Limpa os campos de senha por segurança após o envio
        currentPasswordInput.value = '';
        newPasswordInput.value = '';
    }


    // --- Inicialização ---
    populateForm(); // Preenche o formulário quando a página carrega
    profileForm.addEventListener('submit', handleProfileUpdate); // Adiciona o "ouvinte" ao formulário

});