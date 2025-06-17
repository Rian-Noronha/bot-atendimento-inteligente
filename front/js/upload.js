document.addEventListener('DOMContentLoaded', () => {
        // --- SELEÇÃO DOS ELEMENTOS ---
        // Apontando para os inputs de texto para tema e micro-tema
        const themeInput = document.getElementById('input-theme');
        const subthemeInput = document.getElementById('input-subtheme');
        
        // Outros elementos da página
        const dropArea = document.getElementById('dropArea');
        const fileInput = document.getElementById('fileInput');
        const fileList = document.getElementById('fileList');
        const uploadButton = document.getElementById('uploadButton');
        const uploadStatus = document.getElementById('uploadStatus');
        const documentTitleInput = document.getElementById('document-title');
        const documentDescriptionTextarea = document.getElementById('document-description');
        const documentKeywordsInput = document.getElementById('document-keywords');
        const textSolutionTextarea = document.getElementById('text-solution'); 
        
        // --- LÓGICA DE SESSÃO E TIMEOUT ---
        // Todo o seu código de sessão e timeout que você já tinha. Está correto.
        const TIMEOUT_DURATION = 5 * 60 * 1000; 
        let timeoutInterval;
        function resetTimeoutTimer() { localStorage.setItem('last_activity_time', Date.now()); }
        function logoutUser() {
            clearInterval(timeoutInterval);
            localStorage.clear();
            sessionStorage.clear();
            alert('Sua sessão expirou por inatividade. Por favor, faça login novamente.');
            window.location.href = '../index.html';
        }
        function checkTimeout() {
            const lastActivityTime = parseInt(localStorage.getItem('last_activity_time') || '0', 10);
            if (Date.now() - lastActivityTime > TIMEOUT_DURATION) {
                logoutUser();
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
            window.location.href = '../index.html';
        }
        window.addEventListener('storage', (event) => {
            if (event.key === 'active_session_id' && event.newValue !== sessionStorage.getItem('my_tab_session_id')) {
                alert('Sua sessão foi encerrada porque você se conectou em uma nova aba ou janela.');
                window.location.href = '../index.html';
            }
        });

        // --- LÓGICA DA PÁGINA DE UPLOAD ---
        let filesToUpload = [];

        function updateFileList() {
            fileList.innerHTML = '';
            if (filesToUpload.length > 0) {
                fileList.style.display = 'block';
                const file = filesToUpload[0];
                const listItem = document.createElement('div');
                listItem.classList.add('file-list-item');
                listItem.innerHTML = `<span class="file-name">${file.name} (${(file.size / 1024).toFixed(2)} KB)</span><button type="button" class="remove-file"><i class="bi bi-x-lg"></i></button>`;
                fileList.appendChild(listItem);
            } else {
                fileList.style.display = 'none';
            }
            checkFormValidity();
        }
        
        // ... (suas funções addFiles e de drag-and-drop continuam aqui) ...

        /**
         * VERIFICAÇÃO DE FORMULÁRIO ATUALIZADA
         * Agora verifica se os campos de texto de tema e micro-tema foram preenchidos.
         */
        function checkFormValidity() {
            const hasFile = filesToUpload.length === 1;
            const titleFilled = documentTitleInput.value.trim() !== '';
            const solutionTextFilled = textSolutionTextarea.value.trim() !== '';
            // VERIFICAÇÃO DOS NOVOS CAMPOS DE TEXTO
            const themeFilled = themeInput.value.trim() !== '';
            const subthemeFilled = subthemeInput.value.trim() !== '';
            
            const isFormValid = titleFilled && themeFilled && subthemeFilled && (hasFile || solutionTextFilled);
            uploadButton.disabled = !isFormValid;
            uploadButton.textContent = uploadButton.disabled ? 'Novo documento' : 'Enviar';
        }

        // Adiciona "ouvintes" de evento para todos os campos relevantes para a validação
        themeInput.addEventListener('input', checkFormValidity);
        subthemeInput.addEventListener('input', checkFormValidity);
        documentTitleInput.addEventListener('input', checkFormValidity);
        textSolutionTextarea.addEventListener('input', checkFormValidity);
        // (outros ouvintes como o de descrição e keywords podem ser adicionados aqui também se forem obrigatórios)

        /**
         * LÓGICA DE UPLOAD ATUALIZADA
         * Captura os valores dos inputs de texto de tema e micro-tema.
         */
        uploadButton.addEventListener('click', () => {
            // Validações iniciais (se necessário, podem ser removidas se a `checkFormValidity` já cuida de tudo)
            if (uploadButton.disabled) {
                alert('Por favor, preencha todos os campos obrigatórios.');
                return;
            }

            // Captura os valores dos campos de texto
            const themeValue = themeInput.value.trim();
            const subthemeValue = subthemeInput.value.trim();
            
            uploadStatus.textContent = 'Simulando envio...';
            uploadButton.disabled = true;
            
            setTimeout(() => {

                console.log('Tema:', themeValue);
                console.log('Micro-tema:', subthemeValue);
                console.log('Título:', documentTitleInput.value.trim());
                console.log('Descrição:', documentDescriptionTextarea.value.trim());
                console.log('Palavras-chave:', documentKeywordsInput.value.trim());
                console.log('Solução Textual:', textSolutionTextarea.value.trim());
                console.log('Arquivo:', filesToUpload[0]?.name || 'Nenhum arquivo');
                
                // Limpa todos os campos do formulário após o "envio"
                filesToUpload = [];
                themeInput.value = '';
                subthemeInput.value = '';
                documentTitleInput.value = '';
                documentDescriptionTextarea.value = '';
                documentKeywordsInput.value = '';
                textSolutionTextarea.value = '';
                updateFileList(); // Isso já chama checkFormValidity() no final

                uploadStatus.textContent = 'Documento salvo com sucesso!';
                uploadStatus.style.color = 'green';
                setTimeout(() => {
                    uploadStatus.textContent = '';
                    alert('Documento enviado e processado (simulação)!');
                }, 2000);
            }, 1500);
        });

        // --- INICIALIZAÇÃO ---
        checkFormValidity(); // Verifica o estado inicial do formulário
});