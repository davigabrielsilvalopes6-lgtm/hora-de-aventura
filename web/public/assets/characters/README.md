# Finn — modelo estilizado

Modelo procedural de fã, criado para este jogo a partir da imagem de referência enviada pelo usuário. Finn e Hora de Aventura pertencem aos respectivos titulares; este arquivo não é um modelo oficial nem foi extraído da série.

- Arquivo: `finn.glb`, geometria real e materiais incorporados, sem texturas externas.
- Origem nos pés, eixo Y para cima, frente em -Z, altura aproximadamente 2 unidades.
- Chapéu branco com orelhas, rosto oval, olhos e sorriso, camiseta azul, shorts, meias, sapatos, mochila verde e braço mecânico.
- Modelo estilizado simplificado; não é uma reconstrução exata da imagem.
- Braços e pernas são grupos articulados. O jogo os movimenta por código. O GLB contém pose estática e não possui esqueleto, pesos de skinning ou clipes de animação.

Fonte: `web/src/finn.js`. Para reproduzir a exportação, na pasta `web`, execute `node export-finn.mjs` com Playwright/Chromium disponível. O exportador recarrega o GLB e verifica quantidade de malhas e limites geométricos antes de salvar as capturas reais de frente, lado e costas em `web/docs/finn-*.png`.

A integração muda a aparência do jogador e o movimento dos membros, preservando os controles, colisão, dano e progressão existentes.

## Versão animada

`finn-animated.glb` inclui esqueleto, skinning rígido e sete clipes de animação adaptados da biblioteca CC0 do Quaternius. A versão estática `finn.glb` é preservada. Os controles do jogo usam J para espada e K para socos; caminhar, correr e receber dano selecionam os clipes automaticamente. Créditos e fonte das animações: `../animations/README.md`.
