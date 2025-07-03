import sqlite3
import os
import tkinter as tk
from tkinter import ttk
from ui.componentes.cabecalho import criar_cabecalho
from ui.componentes.rodape import criar_rodape
from ui.componentes.style import COR_FUNDO, COR_FONTE, FONTE_TEXTO, FONTE_TITULO

CAMINHO_BD = os.path.join("searadeluz", "database", "usuarios.db")

class TelaCadastroUsuario:
    def __init__(self, root):
        self.root = root
        self.root.title("Cadastro de Usuários – Registro Akáshico")
        try:
            self.root.state("zoomed")
        except:
            self.root.attributes("-zoomed", True)
        self.root.configure(bg=COR_FUNDO)

        criar_cabecalho(self.root, trocar_tela=self.trocar_tela)

        self.frame = tk.Frame(root, bg=COR_FUNDO)
        self.frame.pack(pady=40)

        # Campos do formulário
        campos = [
            "Nome completo", "Nome social/Apelido", "Data de aniversário", "Grau",
            "Telefone", "Redes Sociais", "Email", "Whatsapp"
        ]
        self.entradas = {}

        for i, campo in enumerate(campos):
            tk.Label(self.frame, text=campo, bg=COR_FUNDO, fg=COR_FONTE, font=FONTE_TEXTO).grid(row=i, column=0, sticky="e", pady=5)

            if campo == "Grau":
                entrada = ttk.Combobox(self.frame, font=FONTE_TEXTO, width=38, state="readonly")
                entrada['values'] = ["Servidor", "Discípulo"]
            else:
                entrada = tk.Entry(self.frame, font=FONTE_TEXTO, width=40)

            entrada.grid(row=i, column=1, pady=5)
            self.entradas[campo] = entrada

        # Campo de função
        funcao_label = tk.Label(self.frame, text="Função na casa", bg=COR_FUNDO, fg=COR_FONTE, font=FONTE_TEXTO)
        funcao_label.grid(row=len(campos), column=0, sticky="e", pady=5)
        funcao_cb = ttk.Combobox(self.frame, font=FONTE_TEXTO, width=38, state="readonly")
        funcao_cb['values'] = ["Recepção", "Exame", "Entrevista", "Coordenação", "Apoio", "ADM"]
        funcao_cb.grid(row=len(campos), column=1, pady=5)
        self.entradas["Função"] = funcao_cb

        # Botões
        botoes = tk.Frame(self.frame, bg=COR_FUNDO)
        botoes.grid(row=len(campos)+1, columnspan=2, pady=20)
        tk.Button(botoes, text="Salvar", font=FONTE_TEXTO, command=self.salvar_usuario).pack(side="left", padx=10)
        tk.Button(botoes, text="Editar", font=FONTE_TEXTO).pack(side="left", padx=10)
        tk.Button(botoes, text="Excluir", font=FONTE_TEXTO).pack(side="left", padx=10)

        criar_rodape(self.root)

    def trocar_tela(self, destino):
        if destino == "cadastro":
            return
        elif destino == "sair":
            self.root.destroy()
        else:
            import tkinter.messagebox as mb
            mb.showinfo("Funcionalidade", f"Tela '{destino}' ainda não implementada.")

    def salvar_usuario(self):
        import tkinter.messagebox as mb

        # Coleta os dados preenchidos
        dados = {campo: entrada.get().strip() for campo, entrada in self.entradas.items()}
        print("[LOG] Dados recebidos do formulário:", dados)

        # Validação dos campos obrigatórios
        obrigatorios = ["Nome completo", "Data de aniversário", "Telefone"]
        for campo in obrigatorios:
            if not dados.get(campo):
                mb.showwarning("Campo obrigatório", f"O campo '{campo}' deve ser preenchido.")
                return

        # Conectar ao banco e inserir dados
        try:
            os.makedirs(os.path.dirname(CAMINHO_BD), exist_ok=True)
            conn = sqlite3.connect(CAMINHO_BD)
            cursor = conn.cursor()

            cursor.execute("""
                INSERT INTO usuarios (
                    nome, apelido, dataNascimento, grau,
                    telefone, redes, email, whatsapp, funcao
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                dados.get("Nome completo"),
                dados.get("Nome social/Apelido"),
                dados.get("Data de aniversário"),
                dados.get("Grau"),
                dados.get("Telefone"),
                dados.get("Redes Sociais"),
                dados.get("Email"),
                dados.get("Whatsapp"),
                dados.get("Função")
            ))

            conn.commit()
            conn.close()
            print("[LOG] Usuário salvo no banco com sucesso.")
            mb.showinfo("Sucesso", "Usuário salvo com sucesso.")

            for campo, entrada in self.entradas.items():
                if isinstance(entrada, ttk.Combobox):
                    entrada.set('')
                else:
                    entrada.delete(0, tk.END)
                    
        except Exception as e:
            print("[ERRO]", e)
            mb.showerror("Erro", f"Erro ao salvar usuário: {e}")