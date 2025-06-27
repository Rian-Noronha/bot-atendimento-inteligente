// Importa os serviços necessários
import { apiUsuarioService } from './services/apiUsuarioService.js';
import { apiPerfilService } from './services/apiPerfilService.js'; // Para carregar os tipos de acesso

document.addEventListener('DOMContentLoaded', async () => {
    // Seleção dos elementos do formulário
    const regNomeInput = document.getElementById('reg-nome');
    const regEmailInput = document.getElementById('reg-email');
    const regSenhaInput = document.getElementById('reg-senha');
    const regTipoAcessoSelect = document.getElementById('reg-tipo-acesso'); // Seleciona o SELECT do REGISTRO
    const btnCadastrar = document.getElementById('btn-cadastrar');
    const backButton = document.querySelector('.back-button');

    // Carregar os perfis no select ao carregar a página
    async function carregarPerfis() {
        try {
            const perfis = await apiPerfilService.pegarTodos();
            // Limpa as opções existentes (exceto a padrão se houver)
            regTipoAcessoSelect.innerHTML = '<option value="" disabled selected>Selecione o Tipo de Acesso</option>';
            
            perfis.forEach(perfil => {
                const option = document.createElement('option');
                option.value = perfil.id; // Define o ID como valor
                option.textContent = perfil.nome; // Define o nome como texto visível
                regTipoAcessoSelect.appendChild(option);
            });
        } catch (error) {
            console.error("Erro ao carregar perfis:", error);
            alert("Não foi possível carregar os tipos de acesso. Tente novamente mais tarde.");
            // Opcional: desabilitar o botão de cadastro se os perfis não carregarem
            btnCadastrar.disabled = true;
        }
    }

    // Chamada inicial para carregar os perfis
    await carregarPerfis(); // Certifique-se que o backend está rodando e o endpoint de perfis funciona!


    // Adiciona o listener para o botão de cadastro
    btnCadastrar.addEventListener('click', async (event) => {
        event.preventDefault(); // Impede o comportamento padrão de envio do formulário

        const nome = regNomeInput.value.trim();
        const email = regEmailInput.value.trim();
        const senha = regSenhaInput.value.trim();
        const perfil_id = parseInt(regTipoAcessoSelect.value); // Pega o ID numérico

        // Validações básicas no frontend
        if (!nome || !email || !senha) {
            alert('Por favor, preencha todos os campos obrigatórios.');
            return;
        }

        if (isNaN(perfil_id) || perfil_id === 0) { // Assumindo que 0 não é um ID válido
            alert('Por favor, selecione um tipo de acesso válido.');
            return;
        }
        
        // Validação de email simples (pode ser mais robusta)
        if (!email.includes('@') || !email.includes('.')) {
            alert('Por favor, insira um e-mail válido.');
            return;
        }

        try {
            // Objeto com os dados do novo usuário
            const novoUsuario = {
                nome: nome,
                email: email,
                senha: senha,
                perfil_id: perfil_id,
                ativo: true // Exemplo: novo usuário é ativo por padrão
            };

            // Chama o serviço para criar o usuário
            const usuarioCriado = await apiUsuarioService.criar(novoUsuario);

            alert('Usuário cadastrado com sucesso!');
            console.log('Usuário criado:', usuarioCriado);

            // Opcional: Limpar o formulário ou redirecionar
            regNomeInput.value = '';
            regEmailInput.value = '';
            regSenhaInput.value = '';
            regTipoAcessoSelect.value = ''; // Reseta para a opção padrão
            
            // Redireciona para a tela de usuários ou login, por exemplo
            window.location.href = './users.html'; 

        } catch (error) {
            console.error('Erro ao cadastrar usuário:', error);
            alert(`Erro ao cadastrar usuário: ${error.message || 'Verifique os dados e tente novamente.'}`);
        }
    });

    // Listener para o botão "Voltar"
    if (backButton) {
        backButton.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = './users.html';
        });
    }
});