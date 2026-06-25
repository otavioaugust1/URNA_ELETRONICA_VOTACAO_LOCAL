# 🖥️ Guia — Gerar o Executável (.exe / .app)

## Pré-requisito

Instale o **Node.js** (versão 18 ou superior):
👉 https://nodejs.org/pt

---

## Passo a passo

```bash
# 1. Acesse a pasta electron
cd urna-eletronica/electron

# 2. Instale as dependências (só na primeira vez)
npm install

# 3. Teste rodando em modo desenvolvimento
npm start

# 4. Gere o instalador
npm run build-win      # Windows → .exe instalador
npm run build-mac      # macOS   → .dmg
npm run build-linux    # Linux   → .AppImage
```

O arquivo gerado fica em `electron/dist/`.

---

## Ícone personalizado (opcional)

Coloque os arquivos na pasta `electron/`:
- `icon.ico` — Windows
- `icon.icns` — macOS  
- `icon.png` — Linux (256×256 px)

---

## Resultado esperado

```
electron/
└── dist/
    └── Urna Eletrônica Setup 1.0.0.exe   ← instalador Windows
```

Ao instalar, o programa abre diretamente na tela da urna, sem necessidade de navegador.
