import uvicorn
from fastapi import FastAPI


from api.endpoints.analysis import router as analysis_router
from api.endpoints.rag import router as rag_router

# Cria a instância principal da aplicação FastAPI
app = FastAPI(
    title="Serviço de IA para Bot de Atendimento",
    description="API para análise de documentos e busca semântica (RAG).",
    version="1.0.0"
)

# Rota para análise e processamento de documentos
app.include_router(
    analysis_router,
    prefix="/api",
    tags=["Análise de Documentos"]
)

# Rota para perguntas e respostas (RAG)
app.include_router(
    rag_router,
    prefix="/api",
    tags=["RAG"]
)

# Ponto de entrada para uma mensagem de status simples
@app.get("/", tags=["Root"])
def read_root():
    """Retorna uma mensagem simples para confirmar que o serviço está no ar."""
    return {"message": "Serviço de IA está operacional."}

# Bloco para permitir a execução direta do ficheiro
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)