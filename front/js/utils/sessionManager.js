// Importa o serviço de autenticação para poder realizar o logout no servidor
import { apiAuthService } from '../services/apiAuthService.js';

// --- CONFIGURAÇÕES ---
// Lembrar de voltar para (5 * 60 * 1000) para produção.
const TIMEOUT_DURATION = 20 * 1000; // 20 segundos
let timeoutInterval;

/**
 * Função unificada de logout.
 * É chamada tanto por inatividade quanto por ação manual ou de outra aba.
 * @param {boolean} isTimeout - Indica se o logout foi por inatividade para mostrar a mensagem correta.
 */
async function logoutUser(isTimeout = false) {
    // Para o monitoramento para evitar chamadas repetidas
    clearInterval(timeoutInterval);
    
    if (isTimeout) {
        alert('Sua sessão expirou por inatividade. Por favor, faça login novamente.');
    }
    
    try {
        // Tenta invalidar a sessão no backend primeiro
        await apiAuthService.logout();
    } catch (error) {
        console.error("Erro ao encerrar sessão no servidor (isso é esperado se o token já for inválido):", error);
    } finally {
        // Independentemente do resultado da API, limpa o frontend e redireciona
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = '../index.html'; // Ajuste o caminho para sua página de login
    }
}

/**
 * Reseta o contador de inatividade sempre que o usuário interage com a página.
 */
function resetTimeoutTimer() {
    localStorage.setItem('last_activity_time', Date.now());
}

/**
 * O "vigia" que verifica o tempo de inatividade a cada 5 segundos.
 */
function checkTimeout() {
    const lastActivityTime = parseInt(localStorage.getItem('last_activity_time') || '0', 10);
    if (Date.now() - lastActivityTime > TIMEOUT_DURATION) {
        logoutUser(true);
    }
}

/**
 * O "vigia" que escuta por eventos de logout em outras abas.
 * A lógica agora é mais simples: se a sessão ativa mudar, esta aba está obsoleta.
 */
function listenForCrossTabLogout() {
    window.addEventListener('storage', (event) => {
        // Se a chave 'authToken' for removida ou 'active_session_id' for alterada em outra aba...
        if (event.key === 'authToken' && !event.newValue) {
            alert('Você se desconectou em outra aba.');
            logoutUser();
        } else if (event.key === 'active_session_id' && event.newValue !== sessionStorage.getItem('my_tab_session_id')) {
            alert('Sua sessão foi encerrada porque você se conectou em uma nova aba ou janela.');
            logoutUser();
        }
    });

    // Verificação inicial
    const currentSessionId = localStorage.getItem('active_session_id');
    if (!sessionStorage.getItem('my_tab_session_id')) {
        sessionStorage.setItem('my_tab_session_id', currentSessionId);
    } else if (sessionStorage.getItem('my_tab_session_id') !== currentSessionId) {
        alert('Sua sessão foi encerrada em outra aba. Você será desconectado.');
        logoutUser();
    }
}

/**
 * Função principal exportada.
 * Ela inicia todo o monitoramento de segurança da sessão no frontend.
 */
export function startSessionManagement() {
    // Garante que só executa se houver um token (usuário logado)
    if (!localStorage.getItem('authToken')) {
        alert("Acesso negado. Por favor, faça login.");
        window.location.href = '../index.html';
        return;
    }

    // Inicia os "vigias"
    const activityEvents = ['mousemove', 'mousedown', 'keypress', 'scroll', 'touchstart'];
    activityEvents.forEach(event => window.addEventListener(event, resetTimeoutTimer));
    timeoutInterval = setInterval(checkTimeout, 5000);
    
    listenForCrossTabLogout();
    resetTimeoutTimer(); // Define a primeira marca de atividade
}
