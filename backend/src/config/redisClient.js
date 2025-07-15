import { createClient } from 'redis';
const redisClient = createClient();

//  "escutas" para eventos de conexão.
redisClient.on('connect', () => {
    console.log('Conectado ao Redis com sucesso!');
});

redisClient.on('error', (err) => {
    console.error('Erro na conexão com o Redis:', err);
});

//auto-executável para garantir que ele tente conectar assim que o arquivo for carregado.
(async () => {
    await redisClient.connect();
})();


export default redisClient;