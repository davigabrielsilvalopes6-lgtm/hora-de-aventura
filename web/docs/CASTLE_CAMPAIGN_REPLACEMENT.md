# Castelo real na campanha — correção da substituição

## Investigação

A página pública é construída pelo repositório `davigabrielsilvalopes6-lgtm/hora-de-aventura`, branch `main`, pasta `web/`. A engine desta versão é Three.js/WebGL2, não Godot. O workflow `.github/workflows/browser-pages.yml` compila com esbuild e publica `web/dist` no GitHub Pages após mudanças em `main`.

O castelo genérico vinha de **`web/src/main.js`, função `lightCastle()`**: bloco de 18×18×14, cilindros e cones. `buildOutside()` criava essa estrutura, e `loadCastle()` podia recusá-la quando `lite` estava ativo. Isso explicava por que o usuário ainda via o genérico mesmo com o GLB presente no projeto e no visualizador.

Foram localizadas a conversão anterior do USDZ no projeto Godot preservado e a cópia GLB no projeto web. A versão usada nesta correção é **`web/public/assets/castle.glb`**, recebida no ZIP do usuário: 38.321.956 bytes, 374 malhas, 1.012.771 triângulos e 43 materiais. SHA256 `f3fd5d7399247c922770fc061127c5f0340b61467eada662ddfd3191f9db21e8`. O arquivo não foi reconstruído nem convertido novamente. Usa cores/materiais incorporados, sem imagens externas de textura. Autor/licença confirmados no GLB: Kenny Park, CC BY 4.0; atribuição preservada.

## Integração

- `lightCastle()` e a referência ao fallback foram removidos.
- A campanha carrega o GLB real automaticamente no exterior, inclusive em qualidade econômica. O modo econômico reduz resolução, preservando geometria e cores.
- Há aviso de carregamento. Falha de rede oferece tentar novamente ou retornar ao menu; não gera um castelo genérico.
- Escala uniforme 100×, posição `(-18,-1,-50)`: o castelo fica ao lado da rota de passarelas, com sua fachada acessível.
- Entrada em `(-18,1,-16)` liga ao grande salão. Saída do salão retorna a `(-18,0,-14)`. Acesso de serviço em `(-21,0,-16)` liga ao laboratório.
- A porta fechada tem um volume de colisão simplificado; o jogador se aproxima e usa E. As colisões das plataformas, janela e poderes de Jake foram preservadas.
- Decoração provisória na aproximação da entrada foi retirada. As árvores e decorações originais do GLB permanecem intactas.
- A câmera permite olhar um pouco para cima para enquadrar a silhueta. Movimento, dano, golpes e missão não foram reescritos.
- Vistas paradas em menu/pausa/configurações não são redesenhadas indefinidamente. Isso evita trabalho gráfico inútil mantendo o modelo completo.

## Arquivos de implementação e testes

`web/src/main.js`, `web/src/index.html`, `web/package.json`, `web/tests/castle-campaign.cjs`, `web/tests/castle-upload.cjs`, `web/tests/browser.cjs`, `web/tests/abilities.cjs` e `web/tests/navigation.cjs`. Documentação, manifestos e capturas em `web/docs/`, README e QA_REPORT foram atualizados. O GLB e seus créditos continuam em `web/public/assets/`.

## Captura da campanha

[Castelo real com Finn e Jake](castle-campaign-finn-jake.png). É captura do jogo em execução no exterior da campanha, com a câmera normal; não é imagem conceitual nem apenas o visualizador. As quatro vistas do modelo também estão no índice `SCREENSHOTS.md`.

## Métodos e limites

Os testes de campanha usam fixtures apenas para preparar salas/etapas, com E, escolhas e combate reais. Travessias físicas de plataformas e poderes usam teclado e passos da física, sem teleportar no percurso. O software gráfico deste ambiente foi lento: esperas fixas por milissegundos não provavam avanço da simulação. Os testes passaram a avançar os passos físicos e verificar aterrissagem/altura, mantendo as mesmas colisões e requisitos. Capturas pesadas de apoio podem pausar a simulação e ocultar apenas o painel de pausa; não ocultam geometria.

O arquivo é incluído por `build.mjs` em `dist/assets/castle.glb`; o caminho `./assets/castle.glb` é relativo ao HTML e compatível com o subdiretório do GitHub Pages. O teste registrou HTTP 200 local, carregamento das 374 malhas, ausência de erros JavaScript, falha de rede controlada e recuperação por retry.

O envio para `main` aciona a publicação automática já configurada. **Push e testes locais não comprovam conclusão do deploy nem ausência de 404 no site público**: o acesso a github.io é limitado neste ambiente. Verifique o workflow e atualize com Ctrl+F5 após publicar.

Continuam pendentes: FPS em GPU física/Windows; colisão precisa de todas as faces do diorama; arte/fidelidade dos interiores adaptados. A rota de serviço da missão foi mantida na lateral, sem afirmar que todo telhado e torre do GLB se tornou explorável. A substituição não altera o formato do save v2.
