
import requests
import io
import re
from typing import List
from urllib.parse import urlparse
import os


from models.loader import embeddings_model
from config.settings import settings
from schemas.document import DocumentProcessRequest

# --- Imports do Unstructured ---
from unstructured.partition.auto import partition
from unstructured.documents.elements import Element

async def process_and_generate_chunks(request_data: DocumentProcessRequest) -> List[dict]:
    """
# --- Imports do Unstructured ---
    Versão final e simplificada: Usa um delimitador universal ('# ') para dividir
    o documento em chunks, conforme o modelo padrão fornecido pelo usuário.
    """
    # --- ETAPA 1: EXTRAIR O TEXTO DO DOCUMENTO ---
    elements: List[Element] = []
    if request_data.url_arquivo:
        print(f"Iniciando processamento com Unstructured para a URL: {request_data.url_arquivo}")
        try:
            response = requests.get(request_data.url_arquivo)
            response.raise_for_status()
            file_content = response.content
            # Podemos usar "fast", pois a estrutura é garantida pelo modelo.
            elements = partition(file=io.BytesIO(file_content), strategy="fast")
        except Exception as e:
            # ... seu código de erro ...
            raise ValueError(f"Erro ao processar o arquivo com Unstructured: {e}")

    if not elements:
        raise ValueError("Unstructured não conseguiu extrair elementos do documento.")

    full_text = "\n\n".join([el.text for el in elements if el.text.strip()])

    # --- ETAPA 2: DIVISÃO PELO DELIMITADOR UNIVERSAL '#' ---
    # A expressão regular agora é fixa e muito simples.
    # Ela divide o texto em cada ocorrência de uma nova linha seguida de "# ".
    # O (?=...) mantém o delimitador no início de cada chunk.
    logical_blocks = re.split(r'(?=\n#\s)', full_text)

    print(f"Documento dividido em {len(logical_blocks)} chunks usando o delimitador '#'.")

    # --- ETAPA 3: PROCESSAR OS CHUNKS ---
    processed_chunks = []
    for chunk_text in logical_blocks:
        # Limpa o chunk de espaços em branco no início/fim
        clean_chunk = chunk_text.strip()
        if not clean_chunk:
            continue
        
        # O título é a primeira linha, removendo o '#' inicial.
        specific_title = clean_chunk.split('\n', 1)[0].replace("#", "").strip()
        
        embedding = embeddings_model.embed_query(clean_chunk)
        
        chunk_data = {
            "titulo": request_data.titulo,
            "solucao": clean_chunk,
            # ... resto dos seus campos ...
            "descricao": request_data.descricao,
            "subcategoria_id": request_data.subcategoria_id,
            "embedding": embedding,
            "urlArquivo": request_data.url_arquivo,
            "ativo": True
        }
        processed_chunks.append(chunk_data)
    
    return processed_chunks