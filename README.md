<p align="center">
  <img src="assent/logo.jpeg" alt="Registro Akashico" width="200"/>
</p>

# 🌟 Registro Akashico – Sistema de Apoio Fraterno

O Registro Akashico (Seara de Luz) é um sistema construído com carinho para apoiar o trabalho fraterno em Centros Espíritas. O objetivo é facilitar o registro e acompanhamento dos assistidos, com foco no acolhimento, organização e continuidade dos atendimentos.

É uma aplicação desktop local, construída com **Electron**, **JavaScript** (sem framework) e **SQLite** (via `better-sqlite3`), pensada para rodar em Linux ou Windows sem depender de internet ou servidor externo.

---

## ✨ Funcionalidades

### Em funcionamento

- 🧍 **Cadastro de assistidos** — nome, apelido, nascimento, endereço (com busca de CEP), telefone, e-mail e status.
- 📊 **Relatório com busca e edição** — lista todos os assistidos cadastrados, com busca por nome/apelido, edição e exclusão em modal.
- 🗓️ **Registro de presença por calendário** — marca/desmarca presenças por assistido e mês, evitando duplicidade no mesmo dia.
- 💳 **Registro de passes** — grava um passe (data, hora e tipo) associado a um assistido no banco de dados.
- 🖨️ **Impressão de passe (simulada)** — registra no console qual passe seria impresso para os assistidos selecionados no relatório; não há integração real com impressora ainda.
- 🔎 **Identificação por e-mail + telefone** — tela de login localiza o assistido pelos mesmos dados do cadastro (ver limitações abaixo).
- 🎨 Interface simples, com cabeçalho e rodapé reaproveitados entre páginas e estilo centralizado em `style.css`.

### Anunciadas, mas ainda não implementadas

- 🔐 Controle de acesso por **perfil** (Usuário/ADM) — a identificação por e-mail/telefone funciona, mas não existe conceito de perfil/permissão no banco, e o app abre direto no relatório sem exigir login.
- 🔁 Lógica de exame e reinício de ciclo de presenças — existia em código morto que foi removido nesta revisão (ver [Changelog](#-changelog-de-correções)); precisa ser reimplementada sobre o fluxo de passes atual, se ainda fizer parte do escopo.
- 📄 Exportação de relatórios (CSV/PDF)
- 🌍 Suporte a múltiplos idiomas (i18n)
- ☁️ Backup automático na nuvem
- 🧹 Desativação automática de assistidos sem presença há 90+ dias

---

## 🚀 Como executar

```bash
npm install
npm start
```

O banco de dados é criado automaticamente em `~/.seara-de-luz/database.sqlite` na primeira execução. Não é necessário configurar nada além disso — o `.env` na raiz só é usado por scripts avulsos de desenvolvimento.

---

## ✅ Changelog de correções

Todos os itens abaixo foram identificados numa revisão de código e já corrigidos:

1. **Login não funcionava.** `login.js` chamava `window.api.loginUsuario` (inexistente no `preload.js`) e o handler `usuario:login` nunca era registrado em `main.js`, além de consultar um banco separado (`backend/db/usuarios.db`) com colunas incompatíveis com o cadastro real. → `loginHandler.js` foi reescrito para consultar o banco ativo (`usuarios.email` + `usuarios.telefone`), foi registrado em `main.js`, e `login.js` agora chama `window.api.usuarios.login`.
2. **Formulário de passe avulso quebrado.** `frontend/scripts/passes.js` chamava `window.electron.ipcRenderer`, inexistente com `contextIsolation` ativo. → passou a usar `window.api.passes.registrar`, com a resposta tratada no formato real devolvido pelo handler (`{ok, id, data, hora, tipo}`).
3. **Ponte `passes.registrar` incompatível com o handler.** `preload.js` enviava o id do assistido "cru", mas o handler esperava `{ assistidoId, tipo, data, hora }` — o registro sempre falharia com "assistidoId é obrigatório". → `preload.js` agora envia `{ assistidoId }`.
4. **Botão "Imprimir Passe" do relatório sem handler.** O canal `passes:imprimirParaUsuarios` nunca tinha sido implementado no backend. → handler adicionado em `backend/handlers/passesHandler.js` (impressão simulada via console, buscando nome e último tipo de passe do assistido).
5. **Duas implementações incompatíveis de "passes".** `backend/passesHandler.js` (lógica de ciclo de exame, banco antigo via `sqlite3`) nunca era usada pelo app. → arquivo removido junto com suas dependências exclusivas (`backend/db/init.js`, `backend/impressora.js`, `backend/utils/data.js`); a lógica de ciclo de exame **não foi reimplementada** — se ainda for necessária, precisa ser reconstruída sobre `backend/handlers/passesHandler.js`.
6. **Duas bases de dados SQLite no projeto.** A legada (`backend/db/usuarios.db`, `sqlite3`) só era usada pelos scripts soltos `inserir-assistido.js` e `test-db.js`. → banco legado e os dois scripts removidos; resta apenas `~/.seara-de-luz/database.sqlite`.
7. **`dbResetHandler.js` importava funções inexistentes** de `usuarioHandler.js` (`criarTabelaUsuarios`, `migrarSchemaSeNecessario`, `salvarUsuario`, `__dbPath`). → reescrito para usar `getDbPath()` e a constante `CREATE_USUARIOS_SQL`, ambas agora exportadas por `usuarioHandler.js`.
8. **`assistidosHandler.js`** devolvia uma lista fictícia fixa e não era usado por nenhuma tela. → removido.
9. **`statusHandler.js`** (desativação automática por 90 dias de ausência) dependia do banco legado e nunca era chamado por nada. → removido junto com o banco legado; se a regra ainda for desejada, precisa ser reescrita contra o schema atual (`usuarios` + `presencas`) e agendada explicitamente.
10. **`backend/db/conn.js` tinha um erro de referência** (usava `DB_PATH` antes de declará-lo com `const`). → arquivo removido (não era usado por nenhum outro módulo).

---

## 💡 Sugestões de próximos passos (ainda em aberto)

- Decidir se a lógica de ciclo de exame/passe (4ª presença → exame, 5ª → entrevista) ainda faz parte do escopo e, se sim, reimplementá-la sobre `backend/handlers/passesHandler.js` e o schema atual.
- Implementar de fato controle de acesso por perfil (Usuário/ADM): adicionar coluna de perfil, exigir login antes de abrir o relatório.
- `modalAvisoHandler.js` continua implementado mas nunca registrado em `main.js` nem chamado pelo frontend — decidir se deve ser usado (registrar) ou removido.
- Implementar exportação de relatório (CSV/PDF), suporte a i18n e backup em nuvem antes de voltar a anunciá-los como funcionalidades.
- Mover scripts de inspeção manual (`verPresencas.js`) para uma pasta `scripts/dev/`, fora da raiz do projeto.
- Renomear a pasta `assent/` para `assets/`.
- Remover `.pytest_cache/` (resíduo de outra ferramenta; não há Python no projeto).

---

## 💛 Como contribuir

Este projeto é comunitário e está em constante evolução. Se você:

- Encontrou um erro
- Tem uma sugestão de melhoria
- Deseja colaborar com código, traduções ou testes

Sinta-se à vontade para abrir uma *issue* ou enviar um *pull request*! Qualquer contribuição, por menor que pareça, é muito bem-vinda 💛

---

## 📫 Feedback e contato

Seu feedback é essencial para que possamos continuar melhorando. Se algo te tocou, te ajudou ou você acredita que podemos fazer melhor, fale com a gente! Você pode deixar uma mensagem via *issues* do GitHub ou entrar em contato diretamente por e-mail, se preferir.

---

## 📄 Licença

Este projeto é distribuído sob a licença **GNU GPL v3** — veja [LICENSE](LICENSE) para os termos completos.

---

## 🙏 Agradecimentos

A todos os trabalhadores do bem que dedicam tempo, carinho e esforço ao próximo. Que este projeto possa ser mais uma ferramenta a serviço da luz, do amor e da fraternidade.

> "Fora da caridade não há salvação." – Allan Kardec
