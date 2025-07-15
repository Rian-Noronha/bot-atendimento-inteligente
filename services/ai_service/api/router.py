from fastapi import APIRouter
from .endpoints import document_process, rag 

# Cria o roteador principal da API que irá agregar os outros
api_router = APIRouter()


api_router.include_router(
    document_process.router, 
    tags=["Processamento de Documentos"] 
)

api_router.include_router(
    rag.router, 
    tags=["RAG - Perguntas e Respostas"]
)