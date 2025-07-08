from pydantic import BaseModel
from typing import List, Any

# Modelo para a requisição de criação de embedding
class EmbedRequest(BaseModel):
    text_to_embed: str

# Modelo para a requisição de pergunta ao chatbot
class AskRequest(BaseModel):
    question: str

# Define que a requisição para análise deve ter uma URL e uma lista de categorias
class AnalyzeRequest(BaseModel):
    file_url: str
    categories: List[Any]
