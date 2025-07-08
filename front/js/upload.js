import { apiCategoriaService } from './services/apiCategoriaService.js';
import { apiPalavraChaveService } from './services/apiPalavraChaveService.js';
import { apiKnowledgeLibraryService } from './services/apiKnowledgeLibraryService.js';
import { storageService } from './services/storageService.js'; 
import { startSessionManagement, logoutUser } from './utils/sessionManager.js';

document.addEventListener('DOMContentLoaded', () => {
    // 3. Inicia toda a lógica de segurança
    startSessionManagement();

    // --- SELEÇÃO DE ELEMENTOS ---
    const form = document.getElementById('upload-form');
    const uploadButton = document.getElementById('uploadButton');
    const uploadStatus = document.getElementById('uploadStatus');
    const logoutButton = document.getElementById('logout-btn');
    const modoManualRadio = document.getElementById('modo-manual');
    const modoAutomaticoRadio = document.getElementById('modo-automatico');
    const manualContainer = document.getElementById('manual-entry-container');
    const automaticoContainer = document.getElementById('automatic-entry-container');
    const themeSelect = document.getElementById('select-theme');
    const subthemeSelect = document.getElementById('select-subtheme');
    const documentTitleInput = document.getElementById('document-title');
    const documentDescriptionTextarea = document.getElementById('document-description');
    const documentKeywordsInput = document.getElementById('document-keywords');
    const textSolutionTextarea = document.getElementById('text-solution');
    const arquivoInput = document.getElementById('arquivo-input');

    // --- LÓGICA DA PÁGINA ---

    if (logoutButton) {
        logoutButton.addEventListener('click', (e) => { 
            e.preventDefault(); 
            logoutUser(); 
        });
    }

    function toggleRequiredAttributes(isManualMode) {
        themeSelect.required = isManualMode;
        subthemeSelect.required = isManualMode;
        documentTitleInput.required = isManualMode;
        textSolutionTextarea.required = isManualMode;
        arquivoInput.required = !isManualMode;
    }

    modoManualRadio.addEventListener('change', () => {
        manualContainer.style.display = 'block';
        automaticoContainer.style.display = 'none';
        uploadButton.textContent = 'Salvar Documento';
        toggleRequiredAttributes(true);
        checkFormValidity();
    });
    modoAutomaticoRadio.addEventListener('change', () => {
        manualContainer.style.display = 'none';
        automaticoContainer.style.display = 'block';
        uploadButton.textContent = 'Processar Arquivo';
        toggleRequiredAttributes(false);
        checkFormValidity();
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
     * LÓGICA DE ENVIO DO FORMULÁRIO 
     */
    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        if (uploadButton.disabled) return;

        const modoSelecionado = document.querySelector('input[name="modo_criacao"]:checked').value;
        uploadButton.disabled = true;
        uploadStatus.style.color = 'var(--cor-fonte)';

        if (modoSelecionado === 'manual') {
            uploadStatus.textContent = 'Salvando documento...';
            try {
                const keywordsString = documentKeywordsInput.value.trim();
                let palavrasChaveIds = [];
                if (keywordsString) {
                    const palavrasArray = keywordsString.split(',').map(p => p.trim()).filter(Boolean);
                    if (palavrasArray.length > 0) {
                        const palavrasChaveSalvas = await apiPalavraChaveService.encontrarOuCriarLote(palavrasArray);
                        palavrasChaveIds = palavrasChaveSalvas.map(p => p.id);
                    }
                }
                const dadosDocumento = {
                    titulo: documentTitleInput.value.trim(),
                    descricao: documentDescriptionTextarea.value.trim(),
                    subcategoria_id: parseInt(subthemeSelect.value, 10),
                    tipoDocumento: 'texto',
                    solucao: textSolutionTextarea.value.trim(),
                    urlArquivo: null,
                    palavrasChaveIds: palavrasChaveIds,
                    ativo: true
                };
                await apiKnowledgeLibraryService.criar(dadosDocumento);
                alert('Documento salvo com sucesso!');
                window.location.href = './knowledge_library.html';
            } catch (error) {
                uploadStatus.textContent = `Erro: ${error.message}`;
                uploadStatus.style.color = 'red';
                uploadButton.disabled = false;
            }
        } else if (modoSelecionado === 'automatico') {
            try {
                const file = arquivoInput.files[0];
                if (!file) throw new Error('Por favor, selecione um arquivo.');
                
                // 1: Criar a função de callback para o progresso.
                // Esta função será chamada pelo storageService sempre que o progresso mudar.
                const onUploadProgress = (progress) => {
                    uploadStatus.textContent = `Enviando para a nuvem... ${progress.toFixed(0)}%`;
                };

                // 2: Chamar o serviço de upload passando a função de callback como terceiro argumento.
                const fileUrl = await storageService.uploadFile(file, 'documentos', onUploadProgress); 

                // Passo 3: Notificar o backend para iniciar o processamento
                uploadStatus.textContent = 'Solicitando análise de IA...';
                await apiKnowledgeLibraryService.iniciarProcessamento({ urlArquivo: fileUrl });

                alert('Arquivo guardado com sucesso. Sendo processado na sua base!');
                window.location.href = './knowledge_library.html';
            } catch (error) {
                console.error("Erro no processamento automático:", error);
                uploadStatus.textContent = `Erro ao processar arquivo: ${error.message}`;
                uploadStatus.style.color = 'red';
                uploadButton.disabled = false;
            }
        }
    });
    
    function checkFormValidity() {
        const isFormValid = form.checkValidity();
        uploadButton.disabled = !isFormValid;
    }

    // --- EVENT LISTENERS E INICIALIZAÇÃO ---
    themeSelect.addEventListener('change', popularMicroTemas);
    form.addEventListener('input', checkFormValidity);
    popularTemas();
    toggleRequiredAttributes(true);
    checkFormValidity();
});
