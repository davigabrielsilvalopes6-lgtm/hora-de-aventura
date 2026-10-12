# O Mundo de Aventura: The Last Dance — jogo de navegador

Protótipo 3D de aventura no Reino Doce, feito com JavaScript e Three.js. Não precisa de Godot para jogar.

Inclui exploração de interiores adaptados, nove missões, diálogos, combate contra doces zumbis, Jake como companheiro, plataformas e salvamento no navegador. Os personagens são provisórios e a fábrica ainda não é uma área jogável.

## Publicar e jogar

1. Neste repositório, abra **Settings → Pages**.
2. Em **Build and deployment → Source**, selecione **GitHub Actions**.
3. Abra **Actions → Publish browser game → Run workflow → Run workflow**.
4. Aguarde o resultado verde. O endereço confirmado aparece na etapa de publicação e em **Settings → Pages**.

O workflow compila o jogo, executa os testes unitários e publica `web/dist`. Enviar o código ao GitHub não significa que o site já foi publicado.

## Desenvolvimento

Requer Node.js 22 e npm.

```sh
cd web
npm ci --ignore-scripts
npm run build
npm run test:unit
npm start
```

Controles: WASD ou setas para andar, Shift para correr, espaço para pular, E para interagir, J para atacar e arrastar o mouse para mover a câmera. Há botões para telas de toque.

Consulte [web/README.md](web/README.md) para testes, limitações e créditos. As capturas em `web/docs/` são imagens reais do protótipo. Resultados anteriores documentam testes locais; não comprovam uma execução do GitHub Actions neste repositório.

O modelo do castelo tem atribuição e licença CC BY 4.0 em [CREDITS.md](web/public/assets/CREDITS.md). Three.js é distribuído sob licença MIT.

## Finn 3D

O jogador agora usa um Finn estilizado baseado na referência enviada: chapéu branco, rosto, roupa azul, mochila verde e braço mecânico. O modelo é procedural, com movimento dos membros no jogo.

- [Baixar Finn GLB](web/public/assets/characters/finn.glb) — use o botão de download do arquivo.
- [Vista frontal real](web/docs/finn-front.png)
- [Vista lateral real](web/docs/finn-side.png)
- [Vista traseira real](web/docs/finn-back.png)
- [Detalhes e limitações](web/public/assets/characters/README.md)
