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

        # A query já ordena por similaridade, o mais relevante vem primeiro
        query = text("""
            SELECT id, titulo, solucao, 1 - (embedding <=> :query_vector) AS similaridade
            FROM documentos
            WHERE 1 - (embedding <=> :query_vector) > 0.6
            ORDER BY similaridade DESC
            LIMIT 3
        """)
        
        with engine.connect() as connection:
            results = connection.execute(query, {"query_vector": str(question_embedding)}).fetchall()

        # ✅ PASSO 1: Preparar a variável para o ID do documento fonte
        source_document_id = None

        # Se não encontrarmos resultados, a resposta é genérica e não há fonte.
        if not results:
            print("Nenhum documento relevante encontrado.")
            return {
                "answer": "Desculpe, não encontrei nenhuma informação relevante sobre isso.",
                "source_document_id": None
            }

        # ✅ PASSO 2: Capturar o ID do documento mais similar (o primeiro da lista)
        # O ID é a primeira coluna (índice 0) da primeira linha (índice 0) dos resultados.
        source_document_id = results[0][0]
        print(f"Documento fonte mais relevante encontrado. ID: {source_document_id}")

        # Monta o contexto para a IA com os documentos encontrados
        context = "\n\n---\n\n".join([
            f"Fonte (ID: {row[0]}): \nTítulo: {row[1]}\nSolução: {row[2]}" for row in results
        ])
        
        prompt_template = ChatPromptTemplate.from_template(
            "Você é um assistente prestativo. Use o seguinte contexto para responder à pergunta. Seja direto.\n\nContexto:\n{context}\n\nPergunta: {question}\n\nResposta:"
        )
        rag_chain = prompt_template | llm | StrOutputParser()
        
        answer = rag_chain.invoke({"context": context, "question": request.question})
        
        # ✅ PASSO 3: Retornar a resposta e o ID do documento fonte
        return {
            "answer": answer,
            "source_document_id": source_document_id
        }
        
    except Exception as e:
        print(f"Erro no processo RAG: {e}")
        raise HTTPException(status_code=500, detail="Ocorreu um erro ao processar a sua pergunta.")