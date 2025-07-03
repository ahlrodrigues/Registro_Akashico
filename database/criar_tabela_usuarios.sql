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
);