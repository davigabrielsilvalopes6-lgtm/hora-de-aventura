const {build}=require('esbuild');
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
(async()=>{
 const modelPath=process.env.FINN_GLB||path.join(__dirname,'../public/assets/characters/finn-animated.glb');
 const source=`import * as T from 'three';import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';import bytes from ${JSON.stringify(modelPath)};
 (async()=>{const g=await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');const root=g.scene,mixer=new T.AnimationMixer(root),feet=[];root.traverse(m=>{if(m.isSkinnedMesh&&/Black.shoe/.test(m.name))feet.push(m);});
 const center=m=>{m.geometry.computeBoundingBox();const p=m.geometry.boundingBox.getCenter(new T.Vector3());m.applyBoneTransform(0,p);return m.localToWorld(p);};const face=root.getObjectByName('Oval_face'),hood=root.getObjectByName('White_hood');
 const result=[];for(const name of ['Walk_Loop','Sprint_Loop']){mixer.stopAllAction();const clip=g.animations.find(c=>c.name===name);mixer.clipAction(clip).reset().play();const samples=[];for(let i=0;i<=40;i++){mixer.setTime(i*clip.duration/40);root.updateMatrixWorld(true);const forward=center(face).sub(center(hood));forward.y=0;forward.normalize();samples.push({forward:forward.toArray(),feet:feet.map(m=>center(m).toArray())});}result.push({name,duration:clip.duration,samples});}window.__gait=result;})();`;
 const bundle=await build({stdin:{contents:source,resolveDir:path.join(__dirname,'..')},bundle:true,loader:{'.glb':'binary'},write:false,format:'iife'});
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
 try{
  const page=await browser.newPage();await page.setContent('<html><body></body></html>');
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addScriptTag({content:bundle.outputFiles[0].text});await page.waitForFunction(()=>window.__gait);
  const clips=await page.evaluate(()=>window.__gait),results=[];
  for(const clip of clips)for(let foot=0;foot<2;foot++){
   const heights=clip.samples.map(s=>s.feet[foot][1]),threshold=Math.min(...heights)+(Math.max(...heights)-Math.min(...heights))*.2;
   let contactTravel=0,count=0;
   for(let i=1;i<clip.samples.length;i++){
    const a=clip.samples[i-1],b=clip.samples[i];if(a.feet[foot][1]>=threshold||b.feet[foot][1]>=threshold)continue;
    // During stance, the planted foot travels backward relative to the torso.
    contactTravel+=(b.feet[foot][0]-a.feet[foot][0])*b.forward[0]+(b.feet[foot][2]-a.feet[foot][2])*b.forward[2];count++;
   }
   assert.ok(count>=5,clip.name+' foot '+foot+' contact samples');
   assert.ok(contactTravel<-.1,clip.name+' foot '+foot+' stance must move against facing; measured '+contactTravel);
   results.push({clip:clip.name,foot,contactSamples:count,contactTravelAlongFacing:contactTravel});
  }
  assert.deepEqual(errors,[]);
  if(!process.env.FINN_GLB)fs.writeFileSync(path.join(__dirname,'../docs/finn-gait-results.json'),JSON.stringify({passed:true,method:'Load actual exported GLB and sample each walk/run clip; both feet near ground must move backward relative to face during stance.',results},null,2));
  console.log('PASS exported walk/run foot contact goes against forward direction for both feet');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
