import * as T from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import rooms from './rooms.json';
import {createFinn} from './finn.js';
import {loadAnimatedFinn} from './finn-controller.js';
import {Progress,quests} from './quests.js';
import {details,sideActivities,story} from './campaign.js';
import {Playtime} from './playtime.js';
import {defaults,controlNames,keyLabel,validBindings} from './controls.js';
const $=id=>document.getElementById(id), keys=new Set(), color={pink:0xf3c9d5,cream:0xf8e8de,lilac:0xd9c9ea,blue:0xb9d9e9,ink:0x614367};
let bindings={...defaults},rebinding=null;try{const saved=JSON.parse(localStorage.getItem('reino-doce-controls'));if(validBindings(saved))bindings=saved;}catch{}
let sideDone=new Set(),playtime=new Playtime(),optionalBusy=false,scenePreview=null;const canvas=$('game');let renderer;
try{renderer=new T.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});}catch(e){$('dialogue').textContent='Seu navegador não conseguiu iniciar o 3D. Ative a aceleração gráfica ou tente Chrome/Edge atualizado.';throw e;}
renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
const scene=new T.Scene();scene.background=new T.Color(0xb9d9e9);scene.fog=new T.Fog(0xb9d9e9,90,190);
const camera=new T.PerspectiveCamera(65,innerWidth/innerHeight,.08,220);scene.add(new T.HemisphereLight(0xfff7f0,0xa18698,1.5));
const sun=new T.DirectionalLight(0xfff2df,2);sun.position.set(20,50,30);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);sun.shadow.camera.left=-30;sun.shadow.camera.right=30;sun.shadow.camera.top=30;sun.shadow.camera.bottom=-30;sun.shadow.normalBias=.05;scene.add(sun);
let world=new T.Group();scene.add(world);const actorRoot=new T.Group();scene.add(actorRoot);
const shapes={plaque:new T.PlaneGeometry(3.25,.72),box:new T.BoxGeometry(1,1,1),sphere:new T.SphereGeometry(.5,12,8),cylinder:new T.CylinderGeometry(1,1,1,16),cone:new T.ConeGeometry(1,1,16),ring:new T.TorusGeometry(.45,.065,6,20)};
const mats=new Map(), labels=new Map();
let buildingStatic=false,staticMeshes=[];
function mat(c){const k=String(c);if(!mats.has(k))mats.set(k,new T.MeshStandardMaterial({color:c,roughness:.85}));return mats.get(k);}
function mesh(type,x,y,z,sx,sy,sz,c,parent=world){const m=new T.Mesh(shapes[type],mat(c));m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.castShadow=true;m.receiveShadow=true;parent.add(m);if(buildingStatic)staticMeshes.push(m);return m;}
const box=(x,y,z,sx,sy,sz,c,p)=>mesh('box',x,y,z,sx,sy,sz,c,p);
const sphere=(x,y,z,sx,sy,sz,c,p)=>mesh('sphere',x,y,z,sx,sy,sz,c,p);
const cyl=(x,y,z,r,h,c,p)=>mesh('cylinder',x,y,z,r,h,r,c,p);
let roomLabels=[],solids=[],floors=[],ramps=[],interactions=[],zombies=[],room='main_hall',mode='start',progress=new Progress(),roof=false,checkpoint='main_hall',puzzle=0,noticeUntil=0,alarmTime=0,enemySerial=0,audio,originalCastle=null,modelPromise=null,modelState='';
let lite=!['http:','https:'].includes(location.protocol)||new URLSearchParams(location.search).has('lite'),fallbackCastle=null;
let yaw=0,pitch=.3,clock=0,attackCD=0,pendingStrike=null,hurtCD=0,hp=5,jumpRequest=false,grounded=false,vy=0,walkTime=0,elapsed=0;
const renderPrevious=new T.Vector3();let missionArrow=null;
let activeCharacter='finn',jakeForm='normal',abilityVisual=null;const finnCarrier=new T.Group();
const player=new T.Group(),jake=new T.Group();player.add(finnCarrier);actorRoot.add(player,jake);let facing=new T.Vector3(0,0,-1);
function displayText(text){return text.replace(/\b(Tab|Q|F|C|B|L)\b/g,key=>keyLabel(bindings[{Tab:'swap',Q:'stretch',F:'giant',C:'small',B:'bridge',L:'ladder'}[key]]));}
function label(text,x,y,z,p=world){text=displayText(text);if(!labels.has(text)){const c=document.createElement('canvas');c.width=512;c.height=96;const ctx=c.getContext('2d');ctx.fillStyle='rgba(255,247,238,.88)';ctx.beginPath();ctx.roundRect(1,1,510,94,22);ctx.fill();ctx.fillStyle='#614367';ctx.font='bold 26px system-ui';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,256,48,490);labels.set(text,new T.SpriteMaterial({map:new T.CanvasTexture(c),depthTest:true}));}const sprite=new T.Sprite(labels.get(text));sprite.position.set(x,y,z);sprite.scale.set(3.8,.72,1);p.add(sprite);roomLabels.push(sprite);return sprite;}
function doorSign(text,node,height=null){
 const key='sign:'+text;
 if(!labels.has(key)){
  const c=document.createElement('canvas');c.width=1024;c.height=256;
  const ctx=c.getContext('2d');ctx.fillStyle='#F8E8DE';ctx.fillRect(0,0,1024,256);
  ctx.strokeStyle='#B783A4';ctx.lineWidth=18;ctx.strokeRect(12,12,1000,232);
  ctx.fillStyle='#614367';ctx.textAlign='center';ctx.textBaseline='middle';
  let size=68;do{ctx.font=`bold ${size}px system-ui`;size-=2;}while(ctx.measureText(text).width>940&&size>24);
  ctx.fillText(text,512,128);
  const texture=new T.CanvasTexture(c);texture.colorSpace=T.SRGBColorSpace;texture.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
  labels.set(key,new T.MeshBasicMaterial({map:texture}));
 }
 // Positive local Z faces the room, with the board clear of the wall.
 const boardY=height??Math.min(3.65,(rooms[room]?.height||10)-node.position.y-.5);box(0,boardY,.18,3.4,.85,.16,color.ink,node);
 const plate=new T.Mesh(shapes.plaque,labels.get(key));plate.position.set(0,boardY,.27);node.add(plate);
 node.userData.sign=text;
}
function hintSign(text,x,y,z){const node=new T.Group();node.position.set(x,y,z);node.scale.setScalar(.65);world.add(node);doorSign(displayText(text),node,0);return node;}
function updateMissionArrow(){
 if(!missionArrow){missionArrow=new T.Group();scene.add(missionArrow);
 const material=new T.MeshBasicMaterial({color:0xffd34f});
 const stem=new T.Mesh(new T.CylinderGeometry(.09,.09,.5,8),material);stem.position.y=.45;missionArrow.add(stem);
 const tip=new T.Mesh(new T.ConeGeometry(.28,.4,12),material);tip.rotation.z=Math.PI;missionArrow.add(tip);
 }
 const next=nextDoorTarget();const point=room==='outside'&&details[expected()]?.room!=='outside'?interactions.find(p=>p.event==='service_return'):next?interactions.find(p=>p.kind==='door'&&p.target===next):interactions.find(p=>p.event===expected());
 missionArrow.visible=mode==='game'&&!!progress.current&&!!point;
 if(point){missionArrow.position.copy(point.pos);if(point.kind==='door')missionArrow.position.addScaledVector(point.inward,.8);
 missionArrow.position.y=Math.min(point.pos.y+(point.kind==='door'?3.6:3.4),rooms[room]?rooms[room].height-.7:Infinity)+Math.sin(elapsed*3)*.12;
 missionArrow.userData.target=point.target||point.event;
 }else missionArrow.userData.target=null;
}
function character(parent,kind='candy',c=color.blue){
 const figure=new T.Group();parent.add(figure);
 if(kind==='jake'){sphere(0,.6,0,.9,1.1,.7,0xe4b85a,figure);sphere(0,1.07,-.08,.9,.55,.65,0xe4b85a,figure);for(const x of [-.22,.22]){sphere(x,1.13,-.33,.18,.18,.1,color.ink,figure);sphere(x,.16,0,.25,.3,.3,0xe4b85a,figure);}sphere(0,1,-.42,.22,.18,.17,color.ink,figure);return figure;}
 sphere(0,1.4,0,.65,.68,.55,kind==='finn'?color.cream:c,figure);
 box(0,.82,0,.64,.7,.4,kind==='finn'?0x72b8d1:c,figure);
 for(const x of [-.2,.2]){cyl(x,.29,0,.09,.5,kind==='finn'?0x7098b5:c,figure);sphere(x,.07,-.06,.23,.15,.32,0x715568,figure);}
 for(const x of [-.38,.38]){cyl(x,.9,0,.09,.55,kind==='finn'?color.cream:c,figure);}
 for(const x of [-.13,.13])sphere(x,1.43,-.27,.07,.09,.05,0x493554,figure);
 if(kind==='finn'){for(const x of [-.22,.22])cyl(x,1.8,0,.1,.32,color.cream,figure);sphere(0,1,.29,.7,.66,.4,0x91b68c,figure);box(.43,.7,-.15,.09,.7,.11,0xe0c76d,figure);}
 if(kind==='princess'){mesh('cone',0,.55,0,.5,1,.5,0xe597bd,figure);cyl(0,1.77,0,.32,.16,0xe8c669,figure);for(const x of [-.22,0,.22])mesh('cone',x,1.96,0,.07,.3,.07,0xe8c669,figure);sphere(0,1.79,-.32,.12,.18,.08,0x8fcac8,figure);}
 if(kind==='zombie'){sphere(.25,1.55,-.1,.18,.18,.08,0x98af75,figure);box(0,1.24,-.27,.18,.07,.04,0x614367,figure);}
 return figure;
}
let finnModel=createFinn();finnCarrier.add(finnModel.root);let finn=finnModel.root;const dog=character(jake,'jake');
loadAnimatedFinn().then(model=>{finnCarrier.remove(finn);finnModel=model;finn=model.root;finnCarrier.add(finn);}).catch(e=>{console.error('Finn animation load failed',e);});
function activeHeight(){return activeCharacter==='finn'?1.8:({normal:1.35,small:.48,giant:3.3,stretch:4.1,bridge:.8,ladder:3.5}[jakeForm]);}
function activeRadius(){return activeCharacter==='finn'?.35:({normal:.35,small:.15,giant:.9,stretch:.35,bridge:.35,ladder:.35}[jakeForm]);}
function switchCharacter(force=false){
 if(!force&&(mode!=='game'||!grounded||attackCD>0)){notice('Troque de personagem ao tocar o chão e terminar o golpe.');return false;}
 keys.clear();jumpRequest=false;vy=0;
 if(activeCharacter==='finn'){
  actorRoot.attach(finnCarrier);finnModel.reset?.();const location=jake.position.clone(),rotation=jake.rotation.y;
  actorRoot.remove(jake);player.position.copy(location);player.rotation.y=rotation;player.add(jake);jake.position.set(0,0,0);jake.rotation.set(0,0,0);activeCharacter='jake';
  solids.push({role:'parkedFinn',min:finnCarrier.position.clone().add(new T.Vector3(-.32,0,-.32)),max:finnCarrier.position.clone().add(new T.Vector3(.32,1.6,.32))});
 }else{
  actorRoot.attach(jake);player.position.copy(finnCarrier.position);player.rotation.y=finnCarrier.rotation.y;player.add(finnCarrier);finnCarrier.position.set(0,0,0);finnCarrier.rotation.set(0,0,0);activeCharacter='finn';solids=solids.filter(s=>s.role!=='parkedFinn');finnModel.reset?.();
 }
 refreshAbilitySupports();renderPrevious.copy(player.position);syncHUD();return true;
}
function setJakeForm(form,force=false){
 if(!force&&activeCharacter!=='jake')return false;if(!force&&jakeForm===form)form='normal';if(!force&&form!==jakeForm&&activeCharacter==='jake'&&['bridge','ladder','giant'].includes(jakeForm)&&!finnHasStaticSupport()){notice('Finn precisa sair do apoio antes de Jake mudar de forma.');return false;}
 const height={normal:1.35,small:.48,giant:3.3,stretch:4.1,bridge:.8,ladder:3.5}[form],radius=form==='giant'?.9:form==='small'?.15:.35;
 if(!force&&(form==='bridge'||form==='ladder')&&!abilityZone(form)){notice('Use esta forma no ponto marcado para '+(form==='bridge'?'ponte':'escada')+'.');return false;}
 if(!force&&(solids.some(s=>overlap(s,player.position.x,player.position.z,player.position.y,radius,height))||(rooms[room]&&player.position.y+height>rooms[room].height))){notice('Não há espaço seguro para esta forma.');return false;}
 jakeForm=form;dog.position.set(0,0,0);dog.rotation.set(0,0,0);dog.scale.set(1,1,1);
 if(form==='small')dog.scale.setScalar(.33);if(form==='giant')dog.scale.setScalar(2.4);if(form==='stretch')dog.scale.set(1,3,1);
 if(form==='bridge'){player.rotation.y=0;dog.scale.set(1.4,.6,8);dog.position.z=-3;}
 if(form==='ladder'){player.rotation.y=0;dog.scale.set(1.5,3,4);dog.position.z=2.5;}
 refreshAbilitySupports();syncHUD();return true;
}
function finnHasStaticSupport(){const p=finnCarrier.position;return floors.some(f=>!f.ability&&Math.abs(p.x-f.x)<f.w/2+.2&&Math.abs(p.z-f.z)<f.d/2+.2&&Math.abs(p.y-f.y)<.3)||solids.some(s=>!['parkedFinn','jakeBody'].includes(s.role)&&p.x>s.min.x-.2&&p.x<s.max.x+.2&&p.z>s.min.z-.2&&p.z<s.max.z+.2&&Math.abs(p.y-s.max.y)<.3)||ramps.some(r=>!r.ability&&Math.abs(p.x-r.x)<r.w/2+.2&&p.z>=r.a&&p.z<=r.b);}
function abilityZone(form){return form==='ladder'?room==='outside'&&Math.abs(player.position.x-3)<2&&Math.abs(player.position.z)<2&&Math.abs(player.position.y-6.5)<.3:room==='dungeon'&&Math.abs(player.position.x)<2&&Math.abs(player.position.z-3)<2&&player.position.y>1;}
function refreshAbilitySupports(){abilityVisual?.removeFromParent();abilityVisual=new T.Group();world.add(abilityVisual);solids=solids.filter(s=>s.role!=='jakeBody');floors=floors.filter(f=>!f.ability);ramps=ramps.filter(r=>!r.ability);const pos=activeCharacter==='jake'?player.position:jake.position;
 if(jakeForm==='bridge'){if(activeCharacter==='finn')solids.push({role:'jakeBody',min:new T.Vector3(pos.x-1,pos.y,pos.z-6),max:new T.Vector3(pos.x+1,pos.y+.7,pos.z)});box(pos.x,pos.y+.6,pos.z-3,2,.2,6,0xe4b85a,abilityVisual);floors.push({ability:true,x:pos.x,z:pos.z-3,y:pos.y+.7,w:2,d:6});}
 if(jakeForm==='ladder'){for(let i=0;i<28;i++)box(pos.x,pos.y+(i+1)*.125-.0625,pos.z+i*(7-pos.z)/28,2.6,.125,(7-pos.z)/28+.01,0xe4b85a,abilityVisual);ramps.push({ability:true,x:pos.x,w:2.6,a:pos.z,b:7,height:3.5,base:pos.y,reverse:true});}
 if(jakeForm==='giant'){
  for(const [dy,dz,w] of [[1.25,2,1.2],[2.5,1,1.2],[3.25,0,1.6]]){box(pos.x,pos.y+dy-.1,pos.z+dz,w,.2,1.4,0xe4b85a,abilityVisual);floors.push({ability:true,x:pos.x,z:pos.z+dz,y:pos.y+dy,w,d:1.4});}
  if(activeCharacter==='finn')solids.push({role:'jakeBody',min:pos.clone().add(new T.Vector3(-.75,0,-.6)),max:pos.clone().add(new T.Vector3(.75,3.25,.6))});
 }

}
function solid(x,y,z,w,h,d,c=color.cream){const m=box(x,y,z,w,h,d,c);const s={min:new T.Vector3(x-w/2,y-h/2,z-d/2),max:new T.Vector3(x+w/2,y+h/2,z+d/2),mesh:m};solids.push(s);return s;}
function floor(x,y,z,w,d,c=color.cream){box(x,y-.15,z,w,.3,d,c);floors.push({x,z,y,w,d});}
function supportAt(x,z,currentY=Infinity){let y=-Infinity;for(const s of solids)if(x>s.min.x-.2&&x<s.max.x+.2&&z>s.min.z-.2&&z<s.max.z+.2&&s.max.y<=currentY+.18)y=Math.max(y,s.max.y);for(const f of floors)if(Math.abs(x-f.x)<f.w/2+.2&&Math.abs(z-f.z)<f.d/2+.2&&f.y<=currentY+.18)y=Math.max(y,f.y);for(const r of ramps)if(Math.abs(x-r.x)<r.w/2+.2&&z>=r.a&&z<=r.b){const h=r.base+(r.reverse?(z-r.a):(r.b-z))/(r.b-r.a)*r.height;if(h<=currentY+.25)y=Math.max(y,h);}return y;}
function overlap(s,x,z,y=player.position.y,r=.35,h=1.6){return x+r>s.min.x&&x-r<s.max.x&&z+r>s.min.z&&z-r<s.max.z&&y+h>s.min.y&&y+.12<s.max.y;}
function movement(pos,dx,dz,y=pos.y,r=.35,h=1.6){const nx=pos.x+dx;if(!solids.some(s=>overlap(s,nx,pos.z,y,r,h)))pos.x=nx;const nz=pos.z+dz;if(!solids.some(s=>overlap(s,pos.x,nz,y,r,h)))pos.z=nz;}
function visible(a,b,exclude){const dir=b.clone().sub(a);const length=dir.length();const ray=new T.Ray(a,dir.normalize());return !solids.some(s=>s!==exclude&&ray.intersectBox(new T.Box3(s.min,s.max),new T.Vector3())?.distanceTo(a)<length-.05);}
function interactable(title,event,x,y,z,kind='object',target=null){const node=new T.Group();node.position.set(x,y,z);world.add(node);if(kind==='npc')character(node,room==='laboratory'?'princess':'candy',room==='laboratory'?0xe597bd:color.blue);else if(kind==='mechanism'){box(0,.12,0,.3,.24,.2,color.blue,node);sphere(0,.3,0,.15,.15,.15,color.ink,node);}else{cyl(0,.3,0,.35,.6,event.startsWith('terminal')?[color.blue,color.cream,color.pink][+event.slice(-1)]:color.lilac,node);sphere(0,.8,0,.45,.5,.45,0xe9ca76,node);}const marker=mesh('ring',0,Math.min(2.3,(rooms[room]?.height||20)-y-.8),0,1,1,1,0xe9c86d,node);label(title,0,Math.min(2.9,(rooms[room]?.height||20)-y-.6),0,node);const point={title,event,pos:node.position,node,marker,kind,target};interactions.push(point);return point;}
function inwardFor(x,z,w,d){return Math.abs(x)/(w/2)>Math.abs(z)/(d/2)?new T.Vector3(-Math.sign(x),0,0):new T.Vector3(0,0,-Math.sign(z));}
function furniture(type,x,z,c=color.lilac){
 const info=rooms[room];if(info){const reserved=info.doors.map(door=>{const [dx,,dz]=door.position;return new T.Vector3(dx,0,dz).addScaledVector(inwardFor(dx,dz,info.width,info.depth),2.3);});
  const collides=(px,pz)=>reserved.some(p=>Math.abs(p.x-px)<1.75&&Math.abs(p.z-pz)<1.15)||(room==='maintenance'&&px>-5.6&&px< -1.7&&pz>-6&&pz<5);
  if(collides(x,z)){for(const [dx,dz] of [[0,2],[0,-2],[2,0],[-2,0],[0,4],[0,-4],[4,0],[-4,0]]){const nx=x+dx,nz=z+dz;if(Math.abs(nx)<info.width/2-1.4&&Math.abs(nz)<info.depth/2-1&& !collides(nx,nz)){x=nx;z=nz;break;}}}
 }
 const root=new T.Group();root.position.set(x,0,z);world.add(root);
 if(['table','desk','lab'].includes(type)){box(0,1.1,0,2.8,.2,1.4,c,root);for(const dx of [-1.1,1.1])for(const dz of [-.5,.5])cyl(dx,.5,dz,.07,1,color.cream,root);if(type!=='table'){box(0,1.6,-.35,.8,.65,.12,color.ink,root);box(0,1.6,-.27,.7,.5,.03,color.blue,root);box(0,1.23,.1,.6,.05,.3,color.cream,root);for(let i=0;i<4;i++){cyl(-.95+i*.17,1.3,.2,.055,.25,[color.blue,color.pink,color.cream][i%3],root);}}}
 else if(type==='bed'){box(0,.5,0,2,.5,3,color.cream,root);box(0,.87,.2,1.9,.3,2.2,c,root);sphere(0,1,-1,1.6,.25,.5,color.cream,root);box(0,1.3,-1.5,2,.9,.15,c,root);}
 else if(type==='chair'){box(0,.5,0,.85,.14,.8,c,root);box(0,1.05,.35,.9,1,.15,c,root);for(const dx of [-.3,.3])for(const dz of [-.3,.3])cyl(dx,.22,dz,.05,.44,color.cream,root);}
 else if(type==='shelf'){box(0,1.6,0,2.5,3.2,.8,c,root);for(let j=0;j<3;j++){box(0,.4+j*.9,-.48,2.2,.1,.15,color.cream,root);for(let i=0;i<6;i++)box(-.9+i*.35,.68+j*.9,-.43,.25,.5,.15,[color.pink,color.blue,color.cream][i%3],root);}}
 else if(type==='plant'){cyl(0,.3,0,.35,.6,color.lilac,root);cyl(0,1,0,.08,1,color.cream,root);for(const dx of [-.4,0,.4])sphere(dx,1.6,0,.8,1,.8,c,root);}
 else if(type==='bath'){box(0,.3,0,2.3,.6,1.2,color.cream,root);box(0,.61,0,1.9,.03,.8,color.blue,root);cyl(.8,.9,0,.05,.6,color.lilac,root);}
 else if(type==='amber'){cyl(0,.35,0,2,.7,color.cream,root);mesh('cone',0,2,0,1.5,3.2,1.5,0xe8bd70,root);}
 // Simplified furniture collision preserves clear central aisles.
 if(type!=='plant')solids.push({min:new T.Vector3(x-1.3,0,z-.75),max:new T.Vector3(x+1.3,1.2,z+.75)});
 return root;
}
function decorate(id,w,d){
 const pink=color.pink,blue=color.blue;
 if(id==='main_hall'||id==='throne'){box(0,.025,0,3,.04,d-4,0xbd7296);for(const x of [-5,5])for(const z of [-6,3]){furniture('table',x,z,pink);furniture('chair',x,z+1.4);}if(id==='throne'){floor(0,.5,-d/2+4,5,4);furniture('chair',0,-d/2+4,pink);label('Trono de Jujuba',0,3,-d/2+4);}for(const x of [-w/2+1.3,w/2-1.3])for(const z of [-d/3,0,d/3]){cyl(x,2.6,z,.25,5.2,color.cream);sphere(x,5.3,z,.8,.5,.8,pink);}}
 else if(id==='laboratory'){for(const x of [-5,5])for(const z of [-6,0,6])furniture('lab',x,z,blue);furniture('amber',0,-8,blue);}
 else if(id==='bedroom'||id==='guest'){furniture('bed',-3,-4,pink);furniture('desk',3,-4);furniture('shelf',-4,3,pink);furniture('plant',4,3,pink);}
 else if(id==='bathroom'){furniture('bath',-2,-3);furniture('desk',3,-3,color.cream);sphere(3,2.5,-3,.8,1,.08,blue);}
 else if(id==='hospital'||id==='dungeon'){for(const x of [-w/3,w/3])for(const z of (id==='dungeon'?[-7,0,7]:[-5,3])){furniture('bed',x,z,id==='hospital'?blue:color.lilac);if(id==='dungeon'){for(let i=0;i<7;i++)cyl(x+(x>0?-2:2),1.7,z-1.6+i*.5,.045,3.4,color.ink);}}}
 else if(id==='tree'||id==='amber'){for(const x of [-5,5])for(const z of [-5,3])furniture('plant',x,z,0x966950);if(id==='amber')furniture('amber',0,-2);}
 else if(id==='kitchen'){for(const x of [-4,0,4]){furniture('desk',x,-6,color.cream);cyl(x,1.4,-6,.3,.3,color.ink);}furniture('table',3,1);furniture('shelf',-5,-1);}
 else if(id==='library'||id==='archive'||id==='pantry'){for(const x of [-w/2+2,w/2-2])for(const z of [-4,2])furniture('shelf',x,z);furniture('table',0,-4);}
 else if(id==='nursery'){furniture('bed',-3,-3,pink);furniture('plant',3,-3,pink);for(let i=0;i<5;i++)sphere(1+i*.5,.2,1,.4,.4,.4,[pink,blue,color.lilac][i%3]);}
 else if(id==='secret'){for(const x of [-1.2,3])for(const z of [-3,2]){cyl(x,.8,z,.65,1.6,color.lilac);sphere(x,1.9,z,.7,.9,.7,blue);}}
 else if(id!=='stairs'){furniture('desk',-w/3,-d/3);furniture('chair',-w/3,-d/3+1.3);furniture('plant',w/3,-d/3);furniture('table',w/3,d/4);}
}

function batchStatic(){
 world.updateMatrixWorld(true);const batches=new Map();
 for(const m of staticMeshes){const key=m.geometry.uuid+':'+m.material.uuid;if(!batches.has(key))batches.set(key,[]);batches.get(key).push(m);}
 for(const list of batches.values()){if(list.length<2)continue;const batch=new T.InstancedMesh(list[0].geometry,list[0].material,list.length);batch.castShadow=true;batch.receiveShadow=true;list.forEach((m,i)=>{batch.setMatrixAt(i,m.matrixWorld);m.removeFromParent();});batch.instanceMatrix.needsUpdate=true;world.add(batch);}
 staticMeshes=[];
}
function buildRoom(id,from='city'){
 const info=rooms[id],w=info.width,d=info.depth,h=info.height;floor(0,0,0,w,d,color.cream);
 for(const x of [-w/2,w/2])solid(x,h/2,0,.4,h,d,info.color);
 for(const z of [-d/2,d/2])solid(0,h/2,z,w,h,.4,info.color);
 // The ceiling exists, while camera height is constrained to stay beneath it.
 box(0,h+.1,0,w,.2,d,color.cream);
 for(let x=-w/2+1;x<w/2;x+=2)for(let z=-d/2+1;z<d/2;z+=2)box(x,.012,z,1.97,.02,1.97,(Math.round(x+z)%4===0)?color.cream:0xf0dee7);
 for(const x of [-w*.28,w*.28]){box(x,3.6,-d/2+.23,1.7,2.3,.04,color.blue);cyl(x,4.7,-d/2+.23,.85,.05,color.cream).rotation.x=Math.PI/2;box(x,3.6,-d/2+.28,.08,2.3,.06,color.cream);}
 decorate(id,w,d);
 if(id==='stairs'){
  floor(0,2.8,-9,w-1,4,color.lilac);floor(0,5.6,9,w-1,4,color.lilac);
  for(const [x,reverse,base] of [[-2,false,0],[2,true,2.8]]){
   ramps.push({x,w:2.6,a:-7,b:7,height:2.8,base,reverse});
   for(let i=0;i<28;i++){const z=reverse?-7+i*.5:7-i*.5,sy=base+(i+1)*.1;box(x,sy/2,z,2.6,sy,.5,color.cream);}
   floor(x,base+2.8,reverse?8:-8,3,2,color.lilac);
  }
 }
 for(const door of info.doors){
  const [x,y,z]=door.position;const node=new T.Group();node.position.set(x,y,z);world.add(node);
  const inward=inwardFor(x,z,w,d);node.rotation.y=Math.atan2(inward.x,inward.z);
  box(0,1.5,0,1.8,3,.18,door.target==='secret'?0xaf8bb6:color.lilac,node);
  for(const dx of [-1.05,1.05])cyl(dx,1.6,0,.11,3.2,color.cream,node);
  mesh('ring',0,y>0?2.6:3,0,y>0?1.2:2.4,y>0?1.2:2.4,1,color.cream,node);sphere(.6,1.4,.2,.16,.16,.16,0xe1c270,node);
  const title=door.target==='city'?'Saída do castelo':rooms[door.target].title;
  doorSign(door.target==='secret'?'Estante antiga':title,node);
  interactions.push({kind:'door',title,target:door.target,pos:new T.Vector3(x,y+1,z),inward});
 }
 const arrival=interactions.find(p=>p.target===from)||interactions.find(p=>p.kind==='door');
 if(arrival)player.position.copy(arrival.pos).addScaledVector(arrival.inward,2.3).add(new T.Vector3(0,-1,0));else player.position.set(0,.05,5);
}
function lightCastle(){const g=new T.Group();world.add(g);g.position.set(0,0,-65);box(0,9,0,18,18,14,color.pink,g);for(const x of [-13,13])for(const z of [-5,5]){cyl(x,10,z,3,20,color.cream,g);mesh('cone',x,23,z,4,7,4,color.lilac,g);}cyl(0,17,0,6,8,color.pink,g);mesh('cone',0,24,0,7,7,7,color.lilac,g);label('Castelo · representação leve',0,32,0,g);return g;}
function loadCastle(){if(lite){modelState='Modo leve';return Promise.resolve(null);}if(modelPromise)return modelPromise;modelState='Carregando castelo original…';modelPromise=new Promise(resolve=>{
 if(location.protocol==='file:'){modelState='Modo leve · arquivo local';return resolve(null);}
 new GLTFLoader().load('./assets/castle.glb',gltf=>{
  originalCastle=gltf.scene;originalCastle.scale.setScalar(100);originalCastle.position.set(0,-1,-70);originalCastle.traverse(o=>{if(o.isMesh){o.receiveShadow=true;for(const m of Array.isArray(o.material)?o.material:[o.material]){if(m){m.metalness=0;if(m.emissive)m.emissive.setHex(0);}}}});modelState='Castelo original · Kenny Park';resolve(originalCastle);
 },undefined,()=>{modelState='Modo leve · modelo original indisponível';resolve(null);});});return modelPromise;}
function buildOutside(){
 floor(0,0,0,46,64,color.pink);floor(0,8,-22,4,10);
 solid(-2.5,9,-22,1,6,10,color.pink);solid(2.5,9,-22,1,6,10,color.pink);solid(0,12.5,-18,4,1,1,color.cream);label('Janela de serviço · salte',0,11,-18);
 for(const [x,y,z,w,d] of [[0,6.5,-13,6,6],[1,6.5,-6,6,5],[3,6.5,0,6,5],[3,5,6,7,5],[3,3.5,11,8,5],[3,2,16,8,5],[3,.5,21,8,5]]){floor(x,y,z,w,d,color.lilac);solid(x-w/2+.15,y+.65,z,.25,1.3,d,color.cream);for(const dx of [-w/2+.4,w/2-.4])cyl(x+dx,y/2,z,.2,y,color.cream);}
 cyl(3,8,0,.07,3,color.cream);box(3.6,9,0,1.2,.7,.06,color.pink);label('Checkpoint dos telhados',3,10,0);
 for(const x of [-17,17])for(const z of [-12,0,12,24]){cyl(x,1.5,z,.25,3,0xb68d9e);sphere(x,3.5,z,3,3,3,color.lilac);for(const dx of [-2,2])sphere(x+dx,.25,z,.4,.5,.4,0xe998bf);}
 cyl(-8,.4,16,2.4,.8,color.cream);cyl(-8,.82,16,2,.03,color.blue);cyl(-8,1.25,16,.3,.8,color.lilac);sphere(-8,1.7,16,.45,.3,.45,color.blue);
 for(const x of [-14,14]){solid(x,2.5,27,7,5,7,color.cream);mesh('cone',x,6.4,27,5,3,5,color.pink);box(x,1.4,23.45,1.5,2.8,.1,color.lilac);}
 for(const x of [-13,12]){box(x,.7,12,3,.2,1,color.cream);box(x,1.2,12.5,3,1,.2,color.lilac);for(const dx of [-1,1])cyl(x+dx,.3,12,.08,.6,color.cream);}
 box(10,1,18,4,.25,2,color.cream);for(const x of [8,12])cyl(x,1.8,18,.12,3.6,color.lilac);box(10,3.7,18,5,.2,3,color.pink);
 const previousStatic=buildingStatic;buildingStatic=false;const fallback=lightCastle();fallbackCastle=fallback;buildingStatic=previousStatic;loadCastle().then(model=>{if(room==='outside'&&model){world.remove(fallback);world.add(model);}});
 player.position.set(0,8,-24);yaw=Math.PI;
}
function changeRoom(id,from=room){if(activeCharacter==='jake')switchCharacter(true);setJakeForm('normal',true);keys.clear();jumpRequest=false;world.traverse(o=>{if(o.isInstancedMesh)o.dispose();});scene.remove(world);world=new T.Group();scene.add(world);solids=[];floors=[];ramps=[];interactions=[];zombies=[];roomLabels=[];room=id;vy=0;grounded=false;attackCD=0;pendingStrike=null;finnModel.reset?.();
 buildingStatic=true;staticMeshes=[];
 if(id==='outside')buildOutside();else buildRoom(id,from);
 buildingStatic=false;batchStatic();
 buildChallenges(id);buildEvents();renderPrevious.copy(player.position);jake.position.copy(player.position).add(new T.Vector3(1,0,1));syncHUD();}
function expected(){return progress.current?.[0]||'';}
function buildEvents(){
 const e=expected(),meta=details[e];
 if(meta&&meta.room===room&&!meta.physical&&!meta.combat){
  if(meta.puzzle==='colors'){for(let i=0;i<3;i++)interactable(['Terminal azul','Terminal creme','Terminal rosa'][i],'terminal'+i,-2+i*2,0,4);}
  else campaignPoint(meta);
 }
 if(room==='main_hall'&&e==='hall_kill')spawnWave(3-progress.n,0,'hall_kill');
 if(room==='laboratory'&&e==='lab_kill')spawnWave(2-progress.n,0,'lab_kill');
 if(room==='main_hall'&&e==='defense_kill')spawnWave(progress.n<3?3-progress.n:6-progress.n,progress.n<3?1:2,'defense_kill');
 if(room==='outside'&&e==='court_kill')spawnWave(3-progress.n,1,'court_kill',13);
 for(const optional of sideActivities)if(optional.room===room&&!sideDone.has(optional.event))campaignPoint({...optional,optional:true});
 if(room==='laboratory'&&(!meta||meta.room!=='laboratory'||!meta.npc))interactable('Princesa Jujuba','flavor',0,0,-4,'npc');
 if(room==='laboratory'&&progress.done.includes('window')&&progress.q!==4)campaignPoint({event:'window_return',text:'Janela de serviço aberta',pos:[0,0,7]});
 if(room==='outside'&&progress.done.includes('window')&&e!=='gate')campaignPoint({event:'service_return',text:'Entrada de serviço do laboratório',pos:[-18,0,20]});
}
function campaignPoint(meta){const [x,y,z]=meta.pos;const p=interactable(meta.text,meta.event,x,y,z,meta.npc?'npc':meta.mechanism?'mechanism':'object');p.meta=meta;return p;}
function optionalCount(){return (sideDone.has('side_rescue')?1:0)+(sideDone.has('side_docs')?1:0)+(['side_secret1','side_secret2','side_secret3'].every(e=>sideDone.has(e))?1:0)+(sideDone.has('side_garden')?1:0)+(sideDone.has('side_key')?1:0);}
function canUse(meta){
 if(meta.character&&activeCharacter!==meta.character){notice('Este objetivo precisa de '+(meta.character==='finn'?'Finn':'Jake')+'. Use Tab.');return false;}
 if(meta.form&&jakeForm!==meta.form){notice((controlNames[meta.form]||'Jake no tamanho normal')+' é necessário para este objetivo.');return false;}
 if(meta.supportForm&&jakeForm!==meta.supportForm){notice('Jake precisa manter o apoio preparado.');return false;}
 if(meta.minY&&player.position.y<meta.minY){notice('Alcance a plataforma usando Jake.');return false;}
 if(meta.together&&jake.position.distanceTo(player.position)>3){notice('Aguarde Jake alcançar a sacada.');return false;}
 if(meta.cooperative&&(activeCharacter!=='jake'||finnCarrier.position.distanceTo(new T.Vector3(-2,0,0))>.85||player.position.distanceTo(new T.Vector3(2,0,0))>.85)){notice('Finn deve ficar na placa rosa; Jake, na azul.');return false;}
 return true;
}
function completeCampaign(meta){
 if(meta.optional){sideDone.add(meta.event);save();syncHUD();notice('Atividade opcional concluída · selo de ajuda recebido');}
 else if(!record(meta.event))return false;
 if(meta.event==='window'){changeRoom('outside');scenePreview={position:new T.Vector3(14,15,-13),target:new T.Vector3(2,7,-1)};checkpoint='outside';roof=false;save();}
 else if(meta.event==='factory_exit'){changeRoom('factory_approach');checkpoint=room;save();}
 else clearEvents();
 dialogue(...(story[meta.event]||lines[meta.event]||[meta.optional?'Ajuda concluída':'Objetivo concluído',meta.optional?'Obrigado! Você recebeu um selo de ajuda.':'Continue a investigação.']));return true;
}
function campaignInteraction(point){const meta=point.meta;
 if(!meta.optional&&meta.event!==expected()){notice('Resolva o objetivo atual.');return;}
 if(!canUse(meta))return;
 optionalBusy=!!meta.optional;if(meta.puzzle){showPuzzle(meta);return;}completeCampaign(meta);
}
function showPuzzle(meta){
 if(meta.puzzle==='dials'||meta.puzzle==='garden'){
  let values=[0,0,0];const target=meta.puzzle==='dials'?[2,0,1]:[1,2,0];
  const draw=()=>openPanel(meta.text,'Ajuste os seletores para '+target.join(' · ')+'.',values.map((v,i)=>['Seletor '+(i+1)+': '+v,()=>{values[i]=(values[i]+1)%3;draw();}]).concat([['Ativar',()=>{if(values.every((v,i)=>v===target[i]))completeCampaign(meta);else{$('dialogue').textContent='Os seletores ainda não estão alinhados. '+target.join(' · ');}}],['Voltar',resume]]));draw();return;
 }
 const sequence=meta.puzzle==='riddle'?['Coração','Estrela']:meta.puzzle==='plants'?['Azul / rosa']:['Estrela','Nuvem','Coração'];let index=0;
 const choices=meta.puzzle==='plants'?['Rosa / amarelo','Azul / rosa','Lilás / azul']:['Estrela','Nuvem','Coração'];
 const draw=()=>openPanel(meta.text,(meta.puzzle==='plants'?'Escolha a planta da ficha.':'Escolha os símbolos em ordem.')+' '+index+'/'+sequence.length,choices.map(c=>[c,()=>{if(c!==sequence[index]){index=0;draw();$('dialogue').textContent='Sequência incorreta. Recomece pela pista.';return;}index++;if(index===sequence.length)completeCampaign(meta);else draw();}]).concat([['Voltar',resume]]));draw();
}
function buildChallenges(id){
 if(id==='outside'){
  floor(3,10,9,4,2,color.lilac);floor(3,10,7.5,4,1.2,color.cream);for(const x of [1,5])cyl(x,5,9,.15,10,color.cream);cyl(3,12,9,.1,4,color.ink);sphere(3,14,9,.5,.5,.5,color.blue);label('Torre do transmissor',3,14.8,9);
 }
 if(id==='dungeon'){
  floor(0,1.6,4.5,3,3,color.cream);floor(0,2.3,-4.5,3,3,color.lilac);hintSign('Ponte elástica · Jake B',-4.4,1.7,4.3);sphere(0,2.8,-4,.3,.5,.3,color.blue);
 }
 if(id==='maintenance'||id==='secret'){
  solid(-4,.9,0,1.8,.6,8,color.lilac);solid(-5.05,.4,0,.25,.8,8,color.cream);solid(-2.95,.4,0,.25,.8,8,color.cream);hintSign('Duto · Jake pequeno C',-4,1.65,4.15);
 }
 if(id==='secret'){box(-2,.025,0,1.4,.05,1.4,color.pink);box(2,.025,0,1.4,.05,1.4,color.blue);}
 if(id==='greenhouse'){
  floor(2,3.2,-2,3,2,color.cream);for(const x of [-5,-3,-1]){cyl(x,.3,-2,.5,.6,color.lilac);cyl(x,1,-2,.08,1.4,color.green||0x91b68c);sphere(x,1.8,-2,.8,.8,.8,[color.pink,color.blue,color.lilac][(x+5)/2]);sphere(x,1.8,-2.4,.3,.3,.3,[0xf9e5a3,color.pink,color.blue][(x+5)/2]);}box(2,.025,0,2.2,.05,2.2,0xe9c86d);hintSign('Apoio elástico · Jake gigante F',-4.7,2.8,-7.9);
 }
 if(id==='guest')hintSign('Botão elevado · Jake Q',-3,Math.min(3.7,rooms[id].height-.6),-4.6);
 if(id==='factory_approach'){for(const x of [-5,5])for(const z of [-6,0,6]){cyl(x,1.5,z,.2,3,color.cream);sphere(x,3,z,2,2,2,color.pink);}label('Fábrica de Doces Abandonada · próxima área',0,4,-8);box(0,.025,0,4,.05,18,color.cream);}
}
function spawnWave(n,variant,event,z=-2){for(let i=0;i<n;i++){
 const node=new T.Group();node.position.set(-2+i*2,0,z);world.add(node);const fig=character(node,'zombie',[0x98bb90,0xc0a0ce,0xd7bb8d][variant]);if(variant===2)fig.scale.set(1.15,1.1,1.15);
 const enemy={node,fig,variant,event,health:variant===2?5:2,origin:node.position.clone(),cooldown:0,lost:0,state:'patrol',id:++enemySerial,path:[],navTime:0,hurt:0};zombies.push(enemy);
 }}
function notice(text){$('notice').textContent=displayText(text);$('notice').style.display='block';noticeUntil=clock+3;}
function record(event){if(!progress.accept(event))return false;checkpoint=room;save();syncHUD();notice('Objetivo concluído · próximo passo disponível');return true;}
function clearEvents(){for(const i of interactions.filter(p=>p.kind!=='door'))world.remove(i.node);interactions=interactions.filter(p=>p.kind==='door');for(const z of zombies)world.remove(z.node);zombies=[];roomLabels=roomLabels.filter(s=>{let n=s;while(n&&n!==world)n=n.parent;return n===world;});buildEvents();}
function audioCue(freq=500,duration=.12){if(!audio)return;const osc=audio.createOscillator(),gain=audio.createGain();osc.type='triangle';osc.frequency.value=freq;gain.gain.setValueAtTime(.04,audio.currentTime);gain.gain.exponentialRampToValueAtTime(.0001,audio.currentTime+duration);osc.connect(gain).connect(audio.destination);osc.start();osc.stop(audio.currentTime+duration);}
function openPanel(title,text,buttons){mode='dialogue';keys.clear();$('modal').classList.remove('hidden');$('modal').classList.toggle('route-preview',!!scenePreview);$('hud').classList.add('hidden');$('prompt').style.display='none';$('title').textContent=title;$('dialogue').textContent=text;$('actions').replaceChildren();for(const [name,fn] of buttons){const b=document.createElement('button');b.textContent=name;b.onclick=fn;$('actions').append(b);} $('actions').firstChild?.focus();}
function dialogue(title,text){openPanel(title,displayText(text),[['Continuar',resume]]);}
function resume(){scenePreview=null;$('modal').classList.remove('route-preview');optionalBusy=false;mode='game';$('modal').classList.add('hidden');$('hud').classList.remove('hidden');keys.clear();}
const lines={princess:['Princesa Jujuba','Jujuba: Um catalisador do experimento 17 sumiu. Alguns cidadãos adoeceram. Preciso descobrir o que aconteceu.\nFinn: Pode contar com a gente!\nJake: Mistério e doces… espero que tenha lanche.\n\nUm alarme interrompe a conversa.'],alarm:['Alarme do castelo','O painel informa uma intrusão nos portões.\nJake: Isso não parece o aviso do jantar.'],guard:['Guarda','Doces contaminados invadiram o castelo! Avise a princesa antes de enfrentá-los.'],report:['Princesa Jujuba','Protejam o grande salão e a entrada do laboratório! Não deixem o catalisador cair nas mãos deles.'],window:['Finn e Jake','Finn: O corredor foi interditado! A janela de serviço leva às sacadas.\nJake: Estou contigo. Você cuida dos saltos!\n\nDepois desta fala, avance até a abertura e use Espaço para saltar.'],rescue:['Cidadão','Obrigado! A chave do portão está na barraca. Atrás dele há uma entrada de serviço para o laboratório.'],key:['Chave recolhida','Você encontrou a chave do portão lateral.'],gate:['Passagem aberta','Você retornou ao laboratório pelo acesso de serviço.'],document:['Registro 17','Lote enviado à Fábrica de Doces Abandonada. Sequência dos estabilizadores: AZUL → CREME → ROSA.'],sample:['Amostra','A substância é a mesma do lote da fábrica. Alguém alterou a fórmula.'],puzzle:['Circuito estabilizado','Os registros revelam uma remessa não autorizada da fábrica.'],revelation:['Princesa Jujuba','Isto não foi só um acidente. A fonte da contaminação pode estar na fábrica. Primeiro, precisamos conter a última invasão!'],debrief:['Guarda','As duas ondas foram contidas. O castelo está seguro por enquanto. Leve as pistas à princesa.'],factory:['Primeira parte concluída','Jujuba: Finn, Jake, sigam as pistas até a Fábrica de Doces Abandonada!\nFinn: Vamos acabar com esse surto.\nJake: E depois… lanche.\n\nVocê concluiu esta área. A fábrica será a próxima parte da versão para navegador.']};
function interactionVisible(a,b){const d=b.clone().sub(a),length=d.length(),ray=new T.Ray(a,d.normalize());return !solids.some(s=>s.role!=='parkedFinn'&&ray.intersectBox(new T.Box3(s.min,s.max),new T.Vector3())?.distanceTo(a)<length-.05);}
function candidate(){const a=player.position.clone().add(new T.Vector3(0,activeCharacter==='finn'?1:activeHeight()*.7,0));const points=interactions.filter(p=>a.distanceTo(p.pos.clone().add(new T.Vector3(0,['door','mechanism'].includes(p.kind)?0:1,0)))<2.4);points.sort((a,b)=>player.position.distanceTo(a.pos)-player.position.distanceTo(b.pos));return points.find(p=>interactionVisible(a,p.pos.clone().add(new T.Vector3(0,['door','mechanism'].includes(p.kind)?0:1,0))));}
function interact(){if(mode!=='game')return;if(!grounded){notice('Pouse antes de interagir.');return;}const p=candidate();if(!p)return;
 if(p.kind==='door'){if(activeCharacter==='jake'){notice('Volte para Finn para atravessar a porta com a dupla.');return;}
  if(p.target==='city'){if(!progress.done.includes('window')){notice('O castelo precisa de você. Siga o objetivo atual.');return;}changeRoom('outside');player.position.set(-18,0,22);return;}
  if(room==='laboratory'&&progress.q===4){notice('Corredor interditado. Use a janela de serviço.');return;}
  changeRoom(p.target);if(activeCharacter==='finn')finnModel.interact?.();return;
 }
 if(activeCharacter==='finn')finnModel.interact?.();if(p.meta){campaignInteraction(p);return;}if(p.event==='window_return'){if(activeCharacter!=='finn'){notice('Volte para Finn antes de atravessar.');return;}changeRoom('outside');return;}if(p.event==='service_return'){if(activeCharacter!=='finn'){notice('Volte para Finn antes de atravessar.');return;}changeRoom('laboratory','kitchen');return;}let event=p.event,e=expected();if(event==='gate'&&progress.done.includes('gate')){changeRoom('laboratory','kitchen');return;}if(event==='princess')event=['princess','report','revelation','factory'].includes(e)?e:event;if(event==='guard'&&e==='debrief')event=e;
 if(event==='flavor'){dialogue(rooms[room].title,'Um recado de evacuação e marcas pegajosas indicam que alguém passou aqui. Jake: Vamos conferir as pistas antes de sair caçando migalhas!');return;}
 if(event.startsWith('terminal')){if(e!=='puzzle'){notice('Leia os registros primeiro.');return;}const n=+event.slice(-1);if(n!==puzzle){puzzle=0;notice('Sequência reiniciada: azul → creme → rosa.');audioCue(180);return;}puzzle++;audioCue(550+puzzle*100);if(puzzle<3){notice(`Estabilizador ${puzzle}/3 ligado`);return;}puzzle=0;event='puzzle';}
 if(!record(event)){notice('Resolva o objetivo atual antes de continuar.');return;}
 if(event==='window'){changeRoom('outside');scenePreview={position:new T.Vector3(14,15,-13),target:new T.Vector3(2,7,-1)};checkpoint='outside';roof=false;save();}
 else if(event==='gate'){changeRoom('laboratory','kitchen');checkpoint='laboratory';save();}
 else clearEvents();
 dialogue(...(story[event]||lines[event]||['Objetivo atualizado','Continue a investigação.']));
}
function attack(style='sword'){if(mode!=='game'||attackCD>0)return 0;attackCD=.42;pendingStrike={time:.13,style};finnModel.startAttack?.(style);return 0;}
function strike(style){let hits=0;
 for(const e of [...zombies]){const offset=e.node.position.clone().sub(player.position);const distance=offset.length();if(distance>(style==='punch'?1.8:2.8)||distance<.001||facing.dot(offset.clone().normalize())<.15||!visible(player.position.clone().add(new T.Vector3(0,.8,0)),e.node.position.clone().add(new T.Vector3(0,.8,0))))continue;
  e.health--;e.hurt=.18;hits++;audioCue(150,.08);e.fig.scale.multiplyScalar(.92);
  if(e.health<=0){world.remove(e.node);zombies=zombies.filter(z=>z!==e);record(e.event);if(e.event==='defense_kill'&&expected()==='defense_kill'&&progress.n===3){spawnWave(3,2,e.event);notice('Segunda onda · resistentes chegando!');}else if(!zombies.length)clearEvents();}
 }
 return hits;
}
function navPath(start,target){const cell=1,radius=rooms[room]?Math.max(rooms[room].width,rooms[room].depth)/2:23;const key=(x,z)=>`${x},${z}`,s=[Math.round(start.x),Math.round(start.z)],goal=[Math.round(target.x),Math.round(target.z)];const list=[s],prev=new Map([[key(...s),null]]);let end;
 for(let i=0;i<450&&list.length;i++){list.sort((a,b)=>(Math.abs(a[0]-goal[0])+Math.abs(a[1]-goal[1]))-(Math.abs(b[0]-goal[0])+Math.abs(b[1]-goal[1])));const at=list.shift();if(Math.abs(at[0]-goal[0])+Math.abs(at[1]-goal[1])<1.5){end=at;break;}for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]){const n=[at[0]+dx,at[1]+dz],k=key(...n);if(prev.has(k)||Math.abs(n[0])>radius||Math.abs(n[1])>radius+9||supportAt(n[0],n[1],.1)===-Infinity||solids.some(b=>overlap(b,n[0],n[1],0,.55)))continue;prev.set(k,at);list.push(n);}}
 if(!end)return [];const path=[];while(end){path.unshift(new T.Vector3(end[0],0,end[1]));end=prev.get(key(...end));}return path.slice(1);
}
function step(dt){clock+=dt;attackCD=Math.max(0,attackCD-dt);hurtCD=Math.max(0,hurtCD-dt);if(pendingStrike!==null){pendingStrike.time-=dt;if(pendingStrike.time<=0){const style=pendingStrike.style;pendingStrike=null;strike(style);}}
 const dx=(keys.has(bindings.right)||keys.has('ArrowRight')?1:0)-(keys.has(bindings.left)||keys.has('ArrowLeft')?1:0),dz=(keys.has(bindings.back)||keys.has('ArrowDown')?1:0)-(keys.has(bindings.forward)||keys.has('ArrowUp')?1:0);const dir=new T.Vector3(dx,0,dz);const running=keys.has(bindings.run)||keys.has('ShiftRight');const beforeMove=player.position.clone();if(!finnModel.update)finnModel.animate(walkTime,activeCharacter==='finn'&&dir.lengthSq()>0,activeCharacter==='finn'&&attackCD>.25);if(activeCharacter==='jake'&&['bridge','ladder'].includes(jakeForm))dir.set(0,0,0);if(dir.lengthSq()){dir.normalize().applyAxisAngle(new T.Vector3(0,1,0),yaw);facing.copy(dir);player.rotation.y=Math.atan2(-dir.x,-dir.z);walkTime+=dt*10;if(!finnModel.update)finn.position.y=Math.sin(walkTime)*.035;}
 const speed=keys.has(bindings.run)||keys.has('ShiftRight')?10:7;const mobile=!['bridge','ladder'].includes(activeCharacter==='jake'?jakeForm:'normal')&&!(activeCharacter==='jake'&&jakeForm==='giant'&&!finnHasStaticSupport());movement(player.position,mobile?dir.x*speed*dt:0,mobile?dir.z*speed*dt:0,player.position.y,activeRadius(),activeHeight());
 if(jumpRequest&&grounded&&mobile){vy=9;grounded=false;audioCue(660,.06);}jumpRequest=false;
 const oldY=player.position.y;vy-=24*dt;player.position.y+=vy*dt;
 if(vy>0)for(const s of solids)if(player.position.x+.3>s.min.x&&player.position.x-.3<s.max.x&&player.position.z+.3>s.min.z&&player.position.z-.3<s.max.z&&oldY+activeHeight()<=s.min.y&&player.position.y+activeHeight()>s.min.y){player.position.y=s.min.y-activeHeight();vy=0;}
 const support=supportAt(player.position.x,player.position.z,Math.max(oldY,player.position.y));if(vy<=0&&support!==-Infinity&&player.position.y<=support+.07){player.position.y=support;vy=0;grounded=true;}else grounded=false;
 if(player.position.y< -8||(room==='outside'&&(Math.abs(player.position.x)>23||Math.abs(player.position.z)>32))){recover(false);notice('Retorno ao ponto seguro.');}
 const horizontal=Math.hypot(player.position.x-beforeMove.x,player.position.z-beforeMove.z);const travelled=Math.hypot(horizontal,grounded&&horizontal>.01?player.position.y-beforeMove.y:0)/dt;finnModel.update?.(dt,{speed:activeCharacter==='finn'?travelled:0,running,grounded:activeCharacter==='finn'?grounded:true,vy:activeCharacter==='finn'?vy:0,active:activeCharacter==='finn'});
 if(room==='outside'){
  if(expected()==='landing'&&grounded&&player.position.z>-16&&player.position.z<3&&Math.abs(player.position.y-6.5)<.15){if(activeCharacter==='finn')record('landing');clearEvents();}
  if(expected()==='roof'&&grounded&&player.position.z>=-.6&&player.position.z<2.5&&Math.abs(player.position.x-3)<2.5&&Math.abs(player.position.y-6.5)<.15){roof=true;if(activeCharacter==='finn')record('roof');clearEvents();save();}
 }
 if(activeCharacter==='finn'&&jakeForm==='normal'){const desired=player.position.clone().add(new T.Vector3(1.3,0,1.5));if(jake.position.distanceTo(desired)>10)jake.position.copy(desired);else jake.position.lerp(desired,1-Math.exp(-dt*4));jake.position.y=player.position.y;jake.rotation.y=player.rotation.y;}
 for(const e of zombies){e.cooldown-=dt;e.hurt=Math.max(0,e.hurt-dt);if(e.hurt>0)continue;e.fig.scale.lerp(new T.Vector3().setScalar(e.variant===2?1.1:1),.2);
  const diff=player.position.clone().sub(e.node.position),dist=diff.length(),canSee=Math.abs(diff.y)<2&&visible(e.node.position.clone().add(new T.Vector3(0,1,0)),player.position.clone().add(new T.Vector3(0,1,0)));
  e.lost=canSee?0:e.lost+dt;if(dist<12&&canSee)e.state='chase';if(dist>18||e.lost>4)e.state='return';
  if(dist<1.6&&canSee&&e.cooldown<=0){e.state='attack';e.cooldown=1.5;if(hurtCD<=0){hp--;hurtCD=1.2;if(activeCharacter==='finn')finnModel.hit?.();audioCue(100,.15);syncHUD();if(hp<=0){mode='defeat';openPanel('Finn foi derrotado','Retorne ao checkpoint. Seu progresso foi preservado.',[['Voltar ao checkpoint',()=>{recover(true);resume();}],['Menu',menu]]);mode='defeat';return;}}}
  else{let goal=e.state==='chase'?player.position:e.origin;if(e.state!=='chase'&&e.node.position.distanceTo(e.origin)<.5){e.state='patrol';goal=e.origin.clone().add(new T.Vector3(Math.sin(clock*.7+e.id)*1.3,0,0));}
   e.navTime-=dt;if(e.navTime<=0){e.path=navPath(e.node.position,goal);e.navTime=.7;}
   const next=e.path[0]||goal,move=next.clone().sub(e.node.position);move.y=0;if(move.length()<.5)e.path.shift();if(move.lengthSq()>.04){move.normalize();const speed=[2,3.6,1.3][e.variant];movement(e.node.position,move.x*dt*speed,move.z*dt*speed,0,.5);e.node.rotation.y=Math.atan2(-move.x,-move.z);}}
 }
 if(progress.q>=3&&progress.q<14){alarmTime+=dt;if(alarmTime>5){alarmTime=0;audioCue(440,.25);}sun.color.setHex(Math.sin(clock*4)>.6?0xffc4c4:0xfff2df);}else sun.color.setHex(0xfff2df);
 if(noticeUntil<clock)$('notice').style.display='none';
 const point=candidate();$('prompt').style.display=point?'block':'none';$('prompt').textContent=point?`[${keyLabel(bindings.interact)}] ${point.kind==='door'?'Abrir · ':''}${displayText(point.title)}`:'';
 player.visible=hurtCD<=0||Math.floor(clock*15)%2===0;
}
function updateCamera(dt){if(scenePreview&&mode==='dialogue'){camera.position.lerp(scenePreview.position,1-Math.exp(-dt*6));camera.lookAt(scenePreview.target);return;}const target=player.position.clone().add(new T.Vector3(0,activeCharacter==='finn'?1.1:activeHeight()*.65,0));const direction=new T.Vector3(Math.sin(yaw)*Math.cos(pitch),Math.sin(pitch),Math.cos(yaw)*Math.cos(pitch));let distance=activeCharacter==='finn'?5:T.MathUtils.clamp(activeHeight()*2,2,7);
 const ray=new T.Ray(target,direction);for(const s of solids){const hit=ray.intersectBox(new T.Box3(s.min,s.max),new T.Vector3());if(hit)distance=Math.min(distance,Math.max(.65,hit.distanceTo(target)-.25));}
 const desired=target.clone().addScaledVector(direction,distance);if(rooms[room])desired.y=Math.min(desired.y,rooms[room].height-.4);camera.position.lerp(desired,1-Math.exp(-dt*12));camera.lookAt(target);}
function nextDoorTarget(){
 if(room==='outside'||!progress.current)return null;
 let target=details[expected()]?.room||'laboratory';if(target==='outside')target='main_hall';
 if(room===target)return details[expected()]?.room==='outside'?'city':null;
 const prev={[room]:null},queue=[room];
 while(queue.length){const at=queue.shift();for(const d of rooms[at]?.doors||[]){if(d.target==='city'||d.target in prev)continue;prev[d.target]=at;queue.push(d.target);}}
 if(!(target in prev))return null;let next=target;while(prev[next]&&prev[next]!==room)next=prev[next];return next;
}
function route(){if(room==='outside')return details[expected()]?.room==='outside'?'Siga a seta para o desafio atual.':'Entrada de serviço → laboratório → corredores do castelo';const next=nextDoorTarget();return next?'Siga a seta amarela → '+(rooms[next]?.title||'Pátio do castelo'):'Objetivo nesta área · siga a seta ou os anéis dourados';}
function syncHUD(){syncControls();const attackButton=document.querySelector('[data-action=attack]');if(attackButton)attackButton.disabled=activeCharacter==='jake';const c=progress.current;$('life').textContent=Array.from({length:5},(_,i)=>i<hp?'♥':'♡').join(' ');$('mission').textContent=c?`MISSÃO ${progress.q+1} · ${quests[progress.q][0]}`:'PRIMEIRA PARTE CONCLUÍDA';$('objective').textContent=c?`${displayText(c[2])} · ${progress.n}/${c[1]}`:'Próximo destino: Fábrica de Doces Abandonada.';$('route').textContent=c?route():'Explore as áreas recuperadas.';$('fill').style.width=`${progress.q/quests.length*100}%`;if($('ingredients'))$('ingredients').textContent=progress.q>=7?'Componentes encontrados: '+['crystal','essence','gelatin'].filter(e=>progress.done.includes(e)).length+'/3':'';if($('optional'))$('optional').textContent='Atividades opcionais: '+optionalCount()+'/5';$('location').textContent=(room==='outside'?'Sacadas, telhados e pátio':rooms[room].title)+' · '+(activeCharacter==='finn'?'Finn':'Jake ('+jakeForm+')');if($('area'))$('area').textContent=$('location').textContent;}
const SAVE='reino-doce-browser-v2';
function save(){try{localStorage.setItem(SAVE,JSON.stringify({version:2,progress:progress.snapshot(),room:checkpoint,roof,sideDone:[...sideDone],playtime:playtime.snapshot(),actors:{active:activeCharacter,form:jakeForm,finn:(activeCharacter==='finn'?player.position:finnCarrier.position).toArray(),jake:(activeCharacter==='jake'?player.position:jake.position).toArray()}}));$('saved').textContent='Progresso salvo';return true;}catch{$('saved').textContent='Salvamento indisponível';return false;}}
function savedData(){try{const d=JSON.parse(localStorage.getItem(SAVE));const p=new Progress();if(d?.version!==2||!p.restore(d.progress)||!['outside',...Object.keys(rooms)].includes(d.room)||typeof d.roof!=='boolean')return null;if(d.actors&&(!['finn','jake'].includes(d.actors.active)||!['normal','small','giant','stretch','bridge','ladder'].includes(d.actors.form)||!['finn','jake'].every(k=>Array.isArray(d.actors[k])&&d.actors[k].length===3&&d.actors[k].every(n=>Number.isFinite(n)&&Math.abs(n)<100))))return null;if(d.sideDone&&(!Array.isArray(d.sideDone)||d.sideDone.some(e=>!sideActivities.some(s=>s.event===e))))return null;return {d,p};}catch{return null;}}
function start(continueGame=false){audio??=new(window.AudioContext||window.webkitAudioContext)();audio.resume().catch(()=>{});const restored=continueGame?savedData():null;if(continueGame&&!restored){notice('Salvamento inválido. Comece uma nova aventura.');return;}progress=restored?.p||new Progress();sideDone=new Set(restored?.d.sideDone||[]);playtime=new Playtime();if(restored?.d.playtime)playtime.restore(restored.d.playtime);roof=restored?.d.roof||false;checkpoint=restored?.d.room||'main_hall';hp=5;hurtCD=0;attackCD=0;puzzle=0;yaw=0;pitch=.3;changeRoom(checkpoint,'city');if(restored?.d.actors){player.position.fromArray(restored.d.actors.finn);jake.position.fromArray(restored.d.actors.jake);setJakeForm(restored.d.actors.form,true);if(restored.d.actors.active==='jake')switchCharacter(true);}else if(room==='outside'&&roof)player.position.set(3,6.5,0);save();resume();if(!continueGame)dialogue('Finn e Jake · Algo está errado','Finn: A Jujuba pediu ajuda. Vamos encontrá-la no laboratório!\nJake: Vamos seguir pela galeria térrea e cozinha.\n\nSiga os controles do rodapé para mover, interagir, pular e trocar de personagem. Arraste o mouse para girar a câmera.');}
function recover(heal){if(activeCharacter==='jake')switchCharacter(true);setJakeForm('normal',true);pendingStrike=null;attackCD=0;finnModel.reset?.();if(heal)hp=5;hurtCD=1.2;vy=0;if(room==='outside')player.position.set(...(roof?[3,6.5,0]:[0,8,-24]));else{const arrival=interactions.find(p=>p.kind==='door');player.position.copy(arrival?.pos||new T.Vector3(0,1,5));if(arrival)player.position.addScaledVector(arrival.inward,2.3);player.position.y=arrival?arrival.pos.y-1:0;}syncHUD();}
function menu(){openPanel('O Mundo de Aventura','Campanha ampliada: Finn e Jake precisam trabalhar juntos para investigar o surto.\n\nO novo progresso é salvo neste navegador. O salvamento da campanha anterior é preservado separadamente.',[['Nova aventura',()=>start()],['Continuar',()=>start(true)],[`Visuais: ${lite?'leves':'castelo original'}`,()=>{lite=!lite;menu();}],['Configurar controles',controlsMenu]]);mode='start';$('actions').children[1].disabled=!savedData();if(location.protocol==='file:'){$('actions').children[2].disabled=true;$('actions').children[2].textContent='Visuais leves · arquivo local';}}
function pause(){openPanel('Aventura pausada','Seu progresso está preservado.',[['Continuar',resume],['Voltar ao checkpoint',()=>{recover(true);resume();}],['Menu',()=>{save();menu();}]]);mode='pause';}
let drag=null;
canvas.addEventListener('pointerdown',e=>{if(mode==='game'){drag={x:e.clientX,y:e.clientY,id:e.pointerId};canvas.setPointerCapture(e.pointerId);}});
canvas.addEventListener('pointermove',e=>{if(!drag||mode!=='game')return;yaw-=(e.clientX-drag.x)*.006;pitch=T.MathUtils.clamp(pitch+(e.clientY-drag.y)*.004,.08,.8);drag.x=e.clientX;drag.y=e.clientY;});
canvas.addEventListener('pointerup',()=>drag=null);canvas.addEventListener('pointercancel',()=>drag=null);
function controlsMenu(){openPanel('Controles','Escolha uma ação e pressione a nova tecla. Escape cancela. As setas também movimentam.',Object.keys(defaults).map(action=>[controlNames[action]+': '+keyLabel(bindings[action]),()=>{rebinding=action;$('dialogue').textContent='Pressione a nova tecla para '+controlNames[action]+'.';}]).concat([['Restaurar padrão',()=>{bindings={...defaults};try{localStorage.setItem('reino-doce-controls',JSON.stringify(bindings));}catch{notice('Controles restaurados somente para esta sessão.');}controlsMenu();}],['Voltar ao menu',menu]]));mode='settings';}
function syncControls(){if($('controls'))$('controls').textContent=keyLabel(bindings.swap)+' Finn/Jake · '+keyLabel(bindings.forward)+keyLabel(bindings.left)+keyLabel(bindings.back)+keyLabel(bindings.right)+' mover · '+keyLabel(bindings.run)+' correr · '+keyLabel(bindings.jump)+' pular · '+'Finn: '+keyLabel(bindings.sword)+' espada · '+keyLabel(bindings.punch)+' soco · '+keyLabel(bindings.interact)+' interagir · Jake: '+keyLabel(bindings.stretch)+' esticar, '+keyLabel(bindings.giant)+' gigante, '+keyLabel(bindings.small)+' pequeno, '+keyLabel(bindings.bridge)+' ponte, '+keyLabel(bindings.ladder)+' escada · Esc pausa';}
addEventListener('keydown',e=>{
 if(rebinding){e.preventDefault();if(e.code==='Escape'){rebinding=null;controlsMenu();return;}const next={...bindings,[rebinding]:e.code};if(!validBindings(next)){$('dialogue').textContent='Esta tecla não é permitida ou já está em uso. Escolha outra.';return;}bindings=next;rebinding=null;try{localStorage.setItem('reino-doce-controls',JSON.stringify(bindings));}catch{notice('Não foi possível salvar os controles.');}syncControls();controlsMenu();return;}
 if(mode==='game'&&(['Tab','Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)||e.code===bindings.swap))e.preventDefault();if(e.repeat)return;
 if(e.code==='Escape'){if(mode==='game')pause();else if(mode==='pause')resume();else if(mode==='settings')menu();return;}if(mode!=='game')return;
 const action=Object.keys(bindings).find(k=>bindings[k]===e.code);if(action==='swap'){switchCharacter();return;}
 if(activeCharacter==='jake'&&['stretch','giant','small','bridge','ladder'].includes(action)){setJakeForm(action);return;}
 keys.add(e.code);if(action==='jump')jumpRequest=true;if(activeCharacter==='finn'&&action==='sword')attack();if(activeCharacter==='finn'&&action==='punch')attack('punch');if(action==='interact')interact();if(action==='recover')recover(true);
});
addEventListener('keyup',e=>keys.delete(e.code));addEventListener('blur',()=>{keys.clear();drag=null;if(mode==='game')pause();});document.addEventListener('visibilitychange',()=>{if(document.hidden&&mode==='game')pause();});
for(const b of document.querySelectorAll('[data-key]')){b.addEventListener('pointerdown',e=>{e.preventDefault();keys.add(bindings[Object.keys(defaults).find(k=>defaults[k]===b.dataset.key)]||b.dataset.key);b.setPointerCapture(e.pointerId);});for(const name of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(name,()=>keys.delete(bindings[Object.keys(defaults).find(k=>defaults[k]===b.dataset.key)]||b.dataset.key));}
for(const b of document.querySelectorAll('[data-action]'))b.onclick=()=>{if(b.dataset.action==='swap'){switchCharacter();return;}if(b.dataset.action==='powers'){if(activeCharacter!=='jake'){notice('Troque para Jake para usar os poderes.');return;}openPanel('Poderes de Jake','Escolha uma forma. Ponte e escada precisam do ponto preparado.',[['Normal',()=>{resume();setJakeForm('normal');}],...['stretch','giant','small','bridge','ladder'].map(f=>[controlNames[f],()=>{resume();setJakeForm(f);}])]);return;}if(mode!=='game')return;if(b.dataset.action==='jump')jumpRequest=true;if(activeCharacter==='finn'&&b.dataset.action==='attack')attack();if(b.dataset.action==='punch')attack('punch');if(b.dataset.action==='interact')interact();};
function resize(){renderer.setSize(innerWidth,innerHeight,false);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();}addEventListener('resize',resize);resize();
changeRoom('main_hall','city');camera.position.set(2,3,10);menu();
let then=performance.now(),accumulator=0,lastTimeDisplay=-1;function frame(now){const realDt=(now-then)/1000;playtime.tick(realDt,mode,progress.q,zombies.length>0,optionalBusy);if($('playtime')&&Math.floor(playtime.total)!==lastTimeDisplay){lastTimeDisplay=Math.floor(playtime.total);$('playtime').textContent='Tempo de jogo: '+Math.floor(playtime.total/60)+' min '+Math.floor(playtime.total%60)+' s';}const dt=Math.min(.1,realDt);then=now;elapsed+=dt;if(mode==='game'){accumulator+=dt;let n=0;while(accumulator>=1/60&&n++<6){renderPrevious.copy(player.position);step(1/60);accumulator-=1/60;}if(n>6)accumulator=0;}else{accumulator=0;if(mode==='dialogue'&&!['attack','hit'].includes(finnModel.state?.().phase))finnModel.update?.(dt,{speed:0,grounded:true,vy:0});}const physicalPosition=player.position.clone();if(mode==='game'&&renderPrevious.distanceToSquared(physicalPosition)<4)player.position.lerpVectors(renderPrevious,physicalPosition,Math.min(1,accumulator*60));updateCamera(dt);updateMissionArrow();for(const sprite of roomLabels){const distance=camera.position.distanceTo(sprite.getWorldPosition(new T.Vector3()));sprite.visible=distance>3.2;const scale=Math.min(3.8,distance*.2);sprite.scale.set(scale,scale*.72/3.8,1);}for(const point of interactions){if(!point.marker)continue;const distance=camera.position.distanceTo(point.marker.getWorldPosition(new T.Vector3()));point.marker.visible=distance>3.2;point.marker.scale.setScalar(Math.min(1,distance*.16));}renderer.render(scene,camera);player.position.copy(physicalPosition);requestAnimationFrame(frame);}requestAnimationFrame(frame);
if(new URLSearchParams(location.search).has('qa'))window.__qa={state:()=>({room,mode,hp,grounded,clock,camera:camera.position.toArray(),direction:camera.getWorldDirection(new T.Vector3()).toArray(),angles:[yaw,pitch],drawCalls:renderer.info.render.calls,position:player.position.toArray(),progress:progress.snapshot(),event:expected(),zombies:zombies.map(e=>({id:e.id,hp:e.health,position:e.node.position.toArray(),state:e.state})),modelState,finnAnimation:finnModel.state?.()||null,activeCharacter,jakeForm,onAbilitySupport:floors.some(f=>f.ability&&Math.abs(player.position.x-f.x)<f.w/2+.15&&Math.abs(player.position.z-f.z)<f.d/2+.15&&Math.abs(player.position.y-f.y)<.2)||ramps.some(r=>r.ability&&Math.abs(player.position.x-r.x)<r.w/2+.15&&player.position.z>=r.a&&player.position.z<=r.b),bindings:{...bindings},sideDone:[...sideDone],playtime:playtime.snapshot(),finnPosition:(activeCharacter==='finn'?player.position:finnCarrier.position).toArray(),jakePosition:(activeCharacter==='jake'?player.position:jake.position).toArray(),nextDoor:nextDoorTarget(),arrow:missionArrow?.visible?missionArrow.userData.target:null,signs:interactions.filter(p=>p.kind==='door').map(p=>p.title),pixelRatio:renderer.getPixelRatio()}),fixture(event,id){progress=new Progress();while(progress.current&&expected()!==event)progress.accept(expected());roof=false;checkpoint=id;changeRoom(id);resume();},place(x,y,z){player.position.set(x,y,z);vy=0;},point(event){const p=interactions.find(p=>p.event===event||p.target===event);if(!p)return null;const y=p.kind==='door'?p.pos.y-1:p.kind==='mechanism'?(p.pos.y>3?0:0):p.pos.y;
 if(p.kind==='door'){player.position.copy(p.pos).addScaledVector(p.inward,1.5);player.position.y=y;}
 else {let found=false;for(const [dx,dz] of [[0,1.1],[0,-1.1],[1.1,0],[-1.1,0],[0,1.7],[0,-1.7]]){const pos=new T.Vector3(p.pos.x+dx,y,p.pos.z+dz),a=pos.clone().add(new T.Vector3(0,activeCharacter==='finn'?1:activeHeight()*.7)),target=p.pos.clone().add(new T.Vector3(0,p.kind==='mechanism'?0:1,0));if(!solids.some(s=>overlap(s,pos.x,pos.z,y,activeRadius(),activeHeight()))&&Math.abs(supportAt(pos.x,pos.z,y+.2)-y)<.35&&interactionVisible(a,target)){player.position.copy(pos);found=true;break;}}if(!found)return null;}
 vy=0;step(1/60);return p.title;},strikeAt(id){const e=zombies.find(z=>z.id===id);if(!e)return false;player.position.copy(e.node.position).add(new T.Vector3(0,0,1.3));facing.set(0,0,-1);player.rotation.y=0;return true;},setCamera(a){yaw=a;},switchCharacter,setJakeForm,save,read:savedData,step,attack,visit:(id,from)=>changeRoom(id,from),model:()=>originalCastle,async original(){lite=false;const m=await loadCastle();if(m&&room==='outside'){world.remove(fallbackCastle);world.add(m);}return !!m;},collision:()=>({ramps:ramps.map(r=>({...r})),abilityFloors:floors.filter(f=>f.ability).map(f=>({...f})),solids:solids.length,floors:floors.length,doorCount:interactions.filter(p=>p.kind==='door').length,support:supportAt(player.position.x,player.position.z,player.position.y+.3),spawnBlocked:solids.some(s=>overlap(s,player.position.x,player.position.z))})};
