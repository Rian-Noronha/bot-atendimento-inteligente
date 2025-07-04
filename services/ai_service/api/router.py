# api/router.py
from fastapi import APIRouter
from .endpoints import embedding, rag

# Roteador principal da API
api_router = APIRouter()

# Inclui os roteadores de cada endpoint, prefixando-os para que
# os URLs finais sejam /api/create-embedding e /api/ask
api_router.include_router(embedding.router, prefix="/api", tags=["Embedding"])
api_router.include_router(rag.router, prefix="/api", tags=["RAG"])
