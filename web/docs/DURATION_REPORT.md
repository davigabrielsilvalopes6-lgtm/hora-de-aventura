# Duração — evidência e validação pendente

A meta solicitada é **20–30 minutos de campanha principal em uma primeira jogada normal**, sem opcionais. **Essa meta ainda não está comprovada.** Não foi feita uma partida humana contínua. Não foram adicionadas esperas obrigatórias para alongar artificialmente a campanha.

## O que foi medido

A suíte `test:campaign` executou as 15 missões com fixtures de sala e posição, E real, escolhas reais de puzzles e J real para combate. O tempo de parede dessa execução foi **106.281 segundos**, incluindo inicialização, leitura automatizada, renderização e capturas. Esse valor mede o teste acelerado, **não a duração normal do jogo**. Os 70 eventos e tempos cumulativos estão em `expanded-campaign-results.json`.

| Missão | Eventos distintos | Intervalo do teste (s) |
| --- | --- | --- |
| 1 | 5 | 8.902 |
| 2 | 4 | 2.549 |
| 3 | 5 | 3.995 |
| 4 | 5 | 12.825 |
| 5 | 4 | 4.018 |
| 6 | 5 | 4.212 |
| 7 | 4 | 3.285 |
| 8 | 2 | 1.273 |
| 9 | 5 | 5.431 |
| 10 | 6 | 6.323 |
| 11 | 6 | 4.916 |
| 12 | 6 | 7.148 |
| 13 | 4 | 4.411 |
| 14 | 7 | 35.572 |
| 15 | 2 | 0.591 |

O primeiro intervalo inclui inicialização; os seguintes incluem o trabalho entre o último evento da missão anterior e o último da missão atual. O tempo restante até o total é finalização. Não usar esses intervalos para concluir que uma missão é curta numa exploração normal: o teste pula trajetos com fixtures.

## Relógio implementado

`Playtime` mede tempo real por quadro, com total, diálogo, exploração, combate, 15 missões e interações opcionais. Menu, pausa, configuração e derrota ficam fora da contagem. O HUD exibe minutos/segundos; o save v2 mantém os números. Testes verificaram exclusão de pausa/menu, round-trip e persistência.

A classificação de combate usa inimigos ativos no setor, não cada segundo de golpe. Tempo procurando opcionais continua classificado como exploração até iniciar a interação opcional. Portanto `optional` não representa toda a duração das atividades secundárias. Navegadores que suspendem abas podem afetar o relógio; a medição recomendada mantém a janela ativa e usa pausa ao se afastar.

## Como validar a meta

1. Abrir a versão publicada e iniciar uma nova aventura.
2. Jogar sem `?qa`, sem teleportes, sem conhecer puzzles, lendo os diálogos normalmente.
3. Registrar o HUD ao começar e ao chegar ao caminho da fábrica; separar opcionais.
4. Repetir com pessoas que não conhecem o mapa, anotando travamentos, tempo por missão e dificuldade.
5. Ajustar conteúdo e orientação com esses resultados; não declarar a meta atingida antes da medição.

Ainda faltam duração humana por missão, duração normal das atividades opcionais e ajuste de ritmo com jogadores reais.
