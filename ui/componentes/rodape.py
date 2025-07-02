
import tkinter as tk
from datetime import datetime
import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../')))
from config import APP_NOME_CURTO, APP_VERSAO

def criar_rodape(pai):
    frame = tk.Frame(pai, bg='#E0FFFF', height=30)
    frame.pack(side='bottom', fill='x')

    now = datetime.now().strftime('%d/%m/%Y %H:%M')
    label = tk.Label(frame, text=f"{APP_NOME_CURTO} • {now} • v{APP_VERSAO}", 
                     bg='#E0FFFF', fg='#00008B', font=('Arial', 9))
    label.pack(side='right', padx=10)

    return frame
