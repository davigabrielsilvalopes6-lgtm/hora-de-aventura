# O Mundo de Aventura: The Last Dance

Jogo 3D de navegador em JavaScript, Three.js e WebGL2. Esta atualização continua a campanha do castelo existente, preservando o modelo externo e o combate.

**[Jogar no navegador](https://davigabrielsilvalopes6-lgtm.github.io/hora-de-aventura/)** · [Publicação no GitHub Actions](https://github.com/davigabrielsilvalopes6-lgtm/hora-de-aventura/actions)

O envio para `main` aciona GitHub Pages. Aguarde a publicação e use Ctrl+F5 se aparecer a versão antiga. Testes locais não comprovam o estado da hospedagem.

## Nesta atualização

- 15 missões principais, investigação, diálogos, puzzles, janela, telhados, defesa e saída rumo à fábrica.
- Cinco atividades opcionais: resgate, documentos, três segredos, mecanismo do jardim e chave do guarda.
- Troca real entre Finn e Jake. Jake estica, cresce, diminui, forma ponte e escada, com desafios físicos cooperativos.
- Finn com repouso, caminhada, corrida, salto, queda, aterrissagem e interação; transições suaves e ritmo pela velocidade real.
- Setas de missão, placas nas portas, controles configuráveis, checkpoints e relógio no HUD.

Interiores e personagens continuam sendo adaptações simplificadas. A área final é o caminho para a fábrica; a fábrica completa ainda precisa ser construída. A meta de **20–30 minutos numa primeira partida normal ainda não foi validada**.

## Controles padrão

| Ação | Tecla |
| --- | --- |
| Andar / correr / pular | WASD ou setas / Shift / Espaço |
| Interagir / pausar | E / Esc |
| Trocar Finn e Jake | Tab |
| Espada / soco de Finn | J / K |
| Jake esticado / gigante / pequeno | Q / F / C |
| Jake ponte / escada | B / L |
| Recuperar ponto seguro | R |
| Girar câmera | Arrastar com o mouse |

Repetir a tecla da forma retorna Jake ao normal quando há espaço livre e Finn não depende desse apoio. Atravesse portas controlando Finn para levar a dupla ao próximo setor. O menu permite configurar as teclas; telas de toque têm botões próprios.

## Progresso salvo

A expansão usa `reino-doce-browser-v2` no armazenamento do navegador. O save antigo `v1` é preservado, mas não é convertido para a sequência nova. Comece uma nova aventura para jogar as 15 missões. **Continuar** carrega o progresso desta versão. Saves dependem do navegador e do endereço do site.

## Desenvolvimento

Requer Node.js 22 ou superior e npm:

```sh
cd web
npm ci --ignore-scripts
npm run build
npm run test:unit
npm start
```

[Instruções e testes](web/README.md) · [Campanha](web/docs/CHAPTER_EXPANSION.md) · [Animações](web/docs/FINN_ANIMATIONS.md) · [Relatório QA](QA_REPORT.md) · [Capturas reais](web/docs/SCREENSHOTS.md)

[Finn animado GLB](web/public/assets/characters/finn-animated.glb) · [Finn estático GLB](web/public/assets/characters/finn.glb) · [Créditos do castelo](web/public/assets/CREDITS.md) · [Animações CC0 de Quaternius](web/public/assets/animations/README.md)

Projeto de fã, sem afiliação oficial. Hora de Aventura e seus personagens pertencem aos respectivos titulares.
