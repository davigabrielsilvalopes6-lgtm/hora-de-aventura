const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-dev-shm-usage']});
 try{
  const page=await browser.newPage({viewport:{width:1280,height:960}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto((process.env.GAME_URL||'http://127.0.0.1:4173/')+'?qa=1&lite=1');
  await page.getByRole('button',{name:'Ver castelo 3D',exact:true}).click();
  await page.waitForFunction(()=>__qa.state().mode==='castle-preview'&&__qa.state().camera[2]>80,null,{timeout:60000});
  const model=await page.evaluate(()=>{let meshes=0,materials=new Set(),emission=0;__qa.model().traverse(m=>{if(m.isMesh){meshes++;for(const mat of Array.isArray(m.material)?m.material:[m.material]){materials.add(mat.uuid);if(mat.emissive&&(mat.emissive.r+mat.emissive.g+mat.emissive.b)>0)emission++;}}});return {meshes,materials:materials.size,emissiveMeshes:emission};});
  assert.equal(model.meshes,374);assert.equal(model.materials,43);assert.ok(model.emissiveMeshes>0,'Uploaded emissive colors preserved');
  const before=await page.evaluate(()=>({save:localStorage.getItem('reino-doce-browser-v2'),progress:__qa.state().progress,playtime:__qa.state().playtime.total}));
  const angles=[];
  for(const [name,file] of [['Frente','front'],['Lado','side'],['Trás','back'],['Aérea','aerial']]){
   const previousView=await page.evaluate(()=>__qa.state());
   await page.getByRole('button',{name,exact:true}).click();
   if(file!=='front')await page.waitForFunction(p=>{const s=__qa.state();return s.renderFrame>p.renderFrame&&JSON.stringify(s.camera)!==JSON.stringify(p.camera);},previousView,{timeout:60000});
   const state=await page.evaluate(()=>__qa.state());angles.push({name,camera:state.camera});
   await page.locator('#castle-preview').evaluate(e=>e.style.visibility='hidden');
   await page.screenshot({path:path.join(__dirname,'../docs/castle-upload-'+file+'.png')});
   await page.locator('#castle-preview').evaluate(e=>e.style.visibility='');
  }
  assert.notDeepEqual(angles[0].camera,angles[1].camera);assert.ok(angles[3].camera[1]>angles[0].camera[1]);
  const unchanged=await page.evaluate(()=>({save:localStorage.getItem('reino-doce-browser-v2'),progress:__qa.state().progress,playtime:__qa.state().playtime.total}));assert.deepEqual(unchanged,before,'Preview must not advance or overwrite campaign');
  await page.setViewportSize({width:390,height:844});await page.waitForTimeout(250);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  await page.getByRole('button',{name:'Voltar ao menu',exact:true}).click();assert.equal((await page.evaluate(()=>__qa.state())).mode,'start');
  await page.getByRole('button',{name:'Nova aventura',exact:true}).click();await page.keyboard.press('Enter');assert.equal((await page.evaluate(()=>__qa.state())).room,'main_hall');
  await page.evaluate(()=>{__qa.fixture('inspect_flask','laboratory');__qa.save();});
  await page.keyboard.press('Escape');await page.getByRole('button',{name:'Menu',exact:true}).click();
  const existingSave=await page.evaluate(()=>localStorage.getItem('reino-doce-browser-v2'));
  await page.getByRole('button',{name:'Ver castelo 3D',exact:true}).click();await page.waitForFunction(()=>__qa.state().mode==='castle-preview'&&__qa.state().camera[2]>80,null,{timeout:60000});
  assert.equal(await page.evaluate(()=>localStorage.getItem('reino-doce-browser-v2')),existingSave,'Existing partial campaign save preserved byte for byte');
  await page.keyboard.press('Escape');assert.equal(await page.getByRole('button',{name:'Visuais: leves',exact:true}).count(),1,'Preview preserves light-mode preference');
  await page.getByRole('button',{name:'Continuar',exact:true}).click();assert.equal((await page.evaluate(()=>__qa.state())).event,'inspect_flask');assert.equal((await page.evaluate(()=>__qa.state())).room,'laboratory');
  await page.evaluate(()=>__qa.visit('outside'));assert.equal(await page.evaluate(()=>__qa.original()),true);await page.waitForFunction(()=>!!__qa.model()?.parent);
  assert.equal((await page.evaluate(()=>__qa.state())).mode,'game');assert.deepEqual(errors,[]);
  fs.writeFileSync(path.join(__dirname,'../docs/castle-upload-results.json'),JSON.stringify({passed:true,model,views:angles,checks:['Real uploaded GLB loads in preview and campaign','Four real rendered views','Preview leaves campaign save, progress and playtime intact','Mobile panel fits','Menu and new adventure restored','Existing partial campaign save preserved byte for byte and Continue restored correct objective','Light-mode preference preserved'],errors},null,2));
  console.log('PASS uploaded castle, materials, four views, save preservation, mobile and campaign integration');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
