import tkinter as tk
import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../')))
from config import APP_NOME_COMPLETO

def criar_cabecalho(pai, usuario=None, trocar_tela=None):
    frame = tk.Frame(pai, bg='#E0FFFF', height=60)
    frame.pack(fill='x')

    titulo = tk.Label(frame, text=APP_NOME_COMPLETO, bg='#E0FFFF', fg='#00008B',
                      font=('Arial', 16, 'bold'))
    titulo.pack(side='left', padx=10, pady=10)

    if usuario:
        info = tk.Label(frame, text=f"{usuario['nome']} ({usuario['funcao']})",
                        bg='#E0FFFF', fg='#00008B', font=('Arial', 10, 'italic'))
        info.pack(side='right', padx=10)

    if trocar_tela:
        menu = tk.Frame(pai, bg='#E0FFFF')
        menu.pack(fill='x', padx=10, pady=5)

        botoes = [
            ("Início", lambda: trocar_tela("inicio")),
            ("Cadastro", lambda: trocar_tela("cadastro")),
            ("Presença", lambda: trocar_tela("presenca")),
            ("Exames", lambda: trocar_tela("exames")),
            ("Entrevistas", lambda: trocar_tela("entrevistas")),
            ("Sair", lambda: trocar_tela("sair"))
        ]

        for texto, comando in botoes:
            tk.Button(menu, text=texto, command=comando, bg='#E0FFFF', fg='#00008B',
                      relief='flat', font=('Arial', 10)).pack(side='left', padx=5)

    return frame