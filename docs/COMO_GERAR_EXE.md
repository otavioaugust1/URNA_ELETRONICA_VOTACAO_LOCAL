# 🖥️ Guia — Gerar o Executável (.exe / .dmg / .AppImage)

O app desktop usa Electron. Ele abre a urna maximizada, sem navegador, e habilita o **painel do mesário em outro computador da rede**.

## Pré-requisito

Instale o **Node.js** (versão 18 ou superior): https://nodejs.org/pt

---

## Passo a passo

Rode os comandos na pasta raiz do projeto, onde está o `package.json`.

```bash
# 1. Instale as dependências (só na primeira vez)
npm install

# 2. Teste em modo desenvolvimento
npm start

# 3. Gere o instalador
npm run build-win      # Windows → instalador .exe
npm run build-mac      # macOS   → .dmg
npm run build-linux    # Linux   → .AppImage
```

O arquivo gerado fica na pasta `dist/`.

> Gere o instalador no sistema de destino: o `.exe` no Windows, o `.dmg` no macOS e o `.AppImage` no Linux.

---

## Arquivos incluídos no build

| Pasta | Conteúdo |
|---|---|
| `electron/` | `main.js` (janela da urna e servidor do mesário) e `preload.js` |
| `src/` | A urna e o painel do mesário (HTML, CSS e JS) |

Se você mudar a estrutura de pastas, atualize `main` e `build.files` no `package.json`.

---

## Ícone personalizado (opcional)

Coloque na pasta `build/`:
- `icon.ico` — Windows
- `icon.icns` — macOS
- `icon.png` — Linux e janela do app (256×256 px)

---

## Mesário em outro computador

1. Abra o app da urna e clique em **🧑‍⚖️ Mesário**. Aparecem os endereços, por exemplo `http://192.168.0.10:3737`.
2. No outro computador, na mesma rede, abra o endereço no navegador.
3. Digite a senha master para liberar o próximo eleitor.

**Firewall:** o computador da urna precisa permitir conexões de entrada na porta **3737**. No Windows, aceite o aviso do firewall na primeira execução (rede privada) ou crie uma regra de entrada para a porta TCP 3737.

---

## Resultado esperado

```
dist/
└── Urna Eletrônica Setup 1.0.0.exe   ← instalador Windows
```

Ao instalar, o programa abre direto na tela da urna, sem necessidade de navegador.

---

## Problemas comuns

| Problema | Solução |
|---|---|
| O painel não abre no outro PC | Confira se os dois estão na mesma rede e se a porta 3737 está liberada no firewall |
| Nenhum endereço aparece no botão Mesário | O PC da urna não está conectado a uma rede. Use o IP dele manualmente: `http://IP:3737` |
| Sem som | Clique ou digite uma tecla uma vez; o som só é liberado depois da primeira interação |
