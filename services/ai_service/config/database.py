from sqlalchemy import create_engine
from .settings import settings

print("A estabelecer conexão com a base de dados...")

try:
    # Cria o 'engine' do SQLAlchemy usando a URL do ficheiro de configuração
    engine = create_engine(settings.DATABASE_URL)
    
    # Testa a conexão ao iniciar
    with engine.connect() as connection:
        print("Conexão com a base de dados PostgreSQL estabelecida com sucesso.")
except Exception as e:
    print(f"ERRO FATAL: Não foi possível conectar-se à base de dados: {e}")
    exit()
