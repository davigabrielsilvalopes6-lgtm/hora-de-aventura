const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-dev-shm-usage']});
 try{
  const page=await browser.newPage({viewport:{width:1280,height:720}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto((process.env.GAME_URL||'http://127.0.0.1:4173/')+'?qa=1&lite=1');
  await page.waitForFunction(()=>__qa.state().finnAnimation?.skins>0);
  await page.getByRole('button',{name:'Nova aventura',exact:true}).click();
  await page.keyboard.press('Enter');
  await page.evaluate(()=>{__qa.fixture('window','laboratory');__qa.point('window');});
  await page.keyboard.press('KeyE');
  await page.waitForFunction(()=>__qa.state().room==='outside'&&__qa.state().camera[0]>8);
  assert.equal(await page.locator('#modal').evaluate(e=>e.classList.contains('route-preview')),true);
  const before=await page.evaluate(()=>__qa.state());
  await page.keyboard.down('KeyW');
  await page.waitForTimeout(150);
  assert.deepEqual((await page.evaluate(()=>__qa.state())).position,before.position,'Dialogue keeps player on safe start');
  await page.keyboard.up('KeyW');
  await page.screenshot({path:path.join(__dirname,'../docs/window-route-preview.png')});
  await page.getByRole('button',{name:'Continuar',exact:true}).click();
  await page.waitForFunction(()=>__qa.state().mode==='game'&&__qa.state().camera[0]<5);
  assert.equal(await page.locator('#modal').evaluate(e=>e.classList.contains('route-preview')),false);
  await page.waitForFunction(()=>__qa.state().grounded);
  await page.keyboard.press('Space');
  await page.waitForFunction(()=>!__qa.state().grounded);
  assert.equal((await page.evaluate(()=>__qa.state())).event,'landing','Jump remains controlled by player, not completed by overview');
  assert.deepEqual(errors,[]);
  fs.writeFileSync(path.join(__dirname,'../docs/window-preview-results.json'),JSON.stringify({passed:true,method:'Window fixture for setup; real E, dialogue, keyboard and jump; camera overview and control restoration checked.'},null,2));
  console.log('PASS window overview, stationary dialogue, return to camera/control and real jump');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
