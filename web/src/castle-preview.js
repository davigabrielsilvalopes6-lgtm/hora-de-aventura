import * as T from 'three';

// Inspect the same model used by the campaign without changing its save or map.
export function createCastlePreview({scene,camera,canvas,onClose}){
 const group=new T.Group();group.visible=false;scene.add(group);
 const panel=document.createElement('section');panel.id='castle-preview';panel.className='card hidden';panel.setAttribute('aria-label','Visualizador do castelo');
 const title=document.createElement('h2');title.textContent='Seu castelo 3D';panel.append(title);
 const hint=document.createElement('p');hint.className='muted';hint.textContent='Arraste para girar · roda do mouse para aproximar. Kenny Park · CC BY 4.0.';panel.append(hint);
 const actions=document.createElement('div');actions.className='preview-actions';panel.append(actions);document.body.append(panel);
 let active=false,angle=0,pitch=.3,zoom=1,drag=null,size=new T.Vector3(),target=new T.Vector3(),previous=null,lastView=null;
 const elements=['modal','hud','controls','location','touch','notice','prompt'];
 for(const [name,a,p] of [['Frente',0,.3],['Lado',Math.PI/2,.3],['Trás',Math.PI,.3],['Aérea',0,1.1]]){
  const button=document.createElement('button');button.textContent=name;button.onclick=()=>{angle=a;pitch=p;zoom=1;};actions.append(button);
 }
 const back=document.createElement('button');back.textContent='Voltar ao menu';back.onclick=()=>{hide();onClose();};actions.append(back);
 canvas.addEventListener('pointerdown',e=>{if(!active)return;drag={id:e.pointerId,x:e.clientX,y:e.clientY};canvas.setPointerCapture(e.pointerId);});
 canvas.addEventListener('pointermove',e=>{if(!active||!drag||drag.id!==e.pointerId)return;angle-=(e.clientX-drag.x)*.006;pitch=T.MathUtils.clamp(pitch+(e.clientY-drag.y)*.004,.12,1.3);drag.x=e.clientX;drag.y=e.clientY;});
 for(const event of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(event,()=>{drag=null;});
 canvas.addEventListener('wheel',e=>{if(!active)return;e.preventDefault();zoom=T.MathUtils.clamp(zoom*Math.exp(e.deltaY*.001),.55,1.8);},{passive:false});
 function hide(){if(!active)return;active=false;drag=null;panel.classList.add('hidden');group.clear();group.visible=false;scene.fog=previous.fog;camera.far=previous.far;camera.updateProjectionMatrix();for(const [id,hidden] of previous.elements)document.getElementById(id).classList.toggle('hidden',hidden);}
 return {
  show(model){
   previous={fog:scene.fog,far:camera.far,elements:elements.map(id=>[id,document.getElementById(id).classList.contains('hidden')])};
   for(const id of elements)document.getElementById(id).classList.add('hidden');
   const copy=model.clone(true);copy.position.set(0,0,0);copy.updateMatrixWorld(true);
   const bounds=new T.Box3().setFromObject(copy);copy.position.y-=bounds.min.y;bounds.translate(new T.Vector3(0,-bounds.min.y,0));bounds.getSize(size);bounds.getCenter(target);
   group.add(copy);group.visible=true;active=true;angle=0;pitch=.3;zoom=1;lastView=null;scene.fog=null;camera.far=1000;camera.updateProjectionMatrix();panel.classList.remove('hidden');back.focus();
  },
  update(){const key=[angle,pitch,zoom,camera.aspect].join(',');if(key===lastView)return false;lastView=key;const halfFov=Math.tan(T.MathUtils.degToRad(camera.fov/2));const radius=(Math.max(size.x,size.z)/(2*halfFov*camera.aspect)+size.z*.5)*1.15*zoom;camera.position.copy(target).add(new T.Vector3(Math.sin(angle)*Math.cos(pitch),Math.sin(pitch),Math.cos(angle)*Math.cos(pitch)).multiplyScalar(Math.max(radius,size.y*1.7)));camera.lookAt(target);return true;},
  hide
 };
}
