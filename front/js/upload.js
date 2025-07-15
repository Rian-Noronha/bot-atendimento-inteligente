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

    // --- LÓGICA DA PÁGINA (Funções de popular e validar permanecem as mesmas) ---

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
            temas.forEach(tema => themeSelect.add(new Option(tema.nome, tema.id)));
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
            microtemas.forEach(sub => subthemeSelect.add(new Option(sub.nome, sub.id)));
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
        const solutionOrFileProvided = textSolutionTextarea.value.trim() !== '' || arquivoInput.files.length > 0;
        uploadButton.disabled = !(baseFormValid && solutionOrFileProvided);
    }

    /**
     * LÓGICA DE ENVIO DO FORMULÁRIO (UNIFICADA)
     */
    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        if (uploadButton.disabled) return;

        uploadButton.disabled = true;
        uploadStatus.style.color = 'var(--cor-fonte)';
        uploadStatus.textContent = 'Iniciando...';

        try {
            let fileUrl = null;
            const file = arquivoInput.files[0];

            // PASSO 1: Se houver um ficheiro, faz o upload para o storage.
            if (file) {
                const onUploadProgress = (progress) => {
                    uploadStatus.textContent = `Enviando ficheiro para a nuvem... ${progress.toFixed(0)}%`;
                };
                fileUrl = await storageService.uploadFile(file, 'documentos', onUploadProgress);
            }

            uploadStatus.textContent = 'Preparando dados para análise...';

            // PASSO 2: Monta o payload final para a API.
            // Este objeto é enviado independentemente do fluxo.
            const dadosParaCriar = {
                titulo: documentTitleInput.value.trim(),
                descricao: documentDescriptionTextarea.value.trim(),
                subcategoria_id: parseInt(subthemeSelect.value, 10),
                palavrasChave: documentKeywordsInput.value.trim().split(',').map(p => p.trim()).filter(Boolean),
                solucao: textSolutionTextarea.value.trim() || null, // Envia o texto da solução se houver
                urlArquivo: fileUrl, // Envia a URL do ficheiro se houver
                ativo: true
            };

            // PASSO 3: Chama a única função de criação do serviço.
            uploadStatus.textContent = 'Enviando para processamento da IA...';
            const resultado = await apiKnowledgeLibraryService.criar(dadosParaCriar);

            alert(resultado.message || 'Operação concluída com sucesso!');
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
    form.addEventListener('input', checkFormValidity);
    
    popularTemas();
    checkFormValidity();
});