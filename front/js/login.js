document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form'); 

    const emailInput = document.getElementById('email'); 
    const passwordInput = document.getElementById('password'); 
   
    const mockUsers = [
        { email: 'admin@verdecard.com', password: 'admin123', type: 'administrador' },
        { email: 'operador1@verdecard.com', password: 'op123', type: 'operador' },
        { email: 'operador2@verdecard.com', password: 'op456', type: 'operador' }
    ];

    
    loginForm.addEventListener('submit', (event) => {
        event.preventDefault(); // impedir o envio padrão do formulário

        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

       
        if (email === '' || password === '') {
            alert('Por favor, preencha todos os campos.');
            return;
        }

        const user = mockUsers.find(
            u => u.email === email && u.password === password
        );

        if (user) {

            const sessionId = Date.now().toString();

            localStorage.setItem('active_session_id', sessionId);

            sessionStorage.setItem('my_tab_session_id', sessionId);

            localStorage.setItem('last_activity_time', Date.now());

            // redirecionar baseado no tipo de usuário
            if (user.type === 'administrador') {
                window.location.href = './pages/dasboard.html'; // sendo admin vá à dasboard
            } else if (user.type === 'operador') {
                window.location.href = './pages/chatbot.html'; // vá ao chatbot
            }
        } else {
            alert('Email ou senha incorretos. Tente novamente.');
        }
    });

});