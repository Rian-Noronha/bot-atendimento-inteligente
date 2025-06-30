// js/dasboard.js

// Importa o novo serviço de API para Assuntos Pendentes
import { apiAssuntoPendenteService } from './services/apiAssuntoPendenteService.js';

document.addEventListener('DOMContentLoaded', () => {
    // --- Seletores de Elementos ---
    const hamburger = document.getElementById('hamburger');
    const aside = document.querySelector('aside');
    const searchInput = document.querySelector('header form input[type="text"]');
    const assuntosContainer = document.querySelector('section.assuntos > div');

    // --- Seletores do Modal de Decisão ---
    const assuntoDecisaoModal = document.getElementById('assunto-decisao-modal');
    const assuntoDecisaoIdInput = document.getElementById('assunto-decisao-id');
    const assuntoDecisaoCategoria = document.getElementById('assunto-decisao-categoria');
    const assuntoDecisaoSubcategoria = document.getElementById('assunto-decisao-subcategoria');
    const assuntoDecisaoPergunta = document.getElementById('assunto-decisao-pergunta');
    const btnSimCadastrar = document.getElementById('btn-sim-cadastrar');
    const btnNaoDescartar = document.getElementById('btn-nao-descartar');

    // --- Variável de Estado ---
    // Guarda todos os assuntos pendentes para evitar múltiplas chamadas à API para pesquisa
    let todosAssuntosPendentes = [];

    // --- Lógica de Sessão e UI (pode manter o seu código existente) ---
    // ... (O seu código de gestão de sessão, timeout e menu hamburger pode ser colocado aqui) ...

    /**
     * Busca os assuntos pendentes da API, armazena-os e renderiza os cards.
     */
    async function fetchAndRenderAssuntos() {
        assuntosContainer.innerHTML = '<p style="text-align: center; color: var(--cor-fonte-fraca);">A carregar assuntos pendentes...</p>';
        try {
            todosAssuntosPendentes = await apiAssuntoPendenteService.pegarTodosPendentes();
            renderCards(todosAssuntosPendentes);
        } catch (error) {
            console.error("Erro ao buscar assuntos pendentes:", error);
            assuntosContainer.innerHTML = `<p style="text-align: center; color: red;">${error.message}</p>`;
        }
    }

    /**
     * Renderiza os cards na página com base nos dados fornecidos.
     */
    function renderCards(assuntos) {
        assuntosContainer.innerHTML = '';
        if (assuntos.length === 0) {
            assuntosContainer.innerHTML = '<p style="text-align: center; color: var(--cor-fonte-fraca);">Nenhum assunto pendente para avaliação encontrado.</p>';
            return;
        }

        assuntos.forEach(assunto => {
            // Acede aos dados aninhados retornados pela sua API
            const categoriaNome = assunto.subcategoria?.categoria?.nome || 'N/A';
            const subcategoriaNome = assunto.subcategoria?.nome || 'N/A';
            const perguntaTexto = assunto.consulta?.pergunta || assunto.texto_assunto || 'Pergunta não disponível';

            const cardDiv = document.createElement('div');
            cardDiv.classList.add('card');
            cardDiv.dataset.id = assunto.id;
            cardDiv.style.cursor = 'pointer';

            cardDiv.innerHTML = `
                <div class="barra" style="background: linear-gradient(135deg, var(--cor-chamativa), var(--cor-fundo-ah-esquerda));"></div>
                <div class="conteudo">
                    <h3>${categoriaNome}</h3>
                    <h4>${subcategoriaNome}</h2>
                    <p>${perguntaTexto}</p>
                    <div class="acoes">
                        <button class="btn-decide-assunto" data-id="${assunto.id}" title="Avaliar assunto">
                            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="M440-280h80v-240h-80v240Zm40-320q17 0 28.5-11.5T520-640q0-17-11.5-28.5T480-680q-17 0-28.5 11.5T440-640q0 17 11.5 28.5T480-600Zm0 520q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/></svg> 
                        </button>
                    </div>
                </div>
            `;
            assuntosContainer.appendChild(cardDiv);
        });
    }

    /**
     * Lógica do Modal de Decisão (Aprovar/Descartar)
     */
    function openAssuntoDecisaoModal(assuntoId) {
        const assunto = todosAssuntosPendentes.find(a => a.id === assuntoId);
        if (assunto) {
            assuntoDecisaoIdInput.value = assunto.id;
            assuntoDecisaoCategoria.value = assunto.subcategoria?.categoria?.nome || 'N/A';
            assuntoDecisaoSubcategoria.value = assunto.subcategoria?.nome || 'N/A';
            assuntoDecisaoPergunta.value = assunto.consulta?.pergunta || assunto.texto_assunto;

            // Prepara o link para redirecionar com os dados para a página de upload
            const params = new URLSearchParams({
                titulo: assunto.consulta?.pergunta || assunto.texto_assunto,
                subcategoriaId: assunto.subcategoria?.id
            }).toString();
            btnSimCadastrar.href = `./upload.html?${params}`;
            
            assuntoDecisaoModal.style.display = 'flex';
        }
    }

    function closeAssuntoDecisaoModal() {
        assuntoDecisaoModal.style.display = 'none';
    }

    // --- Event Listeners ---

    assuntosContainer.addEventListener('click', (event) => {
        const clickedCard = event.target.closest('.card');
        if (clickedCard) {
            openAssuntoDecisaoModal(parseInt(clickedCard.dataset.id));
        }
    });

    btnNaoDescartar.addEventListener('click', async () => {
        const assuntoId = parseInt(assuntoDecisaoIdInput.value);
        if (confirm("Tem a certeza que deseja descartar este assunto? Ele não poderá ser recuperado.")) {
            try {
                await apiAssuntoPendenteService.atualizarStatus(assuntoId, 'descartado');
                alert("Assunto descartado com sucesso.");
                closeAssuntoDecisaoModal();
                fetchAndRenderAssuntos(); // Recarrega a lista para remover o card
            } catch (error) {
                alert(`Erro ao descartar o assunto: ${error.message}`);
            }
        }
    });

    btnSimCadastrar.addEventListener('click', async (event) => {
        event.preventDefault(); 
        const assuntoId = parseInt(assuntoDecisaoIdInput.value);
        try {
            await apiAssuntoPendenteService.atualizarStatus(assuntoId, 'aprovado');
            window.location.href = btnSimCadastrar.href;
        } catch (error) {
            alert(`Erro ao aprovar o assunto: ${error.message}`);
        }
    });

    assuntoDecisaoModal.addEventListener('click', (event) => {
        if (event.target === assuntoDecisaoModal) closeAssuntoDecisaoModal();
    });
    
    searchInput.addEventListener('input', () => {
        const termo = searchInput.value.toLowerCase().trim();
        const filtrados = todosAssuntosPendentes.filter(assunto => {
             const textoCompleto = `
                ${assunto.subcategoria?.categoria?.nome || ''} 
                ${assunto.subcategoria?.nome || ''} 
                ${assunto.consulta?.pergunta || assunto.texto_assunto}
            `.toLowerCase();
            return textoCompleto.includes(termo);
        });
        renderCards(filtrados);
    });

    // --- INICIALIZAÇÃO ---
    fetchAndRenderAssuntos();
});
