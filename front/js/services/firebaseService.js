import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage"; 

const firebaseConfig = {
  apiKey: "AIzaSyCtVGZCHVdzSxHSAvKOKDinLWZ_o51jAa8",
  authDomain: "bot-atendimento-inteligente.firebaseapp.com",
  projectId: "bot-atendimento-inteligente",
  storageBucket: "bot-atendimento-inteligente.firebasestorage.app",
  messagingSenderId: "51017091598",
  appId: "1:51017091598:web:299dbe0c4c3b485dd48a5f",
  measurementId: "G-MWPEJTYWF9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const storage = getStorage(app);
