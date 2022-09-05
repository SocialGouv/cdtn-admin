import os

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.engine.base import Connection

load_dotenv()


class PostgreSQLConnector:
    def __init__(self):
        self.user = os.getenv('POSTGRESQL_USER')
        self.password = os.getenv('POSTGRESQL_PASSWORD')
        self.host = os.getenv('POSTGRESQL_HOST')
        self.db = os.getenv('POSTGRESQL_CDTN_ADMIN_DB')
        self.port = os.getenv('POSTGRESQL_PORT')
        self.connection = self._get_connection()

    def _get_connection(self) -> Connection:
        connection_string = f'postgresql://{self.user}:{self.password}@{self.host}:{self.port}/{self.db}'
        connector = create_engine(connection_string)
        connection = connector.connect()
        return connection
