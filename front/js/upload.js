import { apiCategoriaService } from './services/apiCategoriaService.js';
import { apiPalavraChaveService } from './services/apiPalavraChaveService.js';
import { apiKnowledgeLibraryService } from './services/apiKnowledgeLibraryService.js';
import { apiAuthService } from './services/apiAuthService.js';
import { apiUploadService } from './services/apiUploadService.js'; // Importa o serviço de upload para Firebase Storage

document.addEventListener('DOMContentLoaded', () => {
    // --- SELEÇÃO DOS ELEMENTOS DO FORMULÁRIO E MENU ---
    const form = document.getElementById('upload-form'); // O <form> principal
    const uploadButton = document.getElementById('uploadButton');
    const uploadStatus = document.getElementById('uploadStatus');
    const logoutButton = document.getElementById('logout-btn'); // Botão de logout do HTML

    // Elementos para alternar entre modo manual e automático (corrigido do HTML)
    const modoManualRadio = document.getElementById('modo-manual');
    const modoAutomaticoRadio = document.getElementById('modo-automatico');
    const manualContainer = document.getElementById('manual-entry-container');
    const automaticoContainer = document.getElementById('automatic-entry-container');
    
    // Elementos dos formulários
    const themeSelect = document.getElementById('select-theme');
    const subthemeSelect = document.getElementById('select-subtheme');
    const documentTitleInput = document.getElementById('document-title');
    const documentDescriptionTextarea = document.getElementById('document-description');
    const documentKeywordsInput = document.getElementById('document-keywords');
    const textSolutionTextarea = document.getElementById('text-solution'); // Para modo manual
    const arquivoInput = document.getElementById('arquivo-input'); // Para modo automático

    // --- LÓGICA DE SESSÃO E TIMEOUT ---
    const TIMEOUT_DURATION = 5 * 60 * 1000; // 5 minutos
    let timeoutInterval;

    function resetTimeoutTimer() { 
        localStorage.setItem('last_activity_time', Date.now()); 
    }

    async function logoutUser(isTimeout = false) {
        clearInterval(timeoutInterval); // Para o monitoramento de timeout
        if (isTimeout) {
            alert('Sua sessão expirou por inatividade. Por favor, faça login novamente.');
        }
        try { 
            await apiAuthService.logout(); 
        } catch (error) { 
            console.error("Erro ao encerrar sessão no servidor:", error); 
        } finally {
            localStorage.clear();    // Limpa todos os dados do localStorage
            sessionStorage.clear();  // Limpa todos os dados do sessionStorage
            window.location.href = '../index.html'; // Redireciona para a página de login
        }
    }

    function checkTimeout() {
        const lastActivityTime = parseInt(localStorage.getItem('last_activity_time') || '0', 10);
        // Se a diferença de tempo for maior que a duração do timeout
        if (Date.now() - lastActivityTime > TIMEOUT_DURATION) {
            logoutUser(true); // Desconecta o usuário por inatividade
        }
    }

    function startTimeoutMonitoring() {
        // Eventos que indicam atividade do usuário
        const activityEvents = ['mousemove', 'mousedown', 'keypress', 'scroll', 'touchstart'];
        activityEvents.forEach(event => window.addEventListener(event, resetTimeoutTimer));
        // Inicia o intervalo para verificar o timeout a cada 5 segundos
        timeoutInterval = setInterval(checkTimeout, 5000);
    }

    // Inicia o monitoramento de timeout quando o DOM é carregado
    startTimeoutMonitoring();
    
    const currentSessionId = localStorage.getItem('active_session_id');
    if (!sessionStorage.getItem('my_tab_session_id')) {
        // Se esta aba não tem um ID de sessão, define o atual
        sessionStorage.setItem('my_tab_session_id', currentSessionId);
    } else if (sessionStorage.getItem('my_tab_session_id') !== currentSessionId) {
        // Se o ID da sessão desta aba for diferente da sessão ativa no localStorage, desconecta
        alert('Sua sessão foi encerrada em outra aba. Você será desconectado.');
        logoutUser();
    }
    window.addEventListener('storage', (event) => {
        // Monitora mudanças no localStorage para detectar encerramento de sessão em outras abas/janelas
        if (event.key === 'active_session_id' && event.newValue !== sessionStorage.getItem('my_tab_session_id')) {
            alert('Sua sessão foi encerrada porque você se conectou em uma nova aba ou janela.');
            logoutUser();
        }
    });

    if (logoutButton) {
        logoutButton.addEventListener('click', (e) => { 
            e.preventDefault(); 
            logoutUser(); 
        });
    }

    // --- LÓGICA DA INTERFACE E FORMULÁRIO ---

    // Função que gerencia quais campos são obrigatórios com base no modo de criação
    function toggleRequiredAttributes(isManualMode) {
        themeSelect.required = isManualMode;
        subthemeSelect.required = isManualMode;
        documentTitleInput.required = isManualMode;
        textSolutionTextarea.required = isManualMode; // Obrigatório no modo manual
        arquivoInput.required = !isManualMode; // Obrigatório no modo automático
    }

    // Alterna a visibilidade dos containers e a obrigatoriedade dos campos
    modoManualRadio.addEventListener('change', () => {
        manualContainer.style.display = 'block';
        automaticoContainer.style.display = 'none';
        uploadButton.textContent = 'Salvar Documento'; // Texto do botão para modo manual
        toggleRequiredAttributes(true); // Campos manuais são obrigatórios
        checkFormValidity(); // Revalida o formulário
    });
    modoAutomaticoRadio.addEventListener('change', () => {
        manualContainer.style.display = 'none';
        automaticoContainer.style.display = 'block';
        uploadButton.textContent = 'Processar Arquivo'; // Texto do botão para modo automático
        toggleRequiredAttributes(false); // Campos manuais não são obrigatórios, arquivo sim
        checkFormValidity(); // Revalida o formulário
    });

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

    async function popularMicroTemas() {
        const temaId = themeSelect.value;
        subthemeSelect.innerHTML = '<option value="">A carregar...</option>';
        subthemeSelect.disabled = true; // Desabilita enquanto carrega
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
            subthemeSelect.disabled = false; // Habilita após carregar
        } catch (error) {
            console.error('Erro ao carregar micro-temas:', error);
            subthemeSelect.innerHTML = '<option value="">Erro ao carregar</option>';
        } finally {
            checkFormValidity(); // Revalida o formulário após carregar micro-temas
        }
    }

    // --- FUNÇÃO DE UPLOAD PARA FIREBASE STORAGE (CHAMA apiUploadService) ---
    // Esta função encapsula a chamada ao serviço e lida com o status da UI
    async function uploadFileToFirebaseStorage(file) {
        uploadStatus.textContent = 'A enviar para o Firebase Storage...';
        try {
            // Chama a função de upload do serviço apiUploadService
            // Passa o arquivo e a pasta de destino no Storage (ex: 'documentos')
            const fileUrl = await apiUploadService.uploadFileToFirebaseStorage(file, 'documentos'); 

            uploadStatus.textContent = 'Upload para Firebase Storage concluído!';
            return fileUrl; // Retorna a URL para processamento posterior no backend
        } catch (error) {
            uploadStatus.textContent = `Erro no upload: ${error.message}`;
            uploadButton.disabled = false;
            console.error("Erro no upload do arquivo:", error);
            throw error; // Rejeita a Promise para que o 'catch' no form.addEventListener pegue o erro
        }
    }

    // --- EVENT LISTENER PRINCIPAL DO FORMULÁRIO ---
    form.addEventListener('submit', async (event) => {
        event.preventDefault(); // Impede o envio padrão do formulário
        // Se o botão estiver desabilitado (formulário inválido), não faz nada
        if (uploadButton.disabled) return; 

        const modoSelecionado = document.querySelector('input[name="modo_criacao"]:checked').value;
        uploadButton.disabled = true; // Desabilita o botão enquanto processa

        if (modoSelecionado === 'manual') {
            uploadStatus.textContent = 'A guardar documento (modo manual)...';
            try {
                const keywordsString = documentKeywordsInput.value.trim();
                let palavrasChaveIds = [];
                if (keywordsString) {
                    // Processa e encontra/cria palavras-chave no backend
                    const palavrasArray = keywordsString.split(',').map(p => p.trim()).filter(Boolean);
                    const palavrasChaveSalvas = await apiPalavraChaveService.encontrarOuCriarLote(palavrasArray);
                    palavrasChaveIds = palavrasChaveSalvas.map(p => p.id);
                }
                const dadosDocumento = {
                    titulo: documentTitleInput.value.trim(),
                    descricao: documentDescriptionTextarea.value.trim(),
                    solucao: textSolutionTextarea.value.trim(),
                    // subcategoria_id deve vir do select de subtema no modo manual
                    subcategoria_id: parseInt(subthemeSelect.value, 10), 
                    tipoDocumento: 'texto', // Definido como 'texto' para entrada manual
                    palavrasChaveIds: palavrasChaveIds,
                };
                await apiKnowledgeLibraryService.criar(dadosDocumento); // Envia dados para o backend

                uploadStatus.textContent = 'Documento salvo com sucesso!';
                uploadStatus.style.color = 'green';
                
                // Limpar campos após o sucesso
                documentTitleInput.value = '';
                documentDescriptionTextarea.value = '';
                textSolutionTextarea.value = '';
                documentKeywordsInput.value = '';
                themeSelect.value = ''; // Reseta o select de tema
                subthemeSelect.innerHTML = '<option value="">Escolha um tema primeiro...</option>'; // Reseta o de subtema
                subthemeSelect.disabled = true;
                
                checkFormValidity(); // Revalida o formulário para o estado inicial

                setTimeout(() => {
                    alert('Documento criado com sucesso! A redirecionar...');
                    window.location.href = './knowledge_library.html'; // Redireciona para a lista de documentos
                }, 1000);

            } catch (error) {
                console.error('Falha no envio do documento manual:', error);
                uploadStatus.textContent = `Erro ao guardar documento: ${error.message}`;
                uploadStatus.style.color = 'red';
                uploadButton.disabled = false; // Reabilita o botão
            }
        } else if (modoSelecionado === 'automatico') {
            uploadStatus.textContent = 'A processar ficheiro...';
            try {
                const file = arquivoInput.files[0];
                if (!file) {
                    throw new Error('Por favor, selecione um ficheiro.');
                }
                
                // --- UPLOAD PARA FIREBASE STORAGE ---
                // Chama a função que gerencia o upload para o Firebase Storage
                const fileUrl = await uploadFileToFirebaseStorage(file); 

                uploadStatus.textContent = 'A solicitar análise de IA...';
                // Envia a URL do arquivo no Firebase Storage para o backend para processamento de IA
                await apiKnowledgeLibraryService.iniciarProcessamento({ urlArquivo: fileUrl });

                alert('Ficheiro enviado para processamento! Isto pode levar alguns minutos.');
                window.location.href = './knowledge_library.html'; // Redireciona
            } catch (error) {
                console.error("Erro no processamento automático:", error);
                uploadStatus.textContent = `Erro ao processar ficheiro: ${error.message}`;
                uploadButton.disabled = false;
            }
        }
    });
    
    // Função para verificar a validade dos campos e habilitar/desabilitar o botão de salvar.
    function checkFormValidity() {
        const isManualMode = modoManualRadio.checked;
        let isFormValid = true; // Assume válido por padrão e testa as condições

        if (isManualMode) {
            // No modo manual, todos os campos marcados como 'required' devem ser válidos.
            // form.checkValidity() verifica isso automaticamente para todos os campos com 'required'.
            isFormValid = form.checkValidity(); 
        } else { // Modo automático
            // No modo automático, apenas a seleção do arquivo é essencial para habilitar o botão
            isFormValid = arquivoInput.files.length > 0;
        }
        
        // Habilita/desabilita o botão com base na validade do formulário para o modo selecionado
        uploadButton.disabled = !isFormValid;
        // Atualiza o texto do botão para feedback visual
        if (isManualMode) {
             uploadButton.textContent = isFormValid ? 'Salvar Documento' : 'Preencha os campos';
        } else {
             uploadButton.textContent = isFormValid ? 'Processar Arquivo' : 'Selecione um arquivo';
        }
    }

    // --- EVENT LISTENERS E INICIALIZAÇÃO ---
    // Carrega os micro-temas quando o tema principal muda
    themeSelect.addEventListener('change', popularMicroTemas);
    // Monitora a entrada em qualquer campo do formulário para verificar a validade
    form.addEventListener('input', checkFormValidity); 
    // Carrega os temas assim que a página é carregada
    popularTemas(); 
    // Garante que a lógica de modo e validação inicial é aplicada ao carregar a página
    // Simula o 'change' no rádio 'modo-manual' para configurar o estado inicial corretamente
    modoManualRadio.dispatchEvent(new Event('change')); 
});