import tkinter as tk
from tkinter import ttk
import sqlite3
import os
from ui.componentes.cabecalho import criar_cabecalho
from ui.componentes.rodape import criar_rodape
from ui.componentes.style import COR_FUNDO, COR_FONTE, FONTE_TEXTO, FONTE_SUBTITULO

CAMINHO_BD = os.path.join("searadeluz", "database", "usuarios.db")

class TelaListarAssistidos:
    def __init__(self, root, usuario_logado=None):
        self.root = root
        self.usuario_logado = usuario_logado or {}

        self.root.title("Lista de Assistidos – Registro Akáshico")
        try:
            self.root.state("zoomed")
        except:
            self.root.attributes("-zoomed", True)
        self.root.configure(bg=COR_FUNDO)

        criar_cabecalho(self.root, usuario=usuario_logado, trocar_tela=self.trocar_tela)

        self.frame = tk.Frame(root, bg=COR_FUNDO)
        self.frame.pack(padx=20, pady=20, fill='both', expand=True)

        tk.Label(self.frame, text="Buscar assistido:", font=FONTE_SUBTITULO,
                 bg=COR_FUNDO, fg=COR_FONTE).pack(anchor='w')

        self.buscar_var = tk.StringVar()
        buscar_entry = tk.Entry(self.frame, textvariable=self.buscar_var, font=FONTE_TEXTO, width=40)
        buscar_entry.pack(pady=(0, 10), anchor='w')
        buscar_entry.bind('<KeyRelease>', lambda event: self.carregar_assistidos())

        self.tree = ttk.Treeview(self.frame, columns=("id", "nome", "telefone", "funcao"), show='headings')
        self.tree.heading("id", text="ID")
        self.tree.heading("nome", text="Nome")
        self.tree.heading("telefone", text="Telefone")
        self.tree.heading("funcao", text="Função")
        self.tree.column("id", width=40)
        self.tree.pack(fill='both', expand=True, pady=10)

        criar_rodape(self.root, usuario=usuario_logado)
        self.carregar_assistidos()

    def carregar_assistidos(self):
        busca = self.buscar_var.get().lower()
        self.tree.delete(*self.tree.get_children())
        conn = sqlite3.connect(CAMINHO_BD)
        cursor = conn.cursor()
        cursor.execute("SELECT id, nome, telefone, funcao FROM usuarios ORDER BY nome")
        for row in cursor.fetchall():
            if busca in row[1].lower() or busca in (row[2] or "").lower():
                self.tree.insert("", "end", values=row)
        conn.close()

    def trocar_tela(self, destino):
        if destino == "sair":
            self.root.destroy()
        elif destino == "inicio":
            self.root.destroy()
            from ui.index import TelaInicio
            nova = tk.Tk()
            TelaInicio(nova, usuario=self.usuario_logado)
            nova.mainloop()
        elif destino == "assistidos":
            return
        else:
            import tkinter.messagebox as mb
            mb.showinfo("Funcionalidade", f"Tela '{destino}' ainda não implementada.")

if __name__ == '__main__':
    root = tk.Tk()
    TelaListarAssistidos(root, usuario_logado={"nome": "Antonio", "funcao": "ADM"})
    root.mainloop()