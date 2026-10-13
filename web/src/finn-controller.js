import * as T from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import bytes from '../public/assets/characters/finn-animated.glb';
export async function loadAnimatedFinn(){
 const gltf=await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');
 const root=gltf.scene,mixer=new T.AnimationMixer(root),actions=new Map(gltf.animations.map(c=>[c.name,mixer.clipAction(c)]));
 const feet=[],skeletons=new Set();root.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;o.frustumCulled=false;}if(o.isSkinnedMesh){skeletons.add(o.skeleton);if(o.name.includes('Black_shoe')||o.name.includes('Black shoe'))feet.push(o);}});
 const sword=root.getObjectByName('FinnSword');
 const face=root.getObjectByName('Oval_face'),hood=root.getObjectByName('White_hood');
 function visualForward(){
  if(!face||!hood)return null;
  const center=mesh=>{const point=new T.Vector3();mesh.geometry.computeBoundingBox();mesh.geometry.boundingBox.getCenter(point);mesh.applyBoneTransform(0,point);return mesh.localToWorld(point);};
  const direction=center(face).sub(center(hood));direction.y=0;return direction.normalize().toArray();
 }
 let current='',phase='idle',oneShot=0,punchCount=0,wasGrounded=true,fadeTime=0;
 function play(name,{duration=0,phase:nextPhase=name,fade=.1,rate=1,hold=false}={}){
  if(!actions.has(name))throw Error('Missing animation '+name);
  if(current===name&&phase===nextPhase&&!duration){actions.get(name).timeScale=rate;return;}
  const previous=actions.get(current),action=actions.get(name);
  if(previous&&previous!==action)previous.fadeOut(fade);
  action.reset().setEffectiveWeight(1).setEffectiveTimeScale(duration?action.getClip().duration/duration:rate);
  action.setLoop(duration||hold?T.LoopOnce:T.LoopRepeat,duration||hold?1:Infinity);action.clampWhenFinished=!!(duration||hold);action.play();
  if(previous&&previous!==action&&fade>0)action.fadeIn(fade);
  if(hold){action.time=action.getClip().duration*.65;action.paused=true;}
  current=name;phase=nextPhase;oneShot=duration;fadeTime=fade;
  if(sword)sword.visible=name==='Sword_Attack'||name==='Sword_Idle';
 }
 function ground(){root.position.y=0;root.updateMatrixWorld(true);for(const s of skeletons)s.update();for(const f of feet)f.computeBoundingBox();if(feet.length)root.position.y=-Math.min(...feet.map(f=>f.boundingBox.min.y));root.updateMatrixWorld(true);}
 function idle(force=false){if(force){for(const a of actions.values())a.stop();current='';oneShot=0;}play('Idle_Loop',{phase:'idle',fade:force?0:.1});}
 idle(true);mixer.update(0);ground();
 return {root,
  startAttack(style='sword'){play(style==='punch'?(punchCount++%2?'Punch_Cross':'Punch_Jab'):'Sword_Attack',{duration:.42,phase:'attack',fade:.04});},
  hit(){if(oneShot<=0)play('Hit_Chest',{duration:.42,phase:'hit',fade:.04});},
  interact(){if(phase!=='attack')play('Interact',{duration:.3,phase:'interact',fade:.07});},
  reset(){wasGrounded=true;idle(true);mixer.update(0);ground();},
  update(dt,input={},legacyRun=false){
   if(typeof input==='boolean')input={speed:input?(legacyRun?10:7):0,running:legacyRun,grounded:true,vy:0};
   const {speed=0,running=false,grounded=true,vy=0,active=true}=input;
   if(!active){if(phase!=='idle')idle(true);wasGrounded=true;}
   else{
    oneShot=Math.max(0,oneShot-dt);
    if(phase!=='attack'&&phase!=='hit'&&phase!=='interact'){
     if(wasGrounded&&!grounded&&vy>0)play('Jump_Start',{duration:.14,phase:'jump',fade:.06});
     else if(!wasGrounded&&grounded&&vy<=0)play('Jump_Land',{duration:.16,phase:'land',fade:.06});
    }
    if(oneShot<=0){
     if(!grounded)play('Jump_Loop',{phase:vy>0?'jump':'fall',hold:vy<=0,fade:.08});
     else if(speed>.05){const clip=running?'Sprint_Loop':'Walk_Loop',stride=running?2.4:1.7;play(clip,{phase:running?'run':'walk',rate:T.MathUtils.clamp(speed*actions.get(clip).getClip().duration/stride,.25,5),fade:.12});}
     else idle();
    }
    wasGrounded=grounded;
   }
   fadeTime=Math.max(0,fadeTime-dt);mixer.update(dt);if(grounded)ground();else root.updateMatrixWorld(true);
  },
  state(){return {clip:current,phase,time:actions.get(current)?.time,rate:actions.get(current)?.timeScale,groundOffset:root.position.y,transition:fadeTime>0,skins:skeletons.size,feet:feet.length,oneShot,visualForward:visualForward(),arm:root.getObjectByName('DEF-upper_armR')?.quaternion.toArray()};}
 };
}
