# QA — expansão do capítulo e animações de Finn

## Escopo e ambiente

Revisão da campanha de navegador no checkout `hora-de-aventura`, sobre o commit `954f6755356ce061ae3d28e27e807bb0fd6bb749`. Node.js 24 localmente; workflow Node.js 22. Three.js 0.180.0, Playwright 1.62.1, Chromium 154 com SwiftShader por software. Servidor local na porta 4174. Não foram executados testes Godot: o usuário confirmou continuar no navegador.

Não houve partida humana contínua, GPU física, Windows, Safari ou medição de FPS. O modelo externo do castelo foi preservado. A inspeção gráfica cobriu as capturas listadas; não equivale a aprovar cada canto de todos os interiores.

## Testes executados

| Comando em `web/` | Cobertura | Resultado |
| --- | --- | --- |
| `npm run build` | Bundle, HTML autocontido e recursos | Passou |
| `npm run test:unit` | Ordem de 80 unidades, todos os snapshots, metadados, relógio e controles | 6 testes passaram |
| `npm run test:browser` | Movimento, diálogo, combate, sete plataformas, GLB, save, pausa e responsividade; aceitação | 10 + 6 verificações passaram; file:// bloqueado |
| `npm run test:animation-states` | Idle/walk/run, parede, salto/queda/aterrissagem e porta | Passou |
| `npm run test:finn` | Esqueleto, golpes, rotação do braço, dano único, cooldown e repouso | Passou |
| `npm run test:cooperative` | Tab, Finn estacionado em Idle, Jake e retorno do controle | Passou |
| `npm run test:abilities` | Duto, ponte, escada e gigante por teclado/física; save sobre ponte | 4 trajetos passaram |
| `npm run test:navigation` | Placas, cadeia de portas, seta e alta densidade de pixels | Passou |
| `npm run test:extras` | Configurar teclas, cinco opcionais, não duplicar recompensa, v1 intacto, v2 e relógio | Passou |
| `npm run test:campaign` | 15 missões e 70 eventos, puzzles, combate finito e saída final | Passou |
| `npm run test:window` | Vista da rota, diálogo parado, retorno da câmera/controle e salto real | Passou |

Suítes gráficas usam `GAME_URL=http://127.0.0.1:4174/`. Campanha usa fixtures de sala/posição para preparar etapas: testa progressão e ações reais, não trajetos completos contínuos. Habilidades usam fixtures somente na preparação, com teclado e física na travessia. Testes gerais atravessam janela e sete plataformas sem teleportes no percurso. Os 54 pontos de chegada das 26 áreas foram verificados na aceitação.

Evidências: `web/docs/browser-results.json`, `acceptance-results.json`, `ability-results.json`, `extra-results.json`, `expanded-campaign-results.json`, `window-preview-results.json`, `finn-animated-export.json` e capturas. Logs antigos em `web/docs/` permanecem históricos, não são resultados da expansão.

## Bugs corrigidos

Cada item abaixo inclui reprodução, causa, correção e revalidação. Estados **Corrigido e testado** referem-se ao cenário descrito, sem afirmar ausência de todos os bugs.

### ANI-01 — Locomoção (P2)

- Reprodução e esperado/observado: Mover Finn, parar e alternar corrida. Antes havia cortes bruscos e ritmo fixo; esperado era transição suave seguindo velocidade.
- Causa: Troca imediata dos clipes e marcha independente do deslocamento.
- Correção e arquivos: Fades, clipes separados e rate pelo deslocamento real em `web/src/finn-controller.js` e `main.js`.
- Revalidação: animation-states, finn; Idle/Walk/Run/Idle por teclado.
- Resultado/estado: **Corrigido e testado** no cenário descrito.

### ANI-02 — Parede (P2)

- Reprodução e esperado/observado: Manter W contra uma parede. Finn podia continuar marchando parado; esperado era Idle ao bloquear movimento.
- Causa: Animação dependia da tecla pressionada.
- Correção e arquivos: Usar distância efetivamente percorrida por passo em `main.js`.
- Revalidação: animation-states; W contra a parede retorna Idle.
- Resultado/estado: **Corrigido e testado** no cenário descrito.

### ANI-03 — Salto/interação (P2)

- Reprodução e esperado/observado: Pular, cair, pousar e abrir porta. Faltavam poses próprias; esperado era reagir a essas fases.
- Causa: GLB/controlador tinham apenas os clipes anteriores de marcha/combate.
- Correção e arquivos: Reexportar GLB com 12 clipes, estados de salto/queda/land/interact em `rig-finn.js`, `finn-controller.js` e GLB.
- Revalidação: Exportação recarregada: 45 meshes/12 clipes; animation-states, window e quatro trajetos físicos.
- Resultado/estado: **Corrigido e testado** no cenário descrito.

### COOP-01 — Troca de personagem (P1)

- Reprodução e esperado/observado: Andar, pressionar Tab e mover Jake. Finn não podia continuar junto nem congelar em passo.
- Causa: Controle compartilhado sem posição/estado de Finn estacionado.
- Correção e arquivos: FinnCarrier estacionado, Idle quando inativo, retorno à posição em `main.js` e controlador.
- Revalidação: cooperative; compara posição exata e Idle durante movimento de Jake.
- Resultado/estado: **Corrigido e testado** no cenário descrito.

### COOP-02 — Apoios (P1)

- Reprodução e esperado/observado: Deixar Finn sobre Jake ponte e tentar desfazer a forma. Esperado era apoio permanecer; risco era queda sem aviso.
- Causa: Forma podia retirar a superfície da qual Finn dependia.
- Correção e arquivos: Bloquear mudança/movimento de apoio dependente em `main.js`.
- Revalidação: abilities: Tab/B não desfaz a ponte; salvar/recarregar sobre ela preserva piso; cristal alcançado.
- Resultado/estado: **Corrigido e testado** no cenário descrito.

### COOP-03 — Duto (P1)

- Reprodução e esperado/observado: Diminuir Jake, entrar no túnel e tentar crescer. Esperado era impedir crescimento contra teto.
- Causa: Validação incompleta do volume de cada forma.
- Correção e arquivos: Checar altura e raio contra sólidos antes de mudar forma em `main.js`.
- Revalidação: abilities: Jake atravessa até alavanca central, não cresce dentro, retorna normal fora e destrava acesso.
- Resultado/estado: **Corrigido e testado** no cenário descrito.

### MAP-01 — Torre (P1)

- Reprodução e esperado/observado: Subir escada de Jake até transmissor. Existia um vão entre o fim da rampa e o patamar obrigatório.
- Causa: Rampas/patamares não se conectavam nas coordenadas finais.
- Correção e arquivos: Conector de piso entre z=6,9 e 8,1 em `buildChallenges()` de `main.js`.
- Revalidação: abilities: Finn sobe por movimento real até y>9,8 e ativa o console; campanha avança.
- Resultado/estado: **Corrigido e testado** no cenário descrito.

### MAP-02 — Saída final (P1)

- Reprodução e esperado/observado: Concluir missão 15 e seguir marcador. Alvo inicial coincidia com casa e bloqueava aproximação.
- Causa: Posição do evento na geometria de uma casa.
- Correção e arquivos: Mover `factory_exit` para rua livre (0,0,28) em `campaign.js`.
- Revalidação: campaign: E na saída chega a factory_approach, missão 15 concluída.
- Resultado/estado: **Corrigido e testado** no cenário descrito.

### MAP-03 — Portas (P2)

- Reprodução e esperado/observado: Entrar na galeria e usar porta da estufa. Inicialmente sobrepunha a porta do hospital.
- Causa: Duas portas na mesma parede/coordenada.
- Correção e arquivos: Porta lateral da estufa em `rooms.json`.
- Revalidação: acceptance: 26 setores/54 chegadas seguras; campanha acessa estufa.
- Resultado/estado: **Corrigido e testado** no cenário descrito.

### MAP-04 — Mecanismo no duto (P1)

- Reprodução e esperado/observado: Ir à alavanca pequena. Móveis podiam bloquear a aproximação, e uma posição inicial permitia interagir da boca do túnel.
- Causa: Volumes decorativos cruzavam zona do desafio e gatilho perto da saída.
- Correção e arquivos: Reservar o corredor, afastar móveis e colocar alavanca no centro em `main.js`/`campaign.js`.
- Revalidação: abilities: entrada, percurso completo até z=0, interação e retorno por física.
- Resultado/estado: **Corrigido e testado** no cenário descrito.

### UI-01 — Diálogo (P2)

- Reprodução e esperado/observado: Pressionar E durante salto. Personagem podia ficar suspenso em diálogo; esperado era interagir após pousar.
- Causa: Interação não exigia grounded.
- Correção e arquivos: Exigir chão antes de E em `main.js`.
- Revalidação: window: controle retorna e pulo real permanece; campaign e testes de interação passaram.
- Resultado/estado: **Corrigido e testado** no cenário descrito.

### UI-02 — Derrota (P1)

- Reprodução e esperado/observado: Morrer em combate e usar voltar ao checkpoint. Tela tinha estado dialogue em vez de defeat.
- Causa: openPanel sobrescrevia o modo de derrota.
- Correção e arquivos: Restaurar modo defeat após abrir painel em `main.js`.
- Revalidação: campaign usa recuperação quando necessário; regressão de combate/defesa e checkpoint passou.
- Resultado/estado: **Corrigido e testado** no cenário descrito.

### VIS-01 — Placas/câmera (P3)

- Reprodução e esperado/observado: Aproximar câmera de marcador ou forma de Jake. Rótulos e anéis cobriam Finn; uma dica elevada cortava no teto.
- Causa: Sprite/anéis de tamanho fixo e placa colocada acima da altura do cômodo.
- Correção e arquivos: Placas laterais fixas, limite de altura, escala por distância e ocultação próxima em `main.js`.
- Revalidação: Recapturas reais de ponte, gigante, botão e laboratório inspecionadas; browser, abilities, campaign e window passaram.
- Resultado/estado: **Corrigido e testado** no cenário descrito.

### VIS-02 — Spawn (P3)

- Reprodução e esperado/observado: Entrar numa área e olhar pés. Offset de spawn de 0,05 causava pequeno espaço visual.
- Causa: Spawn acima da cota do piso.
- Correção e arquivos: Spawn na altura exata do chão e ajuste das malhas dos sapatos, em `main.js`/controlador.
- Revalidação: acceptance nas chegadas e capturas de Finn; sem afirmar IK perfeito.
- Resultado/estado: **Corrigido e testado** no cenário descrito.

## Preservação comprovada

Comparação com o commit base: `attack()` e `strike()` permanecem idênticos. SHA256:

- attack: `3f4a8267fd5e1de0d7d171180085e7ce12e4ff96ce91cba320cea4fa20e6f998`
- strike: `b7a0b5e214a8148fd943c4d893261c006a80b12f1a9ef542533f9e27592653a3`
- castle.glb, idêntico: `253a4e960957e5bb8713f347bedb8aac936aac9437673db82d4f5bfd1b74d0bf`
- Finn estático preservado: `643c8b472db0bd830a4dfba627b35aeddcf6bdb62c2b7b4c22cc21092fe183e4`

Dano, cooldown de 0,42 s, atraso de 0,13 s, alcance 2,8/1,8 e invulnerabilidade de 1,2 s preservados. As contagens/variantes de combate da campanha anterior foram reutilizadas. Jake não ganhou um sistema de ataque novo nesta tarefa. O modelo Finn original não foi trocado por outro personagem; somente seu GLB animado recebeu clipes adicionais.

## Pendências e limitações reais

| ID | Gravidade | Estado | Pendência |
| --- | --- | --- | --- |
| DUR-01 | P2 | Pendente de validação | Meta de 20–30 min exige primeira partida humana; teste acelerado não comprova |
| ANI-04 | P3 | Aberto | Queda é pose provisória; falta clipe definitivo |
| ANI-05 | P3 | Aberto | IK de pés por degrau e alinhamento da mão por objeto; deslizamento residual possível |
| ART-01 | P3 | Aberto | Jake e móveis/interiores simplificados; não representam arte definitiva |
| ENV-01 | P3 | Pendente de validação | GPU real, Windows, Safari e sessões longas não testados |
| ENV-02 | P3 | Pendente de validação | file:// bloqueado pelo Chromium administrado; HTML offline em DOM passou |
| MAP-05 | P3 | Aberto | Só caminho da fábrica existe; fábrica completa pertence à próxima área |

A atualização cobre os sistemas descritos; não declara o jogo livre de todos os bugs. Não houve auditoria pixel a pixel de todas as salas nem medição real de desempenho em GPU. Capturas são imagens reais do protótipo e mostram limitações de arte.

## Instalação e publicação

A tentativa de reinstalar dependências com cache padrão falhou ao escrever fora das pastas permitidas. A instalação foi repetida com cache em `/workspace/.npm-cache`, dentro da área autorizada, e passou. Não foi alterada a verificação TLS nem foram solicitados tokens GitHub.

Push confirmado comprova envio do código, não publicação do Pages. Verifique o workflow no GitHub. A política de rede do ambiente limita inspeção do site github.io; não afirmar deployment concluído sem evidência.


## Revalidação após relato de caminhada de costas — ANI-06

**Gravidade:** P2. **Sistema:** retarget de locomoção. **Estado:** Corrigido e testado.

- Reprodução: na versão `d47e985`, caminhar com Finn e observar os pés; o rosto pode estar orientado corretamente, mas o ciclo de apoio parece avançar para trás.
- Esperado: na fase apoiada, o pé deve deslocar-se para trás em relação ao tronco/rosto enquanto o corpo avança.
- Observado: no GLB anterior, o teste mediu +0,3668069 na direção do rosto para o pé 0 em Walk_Loop e falhou.
- Causa: marcha da biblioteca com frente +Z aplicada ao modelo com frente -Z, sem normalizar o eixo da geometria e do esqueleto.
- Correção: normalizar a convenção de frente no bind/export do rig, lados dos membros e dedos dos pés. Não inverter playback nem controles.
- Arquivos: `web/src/rig-finn.js`, GLB animado, diagnóstico visual em `finn-controller.js`, testes `finn-direction.cjs` e `finn-gait.cjs`, documentação e capturas.
- Revalidação: modelo antigo falha no teste de apoio; novo GLB passa nos quatro casos de pé/clipe. Direção passa em quatro eixos, diagonal, câmera girada, corrida e após trocar Jake/Finn. Golpes/dano/cooldown, estados de animação, cooperação e seis unitários foram reexecutados.
- Evidências: `web/docs/finn-gait-results.json`, `finn-direction-results.json`, `finn-walking-forward.png`, vistas do GLB e capturas de golpe.

Esta revisão não reexecutou a campanha completa: a alteração é no modelo animado, sem mudar progresso, física ou lógica de combate. Os resultados da campanha acima pertencem à bateria da expansão anterior.


## Integração do castelo enviado em ZIP

Fonte: anexo `candy_kingdom_castle.zip`, contendo GLB de 38.321.956 bytes. O anexo GLB avulso excedia o limite de transferência de 32 MiB; o ZIP de 11.538.791 bytes permitiu acesso real. O arquivo foi extraído sem executar conteúdo e sua assinatura glTF/metadados foram inspecionados.

O modelo possui 374 malhas, 43 materiais, 1.012.771 triângulos e não depende de imagens externas. Os metadados registram Kenny Park, a origem Sketchfab e licença CC BY 4.0. A cópia em `web/public/assets/castle.glb` é byte a byte igual ao GLB anexado; hash/proveniência em `web/docs/original-model.json`.

O castelo anterior, convertido de USDZ, foi substituído por este GLB direto, preservado no histórico Git em `93d7937`. A emissão de cores original é mantida agora; metalness é ajustado a zero apenas em runtime para a direção cartoon. Não houve edição de geometria ou criação de novos cômodos.

### Testes desta integração

- Build e seis unitários passaram.
- Dez verificações gerais de navegador e seis de aceitação passaram novamente, incluindo carregar as 374 malhas, combate, plataformas, save/reload e 54 chegadas do grafo.
- `test:castle` carregou o arquivo real, verificou 43 materiais/emissão, as quatro vistas com posições de câmera distintas, retorno ao menu/campanha, layout móvel e ausência de erros JavaScript.
- Verificou que inspeção não avança missões nem relógio nem sobrescreve o progresso. O visualizador preserva a escolha de modo leve; sua inspeção carrega o original explicitamente.
- Fonte de `step()`, `attack()` e `strike()` e o grafo de salas foram comparados ao commit anterior e permaneceram idênticos.
- Capturas `castle-upload-front/side/back/aerial.png` são renders reais da mesma cena/modelo usado no jogo; todas foram inspecionadas.

### Ajuste encontrado na validação

CASTLE-01 (P3): a primeira tentativa de captura esperava 500 ms fixos entre vistas. No renderizador por software, isso não garantia uma nova imagem e duas posições de câmera foram registradas iguais. O teste falhou. O visualizador foi ajustado para renderizar apenas quando ângulo/zoom/tamanho muda; o teste aguarda um frame efetivamente renderizado e uma posição de câmera diferente. As quatro capturas foram refeitas e verificadas. Não foram apresentadas as capturas iniciais como quatro ângulos válidos.

A presença do GLB não significa colisão precisa ou exploração de cada superfície original. Interiores, plataformas, missões e colisões já existentes foram preservados. Não houve medição de FPS em GPU física nesta integração. O botão **Ver castelo 3D** mostra o original em HTTP(S); o modo leve continua disponível para jogar sem carregar o modelo pesado.
