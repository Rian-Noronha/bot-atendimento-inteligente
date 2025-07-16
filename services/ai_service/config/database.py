# ficheiro: config/database.py

from sqlalchemy import create_engine
from .settings import settings

# Apenas crie o 'engine'. O SQLAlchemy gerenciará as conexões do pool sob demanda.
# A primeira query falhará se a conexão não for possível, o que é um comportamento
# mais controlável em uma API.
engine = create_engine(settings.DATABASE_URL)

print("Engine do SQLAlchemy criado. A conexão será estabelecida sob demanda.")