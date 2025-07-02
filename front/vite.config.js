// vite.config.js
import { defineConfig } from 'vite';
import path from 'path'; // Importa o módulo 'path' do Node.js

export default defineConfig({
  // Define a pasta raiz do seu projeto frontend para o Vite.
  // Como 'vite.config.js' está em 'front/', e seus HTMLs estão em 'front/' ou 'front/pages/',
  // '.' (o diretório atual) é o caminho correto para a raiz do frontend.
  root: './',

  // Configurações de build para quando você for para produção (npm run build)
  build: {
    // Onde os arquivos empacotados (bundle) serão colocados.
    // 'dist' será criado dentro do 'root' (ou seja, 'front/dist').
    outDir: 'dist',
    // Limpa a pasta de saída ('dist') antes de cada build para garantir um build limpo.
    emptyOutDir: true,

    // Configurações avançadas do Rollup (o empacotador que o Vite usa internamente).
    // Usado aqui para definir as múltiplas entradas HTML do seu aplicativo.
    rollupOptions: {
      input: {
        // 'main' é um nome arbitrário, mas é comum para a página principal.
        // path.resolve(__dirname, 'index.html') resolve o caminho absoluto para 'front/index.html'.
        main: path.resolve(__dirname, 'index.html'),
        
        // Sua página de upload.html
        // path.resolve(__dirname, 'pages/upload.html') resolve o caminho absoluto para 'front/pages/upload.html'.
        upload: path.resolve(__dirname, 'pages/upload.html'),

        // Adicione outras páginas HTML que você tiver na pasta 'pages' aqui.
        // Exemplo:
        knowledge_library: path.resolve(__dirname, 'pages/knowledge_library.html'),
        dashboard: path.resolve(__dirname, 'pages/dashboard.html'),
        forgot_password: path.resolve(__dirname, 'pages/forgot_password.html'),
        register: path.resolve(__dirname, 'pages/register.html'),
        report: path.resolve(__dirname, 'pages/report.html'),
        reset_password: path.resolve(__dirname, 'pages/reset_password.html'),
        users: path.resolve(__dirname, 'pages/users.html'),
        chat_bot: path.resolve(__dirname, 'pages/chat_bot.html'),
      },
    },
  },

  // Configurações para o servidor de desenvolvimento (npm run dev)
  server: {
    // Abre automaticamente o navegador na URL especificada quando o servidor inicia.
    // Ajuste para a página que você usa mais frequentemente para desenvolvimento.
    open: '/pages/upload.html', 

    // Configuração de proxy para o backend. Isso ajuda a evitar problemas de CORS.
    // Requisições do frontend para '/api/*' serão redirecionadas para o seu backend.
    proxy: {
      '/api': {
        target: 'http://localhost:3000', // URL do seu backend Node.js
        changeOrigin: true, // Necessário para virtual hosts baseados em nome
        rewrite: (path) => path.replace(/^\/api/, ''), // Remove '/api' do caminho antes de enviar para o backend
      },
    },
  },
});