# Revisão das animações do Finn

Foi reutilizado o Finn existente, com 53 ossos e skinning rígido cartoon. O GLB foi exportado e recarregado no Chromium: **45 malhas e 12 clipes**, em `finn-animated-export.json`. Movimentos da Universal Animation Library Standard de Quaternius, CC0.

| Estado | Solução atual |
| --- | --- |
| Parado | `Idle_Loop`, respiração sutil; espada oculta fora do ataque |
| Caminhando | `Walk_Loop`, velocidade pelo deslocamento real |
| Correndo | `Sprint_Loop`, clipe próprio e transição de 0,12 s |
| Início do salto | `Jump_Start`, 0,14 s |
| Subida / queda | `Jump_Loop`; queda mantém uma pose em 65% do clipe |
| Aterrissando | `Jump_Land`, 0,16 s, antes da locomoção |
| Interagindo | `Interact`, 0,30 s, em portas e objetos |
| Espada / socos / dano | Clipes existentes, sem alteração do combate |
| Finn sem controle | Idle; corpo permanece onde Tab foi pressionado |

`finn-controller.js` usa `AnimationMixer` e transições de peso, o recurso apropriado no Three.js. Translações de root motion não substituem a física.

## Correções

- Cortes bruscos entre repouso, caminhada e corrida substituídos por fades curtos.
- Pressionar movimento contra parede não mantém caminhada sem deslocamento.
- Ritmo dos passos acompanha deslocamento real, incluindo rampas; corrida não é usada durante caminhada.
- Salto, queda, aterrissagem e interação receberam estados próprios ou solução provisória compatível.
- Trocar para Jake estaciona Finn e encerra locomoção; voltar restaura o controle.
- Apoio visual dos sapatos calculado pelas malhas animadas; física permanece separada.

Golpes mantêm 0,42 s de intervalo, um acerto após 0,13 s, alcance de espada 2,8 e soco 1,8. `attack()` e `strike()` foram comparados ao commit anterior; sua lógica foi preservada.

## Evidências e limitações

Testes por teclado cobrem Idle → Walk → Run → Idle, parede, salto, queda, aterrissagem, porta, troca de personagem, ossos dos golpes e dano único. Travessias físicas de ponte, escada e apoio gigante foram executadas. Consulte o relatório QA para a bateria completa.

`finn-idle-corrected.png`, `character-switch.png`, `finn-animated-game.png`, `finn-sword-attack.png` e as vistas exportadas são renders reais. Imagens estáticas não comprovam suavidade sozinhas; estados e transições foram verificados durante a execução.

A queda usa **pose provisória**, sem clipe original dedicado. Escadas usam marcha sincronizada, sem IK de cada degrau; pode haver deslizamento residual dos pés. Mãos não se alinham exatamente a cada objeto. Articulações rígidas ainda podem melhorar. Roll/esquiva não foi adicionado. Não houve validação em hardware do usuário.


## Correção do ciclo de passos invertido

Após o relato de Finn andando de costas, o teste de direção mostrou que o rosto já acompanhava o movimento. A falha estava no retarget: a biblioteca usa marcha orientada para +Z, enquanto o Finn foi modelado de frente para -Z. O pé em contato deslocava-se para a frente do corpo no ciclo, produzindo a impressão de marcha para trás.

`rig-finn.js` agora prepara a geometria no eixo da biblioteca e normaliza o rig completo para -Z. Os lados dos membros e os dedos dos pés foram alinhados nessa transformação. Os clipes não são reproduzidos ao contrário. O mesmo Finn e as mesmas curvas de animação foram reutilizados; física e combate não foram alterados.

`test:gait` carrega o GLB exportado e mede o deslocamento de ambos os pés perto do chão. O modelo anterior falhou: Walk_Loop, pé 0, avanço relativo ao rosto **+0,3668**. Após a correção, os dois pés em caminhada e corrida deslocam-se para trás do corpo na fase de contato, como esperado. `finn-gait-results.json` registra os valores atuais.

`test:direction` usa teclado real em quatro direções, diagonal, câmera girada, corrida e retorno de Jake; mede o rosto pelas malhas animadas, sem assumir que a rotação do controle é suficiente. A captura `finn-walking-forward.png` foi produzida após a correção. A ausência de IK completo continua sendo uma limitação.
