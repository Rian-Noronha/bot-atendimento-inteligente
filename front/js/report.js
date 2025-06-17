document.addEventListener('DOMContentLoaded', () => {

    // --- SELEÇÃO DOS ELEMENTOS HTML ---
    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');
    const generateReportBtn = document.getElementById('generate-report-btn');
    const exportPdfBtn = document.getElementById('export-pdf-btn');
    
    // Novos elementos de estatísticas
    const totalSubjectsEl = document.getElementById('total-subjects');
    const topCategoryEl = document.getElementById('top-category');
    const peakDayEl = document.getElementById('peak-day');
    const reportResultsList = document.getElementById('report-results-list'); // Container da lista detalhada
    const chartCanvas = document.getElementById('category-chart'); // Canvas do gráfico

    let categoryChart = null; // Variável para armazenar a instância do gráfico

    // --- CONFIGURAÇÃO DAS DATAS PADRÃO ---
    const today = new Date().toISOString().split('T')[0];
    endDateInput.value = today;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    startDateInput.value = thirtyDaysAgo.toISOString().split('T')[0];


    // --- LÓGICA DE TIMEOUT DE SESSÃO (5 MINUTOS) ---

    const TIMEOUT_DURATION = 5 * 60 * 1000; 
    let timeoutInterval; // Variável para guardar nosso "vigia".

    /**
     * Reseta o contador de inatividade.
     * Esta função é chamada sempre que o usuário interage com a página.
     */
    function resetTimeoutTimer() {
        // Atualiza o localStorage com a hora da atividade mais recente.
        localStorage.setItem('last_activity_time', Date.now());
    }

    /**
     * Função que efetivamente desconecta o usuário.
     */
    function logoutUser() {
        // Para o vigia para não continuar verificando.
        clearInterval(timeoutInterval);

        // Limpa os dados da sessão do localStorage para invalidá-la.
        localStorage.removeItem('active_session_id');
        localStorage.removeItem('last_activity_time');
        localStorage.removeItem('loggedInUser'); // Limpa também o usuário logado

        // Avisa o usuário e o redireciona para a tela de login.
        alert('Sua sessão expirou por inatividade. Por favor, faça login novamente.');
        window.location.href = '../index.html'; // Ajuste o caminho se necessário
    }

    /**
     * O "vigia" que verifica o tempo de inatividade.
     * Roda a cada poucos segundos.
     */
    function checkTimeout() {
        const lastActivityTime = parseInt(localStorage.getItem('last_activity_time') || '0', 10);
        const now = Date.now();

        // Se o tempo desde a última atividade for maior que a nossa duração de timeout...
        if (now - lastActivityTime > TIMEOUT_DURATION) {
            console.log('Sessão expirada! Desconectando...');
            logoutUser();
        }
    }

    /**
     * Inicia o monitoramento de atividade.
     */
    function startTimeoutMonitoring() {
        // Lista de eventos que consideraremos como "atividade do usuário".
        const activityEvents = ['mousemove', 'mousedown', 'keypress', 'scroll', 'touchstart'];

        // Para cada evento da lista, adicionamos um "ouvinte" que chama a função de resetar o tempo.
        activityEvents.forEach(event => {
            window.addEventListener(event, resetTimeoutTimer);
        });

        // Inicia o nosso "vigia" para verificar o timeout a cada 5 segundos.
        timeoutInterval = setInterval(checkTimeout, 5000);
    }

    


    // Inicia o monitoramento assim que a página é carregada.
    startTimeoutMonitoring();


    // Quando a página carrega, ela verifica se a sessão atual ainda é a ativa.
    // Isso impede que uma aba antiga "fechada e reaberta" continue funcionando.
    const currentSessionId = localStorage.getItem('active_session_id');
    if (!sessionStorage.getItem('my_tab_session_id')) {
        // Se esta aba não tem um ID, ela acabou de ser aberta. Vamos atribuir o ID ativo a ela.
        sessionStorage.setItem('my_tab_session_id', currentSessionId);
    } else if (sessionStorage.getItem('my_tab_session_id') !== currentSessionId) {
        // Se o ID da aba é diferente do ID ativo, ela é uma sessão antiga.
        alert('Sua sessão foi encerrada em outra aba. Você será desconectado.');
        window.location.href = '../index.html'; // Use '../' para voltar para a raiz
    }

    // Adiciona o "vigia" para eventos de armazenamento em outras abas
    window.addEventListener('storage', (event) => {
        // Verifica se a chave 'active_session_id' foi alterada em outra aba
        if (event.key === 'active_session_id') {
            // Compara o novo ID da sessão com o ID desta aba
            if (event.newValue !== sessionStorage.getItem('my_tab_session_id')) {
                // Se forem diferentes, significa que um novo login foi feito em outro lugar.
                alert('Sua sessão foi encerrada porque você se conectou em uma nova aba ou janela.');
                // Redireciona esta aba "antiga" para a tela de login.
                window.location.href = '../index.html';
            }
        }
    });

    // --- FUNÇÕES PRINCIPAIS ---

    function generateReport() {
        const startDate = startDateInput.value ? new Date(startDateInput.value) : null;
        const endDate = endDateInput.value ? new Date(endDateInput.value) : null;
        if (endDate) {
            endDate.setHours(23, 59, 59, 999);
        }
        const approvedSubjects = JSON.parse(localStorage.getItem('approvedSubjects')) || [];
        const filteredSubjects = approvedSubjects.filter(subject => {
            const subjectDate = new Date(subject.approvedDate);
            if (startDate && endDate) return subjectDate >= startDate && subjectDate <= endDate;
            if (startDate) return subjectDate >= startDate;
            if (endDate) return subjectDate <= endDate;
            return true;
        });
        renderReport(filteredSubjects);
    }

    function renderReport(subjects) {
        // Limpa a lista anterior
        reportResultsList.innerHTML = '';

        if (subjects.length === 0) {
            exportPdfBtn.disabled = true;
            totalSubjectsEl.textContent = '0';
            topCategoryEl.textContent = 'N/A';
            peakDayEl.textContent = 'N/A';
            if(categoryChart) categoryChart.destroy(); // Limpa o gráfico se não houver dados
            reportResultsList.innerHTML = '<p class="no-results">Nenhum dado encontrado.</p>';
            return;
        }

        exportPdfBtn.disabled = false;

        // --- 1. CÁLCULO DAS ESTATÍSTICAS ---

        // Contagem por categoria principal (para o gráfico e KPIs)
        const categoryCounts = subjects.reduce((acc, { tema }) => {
            acc[tema] = (acc[tema] || 0) + 1;
            return acc;
        }, {});

        // Contagem por dia (para o KPI "Dia de Pico")
        const dailyCounts = subjects.reduce((acc, { approvedDate }) => {
            const day = new Date(approvedDate).toLocaleDateString('pt-BR');
            acc[day] = (acc[day] || 0) + 1;
            return acc;
        }, {});

        // Encontra a categoria principal
        const topCategory = Object.keys(categoryCounts).reduce((a, b) => categoryCounts[a] > categoryCounts[b] ? a : b, 'N/A');

        // Encontra o dia de pico
        const peakDay = Object.keys(dailyCounts).reduce((a, b) => dailyCounts[a] > dailyCounts[b] ? a : b, 'N/A');

        // --- 2. ATUALIZAÇÃO DOS CARDS DE RESUMO (KPIs) ---
        totalSubjectsEl.textContent = subjects.length;
        topCategoryEl.textContent = topCategory;
        peakDayEl.textContent = peakDay;

        // --- 3. RENDERIZAÇÃO DO GRÁFICO ---
        renderCategoryChart(categoryCounts);

        // --- 4. RENDERIZAÇÃO DA LISTA DETALHADA ---
        renderDetailedList(subjects);
    }

    function renderCategoryChart(categoryData) {
        // Se já existe um gráfico, destrói para criar um novo e evitar sobreposição
        if (categoryChart) {
            categoryChart.destroy();
        }

        const chartLabels = Object.keys(categoryData);
        const chartValues = Object.values(categoryData);

        categoryChart = new Chart(chartCanvas, {
            type: 'pie', // Tipo do gráfico
            data: {
                labels: chartLabels,
                datasets: [{
                    label: 'Distribuição de Assuntos',
                    data: chartValues,
                    backgroundColor: [ // Cores para as fatias do gráfico
                        '#28ec63', '#678876', '#009640', '#db2777', 
                        '#fb7185', '#fde047', '#f97316', '#3b82f6'
                    ],
                    borderColor: '#ffffff',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top', // Posição da legenda
                    }
                }
            }
        });
    }

    function renderDetailedList(subjects) {
        const themeCounts = subjects.reduce((acc, { tema, microtema }) => {
            const themeKey = `${tema} > ${microtema}`;
            acc[themeKey] = (acc[themeKey] || 0) + 1;
            return acc;
        }, {});
        const sortedThemes = Object.entries(themeCounts).sort(([, a], [, b]) => b - a);
        sortedThemes.forEach(([theme, count]) => {
            const [tema, microtema] = theme.split(' > ');
            const itemElement = document.createElement('div');
            itemElement.classList.add('report-item');
            itemElement.innerHTML = `
                <div class="report-item-info">
                    <span class="category">${tema}</span>
                    <span class="subcategory">> ${microtema}</span>
                </div>
                <div class="report-item-count">${count}</div>`;
            reportResultsList.appendChild(itemElement);
        });
    }

    function exportToPdf() {
        // Seleciona o container principal do relatório para exportar tudo
        const reportArea = document.querySelector('.report-container'); 
        const originalButtonText = exportPdfBtn.innerHTML;
        exportPdfBtn.disabled = true;
        exportPdfBtn.innerHTML = '<i class="bi bi-hourglass-split"></i> Exportando...';

        html2canvas(reportArea, {
            // Opções para melhorar a qualidade da "foto"
            scale: 2, 
            useCORS: true 
        }).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jspdf.jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            const today = new Date().toISOString().slice(0, 10);
            pdf.save(`dashboard-analise-${today}.pdf`);
            exportPdfBtn.disabled = false;
            exportPdfBtn.innerHTML = originalButtonText;
        });
    }

    // --- EXECUÇÃO ---
    generateReportBtn.addEventListener('click', generateReport);
    exportPdfBtn.addEventListener('click', exportToPdf);
    generateReport();
});