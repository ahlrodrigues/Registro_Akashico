
-- Criação da tabela de usuários
CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome_completo TEXT NOT NULL,
    apelido TEXT,
    aniversario DATE,
    grau TEXT CHECK(grau IN ('Servidor', 'Discípulo')) NOT NULL,
    telefone TEXT,
    redes_sociais TEXT,
    email TEXT UNIQUE NOT NULL,
    whatsapp TEXT,
    funcao TEXT CHECK(funcao IN ('Recepção', 'Exame', 'Entrevista', 'ADM')) NOT NULL,
    senha_hash TEXT NOT NULL,
    data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP
);
