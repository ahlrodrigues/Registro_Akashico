from ui.componentes.style import COR_FUNDO, COR_FONTE, COR_CARTAO, COR_SOMBRA, FONTE_TITULO, FONTE_SUBTITULO, FONTE_TEXTO, FONTE_PEQUENA, FONTE_ITALICO, PADDING_CARTAO
import tkinter as tk
from tkinter.scrolledtext import ScrolledText
import os
import sys
import requests
from dotenv import load_dotenv

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))
from ui.componentes.cabecalho import criar_cabecalho
from ui.componentes.rodape import criar_rodape
from ui.listar_assistidos import TelaListarAssistidos
from ui.listar_usuarios import TelaListarUsuarios

class TelaInicio:
    def __init__(self, root, usuario=None):
        self.usuario = usuario
        self.root = root
        self.root.title("Início – Registro Akáshico")
        try:
            self.root.state('zoomed')
        except:
            self.root.attributes('-zoomed', True)

        self.root.configure(bg=COR_FUNDO)

        criar_cabecalho(self.root, usuario=usuario, trocar_tela=self.trocar_tela)

        container = tk.Frame(self.root, bg=COR_FUNDO)
        container.pack(expand=True, fill='both')

        sombra = tk.Frame(container, bg=COR_SOMBRA)
        sombra.pack(padx=6, pady=6)

        cartao = tk.Frame(sombra, bg=COR_CARTAO, bd=1, relief='solid')
        cartao.pack(padx=2, pady=2)

        tk.Label(cartao, text="Avisos importantes", font=FONTE_SUBTITULO,
                 bg=COR_CARTAO, fg=COR_FONTE).pack(pady=(10, 5))

        self.aviso_box = ScrolledText(cartao, width=100, height=20, wrap=tk.WORD,
                                      font=FONTE_TEXTO, bg=COR_CARTAO, fg=COR_FONTE,
                                      relief='flat', highlightthickness=0)
        self.aviso_box.pack(padx=20, pady=(0, 20))
        self.aviso_box.insert(tk.END, "Carregando aviso...")
        self.aviso_box.config(state='disabled')

        criar_rodape(self.root, usuario=usuario)
        self.carregar_aviso()

    def carregar_aviso(self):
        load_dotenv()
        doc_id = os.getenv('GOOGLE_DOC_ID')
        if not doc_id:
            self._exibir_aviso("ID do documento Google não encontrado no .env")
            return
        try:
            url = f"https://docs.google.com/document/d/{doc_id}/export?format=txt"
            response = requests.get(url)
            if response.status_code == 200:
                self._exibir_aviso(response.text)
            else:
                self._exibir_aviso("Não foi possível carregar o aviso do Google Docs.")
        except Exception as e:
            self._exibir_aviso(f"Erro ao carregar aviso: {str(e)}")

    def _exibir_aviso(self, texto):
        self.aviso_box.config(state='normal')
        self.aviso_box.delete('1.0', tk.END)
        self.aviso_box.insert(tk.END, texto.strip())
        self.aviso_box.config(state='disabled')

    def trocar_tela(self, destino):
        from ui.cadastro_usuario import TelaCadastroUsuario
        if destino == "inicio":
            return
        elif destino == "cadastro":
            self.root.destroy()
            nova = tk.Tk()
            TelaCadastroUsuario(nova)
            nova.mainloop()
        elif destino == "assistidos":
            self.root.destroy()
            nova = tk.Tk()
            TelaListarAssistidos(nova, usuario_logado=self.usuario)
            nova.mainloop()
        elif destino == "usuarios":
            self.root.destroy()
            nova = tk.Tk()
            TelaListarUsuarios(nova, usuario_logado=self.usuario)
            nova.mainloop()
            self.root.destroy()
            from ui.cadastro_usuario import TelaCadastroUsuario
            nova = tk.Tk()
            TelaCadastroUsuario(nova)
            nova.mainloop()
        elif destino == "usuarios":
            self.root.destroy()
            nova = tk.Tk()
            TelaListarUsuarios(nova, usuario_logado=self.usuario)
            nova.mainloop()
        elif destino == "sair":
            self.root.destroy()
        else:
            import tkinter.messagebox as mb
            mb.showinfo("Funcionalidade", f"Tela '{destino}' ainda não implementada.")

if __name__ == '__main__':
    root = tk.Tk()
    TelaInicio(root, usuario={"nome": "Antonio", "funcao": "ADM"})
    root.mainloop()