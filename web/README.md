# O Mundo de Aventura — versão para navegador

Protótipo independente em JavaScript + Three.js/WebGL2. Não exige Godot para jogar. O projeto Godot fora desta pasta foi preservado.

## Jogador

A distribuição leve contém somente `Jogar-Reino-Doce.html`. No Windows, abra o arquivo com Chrome ou Edge com aceleração gráfica. O código e o Three.js estão embutidos; não há CDN, npm, servidor ou Godot necessários para o modo leve. O navegador deste ambiente bloqueia navegação `file://` por política administrativa, então **abertura direta no Windows ainda requer validação**. O mesmo HTML foi executado em uma página do Chromium com rede desativada, sem erros.

O menu permite nova aventura e continuar, quando houver progresso válido. WASD/setas movem; Shift corre; Espaço pula; J ataca; E interage; R recupera o ponto seguro; arrastar a tela gira a câmera; Esc pausa. Enter aciona o botão de diálogo focado. Em telas sensíveis ao toque, há setas, pulo, ataque e interação.

O jogo começa no grande salão com Finn e Jake provisórios. As nove missões conduzem ao laboratório, alarme, invasão, janela, sete plataformas, pátio, investigação, duas ondas de defesa e anúncio da fábrica. **A fábrica ainda não foi construída nesta versão.**

## Recursos e diferenças

- 24 setores adaptados dos dados do projeto original, com portas recíprocas, pisos, paredes e móveis simplificados. Não é uma conversão integral das cenas e móveis Godot.
- Movimento com diagonais normalizadas, gravidade, colisões simplificadas, pulo, aterrissagem em pisos/plataformas/móveis e recuperação de quedas.
- Combate com alcance, direção, paredes bloqueando golpes, reação ao dano, vida e breve invulnerabilidade. Zumbis comuns, rápidos e resistentes; patrulha, perseguição, retorno e navegação em grade. Ondas finitas, contagem de mortes e progressão em ordem.
- Jake acompanha sem colisão física e se reposiciona se ficar distante. Interações, diálogos originais de fã e sons sintetizados via WebAudio após ação do jogador.
- Objetivos, contadores e checkpoint são salvos no `localStorage`, isolados do Godot. Dados inválidos são rejeitados. Vida restaura ao continuar. Se armazenamento estiver bloqueado, o HUD informa indisponibilidade e o jogo continua; não promete persistência nesse caso.
- Modelo original de Kenny Park, CC BY 4.0, reutilizado sem modificar o GLB (374 meshes), carregado sob HTTP(S) em `assets/castle.glb`. Pode exigir GPU mais potente. O **modo leve** tem uma representação aproximada explicitamente identificada; é o modo do arquivo único. Não reivindica fidelidade ao USDZ.
- Geometria estática agrupada com InstancedMesh para reduzir chamadas de renderização. Navegação/câmera usam caixas simplificadas; não há colisão precisa de toda a arquitetura do GLB. Não se deve tratar a arquitetura original inteira como explorável só porque está visível.

## Desenvolvimento

Node e npm, sem instalação do Godot:

```sh
npm ci --ignore-scripts
npm run build
npm start
```

O servidor `serve.mjs` é para desenvolvimento/teste. Não é hospedagem pública. A pasta `dist/` é a distribuição estática, com `index.html` e `assets/`. Não requer serviços de backend para hospedar. O `index.html` também contém o modo leve completo.

```sh
npm run test:unit
npm run test:browser
```

Os testes de navegador usam Playwright e Chromium. Neste ambiente há `/usr/bin/chromium`. Em outra máquina, use `npx playwright install chromium` ou indique o executável em `BROWSER_EXECUTABLE`. Inicie o servidor antes dos testes. Fixtures estão disponíveis somente com `?qa=1`. Não são código de progressão do jogador normal.

Dependências fixadas por lockfile, sem desligar verificação TLS. Three.js 0.180.0, esbuild 0.25.11 e Playwright 1.62.1. Licença Three.js no HTML e em `public/assets/THREE_LICENSE.txt`. Créditos do castelo em `public/assets/CREDITS.md`.

## Resultados reais

`docs/browser-results.json`: controles, portas, diálogos, combate, puzzle, janela e sete plataformas via eventos de teclado, original GLB de 374 meshes, checkpoint, pausa e layout responsivo.

`docs/acceptance-results.json`: nove missões terminadas com E e golpes reais, duas ondas, 24 chegadas/colisões/saídas, rejeição de save inválido, HTML sem rede, toque real via CDP e ausência de erros JavaScript. A história completa usa fixtures para certas mudanças de sala/posições na rota externa; o trajeto de plataformas é testado separadamente sem teleporte/alteração de velocidade. Não é uma partida humana contínua.

`docs/quest-tests.log`: ordem dos 30 eventos aceitos, round-trip de cada estado parcial e rejeição de estados inválidos sem mutação.

Capturas PNG em `docs/` são imagens reais do Chromium/WebGL, não arte conceitual. Há uma limitação registrada para `file://` bloqueado por administrador neste ambiente; render offline via DOM foi validado separadamente. Não há teste de hardware GPU do usuário, Windows, Safari ou uma sessão longa. Não há números de FPS inventados.

## Limites / como continuar

Esta é uma primeira versão jogável. Faltam arte e interiores com a fidelidade/detalhamento do projeto anterior, cinematografia, obstáculos mais variados, evolução de Jake, missões opcionais próprias, fábrica e ajuste de dificuldade com jogadores reais. Esta tarefa não reconstruiu o conteúdo Godot nem migrou seu formato de save.

**Ainda não há publicação no GitHub ou site público.** O acesso de escrita deste ambiente falhou nas tentativas anteriores e nenhuma ferramenta de hospedagem está disponível nesta sessão. Os arquivos preparados não equivalem a um site publicado. Para oferecer um link público de jogar, será necessário publicar `dist/` em uma hospedagem estática com acesso autorizado.

## Publicação preparada, não executada

O workflow `.github/workflows/browser-pages.yml` prepara build, testes de progresso e deploy no GitHub Pages. Requer enviar estes arquivos ao GitHub, configurar Settings → Pages → GitHub Actions e executar o workflow (ou integrar em main). **Não foi executado no GitHub nesta sessão; nenhum endereço público foi validado.**

## Correções verificadas nesta implementação

- A primeira montagem do HTML interpretava `$&` do bundle como substituição de texto. Build passou a usar callback; o JavaScript iniciou de verdade no navegador.
- Frames reais lentos no renderizador por software expuseram um problema nos testes: espera fixa por milissegundos não prova que o cooldown/simulação avançaram. Os testes aguardam o relógio da simulação e não removem suas verificações de resultado.
- A janela recebeu altura livre suficiente para o arco do pulo. O teste atravessa sete plataformas com eventos de teclado, parando para validar a aterrissagem em cada altura.
- Os gatilhos de janela e checkpoint agora exigem chão seguro; passar no ar ou correr sob uma plataforma não conclui o objetivo.
- Móveis foram afastados das zonas de chegada, inclusive na masmorra. Direção de entrada foi alinhada à parede, e patamares elevados completam os andares da escada. Teste verifica as 51 chegadas do grafo, piso e ausência de sobreposição.
- Buffers de InstancedMesh são liberados na troca de setor, preservando a geometria/material compartilhados e o modelo original. A câmera e a imagem em dispositivo real ainda precisam de inspeção humana.
- O portão lateral continua utilizável após a missão, sem dar progresso/recompensa duplicados; sair do castelo após o encerramento chega ao pátio, permitindo retornar.

Configuração de instalação/início do ambiente foi salva como rascunho para a nova aplicação web. É separada da publicação de um site; precisa de revisão e publicação nas configurações do ambiente para ativação. Restauração da branch local numa tarefa nova não foi comprovada.

Resultado final: **19 verificações passaram** (3 de progresso e 16 de navegador); uma navegação direta por arquivo ficou bloqueada pela política do ambiente. Os 51 pontos de chegada foram validados; o HTML sem rede e a imagem 3D foram inspecionados após aquecimento do renderizador. Screenshots preliminares de diagnóstico não são evidência de aprovação e estão excluídos da entrega.
