# 🌽 Urna Eletrônica — Sistema de Votação para Festas e Eventos

> Réplica visual da urna eletrônica brasileira para uso recreativo em festas juninas, escolha de síndico, representante de sala e eventos similares.

---

## ✨ O que é isso?

Um sistema de votação inspirado na urna eletrônica brasileira: tela à esquerda, teclado numérico à direita e os botões **BRANCO**, **CORRIGE** e **CONFIRMA**. A urna ocupa toda a janela, com fundo colorido e sons parecidos com os da urna real.

É um projeto de **passatempo e aprendizado**, sem vínculo com o TSE ou com processos eleitorais oficiais.

---

## 🗳️ Funcionalidades

| Recurso | Descrição |
|---|---|
| 🖥️ Tela cheia e responsiva | A urna ocupa o máximo da janela e as fontes e teclas escalam com o tamanho da tela. O app desktop abre maximizado |
| 🎨 Visual colorido | Fundo de festa, tela clara com número em caixas, teclas pretas e botões branco, laranja e verde |
| 🔊 Sons | Bipe a cada tecla, buzzer de erro, confirmação a cada cargo e o **"tiririm"** ao finalizar o voto. Sons gerados no navegador, sem arquivos externos |
| 🙋 Um voto por eleitor | O eleitor vota em todos os cargos em sequência. Ao terminar, a urna **trava** com a tela "FIM" |
| 🔓 Liberação pelo mesário | Para o próximo eleitor votar, o administrador digita a **senha master** em um pop-up (botão na tela ou Enter) |
| ⚪ Branco e ⚫ Nulo | BRANCO mostra "VOTO EM BRANCO". Número inexistente mostra "VOTO NULO". Os dois exigem **CONFIRMA** para registrar |
| 🧑‍⚖️ Painel do mesário | Página `src/mesario.html` para liberar o próximo eleitor. No app desktop funciona **em outro computador da mesma rede** |
| 👥 Lista de candidatos | Botão **Candidatos** no topo mostra cargos, fotos, números e nomes |
| ⚙️ Configuração em tela cheia | A tela de iniciar a votação é maximizada, com cargos e candidatos em colunas, para facilitar a digitação |
| 📷 Fotos | Upload de foto do titular e do vice/chapa |
| 📋 Zerésima | Boletim emitido na abertura, comprovando zero votos |
| 🔀 Anonimato | Votos embaralhados (Fisher-Yates) a cada registro |
| 📊 Resultado | Boletim final com votos por candidato, % de votos válidos, brancos, nulos e vencedor |
| 🖨️ Impressão A4 | Imprime **só o boletim** (sem a urna nem o fundo), em A4 retrato, com a mesma fonte da tela |
| 🌐 Sem dependências | A urna é só HTML, CSS e JS puros e funciona offline em qualquer navegador |
| 💻 App desktop | Versão `.exe`, `.dmg` ou `.AppImage` via Electron |

---

## ⌨️ Teclas

| Ação | Tela | Teclado do computador |
|---|---|---|
| Digitar número | Teclas 0–9 | `0`–`9` (linha de cima ou numérico) |
| **CORRIGE** | Botão laranja | `+` (ou `Backspace`) |
| **BRANCO** | Botão branco | `-` |
| **CONFIRMA** | Botão verde | `Enter` |

Com a urna travada (tela "FIM"), `Enter` abre o pop-up da senha master.

---

## 🔄 Fluxo de uso

1. O administrador clica em **▶ Iniciar**, digita a senha, preenche evento, dígitos, cargos e candidatos e confirma. É emitida a **zerésima**.
2. O eleitor digita o número, confere o candidato na tela e aperta **CONFIRMA**. O mesmo vale para **BRANCO** e **NULO**.
3. Depois do último cargo toca o *tiririm*, aparece "FIM" e a urna **trava**.
4. O mesário clica em **Liberar próximo** (ou Enter), digita a senha master e o próximo eleitor pode votar.
5. No fim, **■ Finalizar** pede a senha, toca a música de encerramento e mostra o **boletim final**, que pode ser impresso em A4.

---

## 🧑‍⚖️ Mesário em outro computador (mesma rede)

Disponível no **app desktop** (`npm start` ou o executável):

1. Abra a urna e clique em **🧑‍⚖️ Mesário**. Aparecem os endereços, por exemplo `http://192.168.0.10:3737`.
2. No outro computador, abra esse endereço no navegador.
3. O painel mostra se o eleitor está votando ou se a urna aguarda liberação. Com a senha master, o mesário libera o próximo eleitor.

Notas: o firewall do computador da urna precisa permitir a porta **3737**. A senha é conferida na urna, e após 5 erros seguidos o painel bloqueia por 30 segundos. Abrindo só o `index.html` no navegador, o botão Mesário abre o painel em uma janela do mesmo computador.

---

## 🚀 Como usar

### Opção 1 — Arquivo local
Abra `src/index.html` no navegador. Funciona offline. O navegador só libera o som após o primeiro clique ou tecla.

### Opção 2 — GitHub Pages
**Settings → Pages → Branch: main → / (root)** e acesse `/src/`. Para abrir direto na raiz, mova o conteúdo de `src/` para uma pasta `docs/` e escolha essa pasta.

### Opção 3 — App desktop

```bash
npm install
npm start              # modo desenvolvimento

npm run build-win      # Windows (.exe)
npm run build-mac      # macOS (.dmg)
npm run build-linux    # Linux (.AppImage)
```

O executável fica em `dist/`. Mais detalhes em [docs/COMO_GERAR_EXE.md](docs/COMO_GERAR_EXE.md).

---

## ⚙️ Configuração

### Senha

A mesma senha vale para iniciar, finalizar e liberar o próximo eleitor. Padrão:

```
131313
```

Para trocar, edite em `src/js/urna.js`:

```js
const SENHA = "131313";
```

### Impressão do boletim

No resultado, clique em **🖨 Imprimir** e escolha papel **A4**. A página sai só com o boletim, sem a urna. Se as barras de porcentagem saírem sem cor, ative "Gráficos de segundo plano" nas opções de impressão do navegador.

---

## 🔐 Segurança e privacidade

- Nenhum dado vai para a internet. A única comunicação de rede é o painel do mesário (porta 3737, só na rede local), e só no app desktop.
- Os votos são embaralhados a cada registro para dificultar saber quem votou em quem.
- O hash do boletim serve apenas para identificar o arquivo de resultado.
- A senha fica no código-fonte; é adequada para eventos recreativos, não para eleições reais.

---

## 📁 Estrutura

```
├── src/                      ← a urna (HTML, CSS e JS separados)
│   ├── index.html            ← tela da urna
│   ├── mesario.html          ← painel do mesário
│   ├── css/
│   │   ├── urna.css
│   │   └── mesario.css
│   └── js/
│       ├── urna.js           ← lógica da urna, sons, boletim e impressão
│       └── mesario.js        ← lógica do painel do mesário
├── electron/                 ← app desktop
│   ├── main.js               ← janela maximizada e servidor do mesário
│   └── preload.js            ← ponte segura entre a urna e o Electron
├── build/                    ← ícones do instalador (opcional)
├── docs/
│   └── COMO_GERAR_EXE.md     ← guia para gerar o executável
├── package.json
├── LICENSE
└── README.md
```

---

## 🤝 Ideias futuras

- [ ] Exportar resultado em PDF
- [ ] Senha master separada da senha do administrador
- [ ] Salvar a configuração de cargos e candidatos para reutilizar
- [ ] Modo escuro

---

## 📄 Licença

MIT — use, modifique e distribua à vontade, mantendo os créditos.

*Desenvolvido por Otávio Augusto · Brasília*
*Inspirado no sistema eleitoral brasileiro — sem vínculo com o TSE ou órgãos públicos.*
