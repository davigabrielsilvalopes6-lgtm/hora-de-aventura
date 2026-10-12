import * as T from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import bytes from '../public/assets/characters/finn-animated.glb';
export async function loadAnimatedFinn(){
 const gltf=await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');
 const root=gltf.scene,mixer=new T.AnimationMixer(root),actions=new Map(gltf.animations.map(c=>[c.name,mixer.clipAction(c)]));
 const feet=[],skeletons=new Set();root.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;o.frustumCulled=false;}if(o.isSkinnedMesh){skeletons.add(o.skeleton);if(o.name.includes('Black_shoe')||o.name.includes('Black shoe'))feet.push(o);}});
 const sword=root.getObjectByName('FinnSword');let current='',oneShot=0,punchCount=0;
 function play(name,single=false){if(!actions.has(name))throw Error('Missing animation '+name);if(current===name&&!single)return;for(const a of actions.values())a.stop();const action=actions.get(name);action.reset();action.setLoop(single?T.LoopOnce:T.LoopRepeat,single?1:Infinity);action.clampWhenFinished=single;action.timeScale=single?action.getClip().duration/.42:1;action.play();if(sword)sword.visible=!name.startsWith('Punch');current=name;oneShot=single?.42:0;}
 function ground(){root.position.y=0;root.updateMatrixWorld(true);for(const s of skeletons)s.update();for(const f of feet)f.computeBoundingBox();if(feet.length)root.position.y=-Math.min(...feet.map(f=>f.boundingBox.min.y));root.updateMatrixWorld(true);}
 play('Sword_Idle');mixer.update(0);ground();
 return {root,startAttack(style='sword'){play(style==='punch'?(punchCount++%2?'Punch_Cross':'Punch_Jab'):'Sword_Attack',true);},hit(){if(oneShot<=0)play('Hit_Chest',true);},reset(){oneShot=0;current='';play('Sword_Idle');},update(dt,moving,running){if(oneShot>0)oneShot=Math.max(0,oneShot-dt);if(oneShot<=0)play(moving?(running?'Sprint_Loop':'Walk_Loop'):'Sword_Idle');mixer.update(dt);ground();},state(){return {clip:current,time:actions.get(current)?.time,skins:skeletons.size,feet:feet.length,oneShot,arm:root.getObjectByName('DEF-upper_armR')?.quaternion.toArray()};}};
}
