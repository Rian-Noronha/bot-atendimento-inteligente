// Importa a instância do storage do arquivo de configuração
import { storage } from '../config/firebase.js'; 
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

export const storageService = {
    /**
     * Envia um arquivo para o Firebase Storage e retorna a URL de download.
     * @param {File} file - O arquivo a ser enviado.
     * @param {string} folderPath - A pasta de destino no Firebase Storage.
     * @returns {Promise<string>} A URL pública do arquivo.
     */
    async uploadFile(file, folderPath = 'documents') {
        return new Promise((resolve, reject) => {
            const fileName = `${Date.now()}_${file.name}`;
            const storageRef = ref(storage, `${folderPath}/${fileName}`);
            const uploadTask = uploadBytesResumable(storageRef, file);

            uploadTask.on('state_changed',
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    console.log(`Upload: ${progress.toFixed(2)}%`);
                },
                (error) => {
                    console.error("Erro no upload para Firebase:", error);
                    reject(new Error('Falha no upload do arquivo.'));
                },
                async () => {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    resolve(downloadURL);
                }
            );
        });
    }
};