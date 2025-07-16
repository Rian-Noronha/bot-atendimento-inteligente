from pydantic import BaseModel, ValidationInfo, field_validator, Field
from typing import List, Optional

# Modelo para a requisição de pergunta ao chatbot
class AskRequest(BaseModel):
    question: str
    similarity_threshold: Optional[float] = Field(0.75, gt=0, le=1)
    top_k: Optional[int] = Field(3, gt=0, le=10) 

# --- Novo Schema para o Processamento de Documentos (com validador V2) ---
class DocumentProcessRequest(BaseModel):
    titulo: str
    subcategoria_id: int
    descricao: Optional[str] = None
    palavras_chave: Optional[List[str]] = []
    solucao: Optional[str] = None
    url_arquivo: Optional[str] = None 

    @field_validator('url_arquivo', mode='after')
    def check_solution_or_url(cls, v, info: ValidationInfo):
        if info.data.get('solucao') and v:
            raise ValueError("Forneça apenas 'solucao' ou 'url_arquivo', não ambos.")
        if not info.data.get('solucao') and not v:
            raise ValueError("É necessário fornecer ou 'solucao' (manual) ou 'url_arquivo' (processamento automático).")
        return v
