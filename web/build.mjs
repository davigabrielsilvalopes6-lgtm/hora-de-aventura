import {build} from 'esbuild';
import {mkdir,readFile,writeFile,cp} from 'node:fs/promises';
const result=await build({entryPoints:['src/main.js'],bundle:true,minify:true,write:false,format:'iife',target:['es2020']});
const template=await readFile('src/index.html','utf8');
const license=await readFile('node_modules/three/LICENSE','utf8');
await mkdir('dist',{recursive:true});
await writeFile('dist/index.html',template.replace('/* GAME_BUNDLE */',()=>('/* Three.js license\n'+license+'\n*/\n'+result.outputFiles[0].text).replaceAll('</script','<\\/script')));
await cp('public/assets','dist/assets',{recursive:true});
console.log('Built dist/index.html (self-contained light game) + original castle GLB');
