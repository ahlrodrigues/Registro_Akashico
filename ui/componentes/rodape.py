import tkinter as tk
from datetime import datetime
from ui.componentes.style import COR_FUNDO, COR_FONTE, FONTE_PEQUENA

APP_VERSAO = "v1.0.0"
APP_NOME = "Registro Akáshico"
ANO_INICIAL = 2025

def criar_rodape(root, usuario=None):
    ano_atual = datetime.now().year
    intervalo_anos = f"{ANO_INICIAL}–{ano_atual}" if ano_atual > ANO_INICIAL else str(ANO_INICIAL)

    frame = tk.Frame(root, bg=COR_FUNDO)
    frame.pack(fill='x', side='bottom', pady=(10, 5))

    nome_label = tk.Label(
        frame,
        text=f"© {intervalo_anos} – {APP_NOME} • Todos os direitos reservados – Versão {APP_VERSAO}",
        font=FONTE_PEQUENA,
        bg=COR_FUNDO,
        fg=COR_FONTE
    )
    nome_label.pack(side='top')

    if usuario:
        nome = usuario.get("nome", "Usuário")
        funcao = usuario.get("funcao", "")
        user_label = tk.Label(
            frame,
            text=f"{nome} ({funcao})",
            font=FONTE_PEQUENA,
            bg=COR_FUNDO,
            fg=COR_FONTE,
            anchor="e"
        )
        user_label.pack(side='right', padx=10)