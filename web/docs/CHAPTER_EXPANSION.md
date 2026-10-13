# Capítulo 1 — expansão do surto

História original de fã para a campanha de navegador. Fórmula e mecanismos são fictícios, não conteúdo canônico. Castelo e setores existentes foram aproveitados; o GLB externo não foi reconstruído nem modificado.

## Missões implementadas

| # | Missão | Desafio |
| --- | --- | --- |
| 1 | Um chamado da princesa | Guarda, laboratório e três evidências |
| 2 | O ingrediente desaparecido | Depósito no segundo andar; Jake esticado alcança botão |
| 3 | Algo não está certo | Testemunhas e livro de entregas |
| 4 | A invasão | Alarme, trava, três zumbis no salão e dois no laboratório |
| 5 | Fuga pela janela | Trava elevada, salto controlado e reunião da dupla |
| 6 | O topo do castelo | Sacadas, escada de Jake e puzzle do transmissor |
| 7 | Pequeno demais para Finn | Duto baixo, alavanca e saída segura |
| 8 | A fórmula incompleta | Descoberta dos três componentes fictícios |
| 9 | O cristal de açúcar | Enigma, ponte física e cofre elevado |
| 10 | A essência arco-íris | Planta correta e apoio de Jake gigante |
| 11 | A gelatina purificadora | Pista, segundo duto e placas simultâneas |
| 12 | Preparando a cura | Componentes, terminais coloridos e seletores |
| 13 | A cura não é suficiente | Hospital, remessa alterada e amostra |
| 14 | A última defesa | Pátio, resgate, chave, mecanismo e duas ondas |
| 15 | Rumo à fábrica | Nova missão e caminho para a fábrica |

Progresso exige o evento atual: 70 eventos distintos, 80 unidades contando inimigos. Testes percorrem cada estado parcial. A fábrica completa não faz parte desta entrega.

## Cooperação

Tab transfere controle sem transportar Finn com Jake. Finn permanece em Idle na posição deixada. Jake acompanha apenas em forma normal ao voltar a Finn. Portas comuns são atravessadas por Finn e levam a dupla ao setor seguinte.

Q/F/C/B/L usam altura, raio e superfícies próprias. Formas maiores não atravessam paredes/teto. Ponte e escada ficam ancoradas; a forma não pode ser removida enquanto Finn depende dela. As placas secretas exigem Finn à esquerda e Jake normal à direita, simultaneamente.

## Conexões e rota

Grafo original preservado. Estufa conecta-se à lateral da galeria do térreo, sem sobrepor hospital. Escadarias existentes levam aos dois andares. Masmorra e manutenção recebem mecanismos. Janela continua pelas sete plataformas, bandeira, escada e transmissor. Patamar da torre foi conectado à escada para eliminar um vão obrigatório.

O pátio liga-se ao acesso de serviço. A saída final está na rua livre `(0, 0, 28)`, sem sobreposição com casa. A aproximação da fábrica é um caminho curto explorável, não a fábrica completa.

## Opcionais

Cinco atividades agrupam sete eventos: cidadão na sala de chá, documentos na biblioteca, lembranças no quarto/trono/árvore, jardim e chave do guarda. Os três segredos formam uma atividade. Sem recompensa duplicada, aumento de dano ou vida; objetos coletados deixam de aparecer.

## Salvamento e orientação

Save `v2`: ordem dos objetivos, opcionais, atores, forma, ponto seguro e relógio. `v1` permanece intacto; inicie nova aventura para a nova sequência.

Seta indica a próxima porta no grafo ou objetivo local. Portas têm placas fixas. Dicas de apoios ficam em placas laterais; rótulos/anéis próximos à câmera são ocultados/reduzidos para não cobrir Finn. Janela tem breve vista da rota externa no diálogo, seguida de salto sob controle normal.

## Pendências

Medir duração com jogadores reais; finalizar Jake; construir fábrica; melhorar IK, móveis e fidelidade dos interiores. Não houve reconstrução das cenas Godot. Resultados em `QA_REPORT.md`, na raiz.
