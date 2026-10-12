const {chromium}=require('playwright');const fs=require('fs');const path=require('path');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.BROWSER_EXECUTABLE || (fs.existsSync('/usr/bin/chromium')?'/usr/bin/chromium':chromium.executablePath()),headless:true,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-dev-shm-usage']});
 const results=[];const context=await browser.newContext({viewport:{width:1280,height:720}});const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 async function check(name,fn){try{await fn();results.push({name,passed:true});console.log('PASS',name);}catch(e){results.push({name,passed:false,error:e.message});console.log('FAIL',name,e.message);}}
 const state=()=>page.evaluate(()=>__qa.state());
 const visit=id=>page.evaluate(id=>__qa.visit(id),id);
 async function action(name){if(!await page.evaluate(e=>__qa.point(e),name))throw Error('No action '+name);await page.keyboard.press('KeyE');await page.waitForTimeout(150);if(await page.locator('#modal').isVisible())await page.getByRole('button',{name:'Continuar',exact:true}).click();}
 async function kills(event){let n=0;while((await state()).event===event){if(++n>90)throw Error('Unending wave '+event);let s=await state();if(s.mode!=='game'){await page.getByRole('button',{name:'Voltar ao checkpoint',exact:true}).click();s=await state();}const enemy=s.zombies[0];if(!enemy)throw Error('Missing zombie');await page.evaluate(id=>__qa.strikeAt(id),enemy.id);const before=(await state()).clock;await page.keyboard.press('KeyJ');await page.waitForFunction(t=>__qa.state().mode!=='game'||__qa.state().clock>t+.46,before);}}
 await page.goto((process.env.GAME_URL||'http://127.0.0.1:4173/')+'?qa=1&lite=1');
 await check('Nine missions completed with E, attack keys, finite waves and documents',async()=>{
  await page.getByRole('button',{name:'Nova aventura',exact:true}).click();await page.keyboard.press('Enter');
  await action('ground_gallery');await action('kitchen');await action('laboratory');await action('princess');
  await visit('main_hall');await action('alarm');await action('guard');await visit('laboratory');await action('princess');
  await visit('main_hall');await kills('hall_kill');await visit('laboratory');await kills('lab_kill');await action('window');
  // Actual input-only platform route is separately tested; these are event-location fixtures.
  await page.evaluate(()=>__qa.place(0,6.5,-13));await page.waitForFunction(()=>__qa.state().event==='roof');
  await page.evaluate(()=>__qa.place(3,6.5,0));await page.waitForFunction(()=>__qa.state().event==='court_kill');
  await kills('court_kill');await action('rescue');await action('key');await action('gate');
  if((await state()).room!=='laboratory')throw Error('Gate did not return to laboratory');
  for(const name of ['document','sample','terminal2','terminal0','terminal1','terminal2','princess'])await action(name);
  if((await state()).event!=='defense_kill')throw Error('Revelation failed');
  await visit('main_hall');await kills('defense_kill');await action('guard');await visit('laboratory');await action('princess');
  if((await state()).progress.q!==9)throw Error('Final objective did not complete');
  await page.screenshot({path:'docs/conclusion.png'});await visit('main_hall');await action('city');await action('gate');if((await state()).room!=='laboratory'||(await state()).progress.q!==9)throw Error('Recovered gate blocked or rewarded again');
 });
 await check('All 24 rooms have supported safe arrivals and exits',async()=>{
  const ids=JSON.parse(fs.readFileSync('src/rooms.json','utf8'));
  let count=0;for(const id of Object.keys(ids))for(const edge of ids[id].doors){await page.evaluate(([id,from])=>__qa.visit(id,from),[id,edge.target]);await page.waitForTimeout(40);const s=await state(),c=await page.evaluate(()=>__qa.collision());if(s.position[1]<-1||c.floors<1||c.solids<4||c.spawnBlocked||c.doorCount<1||Math.abs(s.position[1]-c.support)>.3)throw Error('Unsafe arrival '+id+' from '+edge.target+JSON.stringify({s,c}));count++;}if(count!==51)throw Error('Wrong portal coverage '+count);
 });
 await check('Malformed browser save is rejected without crash',async()=>{await page.evaluate(()=>localStorage.setItem('reino-doce-browser-v1','{"version":1,"progress":{"q":7,"o":99,"n":0}}'));await page.reload();if(!await page.getByRole('button',{name:'Continuar',exact:true}).isDisabled())throw Error('Bad save offered as valid');});
 await context.close();
 await check('Self-contained HTML runs with network offline',async()=>{const isolated=await browser.newContext({viewport:{width:1280,height:720}});await isolated.setOffline(true);const offline=await isolated.newPage();const failures=[];offline.on('pageerror',e=>failures.push(e.message));await offline.setContent(fs.readFileSync('dist/index.html','utf8'));await offline.getByRole('button',{name:'Nova aventura',exact:true}).click();await offline.keyboard.press('Enter');if(!await offline.locator('#hud').isVisible()||!(await offline.locator('#mission').textContent()).includes('MISSÃO 1'))throw Error('Offline start failed');await offline.waitForTimeout(2200);if(await offline.evaluate(()=>document.getElementById('game').getContext('webgl2').isContextLost()))throw Error('Offline WebGL context lost');await offline.screenshot({path:'docs/offline.png'});if(failures.length)throw Error(failures.join('\n'));await isolated.close();});
 results.push({name:'Direct file URL on managed Chromium',skipped:true,reason:'Confirmed ERR_BLOCKED_BY_ADMINISTRATOR on file:// navigation. Offline DOM render is tested separately; Windows file opening is not verified.'});
 await check('Touch controls move the character on mobile layout',async()=>{
  const mobile=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});const p=await mobile.newPage();p.on('pageerror',e=>errors.push(e.message));await p.goto((process.env.GAME_URL||'http://127.0.0.1:4173/')+'?qa=1&lite=1');await p.getByRole('button',{name:'Nova aventura',exact:true}).tap();await p.getByRole('button',{name:'Continuar',exact:true}).tap();
  const s=await p.evaluate(()=>__qa.state()),button=await p.locator('[data-key="KeyW"]').boundingBox();if(!button)throw Error('Missing touch arrows');const cdp=await mobile.newCDPSession(p);await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:button.x+button.width/2,y:button.y+button.height/2}]});await p.waitForFunction(t=>__qa.state().clock>t+.35,s.clock);await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});const after=await p.evaluate(()=>__qa.state());if(Math.abs(after.position[2]-s.position[2])<1.5)throw Error('Touch did not move Finn');await p.waitForTimeout(1200);await p.screenshot({path:'docs/touch.png'});await mobile.close();
 });
 await check('No browser runtime errors during full story',async()=>{if(errors.length)throw Error(errors.join('\n'));});
 fs.writeFileSync('docs/acceptance-results.json',JSON.stringify({browser:await browser.version(),results,errors},null,2));await browser.close();process.exitCode=results.some(r=>r.passed===false)?1:0;
})().catch(e=>{console.error(e);process.exit(1)});
