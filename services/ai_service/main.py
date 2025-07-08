import uvicorn
from fastapi import FastAPI

# 1. Importar os roteadores 
from api.endpoints.analysis import router as analysis_router
from api.endpoints.embedding import router as embedding_router # Roteador do seu endpoint de embedding
from api.endpoints.rag import router as rag_router             # Roteador do seu novo endpoint RAG

# 2. Cria a instância principal da aplicação FastAPI com metadados
app = FastAPI(
    title="Serviço de IA para Bot de Atendimento",
    description="API para análise de documentos, geração de embeddings e busca semântica (RAG).",
    version="1.0.0"
)


# Rota para análise automática de documentos
app.include_router(
    analysis_router,
    prefix="/api",
    tags=["Análise de Documentos"] # Agrupa os endpoints de análise
)

# Rota para criação de embeddings
app.include_router(
    embedding_router,
    prefix="/api",
    tags=["Embeddings"] # Agrupa os endpoints de embedding
)

# Rota para perguntas e respostas (RAG)
app.include_router(
    rag_router,
    prefix="/api",
    tags=["RAG"] # Agrupa os endpoints de RAG
)

# Ponto de entrada para uma mensagem de status simples
@app.get("/", tags=["Root"])
def read_root():
    """Retorna uma mensagem simples para confirmar que o serviço está no ar."""
    return {"message": "Serviço de IA está operacional."}

# Bloco para permitir a execução direta do arquivo
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)