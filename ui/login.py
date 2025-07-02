import tkinter as tk
from tkinter import messagebox
import sqlite3
import hashlib
import os
import sys

# Corrigir import do config.py
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))
from config import APP_NOME_COMPLETO
from ui.componentes.cabecalho import criar_cabecalho
from ui.componentes.rodape import criar_rodape

def conectar():
    os.makedirs("searadeluz/database", exist_ok=True)
    return sqlite3.connect("searadeluz/database/searadeluz.db")

def hash_senha(senha):
    return hashlib.sha256(senha.encode()).hexdigest()

class TelaLogin:
    def __init__(self, root):
        self.root = root
        self.root.title("Login – Registro Akáshico")
        try:
            self.root.state('zoomed')  # Windows
        except:
            self.root.attributes('-zoomed', True)  # Linux

        self.root.configure(bg='#E0FFFF')

        criar_cabecalho(self.root)

        # Frame centralizado para os campos
        frame = tk.Frame(self.root, bg='#E0FFFF')
        frame.pack(expand=True)

        tk.Label(frame, text="Email", bg='#E0FFFF', fg='#00008B', font=('Arial', 12)).pack(pady=5)
        self.email_entry = tk.Entry(frame, width=40, font=('Arial', 12))
        self.email_entry.pack()

        tk.Label(frame, text="Senha", bg='#E0FFFF', fg='#00008B', font=('Arial', 12)).pack(pady=5)
        self.senha_entry = tk.Entry(frame, show="*", width=40, font=('Arial', 12))
        self.senha_entry.pack()

        tk.Button(frame, text="Entrar", font=('Arial', 12), command=self.login).pack(pady=20)

        criar_rodape(self.root)

        self.usuario_logado = None

    def login(self):
        email = self.email_entry.get().strip()
        senha = self.senha_entry.get().strip()

        if not email or not senha:
            messagebox.showwarning("Campos obrigatórios", "Informe email e senha.")
            return

        senha_criptografada = hash_senha(senha)
        conn = conectar()
        cursor = conn.cursor()
        cursor.execute("SELECT id, nome_completo, funcao FROM usuarios WHERE email=? AND senha_hash=?", (email, senha_criptografada))
        usuario = cursor.fetchone()
        conn.close()

        if usuario:
            user_id, nome, funcao = usuario
            self.usuario_logado = {
                "id": user_id,
                "nome": nome,
                "email": email,
                "funcao": funcao
            }
            messagebox.showinfo("Bem-vindo", f"Acesso liberado para: {nome} ({funcao})")
            self.root.destroy()
            from ui.cadastro_usuario import TelaCadastroUsuario
            nova_janela = tk.Tk()
            TelaCadastroUsuario(nova_janela)
            nova_janela.mainloop()
        else:
            messagebox.showerror("Erro", "Email ou senha incorretos.")