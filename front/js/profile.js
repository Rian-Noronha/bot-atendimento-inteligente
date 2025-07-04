// Importe todos os serviços de API necessários
import { apiAuthService } from './services/apiAuthService.js';
import { apiUsuarioService } from './services/apiUsuarioService.js';

document.addEventListener('DOMContentLoaded', () => {

    // --- Seleção de Elementos ---
    const hamburger = document.getElementById('hamburger');
    const aside = document.querySelector('aside');
    const profileForm = document.getElementById('profile-form');
    const nameInput = document.getElementById('profile-name');
    const emailInput = document.getElementById('profile-email');
    const accessTypeInput = document.getElementById('profile-access-type');
    const currentPasswordInput = document.getElementById('current-password');
    const newPasswordInput = document.getElementById('new-password');
    const logoutButton = document.getElementById('logout-btn');

    // Variável para guardar os dados do usuário que virão da API
    let currentUser = null;

    // --- Seu código de timeout e sessão (mantido) ---
    // ... (o código de timeout e sessão entre abas que você já tem está perfeito aqui)


    /**
     * Busca os dados do usuário logado na API e preenche o formulário.
     */
    async function inicializarPagina() {
        try {
            // Chama a API para buscar os dados do usuário do token
            currentUser = await apiAuthService.getMe();
            
            if (currentUser) {
                nameInput.value = currentUser.nome;
                emailInput.value = currentUser.email;
                accessTypeInput.value = currentUser.perfil ? currentUser.perfil.nome : 'Não definido';

                // Desabilita a troca de perfil se o usuário não for admin
                if (!currentUser.perfil || currentUser.perfil.nome.toLowerCase() !== 'administrador') {
                    accessTypeInput.disabled = true;
                }
            }
        } catch (error) {
            console.error('Erro ao carregar dados do perfil:', error);
            alert('Não foi possível carregar seus dados. Sua sessão pode ter expirado.');
            // Se falhar (ex: token inválido), desloga o usuário
            localStorage.clear();
            window.location.href = '../index.html';
        }
    }

    /**
     * Lida com o envio do formulário, chamando as APIs de atualização.
     */
    async function handleProfileUpdate(event) {
        event.preventDefault();
        
        // Pega os dados do formulário
        const updatedUserData = {
            nome: nameInput.value.trim(),
            email: emailInput.value.trim(),
            // Inclui o perfil_id se o campo estiver habilitado (só para admins)
            perfil_id: accessTypeInput.disabled ? undefined : parseInt(accessTypeInput.value)
        };

        const senhaAtual = currentPasswordInput.value;
        const novaSenha = newPasswordInput.value;
        const submitButton = profileForm.querySelector('button[type="submit"]');

        try {
            submitButton.disabled = true;
            submitButton.textContent = 'Salvando...';

            // 1. Atualiza os dados básicos (nome e e-mail)
            await apiUsuarioService.atualizar(currentUser.id, updatedUserData);
            
            // 2. Se o campo de nova senha foi preenchido, tenta atualizar a senha
            if (novaSenha) {
                if (!senhaAtual) {
                    throw new Error('Para alterar a senha, você precisa fornecer sua senha atual.');
                }
                await apiAuthService.updatePassword(senhaAtual, novaSenha);
            }

            alert('Perfil atualizado com sucesso!');
            // Limpa os campos de senha por segurança
            currentPasswordInput.value = '';
            newPasswordInput.value = '';

        } catch (error) {
            console.error('Erro ao atualizar perfil:', error);
            alert(`Falha na atualização: ${error.message}`);
        } finally {
            // Reabilita o botão ao final, com sucesso ou erro
            submitButton.disabled = false;
            submitButton.textContent = 'Salvar Alterações';
        }
    }


    // --- Lógica do Hamburger Menu ---
    if (hamburger && aside) { /* ...código existente... */ }


    // --- Lógica de Logout ---
    if (logoutButton) {
        logoutButton.addEventListener('click', async (event) => {
            event.preventDefault();
            try {
                await apiAuthService.logout();
            } catch (error) {
                console.error('Erro ao encerrar sessão no servidor:', error);
            } finally {
                localStorage.clear();
                sessionStorage.clear();
                window.location.href = '../index.html';
            }
        });
    }

    // --- Inicialização ---
    inicializarPagina(); // Busca dados reais em vez de usar o mock
    profileForm.addEventListener('submit', handleProfileUpdate); 
});