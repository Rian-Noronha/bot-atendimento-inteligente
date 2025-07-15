from fastapi import APIRouter, HTTPException
from schemas.document import AskRequest
from models.loader import embeddings_model, llm
from config.database import engine
from sqlalchemy import text
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

router = APIRouter()

@router.post("/ask", summary="Responde a uma pergunta usando RAG com PGVector")
async def ask_question(request: AskRequest):
    """
    Recebe uma pergunta, faz uma busca semântica, gera a resposta
    e retorna o ID do documento fonte mais relevante.
    """
    try:
        print(f"A processar a pergunta: '{request.question}'")
        question_embedding = embeddings_model.embed_query(request.question)

        # usar os parâmetros e buscar a descrição
        query = text("""
            SELECT id, titulo, descricao, solucao, 1 - (embedding <=> :query_vector) AS similaridade
            FROM documentos
            WHERE 1 - (embedding <=> :query_vector) > :threshold
            ORDER BY similaridade DESC
            LIMIT :top_k
        """)
        
        with engine.connect() as connection:
            results = connection.execute(
                query, 
                {
                    "query_vector": str(question_embedding),
                    "threshold": request.similarity_threshold,
                    "top_k": request.top_k
                }
            ).mappings().fetchall() # Usar .mappings() para acessar colunas pelo nome

        if not results:
            print("Nenhum documento relevante encontrado.")
            return {
                "answer": "Desculpe, não encontrei nenhuma informação relevante sobre isso.",
                "source_document_id": None
            }

        source_document_id = results[0]['id'] # Acessando pelo nome da coluna
        print(f"Documento fonte mais relevante encontrado. ID: {source_document_id}")

        # Contexto enriquecido com a descrição
        context = "\n\n---\n\n".join([
            f"Fonte (ID: {row['id']}):\nTítulo: {row['titulo']}\nDescrição: {row['descricao']}\nSolução: {row['solucao']}" 
            for row in results
        ])
        
        prompt_template = ChatPromptTemplate.from_template(
            "Você é um assistente prestativo. Use o seguinte contexto para responder à pergunta. Seja direto.\n\nContexto:\n{context}\n\nPergunta: {question}\n\nResposta:"
        )
        rag_chain = prompt_template | llm | StrOutputParser()
        
        answer = rag_chain.invoke({"context": context, "question": request.question})
        
        return {
            "answer": answer,
            "source_document_id": source_document_id
        }
        
    except Exception as e:
        print(f"Erro no processo RAG: {e}")
        raise HTTPException(status_code=500, detail="Ocorreu um erro ao processar a sua pergunta.")