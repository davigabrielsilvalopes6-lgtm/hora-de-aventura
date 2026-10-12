const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.BROWSER_EXECUTABLE||(fs.existsSync('/usr/bin/chromium')?'/usr/bin/chromium':chromium.executablePath()),headless:true,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-dev-shm-usage']});
 try{
  const page=await browser.newPage({viewport:{width:1280,height:720},deviceScaleFactor:2});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto((process.env.GAME_URL||'http://127.0.0.1:4173/')+'?qa=1&lite=1');
  await page.getByRole('button',{name:'Nova aventura',exact:true}).click();
  await page.getByRole('button',{name:'Continuar',exact:true}).click();
  const state=()=>page.evaluate(()=>__qa.state());
  await page.waitForFunction(()=>__qa.state().arrow==='ground_gallery');
  for(const target of ['ground_gallery','kitchen','laboratory']){
   assert.equal((await state()).nextDoor,target);
   await page.evaluate(t=>__qa.point(t),target);await page.keyboard.press('KeyE');
   await page.waitForFunction(t=>__qa.state().room===t,target);
  }
  await page.waitForFunction(()=>__qa.state().arrow==='princess');
  assert.equal((await state()).pixelRatio,2);
  assert.ok((await state()).signs.includes('Cozinha real'));
  await page.evaluate(()=>__qa.fixture('alarm','laboratory'));
  await page.waitForFunction(()=>__qa.state().nextDoor==='kitchen');
  await page.evaluate(()=>__qa.fixture('princess','main_hall'));
  await page.evaluate(()=>__qa.place(0,0,0));
  const before=await state();await page.keyboard.down('KeyW');
  await page.waitForFunction(t=>__qa.state().clock>t+.35,before.clock);await page.keyboard.up('KeyW');
  const after=await state();assert.ok(after.position[2]<before.position[2]-1);
  assert.ok(after.position.every(Number.isFinite));assert.ok(after.camera.every(Number.isFinite));
  await page.evaluate(()=>{__qa.place(-3,0,-6);__qa.setCamera(Math.PI/2);});
  await page.waitForTimeout(1200);
  await page.screenshot({path:'docs/door-guidance.png'});
  assert.deepEqual(errors,[]);
  console.log('PASS: door chain, local objective marker, reverse mission route, high DPI, real movement and screenshot');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
