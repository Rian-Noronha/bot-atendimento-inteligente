// 1. Importa os serviços de API necessários para a página
import { apiUsuarioService } from './services/apiUsuarioService.js';
import { apiPerfilService } from './services/apiPerfilService.js';
import { apiAuthService } from './services/apiAuthService.js';

// 2. Importa o nosso novo gerenciador de sessão centralizado
import { startSessionManagement } from './utils/sessionManager.js';

document.addEventListener('DOMContentLoaded', () => {
    // 3. Inicia toda a lógica de segurança (timeout, abas, etc.) com uma única chamada
    startSessionManagement();

    // --- SELEÇÃO DE ELEMENTOS ESPECÍFICOS DA PÁGINA ---
    const hamburger = document.getElementById('hamburger');
    const aside = document.querySelector('aside');
    const userSearchInput = document.getElementById('user-search-input');
    const numUsersDisplayInput = document.getElementById('num-users-display');
    const userTableBody = document.querySelector('#user-table tbody');
    const noUsersMessage = document.getElementById('no-users-message');
    const addUserButton = document.getElementById('add-user-button');
    const logoutButton = document.getElementById('logout-btn');

    // Seletores do Modal de Edição
    const editUserModal = document.getElementById('edit-user-modal');
    const editUserForm = document.getElementById('edit-user-form');
    const editUserId = document.getElementById('edit-user-id');
    const editUserName = document.getElementById('edit-user-name');
    const editUserEmail = document.getElementById('edit-user-email');
    const editUserType = document.getElementById('edit-user-type');
    const btnCancel = editUserModal.querySelector('.btn-cancel');

    // Variável para guardar os dados da API
    let allUsers = [];

    // --- LÓGICA ESPECÍFICA DA PÁGINA ---

    // Lógica do Hamburger Menu
    if (hamburger && aside) {
        hamburger.addEventListener('click', () => aside.classList.toggle('open'));
        document.addEventListener('click', (event) => {
            if (aside.classList.contains('open') && !aside.contains(event.target) && !hamburger.contains(event.target)) {
                aside.classList.remove('open');
            }
        });
    }

    // Lógica do botão de logout
    if (logoutButton) {
        logoutButton.addEventListener('click', async (event) => {
            event.preventDefault();
            try {
                await apiAuthService.logout();
            } catch (error) {
                console.error("Erro ao notificar o servidor sobre o logout:", error);
            } finally {
                localStorage.clear();
                sessionStorage.clear();
                window.location.href = '../index.html';
            }
        });
    }

    /**
     * Busca e renderiza os usuários.
     */
    async function fetchAndRenderUsers() {
        try {
            noUsersMessage.textContent = 'A carregar utilizadores...';
            noUsersMessage.style.display = 'block';
            userTableBody.style.display = 'none';

            const usersFromAPI = await apiUsuarioService.pegarTodos();
            allUsers = usersFromAPI;
            renderUsers();
        } catch (error) {
            console.error('Falha ao carregar utilizadores:', error);
            noUsersMessage.textContent = 'Falha ao carregar dados do servidor. Tente novamente mais tarde.';
        }
    }

    /**
     * Renderiza a tabela com base nos dados filtrados.
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
            noUsersMessage.textContent = 'Nenhum utilizador encontrado.';
            noUsersMessage.style.display = 'block';
            userTableBody.style.display = 'none';
        } else {
            noUsersMessage.style.display = 'none';
            userTableBody.style.display = '';
            
            const headers = Array.from(document.querySelectorAll('#user-table thead th')).map(th => th.dataset.label || th.textContent);

            filteredUsers.forEach(user => {
                const row = userTableBody.insertRow();
                row.dataset.userId = user.id;
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
     * Abre e preenche o modal de edição.
     */
    async function openEditModal(userId) {
        const user = allUsers.find(u => u.id === userId);
        if (user) {
            editUserId.value = user.id;
            editUserName.value = user.nome;
            editUserEmail.value = user.email;

            try {
                const perfis = await apiPerfilService.pegarTodos();
                editUserType.innerHTML = '<option value="" disabled>A carregar Perfis...</option>';
                
                perfis.forEach(perfil => {
                    const option = document.createElement('option');
                    option.value = perfil.id;
                    option.textContent = perfil.nome;
                    if (user.perfil_id === perfil.id) {
                        option.selected = true;
                    }
                    editUserType.appendChild(option);
                });
            } catch (error) {
                console.error("Erro ao buscar perfis para o modal:", error);
                editUserType.innerHTML = '<option value="" disabled selected>Erro ao carregar perfis</option>';
            }

            editUserModal.style.display = 'flex';
        }
    }

    function closeEditModal() {
        editUserModal.style.display = 'none';
        editUserForm.reset();
    }

    // Lida com a submissão do formulário de edição
    editUserForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const userId = parseInt(editUserId.value);
        const selectedPerfilId = parseInt(editUserType.value);

        const updatedData = {
            nome: editUserName.value.trim(),
            email: editUserEmail.value.trim(),
            perfil_id: selectedPerfilId
        };

        if (!updatedData.nome || !updatedData.email || isNaN(selectedPerfilId)) {
            alert('Todos os campos são obrigatórios.');
            return;
        }

        try {
            await apiUsuarioService.atualizar(userId, updatedData);
            alert('Utilizador atualizado com sucesso!');
            closeEditModal();
            fetchAndRenderUsers();
        } catch (error) {
            console.error(error);
            alert(`Ocorreu um erro ao atualizar o utilizador: ${error.message}`);
        }
    });

    // Lida com os cliques na tabela para editar ou deletar
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
                    alert(`Ocorreu um erro ao excluir o utilizador: ${error.message}`);
                }
            }
        }
    });

    // --- Outros Listeners e Inicialização ---
    if (addUserButton) {
        addUserButton.addEventListener('click', () => {
            window.location.href = './register.html';
        });
    }
    btnCancel.addEventListener('click', closeEditModal);
    if (userSearchInput) userSearchInput.addEventListener('input', renderUsers);
    if (numUsersDisplayInput) numUsersDisplayInput.addEventListener('input', renderUsers);

    fetchAndRenderUsers();
});
