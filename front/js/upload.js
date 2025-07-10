import { apiCategoriaService } from './services/apiCategoriaService.js';
import { apiPalavraChaveService } from './services/apiPalavraChaveService.js';
import { apiKnowledgeLibraryService } from './services/apiKnowledgeLibraryService.js';
import { storageService } from './services/storageService.js';
import { startSessionManagement, logoutUser } from './utils/sessionManager.js';

document.addEventListener('DOMContentLoaded', () => {
    startSessionManagement();

    // --- SELEÇÃO DE ELEMENTOS ---
    const form = document.getElementById('upload-form');
    const uploadButton = document.getElementById('uploadButton');
    const uploadStatus = document.getElementById('uploadStatus');
    const logoutButton = document.getElementById('logout-btn');
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
            uploadStatus.textContent = 'Erro ao carregar categorias.';
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

    function checkFormValidity() {
        const baseFormValid = form.checkValidity();
        
        // Validação adicional: OU o campo solução OU o input de arquivo deve ter valor
        const solutionOrFileProvided = textSolutionTextarea.value.trim() !== '' || arquivoInput.files.length > 0;

        uploadButton.disabled = !(baseFormValid && solutionOrFileProvided);
    }

    /**
     * LÓGICA DE ENVIO DO FORMULÁRIO COM ESCOLHA DE CONTEÚDO
     */
    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        if (uploadButton.disabled) return;

        uploadButton.disabled = true;
        uploadStatus.style.color = 'var(--cor-fonte)';
        uploadStatus.textContent = 'Iniciando...';

        try {
            const isManualSolution = textSolutionTextarea.value.trim() !== '';
            const isFileSolution = arquivoInput.files.length > 0;

            if (isManualSolution) {
                // --- FLUXO 1: SOLUÇÃO MANUAL ---
                uploadStatus.textContent = 'Processando dados do documento...';
                
                const keywordsString = documentKeywordsInput.value.trim();
                let palavrasChaveIds = [];
                if (keywordsString) {
                    const palavrasArray = keywordsString.split(',').map(p => p.trim()).filter(Boolean);
                    if (palavrasArray.length > 0) {
                        palavrasChaveIds = (await apiPalavraChaveService.encontrarOuCriarLote(palavrasArray)).map(p => p.id);
                    }
                }

                const dadosDocumento = {
                    titulo: documentTitleInput.value.trim(),
                    descricao: documentDescriptionTextarea.value.trim(),
                    subcategoria_id: parseInt(subthemeSelect.value, 10),
                    tipoDocumento: 'texto',
                    solucao: textSolutionTextarea.value.trim(), // Conteúdo vem do textarea
                    urlArquivo: null, // Nenhum arquivo neste fluxo
                    palavrasChaveIds: palavrasChaveIds,
                    ativo: true
                };

                uploadStatus.textContent = 'Gerando embedding e salvando...';
                await apiKnowledgeLibraryService.criar(dadosDocumento);
                alert('Documento salvo com sucesso!');

            } else if (isFileSolution) {
                // --- FLUXO 2: PROCESSAMENTO DE ARQUIVO ---
                const file = arquivoInput.files[0];
                
                const onUploadProgress = (progress) => {
                    uploadStatus.textContent = `Enviando arquivo para a nuvem... ${progress.toFixed(0)}%`;
                };
                const fileUrl = await storageService.uploadFile(file, 'documentos', onUploadProgress);

                // Notifica o backend para iniciar o processamento (que fará o chunking)
                uploadStatus.textContent = 'Solicitando análise de IA...';
                await apiKnowledgeLibraryService.iniciarProcessamento({
                    urlArquivo: fileUrl,
                    titulo: documentTitleInput.value.trim(),
                    descricao: documentDescriptionTextarea.value.trim(),
                    subcategoria_id: parseInt(subthemeSelect.value, 10),
                    // O backend usará esses metadados para todos os chunks que criar
                });
                alert('Arquivo enviado com sucesso! O processamento foi iniciado.');
            }

            window.location.href = './knowledge_library.html';

        } catch (error) {
            console.error("Erro no envio:", error);
            uploadStatus.textContent = `Erro: ${error.message}`;
            uploadStatus.style.color = 'red';
            uploadButton.disabled = false;
        }
    });
    
    // --- EVENT LISTENERS E INICIALIZAÇÃO ---
    themeSelect.addEventListener('change', popularMicroTemas);
    // Valida o formulário em qualquer alteração
    form.addEventListener('input', checkFormValidity);
    
    // Inicialização da página
    popularTemas();
    checkFormValidity();
});