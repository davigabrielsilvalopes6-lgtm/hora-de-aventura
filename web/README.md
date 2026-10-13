# Reino Doce — jogo de navegador

Aplicação estática JavaScript + Three.js/WebGL2. A decisão de continuar no navegador foi confirmada pelo usuário; esta atualização não usa Godot e não modifica o projeto antigo.

O capítulo começa no grande salão. São 15 missões, 70 tipos de evento e 80 unidades de progresso em ordem, incluindo contagens de combate. Há 26 setores e 54 pontos de chegada no grafo. Os 24 setores anteriores foram aproveitados, com adições locais; estufa e caminho para a fábrica são novos.

## Executar

```sh
npm ci --ignore-scripts --cache /workspace/.npm-cache
npm run build
npm start
```

O servidor mostra o endereço local. `dist/` é a distribuição estática; não precisa de backend. O HTML incorpora Three.js e o Finn animado. Em HTTP(S), o castelo original é carregado de `assets/castle.glb`; com `?lite=1`, reduz-se a resolução de renderização, mantendo o mesmo GLB real. A construção genérica de cilindros/cubos foi removida.

A execução offline do HTML foi validada no Chromium. A política deste ambiente bloqueia navegação `file://`; abrir o arquivo diretamente no Windows ainda precisa de teste. O servidor local é apenas para desenvolvimento.

## Testes

Playwright 1.62.1 e `/usr/bin/chromium`, com SwiftShader. Execute o servidor e, em outro terminal:

```sh
npm run test:unit
GAME_URL=http://127.0.0.1:4173/ npm run test:browser
GAME_URL=http://127.0.0.1:4173/ npm run test:animation-states
GAME_URL=http://127.0.0.1:4173/ npm run test:finn
GAME_URL=http://127.0.0.1:4173/ npm run test:cooperative
GAME_URL=http://127.0.0.1:4173/ npm run test:abilities
GAME_URL=http://127.0.0.1:4173/ npm run test:navigation
GAME_URL=http://127.0.0.1:4173/ npm run test:extras
GAME_URL=http://127.0.0.1:4173/ npm run test:campaign
GAME_URL=http://127.0.0.1:4173/ npm run test:window
GAME_URL=http://127.0.0.1:4173/ npm run test:castle
GAME_URL=http://127.0.0.1:4173/ npm run test:castle-campaign
GAME_URL=http://127.0.0.1:4173/ npm run test:direction
npm run test:gait
```

Nesta auditoria foi usada a porta 4174 para evitar confundir o checkout atual com o antigo. Fixtures são expostas somente com `?qa=1`. A suíte de campanha usa fixtures de sala/posição e comandos reais de interação, puzzles e combate; não equivale a uma partida humana contínua. A suíte de habilidades prepara posições iniciais e então atravessa os desafios por teclado e física real, sem teleportes no trajeto.

O workflow de GitHub Pages executa build e testes unitários. As suítes gráficas foram executadas localmente; não estão automaticamente incluídas no workflow.

## Recursos e limites

- Finn mantém o modelo existente, 53 ossos e 12 clipes. Queda usa uma pose provisória de `Jump_Loop`. Não há IK completo para pés e mãos; escadas sincronizam a marcha com a distância real.
- Jake é provisório. As cinco formas têm efeitos físicos e requisitos de missão. Finn fica parado em Idle enquanto Jake é controlado. Ponte/escada mantêm posição e não podem ser retiradas quando Finn depende delas.
- Câmera e colisões usam volumes simplificados. A arquitetura inteira do GLB externo não é explorável só porque está visível. Não houve validação de cada canto do modelo original.
- J espada, K socos: mesmo dano, alcance, cooldown, invulnerabilidade e contagens de inimigos. Puzzles e selos opcionais não alteram esses valores.
- Save `v2` inclui progresso, atores, formas, opcionais e relógio; `v1` não é apagado. Dados inválidos são rejeitados. Armazenamento bloqueado impede persistência, sem impedir jogar.
- Relógio exclui menu/pausa/configuração/derrota, inclui diálogos e registra tempo por missão. Tempo procurando opcionais não é distinguido automaticamente da exploração principal.
- Imagens são renders reais do Chromium/WebGL. Não há testes em GPU física, Windows ou Safari, nem FPS ou duração normal inventados.

## Documentação

[Campanha](docs/CHAPTER_EXPANSION.md) · [Animações](docs/FINN_ANIMATIONS.md) · [QA](../QA_REPORT.md) · [Duração](docs/DURATION_REPORT.md) · [Capturas](docs/SCREENSHOTS.md)

Logs anteriores à expansão permanecem como histórico. `docs/summary.json` e o relatório QA identificam as evidências atuais. Dependências fixadas por lockfile: Three.js 0.180.0, esbuild 0.25.11 e Playwright 1.62.1. Créditos e licenças em `public/assets/`.


## GLB enviado e visualizador

O castelo atual é o arquivo original do ZIP enviado, preservado byte a byte. Manifesto: `docs/original-model.json`; créditos: `public/assets/CREDITS.md`. O botão **Ver castelo 3D** carrega o mesmo modelo usado na campanha, com quatro vistas, giro e zoom. Não avança missões nem modifica saves, tempo ou a preferência de qualidade econômica. A versão anterior continua no histórico Git.

Capturas novas em `docs/castle-upload-{front,side,back,aerial}.png`. As adaptações de colisão e os interiores existentes não foram reconstruídos; o GLB não cria, sozinho, novas áreas interiores jogáveis.


## Substituição na campanha

O modelo real agora é carregado obrigatoriamente ao visitar o exterior, inclusive em qualidade econômica. `lightCastle()` e seu fallback foram removidos de `src/main.js`. Falha de rede gera aviso e botão de tentar novamente, sem inventar um castelo substituto.

A posição é `(-18, -1, -50)` com escala 100×; a fachada fica acessível ao lado das passarelas existentes. A entrada em `(-18, 1, -16)` liga ao grande salão, e o acesso de serviço em `(-21, 0, -16)` retorna ao laboratório. A saída do salão chega perto dessa fachada. Um volume de colisão simplificado protege a porta fechada. As demais colisões essenciais, missões e interiores foram preservados.

Em pausa/menu/configurações, vistas estáticas deixam de ser redesenhadas repetidamente. Capturas de testes pesadas podem ser feitas com a simulação pausada e a interface de pausa ocultada; nenhuma geometria é escondida. O renderizador por software expôs limitações de esperas por milissegundos: as travessias usam teclado e passos reais da física, sem teleportar durante o percurso. Isso não mede FPS em GPU física.

O exterior com GLB requer acesso aos recursos por HTTP(S). O teste de HTML sem rede valida somente as áreas internas embutidas; a campanha externa não usa mais um castelo fictício offline.
