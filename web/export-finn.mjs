import {build} from 'esbuild';
import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
import {existsSync} from 'node:fs';
const code=`import * as T from 'three';import {createFinn} from './src/finn.js';import {GLTFExporter} from 'three/addons/exporters/GLTFExporter.js';import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
const model=createFinn();const scene=new T.Scene();scene.background=new T.Color(0xe8e1ed);scene.add(model.root);scene.add(new T.HemisphereLight(0xffffff,0x75809b,2));const light=new T.DirectionalLight(0xffffff,3);light.position.set(-3,5,-4);scene.add(light);
const camera=new T.PerspectiveCamera(35,1,.01,30);const renderer=new T.WebGLRenderer({antialias:true});renderer.setSize(720,720);renderer.setPixelRatio(1);renderer.outputColorSpace=T.SRGBColorSpace;document.body.style.margin=0;document.body.appendChild(renderer.domElement);
window.view=(angle)=>{camera.position.set(Math.sin(angle)*4.2,1.15,-Math.cos(angle)*4.2);camera.lookAt(0,1,0);renderer.render(scene,camera);};view(0);
window.exportModel=async()=>{const data=await new GLTFExporter().parseAsync(model.root,{binary:true});const loaded=await new GLTFLoader().parseAsync(data,'');let meshes=0;loaded.scene.traverse(o=>{if(o.isMesh)meshes++;});const bounds=new T.Box3().setFromObject(loaded.scene);if(meshes<30||bounds.min.y<-.03||bounds.max.y>2.2)throw Error('Invalid exported model bounds or mesh count');return {bytes:Array.from(new Uint8Array(data)),meshes,bounds:[bounds.min.toArray(),bounds.max.toArray()]};};`;
const bundle=await build({stdin:{contents:code,resolveDir:process.cwd(),sourcefile:'finn-export.js'},bundle:true,format:'iife',write:false});
const browser=await chromium.launch({executablePath:existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined,headless:true,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-dev-shm-usage']});
try{
 const page=await browser.newPage({viewport:{width:720,height:720}});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.setContent('<html><body></body></html>');await page.addScriptTag({content:bundle.outputFiles[0].text});
 const result=await page.evaluate(()=>exportModel());await mkdir('public/assets/characters',{recursive:true});await writeFile('public/assets/characters/finn.glb',new Uint8Array(result.bytes));
 for(const [name,angle] of [['front',0],['side',Math.PI/2],['back',Math.PI]]){await page.evaluate(a=>view(a),angle);await page.screenshot({path:'docs/finn-'+name+'.png'});}
 if(errors.length)throw Error(errors.join('\n'));delete result.bytes;await writeFile('docs/finn-export.json',JSON.stringify(result,null,2));console.log('Export validated',result);
}finally{await browser.close();}
