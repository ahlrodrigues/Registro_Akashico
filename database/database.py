import sqlite3
import os

CAMINHO_BD = os.path.join("searadeluz", "database", "usuarios.db")
os.makedirs(os.path.dirname(CAMINHO_BD), exist_ok=True)

def criar_banco():
    conn = sqlite3.connect(CAMINHO_BD)
    cursor = conn.cursor()

    cursor.execute("""
CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    apelido TEXT,
    dataNascimento TEXT NOT NULL,
    grau TEXT,
    telefone TEXT NOT NULL,
    redes TEXT,
    email TEXT,
    whatsapp TEXT,
    funcao TEXT,
    data_criacao TEXT DEFAULT CURRENT_TIMESTAMP
)
    """)

    conn.commit()
    conn.close()

if __name__ == "__main__":
    criar_banco()
    print("Banco de dados criado com sucesso.")