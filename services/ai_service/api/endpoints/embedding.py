# api/endpoints/embedding.py
from fastapi import APIRouter, HTTPException
from schemas.document import EmbedRequest
from core.models import embeddings_model # Importa o modelo já inicializado

# Cria um "roteador" 
router = APIRouter()

@router.post("/create-embedding", summary="Gera um embedding para um texto")
async def create_embedding(request: EmbedRequest):
    """
    Recebe um bloco de texto e retorna o seu vetor de embedding.
    """
    try:
        print(f"A gerar embedding para o texto: '{request.text_to_embed[:50]}...'")
        vector = embeddings_model.embed_query(request.text_to_embed)
        print("Embedding gerado com sucesso.")
        return {"embedding": vector}
    except Exception as e:
        print(f"Erro ao gerar embedding: {e}")
        raise HTTPException(status_code=500, detail="Erro interno ao gerar o embedding.")
