from pydantic import BaseModel, ValidationInfo, field_validator
from typing import List, Optional

# Modelo para a requisição de pergunta ao chatbot
class AskRequest(BaseModel):
    question: str

# --- Novo Schema para o Processamento de Documentos (com validador V2) ---
class DocumentProcessRequest(BaseModel):
    """
    Schema para a requisição de processamento de um novo documento.
    O frontend envia os metadados e escolhe entre o modo manual (com 'solucao')
    ou automático (com 'url_arquivo').
    """
    titulo: str
    subcategoria_id: int
    descricao: Optional[str] = None
    palavras_chave: Optional[List[str]] = []

    # O usuário deve fornecer OU a solução manual OU a URL do arquivo
    solucao: Optional[str] = None
    url_arquivo: Optional[str] = None

    @field_validator('url_arquivo', mode='after')
    def check_solution_or_url(cls, v, info: ValidationInfo):
        """ Garante que ou 'solucao' ou 'url_arquivo' seja fornecido, mas não ambos. """
        # O dicionário {'titulo': '...', 'subcategoria_id': ..., 'solucao': '...'} é acessado via info.data
        if info.data.get('solucao') and v:
            raise ValueError("Forneça apenas 'solucao' ou 'url_arquivo', não ambos.")
        if not info.data.get('solucao') and not v:
            raise ValueError("É necessário fornecer ou 'solucao' (manual) ou 'url_arquivo'.")
        return v
