const {chromium}=require('playwright');
const fs=require('fs');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.BROWSER_EXECUTABLE || (fs.existsSync('/usr/bin/chromium')?'/usr/bin/chromium':chromium.executablePath()),headless:true,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-dev-shm-usage']});
 const context=await browser.newContext({viewport:{width:1280,height:720}});const page=await context.newPage();const errors=[];const results=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 async function check(name,fn){try{await fn();results.push({name,passed:true});console.log('PASS',name);}catch(e){results.push({name,passed:false,error:e.message});console.log('FAIL',name,e.message);}}
 const state=()=>page.evaluate(()=>__qa.state());
 const wait=ms=>page.waitForTimeout(ms);
 const fixture=(event,room)=>page.evaluate(([e,r])=>__qa.fixture(e,r),[event,room]);
 async function action(name){const title=await page.evaluate(e=>__qa.point(e),name);if(!title)throw Error('Missing action '+name);await wait(80);await page.keyboard.press('KeyE');await wait(120);if(await page.locator('#modal').isVisible())await page.getByRole('button',{name:'Continuar',exact:true}).click();await wait(120);}
 await page.goto((process.env.GAME_URL||'http://127.0.0.1:4173/')+'?qa=1&lite=1');await page.getByRole('button',{name:'Nova aventura',exact:true}).click();await page.getByRole('button',{name:'Continuar',exact:true}).click();await wait(300);
 await check('Starts in hall, movement and diagonal speed',async()=>{
  if((await state()).room!=='main_hall')throw Error('Wrong starting room');const a=(await state()).position;const startClock=(await state()).clock;await page.keyboard.down('KeyW');await page.waitForFunction(t=>__qa.state().clock>t+.35,startClock);await page.keyboard.up('KeyW');const b=(await state()).position;if(Math.hypot(a[0]-b[0],a[2]-b[2])<1.5)throw Error('No real keyboard movement');
  await page.evaluate(()=>__qa.place(0,0,4));const diagonalClock=(await state()).clock;await page.keyboard.down('KeyW');await page.keyboard.down('KeyD');await page.waitForFunction(t=>__qa.state().clock>t+.3,diagonalClock);await page.keyboard.up('KeyW');await page.keyboard.up('KeyD');const p=(await state()).position;if(Math.hypot(p[0],p[2]-4)>4)throw Error('Diagonal speed exceeds run speed');
 });
 await check('Real door chain and dialogue trigger',async()=>{await action('guard_intro');await action('ground_gallery');await action('kitchen');await action('laboratory');await action('princess');if((await state()).event!=='inspect_console')throw Error('Princess did not advance mission');});
 await page.screenshot({path:'docs/laboratory.png'});
 await check('Mission order blocks city exit and future actions',async()=>{await fixture('princess','main_hall');await action('city');if((await state()).room!=='main_hall')throw Error('Escaped before objectives');await fixture('document','laboratory');if(await page.evaluate(()=>__qa.point('sample'))!==null)throw Error('Future action was exposed');if((await state()).event!=='document')throw Error('Out of order objective accepted');});
 await check('Puzzle wrong order reset and correct order',async()=>{await fixture('puzzle','laboratory');await action('terminal2');if((await state()).event!=='puzzle')throw Error('Wrong order completed');for(const e of ['terminal0','terminal1','terminal2'])await action(e);if((await state()).event!=='dials')throw Error('Correct order failed');});
 await check('Combat, invulnerability and finite invasion',async()=>{
  await fixture('hall_kill','main_hall');let total=0;
  while((await state()).event==='hall_kill'){
   const z=(await state()).zombies[0];if(!z)throw Error('No wave targets');await page.evaluate(id=>__qa.strikeAt(id),z.id);const time=(await state()).clock;await page.keyboard.press('KeyJ');await page.waitForFunction(t=>__qa.state().mode!=='game'||__qa.state().clock>t+.45,time);total++;if(total>12)throw Error('Wave did not end');
  }
  if((await state()).event!=='lab_kill')throw Error('Wave not counted');
 });
 await check('Window and roof playable with actual input',async()=>{
  await fixture('window','laboratory');await action('window');await page.evaluate(()=>__qa.setCamera(0));
  let jumps=0;
  for(const [x,z,y] of [[0,-13,6.5],[1,-6,6.5],[3,0,6.5],[3,6,5],[3,11,3.5],[3,16,2],[3,21,.5]]){
   let reached=false;
   for(let i=0;i<180;i++){
    const s=await state(),dx=x-s.position[0],dz=z-s.position[2];if(s.position[2]>=z-.5&&Math.abs(dx)<2){reached=true;break;}
    const jump=s.grounded&&i%4===0;if(jump)jumps++;
    await page.evaluate(({dx,dz,jump})=>{
     for(const code of ['KeyW','KeyS','KeyA','KeyD'])dispatchEvent(new KeyboardEvent('keyup',{code}));
     if(Math.abs(dx)>.25)dispatchEvent(new KeyboardEvent('keydown',{code:dx>0?'KeyD':'KeyA'}));
     if(Math.abs(dz)>.25)dispatchEvent(new KeyboardEvent('keydown',{code:dz>0?'KeyS':'KeyW'}));
     if(jump){dispatchEvent(new KeyboardEvent('keydown',{code:'Space'}));dispatchEvent(new KeyboardEvent('keyup',{code:'Space'}));}
     // Imported geometry can make software rendering much slower than wall-time polling.
     // Advance the real fixed-step physics while keeping keyboard input and collisions.
     for(let n=0;n<6;n++)__qa.step(1/60);
    },{dx,dz,jump});await wait(100);
   }
   if(!reached)throw Error('Unreachable platform '+[x,z]+' at '+JSON.stringify((await state()).position));
   await page.evaluate(()=>{for(const code of ['KeyW','KeyS','KeyA','KeyD'])dispatchEvent(new KeyboardEvent('keyup',{code}));});
   await page.evaluate(y=>{for(let n=0;n<180;n++){const s=__qa.state();if(s.grounded&&Math.abs(s.position[1]-y)<.15)return;__qa.step(1/60);}},y);const landed=await state();if(!landed.grounded||Math.abs(landed.position[1]-y)>.15)throw Error('Wrong platform landing '+JSON.stringify(landed));if((await state()).event==='reunite')await action('reunite');
  }
  for(const k of ['KeyW','KeyS','KeyA','KeyD'])await page.keyboard.up(k);
  if((await state()).event!=='ladder_prepare')throw Error('Roof triggers failed');if(jumps<1)throw Error('Jump not exercised');
 });
 await page.screenshot({path:'docs/courtyard.png'});
 await check('Original GLB renders, 374 preserved meshes',async()=>{await page.evaluate(()=>__qa.original());await page.waitForFunction(()=>__qa.model()!=null,null,{timeout:30000});const count=await page.evaluate(()=>{let n=0;__qa.model().traverse(o=>{if(o.isMesh)n++});return n});if(count!==374)throw Error('Wrong model mesh count '+count);});
 await check('Save/reload restores objective and roof checkpoint',async()=>{await page.evaluate(()=>__qa.save());const beforeState=await state(),before=beforeState.progress;await page.reload();await page.getByRole('button',{name:'Continuar',exact:true}).click();await wait(300);const after=await state();if(JSON.stringify(after.progress)!==JSON.stringify(before))throw Error('Progress lost');if(Math.hypot(...after.position.map((n,i)=>n-beforeState.position[i]))>.4||after.event!==beforeState.event)throw Error('Roof checkpoint or objective lost');});
 await check('Pause freezes movement and mobile viewport fits',async()=>{await page.keyboard.press('Escape');const before=(await state()).position;await page.keyboard.down('KeyW');await wait(300);await page.keyboard.up('KeyW');if(JSON.stringify(before)!==JSON.stringify((await state()).position))throw Error('Movement continued during pause');await page.setViewportSize({width:390,height:844});await page.screenshot({path:'docs/mobile.png'});if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error('Horizontal overflow');await page.getByRole('button',{name:'Continuar',exact:true}).click();await page.setViewportSize({width:1280,height:720});});
 await check('Browser JS has no uncaught/render errors',async()=>{if(errors.length)throw Error(errors.join('\n'));});
 fs.writeFileSync('docs/browser-results.json',JSON.stringify({browser:await browser.version(),results,errors},null,2));await browser.close();if(results.some(r=>!r.passed))process.exitCode=1;
})().catch(e=>{console.error(e);process.exit(1)});
