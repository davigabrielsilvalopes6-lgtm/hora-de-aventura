const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-dev-shm-usage']});
 try{
  const page=await browser.newPage({viewport:{width:1280,height:720}}),errors=[],results=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto((process.env.GAME_URL||'http://127.0.0.1:4173/')+'?qa=1&lite=1');
  await page.waitForFunction(()=>__qa.state().finnAnimation?.skins>0);
  await page.getByRole('button',{name:'Nova aventura',exact:true}).click();await page.keyboard.press('Enter');
  const cases=[['forward',['KeyW'],0],['back',['KeyS'],0],['left',['KeyA'],0],['right',['KeyD'],0],['diagonal',['KeyW','KeyD'],0],['rotated-camera',['KeyW'],Math.PI/2],['run',['KeyW','ShiftLeft'],Math.PI]];
  for(const [name,keys,yaw] of cases){
   await page.evaluate(yaw=>{__qa.place(0,0,0);__qa.setCamera(yaw);__qa.step(1/60);},yaw);
   const before=await page.evaluate(()=>__qa.state());
   for(const key of keys)await page.keyboard.down(key);
   await page.waitForFunction(t=>__qa.state().clock>t+.35,before.clock);
   const after=await page.evaluate(()=>__qa.state());
   const dx=after.position[0]-before.position[0],dz=after.position[2]-before.position[2],distance=Math.hypot(dx,dz),front=after.finnAnimation.visualForward;
   assert.ok(distance>.5,name+' must actually move');assert.ok(front,name+' visual face direction must be available');
   const alignment=(dx*front[0]+dz*front[2])/distance;
   assert.ok(alignment>.85,name+' face points along travel, measured dot='+alignment+' front='+JSON.stringify(front));
   assert.equal(after.finnAnimation.phase,name==='run'?'run':'walk');
   results.push({name,alignment,front,travel:[dx,dz]});
   if(name==='forward')await page.screenshot({path:path.join(__dirname,'../docs/finn-walking-forward.png')});
   for(const key of keys)await page.keyboard.up(key);
   await page.waitForFunction(()=>__qa.state().finnAnimation.phase==='idle');
  }
  await page.keyboard.press('Tab');assert.equal((await page.evaluate(()=>__qa.state())).finnAnimation.phase,'idle');
  await page.keyboard.press('Tab');
  await page.keyboard.down('KeyW');const t=(await page.evaluate(()=>__qa.state())).clock;
  await page.waitForFunction(t=>__qa.state().clock>t+.3,t);
  const resumed=await page.evaluate(()=>__qa.state());assert.ok(resumed.finnAnimation.visualForward[2]>.85,'Direction remains aligned after returning from Jake with camera rotated');
  await page.keyboard.up('KeyW');assert.deepEqual(errors,[]);
  fs.writeFileSync(path.join(__dirname,'../docs/finn-direction-results.json'),JSON.stringify({passed:true,method:'Actual keyboard movement; visual direction measured from skinned face and hood positions, not controller yaw alone.',results},null,2));
  console.log('PASS Finn faces actual travel in four directions, diagonal, rotated camera, run and after Jake switch');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
