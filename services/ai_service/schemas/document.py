# schemas/document.py
from pydantic import BaseModel

# Modelo para a requisição de criação de embedding
class EmbedRequest(BaseModel):
    text_to_embed: str

# Modelo para a requisição de pergunta ao chatbot
class AskRequest(BaseModel):
    question: str
