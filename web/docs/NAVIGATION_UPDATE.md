# Orientação, placas e movimento

As portas agora possuem placas 3D com moldura, textura de texto e orientação fixa para dentro do cômodo. A face da placa fica afastada da parede; o texto não é mais um sprite que gira para a câmera.

Uma seta amarela aponta para a próxima porta do caminho da missão. O caminho é recalculado por busca em largura no grafo de salas e preserva as restrições de progressão. Na sala do objetivo, a seta indica a interação correspondente quando disponível. Combates e plataformas continuam usando os objetivos do HUD e os anéis existentes.

Na primeira missão, o caminho é Grande salão → Galeria do térreo → Cozinha real → Laboratório principal. As missões que exigem retorno ao salão invertem a orientação automaticamente.

O desenho do personagem e o alvo da câmera agora usam interpolação entre os passos de física de 60 Hz. O estado físico é restaurado após desenhar, preservando colisões e progressão. A resolução acompanha a densidade da tela até 2×, antes limitada a 1,5×. Não havia um efeito de motion blur no código; estas mudanças tratam nitidez e irregularidade visual do movimento. A sensação de borrão no computador do jogador ainda precisa ser reavaliada por ele. Renderizar em 2× pode aumentar o custo em telas de alta densidade.

## Validação

`npm run build` e `npm run test:unit` passaram (3 testes unitários).

`GAME_URL=http://127.0.0.1:4174/ npm run test:navigation` verifica a cadeia de portas usando E, seta no objetivo local, caminho de retorno, resolução 2×, movimento real por teclado e ausência de erros JavaScript. A captura real está em `door-guidance.png`.

Os testes de navegador aceitam `GAME_URL` para validar a compilação correta sem reutilizar um servidor antigo.

Regressão executada na compilação atual: 10 verificações de navegador e 6 de aceitação passaram, incluindo as nove missões, combate, saltos, 24 salas, salvamento, pausa, versão offline e controles de toque. A navegação direta por `file://` continua registrada separadamente como bloqueada pelo ambiente.
