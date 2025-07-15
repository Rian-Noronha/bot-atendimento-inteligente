import { storage } from '../config/firebase.js'; 
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
export const storageService = {
    /**
     * Envia um arquivo para o Firebase Storage, monitora o progresso e retorna a URL de download.
     * @param {File} file - O arquivo a ser enviado.
     * @param {string} folderPath - A pasta de destino no Firebase Storage (padrão: 'documents').
     * @param {function(number): void} [onProgress] - Callback opcional para receber o progresso do upload (de 0 a 100).
     * @returns {Promise<string>} Uma promessa que resolve para a URL pública do arquivo.
     */
    async uploadFile(file, folderPath = 'documents', onProgress) {
        // Retorna uma Promise para que possamos usar async/await na chamada
        return new Promise((resolve, reject) => {
            // Cria um nome de arquivo único para evitar sobreposições
            const fileName = `${Date.now()}_${file.name}`;
            const storageRef = ref(storage, `${folderPath}/${fileName}`);
            
            // Inicia o processo de upload
            const uploadTask = uploadBytesResumable(storageRef, file);

            // Listener que monitora o estado do upload em tempo real
            uploadTask.on('state_changed',
                
                // 1. Callback de progresso
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    console.log(`Upload: ${progress.toFixed(2)}%`);
                    // Se uma função de progresso foi fornecida no chamado, executa-a
                    if (onProgress) {
                        onProgress(progress);
                    }
                },
                
                // 2. Callback de erro
                (error) => {
                    console.error("Erro no upload para Firebase:", error);
                    // Rejeita a promise com uma mensagem de erro clara
                    reject(new Error('Falha no upload do arquivo. Verifique a configuração de CORS e as regras de segurança do Firebase.'));
                },
                
                // 3. Callback de sucesso (quando o upload termina)
                async () => {
                    try {
                        // Pega a URL de download pública do arquivo
                        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                        console.log('Arquivo disponível em:', downloadURL);
                        // Resolve a promise com a URL, completando a operação com sucesso
                        resolve(downloadURL);
                    } catch (error) {
                        console.error("Erro ao obter a URL de download:", error);
                        reject(new Error('Falha ao obter a URL de download após o upload.'));
                    }
                }
            );
        });
    }
};
