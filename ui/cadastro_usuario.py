
import tkinter as tk
from ui.componentes.cabecalho import criar_cabecalho
from ui.componentes.rodape import criar_rodape
from tkinter import messagebox, ttk
import sqlite3
import hashlib
import os

# Conexão simples com SQLite local
def conectar():
    os.makedirs("searadeluz/database", exist_ok=True)
    return sqlite3.connect("searadeluz/database/searadeluz.db")

def hash_senha(senha):
    return hashlib.sha256(senha.encode()).hexdigest()

class TelaCadastroUsuario:
    def __init__(self, root):
        self.root = root
        self.root.title("Cadastro de Usuários")
        try:
            self.root.state("zoomed")
        except:
            self.root.attributes("-zoomed", True)

        self.root.configure(bg="#E0FFFF")

        criar_cabecalho(self.root)
        criar_rodape(self.root)

        self.frame = tk.Frame(root, bg="#E0FFFF")
        self.frame.pack(padx=10, pady=10)

        self.campos = {
            "nome_completo": tk.StringVar(),
            "apelido": tk.StringVar(),
            "aniversario": tk.StringVar(),
            "grau": tk.StringVar(),
            "telefone": tk.StringVar(),
            "redes_sociais": tk.StringVar(),
            "email": tk.StringVar(),
            "whatsapp": tk.StringVar(),
            "funcao": tk.StringVar(),
            "senha": tk.StringVar()
        }

        labels = [
            ("Nome completo", "nome_completo"),
            ("Apelido / Nome social", "apelido"),
            ("Data de nascimento (YYYY-MM-DD)", "aniversario"),
            ("Grau", "grau"),
            ("Telefone", "telefone"),
            ("Redes sociais", "redes_sociais"),
            ("Email", "email"),
            ("WhatsApp", "whatsapp"),
            ("Função", "funcao"),
            ("Senha", "senha")
        ]

        for i, (label, key) in enumerate(labels):
            tk.Label(self.frame, text=label, bg="#E0FFFF", fg="#00008B").grid(row=i, column=0, sticky='e', pady=2)
            if key in ["grau", "funcao"]:
                valores = ["Servidor", "Discípulo"] if key == "grau" else ["Recepção", "Exame", "Entrevista", "ADM"]
                ttk.Combobox(self.frame, textvariable=self.campos[key], values=valores, state="readonly").grid(row=i, column=1, pady=2)
            elif key == "senha":
                tk.Entry(self.frame, textvariable=self.campos[key], show="*").grid(row=i, column=1, pady=2)
            else:
                tk.Entry(self.frame, textvariable=self.campos[key]).grid(row=i, column=1, pady=2)

        # Botões
        tk.Button(self.frame, text="Salvar", command=self.salvar).grid(row=11, column=0, pady=10)
        tk.Button(self.frame, text="Editar", command=self.editar).grid(row=11, column=1, pady=10)
        tk.Button(self.frame, text="Excluir", command=self.excluir).grid(row=11, column=2, pady=10)

        self.lista = tk.Listbox(root, width=80)
        self.lista.pack(pady=10)
        self.lista.bind('<<ListboxSelect>>', self.preencher_formulario)

        self.inicializar_banco()
        self.carregar_usuarios()

    def inicializar_banco(self):
        conn = conectar()
        cursor = conn.cursor()
        cursor.execute("""
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
            )
        """)
        conn.commit()
        conn.close()

    def salvar(self):
        dados = {k: v.get() for k, v in self.campos.items()}
        if not dados["nome_completo"] or not dados["email"] or not dados["senha"]:
            messagebox.showwarning("Campos obrigatórios", "Preencha Nome, Email e Senha.")
            return
        dados["senha_hash"] = hash_senha(dados.pop("senha"))
        try:
            conn = conectar()
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO usuarios (nome_completo, apelido, aniversario, grau, telefone, redes_sociais, email, whatsapp, funcao, senha_hash)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                dados["nome_completo"], dados["apelido"], dados["aniversario"], dados["grau"],
                dados["telefone"], dados["redes_sociais"], dados["email"],
                dados["whatsapp"], dados["funcao"], dados["senha_hash"]
            ))
            conn.commit()
            conn.close()
            self.limpar()
            self.carregar_usuarios()
            messagebox.showinfo("Sucesso", "Usuário salvo com sucesso.")
        except Exception as e:
            messagebox.showerror("Erro", str(e))

    def carregar_usuarios(self):
        self.lista.delete(0, tk.END)
        conn = conectar()
        cursor = conn.cursor()
        cursor.execute("SELECT id, nome_completo, funcao FROM usuarios")
        for row in cursor.fetchall():
            self.lista.insert(tk.END, f"{row[0]} - {row[1]} ({row[2]})")
        conn.close()

    def preencher_formulario(self, event):
        if not self.lista.curselection():
            return
        idx = self.lista.curselection()[0]
        valor = self.lista.get(idx)
        user_id = valor.split(" - ")[0]
        conn = conectar()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM usuarios WHERE id=?", (user_id,))
        row = cursor.fetchone()
        conn.close()
        if row:
            keys = list(self.campos.keys())
            for i, key in enumerate(keys):
                self.campos[key].set("" if key == "senha" else row[i+1])

    def editar(self):
        if not self.lista.curselection():
            messagebox.showwarning("Seleção", "Selecione um usuário para editar.")
            return
        idx = self.lista.curselection()[0]
        valor = self.lista.get(idx)
        user_id = valor.split(" - ")[0]
        dados = {k: v.get() for k, v in self.campos.items()}
        if not dados["nome_completo"] or not dados["email"]:
            messagebox.showwarning("Campos obrigatórios", "Nome e Email são obrigatórios.")
            return
        try:
            conn = conectar()
            cursor = conn.cursor()
            cursor.execute("""
                UPDATE usuarios SET nome_completo=?, apelido=?, aniversario=?, grau=?, telefone=?, redes_sociais=?, email=?, whatsapp=?, funcao=?
                WHERE id=?
            """, (
                dados["nome_completo"], dados["apelido"], dados["aniversario"], dados["grau"],
                dados["telefone"], dados["redes_sociais"], dados["email"],
                dados["whatsapp"], dados["funcao"], user_id
            ))
            conn.commit()
            conn.close()
            self.limpar()
            self.carregar_usuarios()
            messagebox.showinfo("Sucesso", "Usuário atualizado com sucesso.")
        except Exception as e:
            messagebox.showerror("Erro", str(e))

    def excluir(self):
        if not self.lista.curselection():
            messagebox.showwarning("Seleção", "Selecione um usuário para excluir.")
            return
        idx = self.lista.curselection()[0]
        valor = self.lista.get(idx)
        user_id = valor.split(" - ")[0]
        if messagebox.askyesno("Confirmação", "Deseja realmente excluir este usuário?"):
            conn = conectar()
            cursor = conn.cursor()
            cursor.execute("DELETE FROM usuarios WHERE id=?", (user_id,))
            conn.commit()
            conn.close()
            self.limpar()
            self.carregar_usuarios()
            messagebox.showinfo("Removido", "Usuário excluído com sucesso.")

    def limpar(self):
        for var in self.campos.values():
            var.set("")

if __name__ == '__main__':
    root = tk.Tk()
    TelaCadastroUsuario(root)
    root.mainloop()
