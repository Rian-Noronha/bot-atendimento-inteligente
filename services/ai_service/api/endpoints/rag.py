# api/endpoints/rag.py
from fastapi import APIRouter, HTTPException
from schemas.document import AskRequest
from core.models import embeddings_model, llm
from core.database import engine
from sqlalchemy import text
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

router = APIRouter()

@router.post("/ask", summary="Responde a uma pergunta usando RAG com PGVector")
async def ask_question(request: AskRequest):
    """
    Recebe uma pergunta, faz uma busca semântica e gera a resposta.
    """
    try:
        print(f"A processar a pergunta: '{request.question}'")
        question_embedding = embeddings_model.embed_query(request.question)

        query = text("""
            SELECT id, titulo, solucao, 1 - (embedding <=> :query_vector) AS similaridade
            FROM documentos
            WHERE 1 - (embedding <=> :query_vector) > 0.4
            ORDER BY similaridade DESC
            LIMIT 3
        """)
        
        with engine.connect() as connection:
            results = connection.execute(query, {"query_vector": str(question_embedding)}).fetchall()

        if not results:
            return {"answer": "Desculpe, não encontrei nenhuma informação relevante sobre isso."}

        context = "\n\n---\n\n".join([
            f"Fonte (ID: {row[0]}): \nTítulo: {row[1]}\nSolução: {row[2]}" for row in results
        ])
        
        prompt_template = ChatPromptTemplate.from_template(
            "Você é um assistente prestativo. Use o seguinte contexto para responder à pergunta. Seja direto.\n\nContexto:\n{context}\n\nPergunta: {question}\n\nResposta:"
        )
        rag_chain = prompt_template | llm | StrOutputParser()
        
        answer = rag_chain.invoke({"context": context, "question": request.question})
        return {"answer": answer}
        
    except Exception as e:
        print(f"Erro no processo RAG: {e}")
        raise HTTPException(status_code=500, detail="Ocorreu um erro ao processar a sua pergunta.")
