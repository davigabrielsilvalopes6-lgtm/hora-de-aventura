export const quests=[
 ['ENCONTRE A PRINCESA JUJUBA',[['princess',1,'Converse com Jujuba no laboratório']]],
 ['ALGO DEU ERRADO',[['alarm',1,'Investigue o alarme no grande salão'],['guard',1,'Converse com o guarda'],['report',1,'Retorne à princesa']]],
 ['INVASÃO AO CASTELO',[['hall_kill',3,'Proteja o grande salão'],['lab_kill',2,'Proteja o laboratório']]],
 ['FUGA PELA JANELA',[['window',1,'Abra a janela de serviço'],['landing',1,'Salte pela janela até a sacada']]],
 ['PELOS TELHADOS',[['roof',1,'Atravesse os telhados até a bandeira']]],
 ['O PÁTIO INFECTADO',[['court_kill',3,'Derrote os zumbis do pátio'],['rescue',1,'Resgate o cidadão junto à fonte'],['key',1,'Recolha a chave na barraca'],['gate',1,'Abra o portão lateral']]],
 ['O SEGREDO DO LABORATÓRIO',[['document',1,'Leia o registro do experimento'],['sample',1,'Examine a amostra'],['puzzle',1,'Ligue os terminais: azul → creme → rosa'],['revelation',1,'Converse com a princesa']]],
 ['DEFESA DO CASTELO',[['defense_kill',6,'Defenda o salão: duas ondas de três'],['debrief',1,'Receba o relatório do guarda']]],
 ['A AMEAÇA DA FÁBRICA',[['factory',1,'Converse com Jujuba sobre a fábrica']]]
];
export class Progress{
 constructor(){this.q=0;this.o=0;this.n=0;this.done=[];}
 get current(){return quests[this.q]?.[1][this.o];}
 accept(event){const c=this.current;if(!c||c[0]!==event)return false;this.n++;if(this.n>=c[1]){this.done.push(event);this.n=0;this.o++;if(this.o>=quests[this.q][1].length){this.q++;this.o=0;}}return true;}
 snapshot(){return {q:this.q,o:this.o,n:this.n,done:[...this.done]};}
 restore(d){
  if(!d||![d.q,d.o,d.n].every(Number.isInteger)||d.q<0||d.q>quests.length||d.o<0||d.n<0)return false;
  if(d.q===quests.length ? d.o!==0||d.n!==0 : !quests[d.q][1][d.o]||d.n>=quests[d.q][1][d.o][1])return false;
  const expected=quests.slice(0,d.q).flatMap(q=>q[1].map(o=>o[0])).concat((quests[d.q]?.[1]||[]).slice(0,d.o).map(o=>o[0]));
  if(JSON.stringify(expected)!==JSON.stringify(d.done))return false;
  Object.assign(this,{q:d.q,o:d.o,n:d.n,done:expected});return true;
 }
}
