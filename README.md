# 🌽 Urna Eletrônica — Sistema de Votação para Festas e Eventos

> Réplica visual da urna eletrônica brasileira desenvolvida para uso recreativo em festas juninas, escolhas de síndico, representante de sala e eventos similares.

![preview](docs/preview.png)

---

## ✨ O que é isso?

Um sistema de votação eletrônica inspirado na **urna eletrônica do TSE (Tribunal Superior Eleitoral)**, desenvolvida pela Diebold Nixdorf e usada no Brasil desde 1996. O visual replica fielmente o equipamento real: corpo cinza, tela LCD à esquerda, teclado numérico à direita, com os botões **BRANCO** (branco), **CORRIGE** (laranja) e **CONFIRMA** (verde).

É um projeto de **passatempo e aprendizado**, sem qualquer vínculo com o TSE ou com processos eleitorais oficiais. O código é aberto e livre para adaptação.

---

## 🗳️ Funcionalidades

| Recurso | Descrição |
|---|---|
| 🎨 Visual fiel | Layout idêntico à urna Diebold: tela + teclado lado a lado |
| ⚙️ Configurável | Nome do evento, cargos (Rei, Rainha, Síndico…) e candidatos ajustáveis |
| 📷 Fotos | Upload de foto do titular e do vice/chapa |
| 🔒 Senha dupla | Botões **INICIAR** e **FINALIZAR** protegidos por senha |
| 📋 Zerésima | Boletim de urna emitido na abertura, comprovando zero votos |
| 🔀 Anonimato | Votos embaralhados (Fisher-Yates) a cada registro — impossível saber quem votou em quem |
| 📊 Resultado | Boletim final com votos por candidato, % de votos válidos, brancos e vencedor |
| ⌨️ Teclado físico | Números 0–9, Enter = CONFIRMA, Backspace = CORRIGE, B = BRANCO |
| 🌐 Zero dependências | Um único arquivo HTML — roda em qualquer navegador |
| 💻 App Desktop | Versão `.exe` / `.app` via Electron para uso sem navegador |

---

## 🚀 Como usar

### Opção 1 — GitHub Pages (recomendado para eventos online)

1. Faça um fork deste repositório
2. Vá em **Settings → Pages → Branch: main → / (root)**
3. Acesse `https://seu-usuario.github.io/urna`

### Opção 2 — Arquivo local

Baixe `index.html` e abra diretamente no navegador. Funciona offline, sem servidor.

### Opção 3 — App Desktop (.exe / .app)

Veja a pasta [`electron/`](electron/) e siga o [guia de instalação](#-instalando-o-app-desktop).

---

## 🖥️ Instalando o App Desktop

> Para quem prefere um executável sem precisar abrir navegador.

### Pré-requisitos

- [Node.js](https://nodejs.org) 18 ou superior

### Passos

```bash
# Clone o repositório
git clone https://github.com/SEU_USUARIO/urna-eletronica.git
cd urna-eletronica/electron

# Instale as dependências
npm install

# Rode em modo desenvolvimento
npm start

# Gere o executável para Windows (.exe)
npm run build-win

# Gere para macOS (.dmg)
npm run build-mac

# Gere para Linux (.AppImage)
npm run build-linux
```

O executável gerado fica em `electron/dist/`.

---

## ⚙️ Configuração Rápida

### Senha padrão

```
131313
```

> Para trocar, edite a linha no `index.html`:
> ```js
> const SENHA = "131313";
> ```

### Tipos de cargo sugeridos

Você pode nomear os cargos como quiser na tela de configuração:

- 🌽 Rei e Rainha do Milho
- 🏢 Síndico do Condomínio
- 🎓 Representante de Sala / Turma
- 🏆 MVP da Equipe
- 🎉 Melhor Fantasia da Festa

---

## 🔐 Segurança e Privacidade

- **Nenhum dado é enviado para servidores** — tudo roda localmente no navegador.
- Os votos são embaralhados com o algoritmo Fisher-Yates a cada registro, impedindo rastrear quem votou em quem.
- O hash no Boletim de Urna serve apenas para identificação do arquivo de resultado.

---

## 💡 Inspiração técnica

A urna eletrônica brasileira é referência mundial em segurança e usabilidade. Desenvolvida originalmente pela **Diebold Nixdorf** em parceria com o TSE, ela foi introduzida em 1996 e desde 2008 é 100% fabricada no Brasil. O design do teclado com as três cores — branco, laranja e verde — para as ações primárias é um dos elementos mais reconhecíveis do processo eleitoral brasileiro.

Este projeto usa apenas HTML + CSS + JavaScript vanilla, sem frameworks, respeitando o espírito de acessibilidade e simplicidade do equipamento original.

---

## 📁 Estrutura do Repositório

```
urna-eletronica/
├── index.html          ← app completo (abrir no navegador ou GitHub Pages)
├── README.md
├── docs/
│   └── preview.png     ← screenshot para o README
└── electron/
    ├── main.js         ← processo principal Electron
    ├── package.json    ← dependências e scripts de build
    └── (index.html é copiado automaticamente pelo build)
```

---

## 🤝 Contribuindo

Pull requests são bem-vindos! Sugestões de melhoria:

- [ ] Modo escuro / claro
- [ ] Suporte a mais de 5 dígitos
- [ ] Exportar resultado em PDF
- [ ] Som de confirmação (como na urna real)
- [ ] QR Code para votação remota

---

## 📄 Licença

MIT — use, modifique e distribua à vontade, desde que mantenha os créditos.

---

*Desenvolvido por Otávio Augusto · Brasília, 2025*
*Inspirado no sistema eleitoral brasileiro — sem vínculo com TSE ou órgãos públicos.*
