import { apiCategoriaService } from './services/apiCategoriaService.js';
import { apiPalavraChaveService } from './services/apiPalavraChaveService.js';
import { apiKnowledgeLibraryService } from './services/apiKnowledgeLibraryService.js';

document.addEventListener('DOMContentLoaded', () => {
    const themeSelect = document.getElementById('select-theme');
    const subthemeSelect = document.getElementById('select-subtheme');
    const uploadButton = document.getElementById('uploadButton');
    const uploadStatus = document.getElementById('uploadStatus');
    const documentTitleInput = document.getElementById('document-title');
    const documentDescriptionTextarea = document.getElementById('document-description');
    const documentKeywordsInput = document.getElementById('document-keywords');
    const textSolutionTextarea = document.getElementById('text-solution');
    const formContainer = document.querySelector('.form-document-details');
    const logoutButton = document.getElementById('logout-btn'); 
    
    // --- LÓGICA DE SESSÃO E TIMEOUT (PARTE RESTAURADA) ---
    // --- LÓGICA DE SESSÃO E TIMEOUT (PARTE RESTAURADA) ---

    const TIMEOUT_DURATION = 5 * 60 * 1000; // 5 minutos
    let timeoutInterval;

    function resetTimeoutTimer() {
        localStorage.setItem('last_activity_time', Date.now());
    }

    async function logoutUser(isTimeout = false) {
        clearInterval(timeoutInterval);
        if (isTimeout) {
            alert('Sua sessão expirou por inatividade. Por favor, faça login novamente.');
        }
        try {
            await apiAuthService.logout();
        } catch (error) {
            console.error("Erro ao encerrar sessão no servidor:", error);
        } finally {
            localStorage.clear();
            sessionStorage.clear();
            window.location.href = '../index.html';
        }
    }

    function checkTimeout() {
        const lastActivityTime = parseInt(localStorage.getItem('last_activity_time') || '0', 10);
        if (Date.now() - lastActivityTime > TIMEOUT_DURATION) {
            logoutUser(true); // Passa true para indicar que é um logout por timeout
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
        alert('Sua sessão foi encerrada em outra aba. Você será desconectado.');
        logoutUser();
    }
    window.addEventListener('storage', (event) => {
        if (event.key === 'active_session_id' && event.newValue !== sessionStorage.getItem('my_tab_session_id')) {
            alert('Sua sessão foi encerrada porque você se conectou em uma nova aba ou janela.');
            logoutUser();
        }
    });

    // --- LÓGICA DO BOTÃO DE LOGOUT ---
    if (logoutButton) {
        logoutButton.addEventListener('click', (event) => {
            event.preventDefault();
            logoutUser(); // Chama a função de logout manual
        });
    }

    
    /**
     * Popula o <select> de Temas (Categorias) buscando dados da API.
     */
    async function popularTemas() {
        try {
            const temas = await apiCategoriaService.pegarTodasCategorias();
            themeSelect.innerHTML = '<option value="">Selecione um tema...</option>';
            temas.forEach(tema => {
                const option = new Option(tema.nome, tema.id);
                themeSelect.add(option);
            });
        } catch (error) {
            console.error('Erro ao carregar temas:', error);
            uploadStatus.textContent = 'Erro ao carregar categorias. Tente recarregar a página.';
            uploadStatus.style.color = 'red';
        }
    }

    /**
     * Popula o <select> de Micro-temas baseado no tema selecionado.
     */
    async function popularMicroTemas() {
        const temaId = themeSelect.value;
        subthemeSelect.innerHTML = '<option value="">A carregar...</option>';
        subthemeSelect.disabled = true;

        if (!temaId) {
            subthemeSelect.innerHTML = '<option value="">Escolha um tema primeiro...</option>';
            checkFormValidity();
            return;
        }

        try {
            const microtemas = await apiCategoriaService.pegarSubcategoriasPorCategoriaId(temaId);
            subthemeSelect.innerHTML = '<option value="">Selecione um micro-tema...</option>';
            microtemas.forEach(sub => {
                const option = new Option(sub.nome, sub.id);
                subthemeSelect.add(option);
            });
            subthemeSelect.disabled = false;
        } catch (error) {
            console.error('Erro ao carregar micro-temas:', error);
            subthemeSelect.innerHTML = '<option value="">Erro ao carregar</option>';
        } finally {
            checkFormValidity();
        }
    }

    /**
     * LÓGICA DE UPLOAD REAL, CONECTADA AO BACKEND
     */
    uploadButton.addEventListener('click', async () => {
        if (uploadButton.disabled) {
            alert('Por favor, preencha todos os campos obrigatórios.');
            return;
        }

        uploadStatus.textContent = 'A processar e a enviar...';
        uploadStatus.style.color = '#333';
        uploadButton.disabled = true;

        try {
            // 1. Processar as Palavras-chave
            const keywordsString = documentKeywordsInput.value.trim();
            let palavrasChaveIds = [];
            if (keywordsString) {
                const palavrasArray = keywordsString.split(',').map(p => p.trim()).filter(Boolean);
                if (palavrasArray.length > 0) {
                    const palavrasChaveSalvas = await apiPalavraChaveService.encontrarOuCriarLote(palavrasArray);
                    palavrasChaveIds = palavrasChaveSalvas.map(p => p.id);
                }
            }

            // 2. Montar o objeto do documento para envio
            const dadosDocumento = {
                titulo: documentTitleInput.value.trim(),
                descricao: documentDescriptionTextarea.value.trim(),
                solucao: textSolutionTextarea.value.trim(),
                subcategoria_id: parseInt(subthemeSelect.value, 10),
                palavrasChaveIds: palavrasChaveIds,
            };

            // 3. Chamar o serviço para criar o documento na API
            await apiKnowledgeLibraryService.criar(dadosDocumento);

            uploadStatus.textContent = 'Documento salvo com sucesso!';
            uploadStatus.style.color = 'green';
            
            // --- CORREÇÃO APLICADA AQUI ---
            // Em vez de 'form.reset()', limpamos cada campo manualmente.
            documentTitleInput.value = '';
            documentDescriptionTextarea.value = '';
            textSolutionTextarea.value = '';
            documentKeywordsInput.value = '';
            themeSelect.value = ''; // Reseta o select de tema
            subthemeSelect.innerHTML = '<option value="">Escolha um tema primeiro...</option>'; // Reseta o de subtema
            subthemeSelect.disabled = true;
            // --- FIM DA CORREÇÃO ---
            
            checkFormValidity();

            setTimeout(() => {
                alert('Documento criado com sucesso! A redirecionar...');
                window.location.href = './knowledge_library.html'; // Redireciona para a lista
            }, 1000);

        } catch (error) {
            console.error('Falha no envio:', error);
            uploadStatus.textContent = `Erro ao salvar: ${error.message}`;
            uploadStatus.style.color = 'red';
            uploadButton.disabled = false; // Reabilita o botão
        }
    });
    
    /**
     * Verifica a validade dos campos para habilitar/desabilitar o botão de salvar.
     */
    function checkFormValidity() {
        const titleFilled = documentTitleInput.value.trim() !== '';
        const solutionTextFilled = textSolutionTextarea.value.trim() !== '';
        const themeFilled = themeSelect.value !== '';
        const subthemeFilled = subthemeSelect.value !== '';

        const isFormValid = titleFilled && solutionTextFilled && themeFilled && subthemeFilled;
        
        uploadButton.disabled = !isFormValid;
        uploadButton.textContent = isFormValid ? 'Salvar Documento' : 'Preencha os campos';
    }

    // --- EVENT LISTENERS E INICIALIZAÇÃO ---
    themeSelect.addEventListener('change', popularMicroTemas);
    // CORRIGIDO: O listener de 'input' agora escuta o container do formulário
    formContainer.addEventListener('input', checkFormValidity);
    
    popularTemas(); // Carrega os temas iniciais assim que a página é carregada
});
