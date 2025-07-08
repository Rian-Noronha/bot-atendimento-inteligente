from langchain_huggingface import HuggingFaceEmbeddings
from langchain_groq import ChatGroq
from config.settings import settings

print("A carregar os modelos de IA...")

# Carrega e inicializa o modelo de embeddings uma única vez
embeddings_model = HuggingFaceEmbeddings(
    model_name=settings.EMBEDDINGS_MODEL_NAME
)

# Carrega e inicializa o LLM uma única vez
llm = ChatGroq(
    api_key=settings.GROQ_API_KEY, 
    model_name=settings.LLM_MODEL_NAME
)

print("Modelos de IA carregados com sucesso.")
