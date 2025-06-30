import { apiLoginService } from './services/apiLoginService.js';

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password'); 
    const loginStatusMessage = document.getElementById('login-status-message');

    
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault(); 
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        if (email === '' || password === '') {
            alert('Por favor, preencha todos os campos.');
            return;
        }

        try {
            if (loginStatusMessage) {
                loginStatusMessage.textContent = 'A autenticar...';
                loginStatusMessage.style.color = '#333';
                loginStatusMessage.style.display = 'block';
            }

            // Chama a API para tentar fazer o login
            const loginData = await apiLoginService.login(email, password);

            if (loginData.token && loginData.usuario) {
                // 1. Guarda o token e os dados do utilizador no localStorage
                localStorage.setItem('authToken', loginData.token);
                localStorage.setItem('loggedInUser', JSON.stringify(loginData.usuario));

                // 2. Configura a gestão da sessão
                const sessionId = Date.now().toString();
                localStorage.setItem('active_session_id', sessionId);
                sessionStorage.setItem('my_tab_session_id', sessionId);
                localStorage.setItem('last_activity_time', Date.now());

                // 3. Redireciona com base no perfil do utilizador
                const perfilNome = loginData.usuario.perfil.nome;
                if (perfilNome.toLowerCase() === 'administrador') {
                    window.location.href = './pages/dasboard.html';
                } else {
                    window.location.href = './pages/chatbot.html';
                }
            }

        } catch (error) {
            // Captura e exibe o erro retornado pela API
            console.error('Falha no login:', error);
            if (loginStatusMessage) {
                loginStatusMessage.textContent = error.message;
                loginStatusMessage.style.color = 'red';
            } else {
                alert(error.message);
            }
        }
    });
});
