const {chromium}=require('playwright');const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-dev-shm-usage']});
 try{
  const page=await browser.newPage({viewport:{width:1280,height:800}}),errors=[],requests=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.url().endsWith('/assets/castle.glb'))requests.push({url:r.url(),status:r.status()});});
  await page.goto((process.env.GAME_URL||'http://127.0.0.1:4173/')+'?qa=1&lite=1');await page.waitForFunction(()=>__qa.state().finnAnimation?.skins>0);
  await page.getByRole('button',{name:'Nova aventura',exact:true}).click();await page.keyboard.press('Enter');
  await page.evaluate(()=>__qa.fixture('princess','outside'));
  await page.waitForFunction(()=>!__qa.state().castleLoading&&__qa.model()?.parent,null,{timeout:60000});
  const model=await page.evaluate(()=>{let count=0;__qa.model().traverse(o=>{if(o.isMesh)count++;});return {count,name:__qa.model().name,position:__qa.model().position.toArray()};});
  assert.equal(model.count,374);assert.equal(model.name,'CandyKingdomCastleUploaded');const genericBlocks=await page.evaluate(()=>{let n=0;__qa.model().parent.traverse(o=>{if(o.isMesh&&!o.isInstancedMesh&&o.geometry.type==='BoxGeometry'&&o.scale.x===18&&o.scale.y===18&&o.scale.z===14)n++;});return n;});assert.equal(genericBlocks,0,'Old 18×18×14 castle facade must be absent from rendered scene');
  assert.equal(requests.length,1);assert.equal(requests[0].status,200,'Model must load under light-quality URL too');
  await page.evaluate(()=>{__qa.place(-11,0,18);__qa.setCamera(.1,-.12);});await page.waitForFunction(()=>__qa.state().grounded&&__qa.state().camera[2]>22);
  await page.screenshot({path:path.join(__dirname,'../docs/castle-campaign-finn-jake.png')});
  await page.keyboard.down('KeyW');const before=await page.evaluate(()=>__qa.state());await page.waitForFunction(t=>__qa.state().clock>t+.25,before.clock);await page.keyboard.up('KeyW');assert.ok((await page.evaluate(()=>__qa.state())).position[2]<before.position[2]-.5);
  await page.evaluate(()=>{__qa.place(-18,0,-14);__qa.setCamera(0);__qa.step(1/60);});await page.keyboard.down('KeyW');const gateClock=(await page.evaluate(()=>__qa.state())).clock;await page.waitForFunction(t=>__qa.state().clock>t+.6,gateClock);await page.keyboard.up('KeyW');assert.ok((await page.evaluate(()=>__qa.state())).position[2]>-17.1,'Closed real gate blocks walking through facade');await page.evaluate(()=>__qa.point('castle_entry'));await page.keyboard.press('KeyE');await page.waitForFunction(()=>__qa.state().room==='main_hall');
  for(const target of ['ground_gallery','kitchen','laboratory']){await page.evaluate(t=>__qa.point(t),target);await page.keyboard.press('KeyE');await page.waitForFunction(t=>__qa.state().room===t,target);}
  await page.evaluate(()=>__qa.point('princess'));await page.keyboard.press('KeyE');await page.getByRole('button',{name:'Continuar',exact:true}).click();assert.equal((await page.evaluate(()=>__qa.state())).event,'inspect_console');
  await page.evaluate(()=>__qa.fixture('reunite','main_hall'));await page.evaluate(()=>__qa.point('city'));await page.keyboard.press('KeyE');await page.waitForFunction(()=>__qa.state().room==='outside'&&__qa.state().grounded);assert.ok(Math.abs((await page.evaluate(()=>__qa.state())).position[2]+14)<.2,'Exit arrives near real gate');await page.evaluate(()=>__qa.point('castle_entry'));await page.keyboard.press('KeyE');await page.waitForFunction(()=>__qa.state().room==='main_hall');
  let allowModel=false;await page.route('**/assets/castle.glb',r=>allowModel?r.continue():r.abort());
  await page.reload();await page.getByRole('button',{name:'Nova aventura',exact:true}).click();await page.keyboard.press('Enter');await page.evaluate(()=>__qa.fixture('princess','outside'));
  await page.waitForFunction(()=>document.getElementById('title').textContent==='Não foi possível carregar o castelo');assert.equal(await page.evaluate(()=>__qa.model()),null,'Failure never substitutes a generic castle');
  allowModel=true;await page.getByRole('button',{name:'Tentar novamente',exact:true}).click();await page.waitForFunction(()=>__qa.model()?.parent&&!__qa.state().castleLoading,null,{timeout:60000});assert.equal((await page.evaluate(()=>__qa.state())).mode,'game');
  assert.deepEqual(errors,[]);
  fs.writeFileSync(path.join(__dirname,'../docs/castle-campaign-results.json'),JSON.stringify({passed:true,model,requests,method:'Light-quality URL; actual campaign automatically loads uploaded GLB, keyboard movement, E through entrance/rooms/princess; fixtures only prepare locations.',checks:['No generic castle','Real GLB loads automatically in campaign','Finn/Jake real gameplay capture','Player moves','Exterior entry connects grand hall, kitchen and lab','Princess objective advances','Closed real gate has collision','Main entrance exit and reentry work','Model network failure is visible and retry restores real model'],errors},null,2));console.log('PASS real castle replaces generic in campaign, entrance/interiors, movement and mission');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
