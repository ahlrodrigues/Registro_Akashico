import tkinter as tk
from tkinter import messagebox
from ui.componentes.style import COR_FUNDO, COR_FONTE, FONTE_TITULO, FONTE_PEQUENA, FONTE_TEXTO
from ui.componentes.cabecalho import criar_cabecalho
from ui.componentes.rodape import criar_rodape

class TelaLogin:
    def __init__(self, root):
        self.root = root
        self.root.title("Login – Registro Akáshico")
        try:
            self.root.state("zoomed")
        except:
            self.root.attributes("-zoomed", True)
        self.root.configure(bg=COR_FUNDO)

        criar_cabecalho(self.root)

        self.frame = tk.Frame(root, bg=COR_FUNDO)
        self.frame.pack(expand=True)

        tk.Label(self.frame, text="Usuário:", bg=COR_FUNDO, fg=COR_FONTE, font=FONTE_TEXTO).grid(row=0, column=0, pady=10, sticky="e")
        self.usuario_entry = tk.Entry(self.frame, font=FONTE_TEXTO)
        self.usuario_entry.grid(row=0, column=1, pady=10)

        tk.Label(self.frame, text="Senha:", bg=COR_FUNDO, fg=COR_FONTE, font=FONTE_TEXTO).grid(row=1, column=0, pady=10, sticky="e")
        self.senha_entry = tk.Entry(self.frame, show="*", font=FONTE_TEXTO)
        self.senha_entry.grid(row=1, column=1, pady=10)

        tk.Button(self.frame, text="Entrar", command=self.login, font=FONTE_TEXTO).grid(row=2, columnspan=2, pady=20)

        criar_rodape(self.root)

    def login(self):
        usuario = self.usuario_entry.get()
        senha = self.senha_entry.get()
        if usuario == "admin" and senha == "admin":
            messagebox.showinfo("Login", "Login bem-sucedido!")
        else:
            messagebox.showerror("Erro", "Credenciais inválidas.")