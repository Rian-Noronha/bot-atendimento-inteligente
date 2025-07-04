// 1. Importa o nosso novo gerenciador de sessão centralizado
// Ele cuidará do timeout, da verificação de abas e do logout seguro.
import { startSessionManagement } from './utils/sessionManager.js';
import { apiAuthService } from './services/apiAuthService.js'; // Ainda necessário para o logout manual

document.addEventListener('DOMContentLoaded', () => {
    // 2. Inicia toda a lógica de segurança com uma única chamada
    startSessionManagement();

    // --- SELEÇÃO DE ELEMENTOS ESPECÍFICOS DA PÁGINA ---
    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');
    const generateReportBtn = document.getElementById('generate-report-btn');
    const exportPdfBtn = document.getElementById('export-pdf-btn');
    const logoutButton = document.getElementById('logout-btn'); // Supondo que a página de relatório tenha um botão de sair

    // Elementos de estatísticas
    const totalSubjectsEl = document.getElementById('total-subjects');
    const dailyAverageEl = document.getElementById('daily-average');
    const topCategoryEl = document.getElementById('top-category');
    const topSubcategoryEl = document.getElementById('top-subcategory');
    const peakWeekdayEl = document.getElementById('peak-weekday');
    
    const reportResultsList = document.getElementById('report-results-list');
    const chartCanvas = document.getElementById('category-chart');

    let categoryChart = null;

    // --- LÓGICA ESPECÍFICA DA PÁGINA DE RELATÓRIOS ---

    // Lógica do botão de logout (mantida para garantir a chamada à API)
    if (logoutButton) {
        logoutButton.addEventListener('click', async (e) => {
            e.preventDefault();
            try {
                await apiAuthService.logout();
            } catch (error) {
                console.error("Erro ao notificar o servidor sobre o logout:", error);
            } finally {
                // A lógica de limpar o storage e redirecionar já está no sessionManager,
                // mas podemos garantir que aconteça aqui para uma resposta imediata.
                localStorage.clear();
                sessionStorage.clear();
                window.location.href = '../index.html';
            }
        });
    }

    // Configuração das datas padrão
    const today = new Date().toISOString().split('T')[0];
    endDateInput.value = today;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    startDateInput.value = thirtyDaysAgo.toISOString().split('T')[0];

    /**
     * Função principal que filtra os dados do localStorage e chama as funções de renderização.
     */
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

    /**
     * Calcula as estatísticas e renderiza todos os componentes visuais do relatório.
     */
    function renderReport(subjects) {
        reportResultsList.innerHTML = '';

        if (subjects.length === 0) {
            exportPdfBtn.disabled = true;
            totalSubjectsEl.textContent = '0';
            dailyAverageEl.textContent = '0.0';
            topCategoryEl.textContent = 'N/A';
            topSubcategoryEl.textContent = 'N/A';
            peakWeekdayEl.textContent = 'N/A';
            if(categoryChart) categoryChart.destroy();
            reportResultsList.innerHTML = '<p class="no-results">Nenhum dado encontrado para o período selecionado.</p>';
            return;
        }

        exportPdfBtn.disabled = false;

        // Lógica de cálculo das estatísticas
        const categoryCounts = subjects.reduce((acc, { tema }) => { acc[tema] = (acc[tema] || 0) + 1; return acc; }, {});
        const subcategoryCounts = subjects.reduce((acc, { microtema }) => { acc[microtema] = (acc[microtema] || 0) + 1; return acc; }, {});
        const weekdayCounts = subjects.reduce((acc, { approvedDate }) => {
            const dayIndex = new Date(approvedDate).getDay();
            acc[dayIndex] = (acc[dayIndex] || 0) + 1;
            return acc;
        }, { 0:0, 1:0, 2:0, 3:0, 4:0, 5:0, 6:0 });

        const uniqueDays = new Set(subjects.map(s => new Date(s.approvedDate).toLocaleDateString())).size;
        const dailyAverage = (subjects.length / (uniqueDays || 1)).toFixed(1);

        const findTopItem = (counts) => Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b, 'N/A');
        
        const topCategory = findTopItem(categoryCounts);
        const topSubcategory = findTopItem(subcategoryCounts);
        
        const weekdays = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
        const peakWeekdayIndex = findTopItem(weekdayCounts);
        const peakWeekday = weekdays[peakWeekdayIndex] || 'N/A';

        // Atualização dos KPIs na tela
        totalSubjectsEl.textContent = subjects.length;
        dailyAverageEl.textContent = dailyAverage;
        topCategoryEl.textContent = topCategory;
        topSubcategoryEl.textContent = topSubcategory;
        peakWeekdayEl.textContent = peakWeekday;

        renderCategoryChart(categoryCounts);
        renderDetailedList(subjects);
    }
    
    function renderCategoryChart(categoryData) {
        if (categoryChart) categoryChart.destroy();
        const chartLabels = Object.keys(categoryData);
        const chartValues = Object.values(categoryData);
        categoryChart = new Chart(chartCanvas, {
            type: 'pie',
            data: {
                labels: chartLabels,
                datasets: [{
                    label: 'Distribuição de Assuntos',
                    data: chartValues,
                    backgroundColor: ['#28ec63', '#678876', '#009640', '#db2777', '#fb7185', '#fde047', '#f97316', '#3b82f6'],
                    borderColor: '#ffffff',
                    borderWidth: 2
                }]
            },
            options: { responsive: true, plugins: { legend: { position: 'top' } } }
        });
    }

    function renderDetailedList(subjects) {
        const themeCounts = subjects.reduce((acc, { tema, microtema }) => {
            const themeKey = `${tema} > ${microtema}`;
            acc[themeKey] = (acc[themeKey] || 0) + 1;
            return acc;
        }, {});
        const sortedThemes = Object.entries(themeCounts).sort(([, a], [, b]) => b - a);
        reportResultsList.innerHTML = ''; // Limpa a lista antes de renderizar
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
        const reportArea = document.querySelector('.report-container'); 
        const originalButtonText = exportPdfBtn.innerHTML;
        exportPdfBtn.disabled = true;
        exportPdfBtn.innerHTML = '<i class="bi bi-hourglass-split"></i> Exportando...';

        html2canvas(reportArea, { scale: 2, useCORS: true }).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jspdf.jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            const today = new Date().toISOString().slice(0, 10);
            pdf.save(`relatorio-analitico-${today}.pdf`);
            exportPdfBtn.disabled = false;
            exportPdfBtn.innerHTML = originalButtonText;
        });
    }

    // --- EXECUÇÃO ---
    generateReportBtn.addEventListener('click', generateReport);
    exportPdfBtn.addEventListener('click', exportToPdf);
    generateReport();
});
