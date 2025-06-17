document.addEventListener('DOMContentLoaded', () => {

    const hamburger = document.getElementById('hamburger');
    const aside = document.querySelector('aside');
    const userSearchInput = document.getElementById('user-search-input');
    const numUsersDisplayInput = document.getElementById('num-users-display');
    const userTableBody = document.querySelector('#user-table tbody');
    const noUsersMessage = document.getElementById('no-users-message');
    const addUserButton = document.getElementById('add-user-button');


    const editUserModal = document.getElementById('edit-user-modal');
    const editUserForm = document.getElementById('edit-user-form');
    const editUserId = document.getElementById('edit-user-id');
    const editUserName = document.getElementById('edit-user-name');
    const editUserEmail = document.getElementById('edit-user-email');
    const editUserType = document.getElementById('edit-user-type');
    const btnSave = editUserModal.querySelector('.btn-save');
    const btnCancel = editUserModal.querySelector('.btn-cancel');


    let mockUsers = [
        { id: 1, name: 'Mariana Wolff de Souza', email: 'mariana.admin@example.com', type: 'administrador' },
        { id: 2, name: 'João Silva', email: 'joao.operador@example.com', type: 'operador' },
        { id: 3, name: 'Maria Santos', email: 'maria.operador@example.com', type: 'operador' },
        { id: 4, name: 'Pedro Costa', email: 'pedro.admin@example.com', type: 'administrador' },
        { id: 5, name: 'Ana Pereira', email: 'ana.operador@example.com', type: 'operador' },
        { id: 6, name: 'Carlos Lima', email: 'carlos.operador@example.com', type: 'operador' },
        { id: 7, name: 'Juliana Almeida', email: 'juliana.admin@example.com', type: 'administrador' },
        { id: 8, name: 'Fernando Rocha', email: 'fernando.operador@example.com', type: 'operador' },
        { id: 9, name: 'Beatriz Gomes', email: 'beatriz.operador@example.com', type: 'operador' },
        { id: 10, name: 'Rafael Martins', email: 'rafael.admin@example.com', type: 'administrador' },
    ];

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


      function renderUsers() {
        userTableBody.innerHTML = ''; // Limpa o corpo da tabela

        let filteredUsers = [...mockUsers];

        const searchTerm = userSearchInput.value.toLowerCase().trim();
        if (searchTerm) {
            filteredUsers = filteredUsers.filter(user =>
                user.name.toLowerCase().includes(searchTerm) ||
                user.email.toLowerCase().includes(searchTerm)
            );
        }

        const numToDisplay = parseInt(numUsersDisplayInput.value);
        if (!isNaN(numToDisplay) && numToDisplay > 0) {
            filteredUsers = filteredUsers.slice(0, numToDisplay);
        }

        if (filteredUsers.length === 0) {
            noUsersMessage.style.display = 'block';
            userTableBody.style.display = 'none';
        } else {
            noUsersMessage.style.display = 'none';
            userTableBody.style.display = 'table-row-group';
            
            // OBTER OS CABEÇALHOS DA TABELA (COM data-label)
            // É importante selecionar os THs para que os data-labels sejam corretos.
            const headers = Array.from(document.querySelectorAll('#user-table thead th')).map(th => th.dataset.label || th.textContent);

            filteredUsers.forEach(user => {
                const row = userTableBody.insertRow(); // Cria a TR
                row.dataset.userId = user.id;

                // Célula do Nome
                const userNameCell = row.insertCell(); // Cria a TD para o Nome
                userNameCell.dataset.label = headers[0]; // Adiciona o data-label
                userNameCell.innerHTML = `<span class="td-value">${user.name}</span>`; // Envolve o conteúdo em span

                // Célula do E-mail
                const userEmailCell = row.insertCell(); // Cria a TD para o E-mail
                userEmailCell.dataset.label = headers[1]; // Adiciona o data-label
                userEmailCell.innerHTML = `<span class="td-value">${user.email}</span>`; // Envolve o conteúdo em span

                // Célula do Tipo de Acesso
                const userTypeCell = row.insertCell(); // Cria a TD para o Tipo de Acesso
                userTypeCell.dataset.label = headers[2]; // Adiciona o data-label
                userTypeCell.innerHTML = `<span class="td-value">${user.type.charAt(0).toUpperCase() + user.type.slice(1)}</span>`; // Envolve o conteúdo em span

                // Célula de Ações
                const userActionsCell = row.insertCell(); // Cria a TD para as Ações
                userActionsCell.dataset.label = headers[3]; // Adiciona o data-label
                userActionsCell.classList.add('user-actions');
                userActionsCell.innerHTML = `
                    <button class="btn-edit" data-id="${user.id}" title="Editar usuário"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000"><path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z"/></svg></button>
                    <button class="btn-delete" data-id="${user.id}" title="Excluir usuário"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000"><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/></svg></button>
                `;
            });
        }
    }




    function openEditModal(userId) {
        const user = mockUsers.find(u => u.id === userId);
        if (user) {
            editUserId.value = user.id;
            editUserName.value = user.name;
            editUserEmail.value = user.email;
            editUserType.value = user.type;
            editUserModal.style.display = 'flex';
        }
    }


    function closeEditModal() {
        editUserModal.style.display = 'none';
        editUserForm.reset();
    }


    editUserForm.addEventListener('submit', (event) => {
        event.preventDefault(); // evitar envio padrão do formulário

        const userId = parseInt(editUserId.value);
        const updatedName = editUserName.value.trim();
        const updatedEmail = editUserEmail.value.trim();
        const updatedType = editUserType.value;

        // Validação básica
        if (!updatedName || !updatedEmail) {
            alert('Nome e e-mail não podem estar vazios.');
            return;
        }

        const userIndex = mockUsers.findIndex(u => u.id === userId);
        if (userIndex !== -1) {
            mockUsers[userIndex] = {
                ...mockUsers[userIndex], // copiar as propriedades existentes
                name: updatedName,
                email: updatedEmail,
                type: updatedType
            };
            alert('Usuário atualizado com sucesso (simulação)!');
            closeEditModal();
            renderUsers(); // re-renderiza a tabela para mostrar as alterações
        } else {
            alert('Erro: Usuário não encontrado para atualização.');
        }
    });

    // event listener para o botão Cancelar do modal
    btnCancel.addEventListener('click', closeEditModal);

    userTableBody.addEventListener('click', (event) => {
        const targetButton = event.target.closest('button');
        if (!targetButton) return; // não clicou em um botão, sai

        const userId = parseInt(targetButton.dataset.id); // Pega o ID do usuário do data-id do botão

        if (isNaN(userId)) return;

        if (targetButton.classList.contains('btn-edit')) {
            openEditModal(userId);
        } else if (targetButton.classList.contains('btn-delete')) {
            if (confirm(`Tem certeza que deseja excluir o usuário "${mockUsers.find(u => u.id === userId)?.name}"?`)) {
                mockUsers = mockUsers.filter(user => user.id !== userId);
                alert('Usuário excluído com sucesso (simulação)!');
                renderUsers(); // Re-renderiza a tabela
            }
        }
    });




    addUserButton.addEventListener('click', () => {
        alert('Redirecionando para a página de cadastro de novo usuário...');
        window.location.href = './register.html';
    });



    // pesquisa de usuários (aciona a renderização ao digitar)
    userSearchInput.addEventListener('input', renderUsers);

    // qtd de usuários a mostrar (aciona a renderização ao mudar o valor)
    numUsersDisplayInput.addEventListener('input', renderUsers);

    renderUsers(); // Renderiza a tabela de usuários ao carregar a página
});