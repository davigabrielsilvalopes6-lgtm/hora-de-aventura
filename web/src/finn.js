import * as T from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
// Procedural fan model. Front is -Z; feet rest on Y=0.
export function createFinn(){
 const root=new T.Group();root.name='Finn';
 const colors={skin:0xffdfbf,white:0xfffdf5,shirt:0x009dca,shorts:0x0964c9,black:0x151820,green:0x56bc20,lime:0x9ce85b,metal:0xb9dfe8,darkMetal:0x76a6ba};
 const materials=Object.fromEntries(Object.entries(colors).map(([k,v])=>[k,new T.MeshStandardMaterial({color:v,roughness:.85})]));
 const geo={sphere:new T.SphereGeometry(1,24,16),capsule:new T.CapsuleGeometry(1,1,6,16),rounded:new RoundedBoxGeometry(1,1,1,4,.12)};
 function part(name,parent,type,pos,scale,color){const m=new T.Mesh(geo[type],materials[color]);m.name=name;m.position.set(...pos);m.scale.set(...scale);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
 function egg(name,parent,pos,scale,color){return part(name,parent,'sphere',pos,scale,color);}
 function limb(name,x,y){const g=new T.Group();g.name=name;g.position.set(x,y,0);root.add(g);return g;}
 egg('White hood',root,[0,1.59,0],[.32,.31,.19],'white');
 for(const x of [-.23,.23])part('Rounded hat ear',root,'capsule',[x,1.86,0],[.075,.09,.075],'white');
 egg('Oval face',root,[0,1.6,-.165],[.247,.211,.065],'skin');
 for(const x of [-.09,.09])egg('Eye',root,[x,1.63,-.226],[.014,.025,.008],'black');
 const smile=new T.CatmullRomCurve3([new T.Vector3(-.035,1.548,-.229),new T.Vector3(0,1.544,-.232),new T.Vector3(.035,1.552,-.229)]);
 const mouth=new T.Mesh(new T.TubeGeometry(smile,12,.004,6,false),materials.black);mouth.name='Small smile';root.add(mouth);
 part('Blue T shirt',root,'rounded',[0,1.13,0],[.52,.56,.31],'shirt');
 part('Shorts waist',root,'rounded',[0,.81,0],[.49,.2,.3],'shorts');
 const legs=[];for(const x of [-.14,.14]){const leg=limb(x<0?'Right leg':'Left leg',x,.82);legs.push(leg);
 part('Shorts leg',leg,'capsule',[0,-.12,0],[.102,.085,.125],'shorts');
 part('Bare shin',leg,'capsule',[0,-.46,0],[.045,.155,.045],'skin');
 egg('White sock cuff',leg,[0,-.69,0],[.076,.04,.068],'white');
 egg('Black shoe',leg,[0,-.755,-.044],[.085,.065,.145],'black');}
 const arms=[];for(const x of [-.3,.3]){const arm=limb(x>0?'Mechanical right arm':'Left arm',x,1.29);arms.push(arm);arm.rotation.z=x<0?-.1:.1;
 part('Short sleeve',arm,'capsule',[0,-.05,0],[.105,.065,.115],'shirt');
 part('Upper arm',arm,'capsule',[0,-.19,0],[.045,.06,.045],'skin');
 if(x>0){egg('Elbow joint',arm,[0,-.31,0],[.07,.065,.07],'darkMetal');part('Mechanical forearm',arm,'capsule',[0,-.43,0],[.062,.085,.064],'metal');
 egg('Wrist ring',arm,[0,-.56,0],[.075,.04,.075],'darkMetal');egg('Metal palm',arm,[0,-.63,0],[.07,.07,.042],'metal');
 for(const dx of [-.043,0,.043])part('Mechanical finger',arm,'capsule',[dx,-.713,-.006],[.013,.025,.015],'metal');
 part('Forearm highlight',arm,'capsule',[-.023,-.43,-.06],[.009,.062,.003],'white');
 }else{egg('Elbow',arm,[0,-.305,0],[.045,.05,.045],'skin');part('Forearm',arm,'capsule',[0,-.43,0],[.043,.095,.043],'skin');egg('Hand',arm,[0,-.63,0],[.05,.085,.03],'skin');for(const dx of [-.027,0,.027])part('Finger',arm,'capsule',[dx,-.7,0],[.012,.018,.015],'skin');}}
 egg('Green backpack',root,[0,1.22,.225],[.29,.34,.16],'green');egg('Light green backpack flap',root,[0,1.4,.30],[.29,.16,.095],'lime');
 for(const x of [-.23,.23])part('Backpack shoulder strap',root,'capsule',[x,1.25,.05],[.025,.105,.035],'green');
 root.userData={model:'Procedural Finn inspired by user reference',animation:'Articulated limb groups; no skeletal rig'};
 return {root,arms,legs,animate(time,moving,attacking=false){legs.forEach((g,i)=>g.rotation.x=moving?Math.sin(time+(i?Math.PI:0))*.55:0);arms.forEach((g,i)=>g.rotation.x=attacking&&i===1?1.3:moving?Math.sin(time+(i?0:Math.PI))*.4:0);}};
}
