document.addEventListener('DOMContentLoaded', () => {

    const forgotPasswordForm = document.getElementById('forgot-password-form');
    const formContainer = document.getElementById('form-container');
    const confirmationContainer = document.getElementById('confirmation-container');

    


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

    // Adiciona um "ouvinte" para o evento de envio do formulário
    forgotPasswordForm.addEventListener('submit', (event) => {
        // Impede que a página recarregue, que é o comportamento padrão de um formulário
        event.preventDefault();

        const emailInput = document.getElementById('email');
        const email = emailInput.value;

        // Validação simples para verificar se o e-mail não está vazio
        if (!email) {
            alert('Por favor, insira seu endereço de e-mail.');
            return;
        }

        // --- SIMULAÇÃO DE ENVIO ---
        // Em uma aplicação real, aqui você faria uma chamada para o seu backend (API)
        // para que ele enviasse o e-mail de verdade.
        console.log(`Simulação: Enviando link de redefinição para o e-mail: ${email}`);
        
        // --- ATUALIZAÇÃO DA INTERFACE ---
        // Esconde o formulário
        formContainer.style.display = 'none';
        
        // Mostra a mensagem de confirmação
        confirmationContainer.style.display = 'flex'; // Usamos 'flex' para centralizar o conteúdo
    });

});