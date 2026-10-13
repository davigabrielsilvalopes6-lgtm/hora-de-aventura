// Original fan story. Fictitious ingredients and mechanisms, not canonical recipes.
const step=(event,text,room,pos=[0,0,0],rules={})=>({event,text,room,pos,...rules});
export const chapters=[
 ['UM CHAMADO DA PRINCESA',[
 step('guard_intro','Converse com o guarda do grande salão','main_hall',[2,0,2],{npc:true}),
 step('princess','Encontre Jujuba no laboratório','laboratory',[0,0,-4],{npc:true}),
 step('inspect_console','Examine o monitor do experimento','laboratory',[-3,0,0]),step('inspect_flask','Examine o frasco instável','laboratory',[3,0,0]),step('inspect_notes','Leia as anotações de Jujuba','laboratory',[0,0,4])]],
 ['O INGREDIENTE DESAPARECIDO',[
 step('store_find','Localize o depósito no segundo andar','guest',[0,0,0]),
 step('storage_button','Tab: controle Jake; Q: alcance o botão elevado','guest',[-3,3.8,-3],{character:'jake',form:'stretch',mechanism:true}),
 step('ingredient','Volte para Finn e recolha o ingrediente','guest',[3,0,-3],{character:'finn'}),step('ingredient_report','Entregue o ingrediente à princesa','laboratory',[0,0,-4],{npc:true})]],
 ['ALGO NÃO ESTÁ CERTO',[
 step('witness_guard','Ouça o guarda da galeria','guards',[0,0,0],{npc:true}),step('witness_patient','Ouça um paciente no hospital','hospital',[0,0,0],{npc:true}),step('witness_nurse','Ouça a cuidadora no berçário','nursery',[0,0,0],{npc:true}),
 step('office_clue','Investigue o registro de entregas','office',[0,0,0]),step('report','Conte suas descobertas à princesa','laboratory',[0,0,-4],{npc:true})]],
 ['A INVASÃO',[
 step('alarm','Investigue o alarme no grande salão','main_hall',[-2,0,3]),step('guard','Ajude os guardas','main_hall',[2,0,2],{npc:true}),step('seal_entry','Feche a trava do portão de entrada','main_hall',[0,0,8]),
 step('hall_kill','Proteja o grande salão','main_hall',null,{count:3,combat:true}),step('lab_kill','Proteja a entrada do laboratório','laboratory',null,{count:2,combat:true})]],
 ['FUGA PELA JANELA',[
 step('window_panel','Use Jake esticado para alcançar a trava','laboratory',[0,3.8,7],{character:'jake',form:'stretch',mechanism:true}),
 step('window','Volte para Finn e abra a janela de serviço','laboratory',[0,0,7],{character:'finn'}),step('landing','Salte pela janela até a sacada','outside',null,{physical:true}),
 step('reunite','Reúna a dupla na sacada segura','outside',[0,6.5,-13],{character:'finn',together:true})]],
 ['O TOPO DO CASTELO',[
 step('roof','Atravesse as sacadas até a bandeira','outside',null,{physical:true}),step('ladder_prepare','Leve Jake à bandeira e use L para virar escada','outside',[3,6.5,0],{character:'jake',form:'ladder'}),
 step('tower_console','Volte para Finn e suba a escada de Jake','outside',[3,10,9],{character:'finn',supportForm:'ladder',minY:9.8}),
 step('transmitter','Transmissor: ESTRELA → NUVEM → CORAÇÃO','outside',[3,10,10],{puzzle:'symbols',character:'finn'}),step('court_arrival','Desça até o pátio e examine o mapa','outside',[3,0,24])]],
 ['PEQUENO DEMAIS PARA FINN',[
 step('duct_find','Encontre o duto da manutenção','maintenance',[0,0,3]),step('duct_lever','Use Jake pequeno (C) para atravessar o duto','maintenance',[-4,.1,0],{character:'jake',form:'small',mechanism:true}),step('duct_exit','Saia do duto e retorne ao tamanho normal','maintenance',[-4,0,4],{character:'jake',form:'normal'}),step('service_unlock','Volte para Finn e destrave o acesso de serviço','maintenance',[3,0,3],{character:'finn'})]],
 ['A FÓRMULA INCOMPLETA',[
 step('formula_brief','Converse com Jujuba sobre a cura','laboratory',[0,0,-4],{npc:true}),step('formula_record','Leia os três componentes fictícios necessários','laboratory',[0,0,4])]],
 ['O CRISTAL DE AÇÚCAR',[
 step('dungeon_riddle','Leia o enigma do cofre nas masmorras','dungeon',[-4,0,4]),step('riddle','Selecione os símbolos do enigma: CORAÇÃO → ESTRELA','dungeon',[-4,0,3],{puzzle:'riddle'}),
 step('bridge_prepare','Suba no apoio; posicione Jake e use B para virar ponte','dungeon',[0,1.6,3],{character:'jake',form:'bridge'}),step('crystal','Volte para Finn e atravesse a ponte até o cristal','dungeon',[0,2.3,-4],{character:'finn',supportForm:'bridge',minY:2.2}),step('crystal_report','Leve o cristal à princesa','laboratory',[0,0,-4],{npc:true})]],
 ['A ESSÊNCIA ARCO-ÍRIS',[
 step('greenhouse_find','Encontre a estufa pela galeria do térreo','greenhouse',[0,0,4]),step('plant_note','Leia a ficha das plantas','greenhouse',[-3,0,2]),step('plant_select','Identifique a planta: pétalas azuis, centro rosa','greenhouse',[-3,0,-2],{puzzle:'plants'}),
 step('giant_prepare','Posicione Jake no círculo e use F para crescer','greenhouse',[2,0,0],{character:'jake',form:'giant'}),step('essence','Volte para Finn e suba em Jake até a planta','greenhouse',[2,3.2,-2],{character:'finn',supportForm:'giant',minY:3}),step('essence_report','Entregue a essência à princesa','laboratory',[0,0,-4],{npc:true})]],
 ['A GELATINA PURIFICADORA',[
 step('secret_clue','Procure a pista no arquivo real','archive',[0,0,0]),step('secret_find','Encontre a passagem atrás do berçário','secret',[0,0,3]),step('secret_lever','Use Jake pequeno para atravessar o segundo duto','secret',[-4,.1,0],{character:'jake',form:'small',mechanism:true}),step('secret_door','Volte para Finn e abra o depósito','secret',[3,0,3],{character:'finn'}),
 step('coop_plate','Deixe Finn na placa rosa; controle Jake na placa azul','secret',[2,0,0],{character:'jake',form:'normal',cooperative:true}),step('gelatin','Volte para Finn e recolha a gelatina','secret',[0,0,-3],{character:'finn'})]],
 ['PREPARANDO A CURA',[
 step('place_crystal','Coloque o cristal no aparelho estrela','laboratory',[-3,0,0]),step('place_essence','Coloque a essência no aparelho nuvem','laboratory',[0,0,0]),step('place_gelatin','Coloque a gelatina no aparelho coração','laboratory',[3,0,0]),
 step('puzzle','Ligue os terminais: AZUL → CREME → ROSA','laboratory',[0,0,4],{puzzle:'colors'}),step('dials','Ajuste os seletores: 2 · 0 · 1','laboratory',[0,0,3],{puzzle:'dials'}),step('cure_activate','Ative o condensador de fantasia','laboratory',[0,0,-1])]],
 ['A CURA NÃO É SUFICIENTE',[
 step('cure_result','Examine o resultado junto ao paciente','hospital',[0,0,0],{npc:true}),step('revelation','Converse com a princesa','laboratory',[0,0,-4],{npc:true}),step('document','Investigue a remessa não autorizada','office',[0,0,0]),step('sample','Compare o selo da amostra no laboratório','laboratory',[2,0,0])]],
 ['A ÚLTIMA DEFESA',[
 step('court_kill','Proteja os cidadãos no pátio','outside',null,{count:3,combat:true}),step('rescue','Resgate o cidadão junto à fonte','outside',[-8,0,14],{npc:true}),step('key','Recolha a chave da trava externa','outside',[10,0,18]),
 step('reinforce','Use Jake gigante para segurar o mecanismo do portão','outside',[-18,0,20],{character:'jake',form:'giant'}),step('gate','Volte para Finn e feche o portão lateral','outside',[-18,0,20],{character:'finn'}),
 step('defense_kill','Defenda o grande salão: duas ondas','main_hall',null,{count:6,combat:true}),step('debrief','Confirme que a princesa está segura','main_hall',[2,0,2],{npc:true})]],
 ['RUMO À FÁBRICA',[
 step('factory','Receba a missão da fábrica','laboratory',[0,0,-4],{npc:true}),step('factory_exit','Atravesse o caminho aberto no pátio','outside',[0,0,28])]]
];
export const details=Object.fromEntries(chapters.flatMap(([title,steps])=>steps.map(s=>[s.event,s])));
export const quests=chapters.map(([title,steps])=>[title,steps.map(s=>[s.event,s.count||1,s.text])]);
export const sideActivities=[
 step('side_rescue','Resgatar o cidadão escondido','tea_room',[0,0,0],{npc:true}),step('side_docs','Recuperar os documentos perdidos','library',[0,0,0]),step('side_secret1','Encontrar a lembrança do quarto','bedroom',[0,0,0]),step('side_secret2','Encontrar a lembrança do trono','throne',[0,0,0]),step('side_secret3','Encontrar a lembrança da árvore','tree',[0,0,0]),step('side_garden','Consertar o mecanismo do jardim','outside',[-12,0,5],{puzzle:'garden'}),step('side_key','Ajudar o guarda a encontrar sua chave','guards',[3,0,3])
];
export const story={
 princess:['Princesa Jujuba','Alguns cidadãos estão esquecendo coisas e meus registros não explicam o motivo. Examinem o monitor, o frasco e as anotações. Finn: Vamos descobrir juntos. Jake: Só espero que o mistério não grude nos pés.'],
 report:['Jujuba','Os relatos apontam para uma remessa alterada. Precisamos verificar o portão… Espere, o alarme disparou!'],
 factory:['Jujuba','A remessa veio da Fábrica de Doces Abandonada. Levem os registros e sigam pelo caminho aberto no pátio. Finn: Vamos descobrir quem está por trás disso. Jake: Combinado. E ninguém prova o lodo verde.'],
 guard_intro:['Guarda','A princesa está no laboratório. Pela galeria do térreo, passe pela cozinha. Os corredores estão abertos, mas alguns cidadãos estão muito inquietos.'],
 inspect_console:['Monitor','A curva oscila quando o catalisador recebe energia. Finn: Não parece um resultado normal.'],inspect_flask:['Frasco','O frasco tem um brilho verde que não consta na etiqueta. Jake: Se isso vira sobremesa, eu passo.'],inspect_notes:['Anotações','Jujuba precisa do estabilizador guardado no antigo depósito do segundo andar. A trava está emperrada; há um botão elevado dentro da sala.'],
 store_find:['Depósito','O armário está trancado. O botão fica alto demais para Finn. Tab troca de personagem; Q estica Jake.'],storage_button:['Jake','Jake: Resolvido! Braços compridos, problemas pequenos. Volte para Finn e recolha o estabilizador.'],ingredient:['Estabilizador','O ingrediente foi recolhido. O laboratório fica pela cozinha.'],ingredient_report:['Jujuba','Esse estabilizador vai ajudar. Antes de misturar qualquer coisa, investiguem os relatos dos habitantes.'],
 witness_guard:['Guarda','Ouvi arranhões perto do portão. Um cidadão voltou da fábrica sem lembrar do caminho.'],witness_patient:['Paciente','As luzes pareciam doces… mas meus braços começaram a endurecer. A enfermeira me trouxe para cá.'],witness_nurse:['Cuidadora','Havia caixas com um selo diferente. Registrei a entrega no escritório da princesa.'],office_clue:['Livro de entregas','Uma remessa saiu da fábrica e passou pelo castelo sem inspeção. A assinatura foi raspada.'],
 seal_entry:['Trava','O portão principal está fechado. Agora ajude os guardas a conter os invasores.'],window_panel:['Jake','A trava superior cedeu. Volte para Finn e abra a janela.'],reunite:['Finn e Jake','Finn: Todo mundo inteiro? Jake: Inteiro, sim. Um pouco mais comprido, talvez. A bandeira marca o próximo apoio.'],
 ladder_prepare:['Jake','Jake segura a forma de escada. Tab retorna a Finn. Suba a rampa amarela até a plataforma do transmissor.'],tower_console:['Transmissor','O desenho gravado indica ESTRELA, NUVEM, CORAÇÃO. Os terminais precisam receber esses sinais em ordem.'],transmitter:['Jujuba, pelo rádio','O sinal voltou! Há um bloqueio no acesso de manutenção. Jake pode entrar pelo duto pequeno.'],court_arrival:['Mapa do pátio','A entrada de serviço fica pelo laboratório. Procurem a manutenção e seu duto.'],
 duct_find:['Duto','O túnel baixo leva à alavanca interna. Jake pode passar diminuindo com C.'],duct_lever:['Alavanca','A trava interna foi solta. Saia pelo mesmo túnel; só volte ao tamanho normal em espaço aberto.'],duct_exit:['Jake','Jake: Forma normal, espaço normal. Finn pode usar a porta de serviço agora.'],service_unlock:['Acesso liberado','Volte ao laboratório para ouvir o plano da princesa.'],
 formula_brief:['Jujuba','Precisamos de um cristal de açúcar estelar, essência de fruta arco-íris e gelatina purificadora. São componentes raros da minha fórmula de fantasia.'],formula_record:['Registro da fórmula','Cristal: cofre das masmorras. Essência: estufa da galeria. Gelatina: depósito escondido. Cada lugar guarda um mecanismo diferente.'],dungeon_riddle:['Enigma','Primeiro o símbolo da coragem. Depois o que ilumina a noite. CORAÇÃO → ESTRELA.'],riddle:['Cofre','O caminho de entrada abriu. O apoio do cristal está alto; Jake pode unir os dois lados como ponte.'],bridge_prepare:['Jake','A ponte está firme. Volte para Finn, suba no apoio de entrada e atravesse o corpo de Jake.'],crystal:['Cristal','O cristal vibra como uma pequena estrela. Leve-o à princesa.'],crystal_report:['Jujuba','Um componente pronto. A ficha da estufa explica qual planta produz a essência.'],
 greenhouse_find:['Estufa','Três plantas têm cores parecidas. Investigue antes de colher.'],plant_note:['Ficha das plantas','A planta correta tem pétalas azuis e centro rosa. A essência cresce na plataforma alta.'],plant_select:['Planta correta','Você identificou a planta. Jake gigante pode servir de apoio até a plataforma.'],giant_prepare:['Jake','Jake segura a forma gigante. Volte para Finn e use os apoios amarelos até a planta.'],essence:['Essência','A essência foi recolhida sem danificar a planta.'],essence_report:['Jujuba','Falta a gelatina. Há uma anotação sobre ela no arquivo real.'],
 secret_clue:['Arquivo','O depósito fica atrás da estante no berçário. A alavanca pode ser acessada por um duto; a última trava exige dois personagens nas placas.'],secret_find:['Depósito secreto','A alavanca interna está no túnel baixo à esquerda.'],secret_lever:['Jake','A porta externa foi destravada. Volte para Finn.'],secret_door:['Placas cooperativas','Deixe Finn sobre a placa rosa à esquerda. Troque para Jake e leve-o à placa azul à direita. As duas precisam ficar ocupadas.'],coop_plate:['Trava cooperativa','Os dois apoios foram pressionados. A gelatina está livre.'],gelatin:['Gelatina','Os três componentes estão disponíveis. Retorne ao laboratório.'],
 place_crystal:['Aparelho estrela','Cristal colocado.'],place_essence:['Aparelho nuvem','Essência colocada.'],place_gelatin:['Aparelho coração','Gelatina colocada. A sequência dos terminais é azul, creme, rosa.'],dials:['Seletores','Os mecanismos estão alinhados em 2 · 0 · 1. O condensador está pronto.'],cure_activate:['Experimento','Uma luz lilás percorre os tubos. O novo brilho verde desaparece da amostra. Visite o hospital para ver o resultado.'],cure_result:['Paciente','Já consigo lembrar da minha casa! Mas o rádio ainda recebe pedidos de ajuda da rua.'],
 reinforce:['Jake','Jake sustenta o mecanismo. Finn pode fechar a trava externa.'],factory_exit:['Rumo à fábrica','O caminho para a fábrica está aberto. A dupla segue com os registros e os três componentes da cura. Esta área continua disponível para exploração.']
};
