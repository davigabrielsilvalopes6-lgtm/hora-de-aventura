export {quests} from './campaign.js';
import {quests} from './campaign.js';
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
