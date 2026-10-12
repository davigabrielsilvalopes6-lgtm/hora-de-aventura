# Finn 3D — entrega e evidências

Criado por modelagem procedural em Three.js a partir da referência visual fornecida, sem geração de imagem por IA. O modelo real tem chapéu branco e orelhas arredondadas, face oval, olhos e sorriso, roupa azul, mochila em dois tons de verde, meias, sapatos e braço mecânico com dedos e acabamento azul claro.

A fábrica `src/finn.js` é usada diretamente pelo jogador em `src/main.js`. O modelo também foi exportado para `public/assets/characters/finn.glb`. As pernas e os braços se movimentam por grupos articulados durante caminhada e ataque; o arquivo exportado está em pose estática, sem esqueleto ou clipes de animação.

## Validação real

- Compilação passou; três testes unitários de missões passaram.
- `node export-finn.mjs` exportou e recarregou o GLB usando GLTFExporter/GLTFLoader no Chromium: 39 malhas, altura 1,995 unidades, pés em Y=0. Evidência numérica em `finn-export.json`.
- `finn-front.png`, `finn-side.png` e `finn-back.png` são capturas reais do modelo renderizado em WebGL. As três vistas foram inspecionadas; os encaixes do braço e a junção entre camiseta e shorts foram ajustados e as capturas refeitas.
- O teste de orientação executou a cadeia de portas até o laboratório, caminho de retorno, marcador local, movimento por teclado e ausência de erros JavaScript.

Este é um modelo simplificado de fã, inspirado na imagem, e não uma reprodução exata ou um recurso oficial. Não foi validado em Blender, celular físico ou no computador do usuário. A publicação do site ocorre pelo workflow de GitHub Pages, separadamente do envio dos arquivos.

Regressão: 10 verificações de navegador e 6 verificações de aceitação passaram, incluindo movimento, portas, combate, saltos da janela e telhados, nove missões, 24 salas, checkpoints, salvamento, pausa, jogo offline e toque. A tentativa direta por `file://` permanece marcada separadamente como bloqueada pelo ambiente.
