# main.py
import uvicorn
from fastapi import FastAPI

# Como o projeto está instalado em modo editável,
# estas importações agora funcionam de forma nativa e fiável.
from api.router import api_router

# Cria a instância principal da aplicação FastAPI
app = FastAPI(
    title="Serviço de IA para Bot de Atendimento Inteligente",
    version="1.0.0"
)

# Inclui todas as rotas definidas no 'api_router'
app.include_router(api_router)

# Ponto de entrada para executar o servidor
if __name__ == "__main__":
    # Usamos a forma recomendada para uvicorn, que funciona bem com projetos instalados
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)
