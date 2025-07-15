// js/profile.js

// 1. Importa os serviços de API necessários para a página
import { apiAuthService } from './services/apiAuthService.js';
import { apiUsuarioService } from './services/apiUsuarioService.js';

// 2. Importa o nosso novo gerenciador de sessão centralizado
import { startSessionManagement } from './utils/sessionManager.js';

document.addEventListener('DOMContentLoaded', () => {
    // 3. Inicia toda a lógica de segurança (timeout, abas, etc.) com uma única chamada
    startSessionManagement();

    // --- SELEÇÃO DE ELEMENTOS ESPECÍFICOS DA PÁGINA ---
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
                // A lógica de limpar o storage e redirecionar já está no sessionManager,
                // mas podemos garantir que aconteça aqui também para uma resposta imediata.
                localStorage.clear();
                sessionStorage.clear();
                window.location.href = '../index.html';
            }
        });
    }

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
                // O perfil agora vem aninhado no objeto
                accessTypeInput.value = currentUser.perfil ? currentUser.perfil.nome : 'Não definido';

                // Desabilita a troca de perfil se o usuário não for admin
                if (!currentUser.perfil || currentUser.perfil.nome.toLowerCase() !== 'administrador') {
                    accessTypeInput.disabled = true;
                }
            }
        } catch (error) {
            // O handleResponseError no serviço de API já irá deslogar o usuário em caso de 401.
            // Aqui podemos apenas logar o erro.
            console.error('Erro ao carregar dados do perfil:', error);
            alert('Não foi possível carregar seus dados. Verifique sua conexão e tente novamente.');
        }
    }

    /**
     * Lida com o envio do formulário, chamando as APIs de atualização.
     */
    async function handleProfileUpdate(event) {
        event.preventDefault();
        
        const updatedUserData = {
            nome: nameInput.value.trim(),
            email: emailInput.value.trim(),
        };

        const senhaAtual = currentPasswordInput.value;
        const novaSenha = newPasswordInput.value;
        const submitButton = profileForm.querySelector('button[type="submit"]');

        try {
            submitButton.disabled = true;
            submitButton.textContent = 'Salvando...';

            // 1. Atualiza os dados básicos (nome e e-mail)
            // A rota de atualizar usuário é diferente da de atualizar senha
            await apiUsuarioService.atualizar(currentUser.id, updatedUserData);
            
            // 2. Se o campo de nova senha foi preenchido, tenta atualizar a senha
            if (novaSenha) {
                if (!senhaAtual) {
                    throw new Error('Para alterar a senha, você precisa fornecer sua senha atual.');
                }
                if (novaSenha.length < 6) {
                    throw new Error('A nova senha deve ter no mínimo 6 caracteres.');
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

    // --- INICIALIZAÇÃO ---
    inicializarPagina(); // Busca dados reais em vez de usar o mock
    profileForm.addEventListener('submit', handleProfileUpdate); 
});
