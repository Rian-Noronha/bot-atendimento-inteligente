// Importa os serviços necessários no topo do ficheiro.
import { apiUsuarioService } from './services/apiUsuarioService.js';
import { apiPerfilService } from './services/apiPerfilService.js';

document.addEventListener('DOMContentLoaded', () => {
    // --- SELEÇÃO DE ELEMENTOS ---
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
    const btnCancel = editUserModal.querySelector('.btn-cancel');

    // Variável para guardar os dados da API. Declarada com 'let' para permitir reatribuição.
    let allUsers = [];

    // --- LÓGICA DE SESSÃO E TIMEOUT (sem alterações) ---
    const TIMEOUT_DURATION = 5 * 60 * 1000;
    let timeoutInterval;
    function resetTimeoutTimer() { localStorage.setItem('last_activity_time', Date.now()); }
    function logoutUser() {
        clearInterval(timeoutInterval);
        localStorage.clear();
        sessionStorage.clear();
        alert('A sua sessão expirou por inatividade. Por favor, inicie sessão novamente.');
        window.location.href = '../index.html';
    }
    function checkTimeout() {
        const lastActivityTime = parseInt(localStorage.getItem('last_activity_time') || '0', 10);
        if (Date.now() - lastActivityTime > TIMEOUT_DURATION) {
            logoutUser();
        }
    }
    function startTimeoutMonitoring() {
        const activityEvents = ['mousemove', 'mousedown', 'keypress', 'scroll', 'touchstart'];
        activityEvents.forEach(event => window.addEventListener(event, resetTimeoutTimer));
        timeoutInterval = setInterval(checkTimeout, 5000);
    }
    startTimeoutMonitoring();
    const currentSessionId = localStorage.getItem('active_session_id');
    if (!sessionStorage.getItem('my_tab_session_id')) {
        sessionStorage.setItem('my_tab_session_id', currentSessionId);
    } else if (sessionStorage.getItem('my_tab_session_id') !== currentSessionId) {
        alert('A sua sessão foi encerrada noutra aba.');
        window.location.href = '../index.html';
    }
    window.addEventListener('storage', (event) => {
        if (event.key === 'active_session_id' && event.newValue !== sessionStorage.getItem('my_tab_session_id')) {
            alert('A sua sessão foi encerrada porque iniciou sessão numa nova janela.');
            window.location.href = '../index.html';
        }
    });
    if (hamburger && aside) {
        hamburger.addEventListener('click', () => aside.classList.toggle('open'));
        document.addEventListener('click', (event) => {
            if (aside.classList.contains('open') && !aside.contains(event.target) && !hamburger.contains(event.target)) {
                aside.classList.remove('open');
            }
        });
    }

    /**
     * Busca todos os utilizadores através do serviço de API e renderiza a tabela.
     */
    async function fetchAndRenderUsers() {
        try {
            const usersFromAPI = await apiUsuarioService.pegarTodos();
            allUsers = usersFromAPI; 
            renderUsers(); 
        } catch (error) {
            console.error('Falha ao carregar utilizadores:', error);
            noUsersMessage.textContent = 'Falha ao carregar dados do servidor. Tente novamente mais tarde.';
            noUsersMessage.style.display = 'block';
            userTableBody.style.display = 'none';
        }
    }

    /**
     * Renderiza os utilizadores na tabela a partir da variável local 'allUsers'.
     */
    function renderUsers() {
        userTableBody.innerHTML = '';
        let filteredUsers = [...allUsers];

        const searchTerm = userSearchInput ? userSearchInput.value.toLowerCase().trim() : '';
        if (searchTerm) {
            filteredUsers = filteredUsers.filter(user =>
                user.nome.toLowerCase().includes(searchTerm) ||
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
            userTableBody.style.display = '';
            
            const headers = Array.from(document.querySelectorAll('#user-table thead th')).map(th => th.dataset.label || th.textContent);

            filteredUsers.forEach(user => {
                const row = userTableBody.insertRow();
                row.dataset.userId = user.id;
                
                // CORRIGIDO: Usa o objeto 'perfil' que vem da API.
                const perfilNome = user.perfil ? user.perfil.nome : 'N/A';

                row.innerHTML = `
                    <td data-label="${headers[0]}"><span class="td-value">${user.nome}</span></td>
                    <td data-label="${headers[1]}"><span class="td-value">${user.email}</span></td>
                    <td data-label="${headers[2]}"><span class="td-value">${perfilNome}</span></td>
                    <td data-label="${headers[3]}" class="user-actions">
                        <button class="btn-edit" data-id="${user.id}" title="Editar utilizador"><i class="bi bi-pencil-square"></i></button>
                        <button class="btn-delete" data-id="${user.id}" title="Excluir utilizador"><i class="bi bi-trash3-fill"></i></button>
                    </td>
                `;
            });
        }
    }

    /**
     * Abre o modal de edição e preenche os dados.
     */
    async function openEditModal(userId) {
        const user = allUsers.find(u => u.id === userId);
        if (user) {
            editUserId.value = user.id;
            editUserName.value = user.nome;
            editUserEmail.value = user.email;

            try {
                const perfis = await apiPerfilService.pegarTodos();
                // Limpa e adiciona uma opção padrão antes de preencher
                editUserType.innerHTML = '<option value="" disabled>Carregando Perfis...</option>'; // Opcional: manter "Carregando" até preencher
                
                perfis.forEach(perfil => {
                    const option = document.createElement('option');
                    option.value = perfil.id;
                    option.textContent = perfil.nome;
                    // CORRIGIDO: O backend retorna 'perfil_id'. Usamos essa chave para selecionar a opção correta.
                    if (user.perfil_id === perfil.id) {
                        option.selected = true;
                    }
                    editUserType.appendChild(option);
                });
                // Se nenhum perfil foi selecionado ou user.perfil_id era nulo, garanta que uma opção padrão seja selecionada.
                // Isso pode ser feito adicionando uma opção padrão com selected, e depois as dinâmicas.
                if (!user.perfil_id || !editUserType.value) { // Se não houver perfil_id ou o select ainda não tiver valor
                     editUserType.querySelector('option[value=""]').selected = true; // Seleciona a opção "Selecione..."
                }

            } catch (error) {
                console.error("Erro ao buscar perfis para o modal:", error);
                // Exemplo de como lidar com o erro no modal: desabilitar o select
                editUserType.innerHTML = '<option value="" disabled selected>Erro ao carregar perfis</option>';
                editUserType.disabled = true;
            }

            editUserModal.style.display = 'flex';
        }
    }

    function closeEditModal() {
        editUserModal.style.display = 'none';
        editUserForm.reset();
    }

    editUserForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const userId = parseInt(editUserId.value);
        const selectedPerfilId = parseInt(editUserType.value); // Obtém o valor selecionado

        const updatedData = {
            nome: editUserName.value.trim(),
            email: editUserEmail.value.trim(),
            perfil_id: selectedPerfilId // Usa o valor inteiro parseado
        };

        if (!updatedData.nome || !updatedData.email) {
            alert('Nome e e-mail não podem estar vazios.');
            return;
        }

        if (isNaN(selectedPerfilId)) {
            alert('Por favor, selecione um tipo de perfil.');
            return;
        }

        try {
            await apiUsuarioService.atualizar(userId, updatedData);
            alert('Utilizador atualizado com sucesso!');
            closeEditModal();
            fetchAndRenderUsers();
        } catch (error) {
            console.error(error);
            alert('Ocorreu um erro ao atualizar o utilizador.');
        }
    });

    btnCancel.addEventListener('click', closeEditModal);

    userTableBody.addEventListener('click', async (event) => {
        const targetButton = event.target.closest('button');
        if (!targetButton) return;
        const userId = parseInt(targetButton.dataset.id);
        if (isNaN(userId)) return;

        if (targetButton.classList.contains('btn-edit')) {
            openEditModal(userId);
        } else if (targetButton.classList.contains('btn-delete')) {
            const user = allUsers.find(u => u.id === userId);
            if (confirm(`Tem certeza que deseja excluir o utilizador "${user?.nome}"?`)) {
                try {
                    await apiUsuarioService.deletar(userId);
                    alert('Utilizador excluído com sucesso!');
                    fetchAndRenderUsers();
                } catch (error) {
                    console.error(error);
                    alert('Ocorreu um erro ao excluir o utilizador.');
                }
            }
        }
    });

    if (addUserButton) {
        addUserButton.addEventListener('click', () => {
            window.location.href = './register.html';
        });
    }
    
    if (userSearchInput) userSearchInput.addEventListener('input', renderUsers);
    if (numUsersDisplayInput) numUsersDisplayInput.addEventListener('input', renderUsers);

    // --- INICIALIZAÇÃO ---
    // CORRIGIDO: Chama a função com o nome correto.
    fetchAndRenderUsers();
});
