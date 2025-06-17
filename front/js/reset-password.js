document.addEventListener('DOMContentLoaded', () => {

    const resetPasswordForm = document.getElementById('reset-password-form');


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
     * Simula a validação do token da URL.
     * Em um app real, se o token for inválido, o usuário seria bloqueado ou redirecionado.
     */
    function validateToken() {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');

        if (token) {
            console.log(`Simulação: Validando o token "${token}"... Token considerado válido.`);
        } else {
            console.warn('Atenção: Nenhum token de redefinição encontrado na URL. Permitindo o fluxo para fins de demonstração.');
            // Em um app real:
            // alert('Link de redefinição inválido ou expirado.');
            // window.location.href = './forgot-password.html';
        }
    }

    // Lida com o envio do formulário de redefinição de senha
    resetPasswordForm.addEventListener('submit', (event) => {
        event.preventDefault(); // Impede o recarregamento da página

        const newPasswordInput = document.getElementById('new-password');
        const confirmPasswordInput = document.getElementById('confirm-password');

        const newPassword = newPasswordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        // --- VALIDAÇÃO ---
        if (!newPassword || !confirmPassword) {
            alert('Por favor, preencha os dois campos de senha.');
            return;
        }

        if (newPassword.length < 6) {
            alert('A nova senha deve ter no mínimo 6 caracteres.');
            return;
        }

        if (newPassword !== confirmPassword) {
            alert('As senhas digitadas não são iguais. Por favor, tente novamente.');
            return;
        }

        // --- SUCESSO ---
        // Simulação: A senha foi atualizada no backend.
        console.log('Simulação: Senha redefinida com sucesso!');
        alert('Sua senha foi redefinida com sucesso! Você será redirecionado para a tela de login.');

        // Redireciona o usuário para a tela de login após 2 segundos
        setTimeout(() => {
            window.location.href = './login.html';
        }, 2000);
    });

    // Executa a validação do token assim que a página carrega
    validateToken();
});