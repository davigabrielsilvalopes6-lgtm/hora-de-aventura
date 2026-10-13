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
