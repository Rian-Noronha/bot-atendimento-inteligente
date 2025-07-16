# ficheiro: api/endpoints/rag.py (VERSÃO FINAL E LIMPA)

from fastapi import APIRouter, HTTPException
from sqlalchemy import text
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
import math

from schemas.document import AskRequest
from models.loader import embeddings_model, llm
from config.database import engine

router = APIRouter()

DEFAULT_HNSW_EF_SEARCH = 100

@router.post("/ask", summary="Responde a uma pergunta usando RAG com PGVector")
async def ask_question(request: AskRequest):
    try:
        print(f"A processar a pergunta: '{request.question}'")
        
        question_embedding = embeddings_model.embed_query(request.question)

        # Query final de produção com o filtro WHERE reativado
        query = text("""
            WITH nearest_neighbors AS (
                SELECT 
                    id, 
                    titulo, 
                    descricao, 
                    solucao,
                    "urlArquivo",
                    embedding <=> (:query_vector)::vector AS distance
                FROM 
                    documentos
                ORDER BY 
                    distance ASC
                LIMIT 
                    :top_k
            )
            SELECT 
                id, 
                titulo, 
                descricao, 
                solucao,
                "urlArquivo",
                1 - distance AS similarity
            FROM 
                nearest_neighbors
            WHERE 
                1 - distance > :similarity_threshold
            ORDER BY
                similarity DESC;
        """)
        
        with engine.connect() as connection:
            with connection.begin() as transaction:
                print(f"Usando hnsw.ef_search = {DEFAULT_HNSW_EF_SEARCH}")
                
                connection.execute(
                    text("SET LOCAL hnsw.ef_search = :ef_search"),
                    {"ef_search": DEFAULT_HNSW_EF_SEARCH}
                )

                results = connection.execute(
                    query, 
                    {
                        "query_vector": question_embedding, 
                        "similarity_threshold": request.similarity_threshold,
                        "top_k": request.top_k
                    }
                ).mappings().all()

        if not results:
            print(f"Nenhum documento encontrado para a pergunta '{request.question}' com o limiar de {request.similarity_threshold}")
            return {
                "answer": "Desculpe, não encontrei nenhuma informação suficientemente relevante sobre isso em minha base de conhecimento.",
                "source_document_id": None
            }

        top_result = results[0]
        source_document_id = top_result['id']
        source_document_url = top_result['urlArquivo']
        source_document_title = top_result['titulo']
        print(f"Documento fonte encontrado. ID: {source_document_id} com similaridade: {results[0]['similarity']:.4f}")

        context = "\n\n---\n\n".join([
            f"Fonte (ID: {row['id']}):\nTítulo: {row['titulo']}\nDescrição: {row['descricao']}\nSolução: {row['solucao']}" 
            for row in results
        ])
        
        prompt_template = ChatPromptTemplate.from_template(
            "Você é um assistente prestativo. Use o seguinte contexto para responder à pergunta. Seja direto e conciso.\n\nContexto:\n{context}\n\nPergunta: {question}\n\nResposta:"
        )
        rag_chain = prompt_template | llm | StrOutputParser()
        
        answer = rag_chain.invoke({"context": context, "question": request.question})
        
        return {
            "answer": answer,
            "source_document_id": source_document_id,
            "source_document_url": source_document_url,
            "source_document_title": source_document_title
        }
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Ocorreu um erro inesperado ao processar a sua pergunta.")