from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    """
    Carrega e valida as configurações da aplicação a partir de um ficheiro .env.
    Se uma variável obrigatória não for encontrada, a aplicação falhará ao iniciar
    com uma mensagem de erro clara.
    """
    # Configura a pydantic para ler o ficheiro .env na pasta raiz do projeto
    model_config = SettingsConfigDict(env_file='.env', env_file_encoding='utf-8', extra='ignore')

    # --- Variáveis da Base de Dados (Obrigatórias) ---
    DB_USER: str
    DB_PASSWORD: str
    DB_HOST: str
    DB_PORT: int
    DB_DATABASE: str

    # --- Chaves de API (Obrigatória) ---
    GROQ_API_KEY: str

    # --- Configurações do Modelo (com valores padrão) ---
    EMBEDDINGS_MODEL_NAME: str = "sentence-transformers/all-mpnet-base-v2"
    LLM_MODEL_NAME: str = "llama3-8b-8192"

    # Propriedade para construir a URL de conexão dinamicamente
    @property
    def DATABASE_URL(self) -> str:
        """Constrói a URL de conexão do SQLAlchemy a partir das variáveis."""
        return f"postgresql://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_DATABASE}"

# Tenta criar a instância de configurações.
# Se alguma variável obrigatória estiver em falta no .env, isto irá falhar.
try:
    settings = Settings()
except Exception as e:
    print("ERRO FATAL: Falha ao carregar as configurações. Verifique o seu ficheiro .env.")
    print(f"Detalhes: {e}")
    exit()

