import { storage } from './firebaseService.js'; 
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

export const apiUploadService = {
    async uploadFileToFirebaseStorage(file, folderPath = 'documents') { // Pode passar a pasta como parâmetro
        return new Promise((resolve, reject) => {
            const fileName = `${file.name}_${Date.now()}`;
            const storageRef = ref(storage, `${folderPath}/${fileName}`); // Ref para o arquivo

            const uploadTask = uploadBytesResumable(storageRef, file);

            uploadTask.on('state_changed',
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    console.log(`Upload do arquivo: ${progress.toFixed(2)}% concluído`);
                    //emitir um evento aqui ou passar uma callback para atualizar a UI do upload.js
                },
                (error) => {
                    console.error("Erro no upload para Firebase Storage:", error);
                    reject(new Error('Falha no upload do arquivo para o Firebase Storage: ' + error.message));
                },
                async () => {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    console.log('Arquivo disponível em:', downloadURL);
                    resolve(downloadURL);
                }
            );
        });
    }
};