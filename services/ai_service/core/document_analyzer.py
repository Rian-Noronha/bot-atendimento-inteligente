# ficheiro: core/document_analyzer.py (Versão final com Google Gemini)

import requests
import io
import re
from typing import List

from models.loader import embeddings_model
from schemas.document import DocumentProcessRequest

# --- Imports do Unstructured ---
from unstructured.partition.auto import partition
from unstructured.documents.elements import Element


async def process_and_generate_chunks(request_data: DocumentProcessRequest) -> List[dict]:
    """
    Processa um documento, divide-o em chunks e gera embeddings para todos 
    os chunks de forma otimizada usando uma única chamada de API em lote.
    """
    # --- ETAPA 1: EXTRAIR O TEXTO DO DOCUMENTO (Nenhuma mudança aqui) ---
    elements: List[Element] = []
    if request_data.url_arquivo:
        print(f"Iniciando processamento com Unstructured para a URL: {request_data.url_arquivo}")
        try:
            response = requests.get(request_data.url_arquivo)
            response.raise_for_status()
            file_content = response.content
            elements = partition(file=io.BytesIO(file_content), strategy="fast")
        except Exception as e:
            raise ValueError(f"Erro ao processar o arquivo com Unstructured: {e}")

    if not elements:
        raise ValueError("Unstructured não conseguiu extrair elementos do documento.")

    full_text = "\n\n".join([el.text for el in elements if el.text.strip()])
    logical_blocks = re.split(r'(?=\n#\s)', full_text)
    print(f"Documento dividido em {len(logical_blocks)} chunks usando o delimitador '#'.")

    # --- ETAPA 2: PREPARAR OS DADOS E TEXTOS PARA EMBEDDING (Nenhuma mudança aqui) ---
    chunks_to_process = []
    texts_for_embedding = []

    for chunk_text in logical_blocks:
        clean_chunk = chunk_text.strip()
        if not clean_chunk:
            continue

        # Extração das partes
        titulo_final = request_data.titulo
        descricao_final = request_data.descricao
        solucao_final = clean_chunk.lstrip('#').strip()
        
        match_titulo = re.search(r'#\s*(.*?)(?:\n|Descrição:)', clean_chunk, re.IGNORECASE)
        if match_titulo and match_titulo.group(1).strip():
            titulo_final = match_titulo.group(1).strip()

        match_descricao = re.search(r'Descrição:(.*?)(?=\s*Solução:|$)', clean_chunk, re.DOTALL | re.IGNORECASE)
        if match_descricao and match_descricao.group(1).strip():
            descricao_final = match_descricao.group(1).strip()
        
        match_solucao = re.search(r'Solução:(.*)', clean_chunk, re.DOTALL | re.IGNORECASE)
        if match_solucao and match_solucao.group(1).strip():
            solucao_final = match_solucao.group(1).strip()
        
        texto_para_embedding = f"Título: {titulo_final}\nDescrição: {descricao_final}\nSolução: {solucao_final}"
        texts_for_embedding.append(texto_para_embedding)

        chunks_to_process.append({
            "titulo": titulo_final,
            "descricao": descricao_final,
            "solucao": solucao_final,
        })

    # --- ETAPA 3: GERAR EMBEDDINGS EM LOTE ---
    if not texts_for_embedding:
        return []

    print(f"--- Gerando embeddings para {len(texts_for_embedding)} chunks com a API do Google... ---")
    
    # A chamada agora é mais simples. O wrapper cuida do 'task_type' internamente.
    embeddings = embeddings_model.embed_documents(texts_for_embedding)

    print("--- Embeddings gerados com sucesso. ---")

    # --- ETAPA 4: MONTAR A RESPOSTA FINAL (Nenhuma mudança aqui) ---
    final_documents = []
    for chunk_data, embedding in zip(chunks_to_process, embeddings):
        final_documents.append({
            "titulo": chunk_data["titulo"],
            "descricao": chunk_data["descricao"],
            "solucao": chunk_data["solucao"],
            "subcategoria_id": request_data.subcategoria_id,
            "embedding": embedding,
            "urlArquivo": request_data.url_arquivo,
            "ativo": True
        })

    return final_documents