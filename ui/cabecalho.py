import tkinter as tk
import webbrowser
from ui.componentes.style import COR_FUNDO, COR_FONTE, FONTE_TITULO, FONTE_PEQUENA, FONTE_LOGO

def criar_cabecalho(root, **kwargs):
    frame = tk.Frame(root, bg=COR_FUNDO)
    frame.pack(fill='x', pady=(5, 10))

    titulo = tk.Label(frame, text="🌟 Seara de Luz 🌟", font=FONTE_LOGO, bg=COR_FUNDO, fg=COR_FONTE)
    titulo.pack(pady=(5, 5))

    menu_frame = tk.Frame(frame, bg=COR_FUNDO)
    menu_frame.pack(pady=(0, 10))

    def criar_link(texto, destino):
        return tk.Button(menu_frame, text=texto, font=FONTE_PEQUENA, bg=COR_FUNDO,
                         fg=COR_FONTE, bd=0, cursor="hand2", relief="flat",
                         activebackground=COR_FUNDO, activeforeground=COR_FONTE,
                         highlightthickness=0,
                         command=lambda: webbrowser.open("https://github.com/ahlrodrigues/Registro_Akashico")
                         if destino == "suporte"
                         else kwargs.get('trocar_tela', lambda x: None)(destino))

    botoes = [
        criar_link("🏠 Início", "inicio"),
        criar_link("🙋 Cadastro", "cadastro"),
        criar_link("🧾 Presença", "presenca"),
        criar_link("🧠 Exames", "exames"),
        criar_link("🧍 Assistidos", "assistidos"),
        criar_link("💬 Entrevistas", "entrevistas"),
        criar_link("👥 Usuários", "usuarios"),
        criar_link("🚪 Sair", "sair"),
        criar_link("🛟 Suporte", "suporte"),
    ]

    for i, botao in enumerate(botoes):
        botao.pack(side='left')
        if i < len(botoes) - 1:
            separador = tk.Label(menu_frame, text="|", font=FONTE_PEQUENA, bg=COR_FUNDO, fg=COR_FONTE)
            separador.pack(side='left')