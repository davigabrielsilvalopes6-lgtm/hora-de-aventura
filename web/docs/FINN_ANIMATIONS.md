# Finn — esqueleto e combate animado

## Implementado

O Finn agora utiliza um esqueleto de 53 ossos, adaptado às suas proporções, com skinning rígido nas peças cartoon. As animações são as curvas reais da Universal Animation Library Standard, de Quaternius (CC0). As translações e escalas dos clipes foram removidas para não substituir a física, a orientação e a posição do jogador.

- J: Sword_Attack, com Sword_Idle ao retornar ao repouso.
- K: alterna Punch_Jab e Punch_Cross; a espada fica oculta durante os socos.
- Movimento: Walk_Loop; Shift: Sprint_Loop.
- Dano: Hit_Chest, respeitando o estado do ataque.
- Duração dos golpes: 0,42 s; dano uma única vez após 0,13 s. Alcance de espada 2,8; alcance de soco 1,8. Orientação, paredes e invulnerabilidade existentes são preservadas.
- Troca de sala, recuperação e reinício cancelam golpes pendentes.
- O apoio visual dos pés é ajustado à superfície sem mover o corpo físico.

A versão animada do GLB é incorporada ao HTML na compilação: o modo leve continua funcionando sem solicitar arquivos externos. O GLB também está disponível separadamente em `public/assets/characters/finn-animated.glb`. A versão estática anterior foi preservada.

## Evidências reais

`export-finn-animated.mjs` exportou e recarregou o modelo no Chromium: 45 malhas e sete clipes. Dados em `finn-animated-export.json`. As vistas `finn-animated-front.png`, `finn-animated-side.png` e `finn-animated-back.png` foram renderizadas em WebGL. Durante a inspeção foram corrigidos os encaixes dos joelhos e do pescoço; as capturas foram refeitas.

`finn-animated-game.png` e `finn-sword-attack.png` são capturas reais do jogo.

Verificações executadas na compilação atual:

- Build concluído; três testes unitários passaram.
- Teste de orientação passou: portas, marcador, caminho inverso, movimento, resolução e ausência de erros.
- Teste específico de Finn passou: esqueleto carregado, caminhada/corrida por teclado, alteração real da rotação do osso durante o ataque, atraso do dano, apenas um acerto, cooldown, retorno ao repouso e os dois socos por K.
- Dez verificações de navegador passaram: movimento, portas, combate, salto/janela/telhados, GLB original do castelo, salvamento, pausa e ausência de erros.
- Seis verificações de aceitação passaram: nove missões, 24 salas, salvamento inválido, HTML offline, toque e ausência de erros.

O teste de cooldown inicialmente dependia do tempo gasto capturando uma imagem: em renderização por software, a captura podia demorar mais que o cooldown e permitir outro ataque válido. A verificação foi corrigida para avançar passos de física controlados, separando as capturas; os testes por teclado foram mantidos.

## Limitações

Roll/esquiva não foi integrado. As poses usam skinning rígido, com acabamento simplificado nas articulações; não houve validação em dispositivos físicos nem medição de FPS em GPU real. O salto continua controlado pela física, sem clipe dedicado de salto nesta atualização. A publicação via GitHub Pages não é comprovada pelos testes locais.
