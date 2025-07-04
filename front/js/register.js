import { apiUsuarioService } from './services/apiUsuarioService.js';
import { apiPerfilService } from './services/apiPerfilService.js'; // Para carregar os tipos de acesso

document.addEventListener('DOMContentLoaded', async () => {
    const regNomeInput = document.getElementById('reg-nome');
    const regEmailInput = document.getElementById('reg-email');
    const regSenhaInput = document.getElementById('reg-senha');
    const regTipoAcessoSelect = document.getElementById('reg-tipo-acesso'); // Seleciona o SELECT do REGISTRO
    const btnCadastrar = document.getElementById('btn-cadastrar');
    const backButton = document.querySelector('.back-button');

    async function carregarPerfis() {
        try {
            const perfis = await apiPerfilService.pegarTodos();
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
            btnCadastrar.disabled = true;
        }
    }

   
    await carregarPerfis(); 


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

        if (isNaN(perfil_id) || perfil_id === 0) {
            alert('Por favor, selecione um tipo de acesso válido.');
            return;
        }
        
        // Validação de email simples (tornar mais robusta)
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
                ativo: true
            };

            const usuarioCriado = await apiUsuarioService.criar(novoUsuario);

            alert('Usuário cadastrado com sucesso!');
            console.log('Usuário criado:', usuarioCriado);

            regNomeInput.value = '';
            regEmailInput.value = '';
            regSenhaInput.value = '';
            regTipoAcessoSelect.value = ''; // Reseta para a opção padrão
            
            window.location.href = './users.html'; 

        } catch (error) {
            console.error('Erro ao cadastrar usuário:', error);
            alert(`Erro ao cadastrar usuário: ${error.message || 'Verifique os dados e tente novamente.'}`);
        }
    });

    if (backButton) {
        backButton.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = './users.html';
        });
    }
});