export class Playtime{
 constructor(){this.total=0;this.dialogue=0;this.exploration=0;this.combat=0;this.missions=Array(15).fill(0);this.optional=0;}
 tick(dt,mode,quest,enemies,optional=false){if(!Number.isFinite(dt)||dt<0||dt>300)return;if(!['game','dialogue'].includes(mode))return;this.total+=dt;if(optional)this.optional+=dt;else if(quest<15)this.missions[quest]+=dt;if(mode==='dialogue')this.dialogue+=dt;else if(enemies)this.combat+=dt;else this.exploration+=dt;}
 snapshot(){return {total:this.total,dialogue:this.dialogue,exploration:this.exploration,combat:this.combat,missions:[...this.missions],optional:this.optional};}
 restore(v){if(!v||!['total','dialogue','exploration','combat','optional'].every(k=>Number.isFinite(v[k])&&v[k]>=0)||!Array.isArray(v.missions)||v.missions.length!==15||v.missions.some(n=>!Number.isFinite(n)||n<0))return false;Object.assign(this,v);return true;}
}
