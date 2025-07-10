import requests
import io
from pypdf import PdfReader
import docx
from langchain_text_splitters import RecursiveCharacterTextSplitter
from transformers import AutoTokenizer

from models.loader import embeddings_model
from config.settings import settings
from schemas.document import DocumentProcessRequest

# --- Configuração do Divisor de Texto (Chunker) ---
tokenizer = AutoTokenizer.from_pretrained(settings.EMBEDDINGS_MODEL_NAME)

text_splitter = RecursiveCharacterTextSplitter.from_huggingface_tokenizer(
    tokenizer=tokenizer,
    chunk_size=512,
    chunk_overlap=50,
)

def _extract_text_from_pdf(content: bytes) -> str:
    """Função auxiliar para extrair texto de um conteúdo de arquivo PDF."""
    try:
        reader = PdfReader(io.BytesIO(content))
        text = "".join(page.extract_text() or "" for page in reader.pages)
        return text
    except Exception as e:
        print(f"Erro ao extrair texto do PDF: {e}")
        return ""

def _extract_text_from_docx(content: bytes) -> str:
    """Função auxiliar para extrair texto de um conteúdo de arquivo DOCX."""
    try:
        doc = docx.Document(io.BytesIO(content))
        text = "\n".join([para.text for para in doc.paragraphs if para.text.strip()])
        return text
    except Exception as e:
        print(f"Erro ao extrair texto do DOCX: {e}")
        return ""

async def process_and_generate_chunks(request_data: DocumentProcessRequest):
    """
    Orquestra o processamento do documento e retorna uma lista de "documentos-chunk"
    prontos para serem salvos no banco pelo Node.js.
    """
    # Cenário 1: Processamento automático a partir de uma URL de ficheiro
    if request_data.url_arquivo:
        print(f"Iniciando processamento automático para a URL: {request_data.url_arquivo}")
        
        response = requests.get(request_data.url_arquivo)
        response.raise_for_status()
        
        file_content = response.content
        if request_data.url_arquivo.lower().endswith('.pdf'):
            text = _extract_text_from_pdf(file_content)
        elif request_data.url_arquivo.lower().endswith('.docx'):
            text = _extract_text_from_docx(file_content)
        else:
            raise ValueError("Formato de ficheiro não suportado. Use .pdf ou .docx.")

        if not text.strip():
            raise ValueError("Não foi possível extrair texto do documento ou o documento está vazio.")

        chunks = text_splitter.split_text(text)
        print(f"Documento dividido em {len(chunks)} chunks.")

        processed_chunks = []
        for i, chunk_text in enumerate(chunks):
            embedding = embeddings_model.embed_query(chunk_text)
            
            chunk_data = {
                "titulo": request_data.titulo,
                "descricao": request_data.descricao,
                "subcategoria_id": request_data.subcategoria_id,
                "solucao": chunk_text,
                "embedding": embedding,
                "urlArquivo": request_data.url_arquivo, 
                "ativo": True
            }
            processed_chunks.append(chunk_data)
        
        return processed_chunks

    # Cenário 2: Processamento manual a partir do campo 'solucao'
    elif request_data.solucao:
        print("Iniciando processamento manual (sem ficheiro).")
        embedding = embeddings_model.embed_query(request_data.solucao)
        
        manual_document = {
            "titulo": request_data.titulo,
            "descricao": request_data.descricao,
            "subcategoria_id": request_data.subcategoria_id,
            "solucao": request_data.solucao,
            "embedding": embedding,
            "urlArquivo": None, 
            "ativo": True
        }
        return [manual_document]