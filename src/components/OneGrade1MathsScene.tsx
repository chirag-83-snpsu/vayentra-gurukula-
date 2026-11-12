import React,{useEffect,useState} from 'react';
import {Eye,Hand,MousePointerClick} from 'lucide-react';
import '../styles/one-grade1-maths.css';

export type PictureScene={
 kind:'position'|'sequence'|'matching'|'sorting';
 anchor:string;
 actor:string;
 positions:string[];
 prompt:string;
};
type Props={scene:PictureScene;title:string};
const spokenLabels:Record<string,string>={
 on:'on top',under:'underneath',inside:'inside',outside:'outside',
 above:'above',below:'below',near:'nearby',far:'far away',beside:'beside',
 front:'in front',behind:'behind',top:'at the top',bottom:'at the bottom',
 wake:'waking up',wash:'washing paws',eat:'eating breakfast',
 colour:'matching by colour',shape:'matching by shape',size:'matching by size'
};
const positions:Record<string,[number,number]>={
 on:[285,107],under:[285,254],inside:[284,213],outside:[449,234],
 above:[285,58],below:[325,274],near:[390,230],far:[83,235],
 beside:[434,232],front:[281,267],behind:[285,140],
 top:[282,87],bottom:[282,249]
};
const clampIndex=(scene:PictureScene)=>scene.positions[0]||'on';
const Paw:React.FC<{x:number;y:number}>=({x,y})=><g transform={'translate('+x+' '+y+')'}>
 <ellipse cx="0" cy="17" rx="44" ry="24" fill="#d59a61" stroke="#925d3e" strokeWidth="3"/>
 <path d="M-23 -2 L-26 -30 L-8 -15 L7 -33 L21 -6" fill="#d59a61" stroke="#925d3e" strokeWidth="3" strokeLinejoin="round"/>
 <ellipse cx="0" cy="-1" rx="30" ry="27" fill="#dca66e" stroke="#925d3e" strokeWidth="3"/>
 <path d="M-8 -27 L-5 -12 L-16 -13 Z M11 -26 L17 -12 L5 -14 Z" fill="#f4c9ad"/>
 <circle cx="-11" cy="-4" r="3.7" fill="#273f5d"/><circle cx="11" cy="-4" r="3.7" fill="#273f5d"/>
 <path d="M-4 5 L4 5 L0 9 Z" fill="#9d5b5f"/>
 <path d="M0 9q-7 7-13 3 M0 9q7 7 13 3" stroke="#784a49" fill="none" strokeWidth="2" strokeLinecap="round"/>
 <path d="M-28 9 L-47 5 M-26 14L-47 16 M28 9L47 5 M26 14L47 16" stroke="#885c4d" strokeWidth="1.5"/>
 <path d="M38 25 Q66 32 63 1" stroke="#b67d51" strokeWidth="9" fill="none" strokeLinecap="round"/>
 </g>;
const Star:React.FC<{x:number;y:number}>=({x,y})=><polygon
 points="0,-27 7,-9 28,-9 11,4 18,25 0,13 -18,25 -11,4 -28,-9 -7,-9"
 transform={'translate('+x+' '+y+')'} fill="#f6cb62" stroke="#c38b35" strokeWidth="3"/>;
const Kite:React.FC<{x:number;y:number}>=({x,y})=><g transform={'translate('+x+' '+y+')'}>
 <path d="M0 -35 L27 0 L0 34 L-27 0 Z" fill="#faac84" stroke="#bd715c" strokeWidth="3"/>
 <path d="M-27 0 H27 M0 -35V34" stroke="#f7e0b5" strokeWidth="3"/>
 <path d="M0 34 q7 22 0 43" stroke="#a77c61" strokeWidth="2.5" fill="none"/>
 <path d="M-11 53L0 58L12 53 M-10 73L0 77L10 73" stroke="#9b6f91" strokeWidth="3" fill="none"/>
 </g>;
const ArtObject:React.FC<{scene:PictureScene;point:[number,number]}>=({scene,point})=>
 scene.actor==='star'?<Star x={point[0]} y={point[1]}/>:scene.actor==='kite'?<Kite x={point[0]} y={point[1]}/>:<Paw x={point[0]} y={point[1]}/>;
const Anchor:React.FC<{anchor:string}>=({anchor})=>{
 if(anchor==='basket')return <g>
  <ellipse cx="284" cy="236" rx="103" ry="31" fill="#f9edcb" stroke="#a57c4c" strokeWidth="4"/>
  <path d="M181 235L197 290Q283 320 371 290L387 235" fill="#eecb8e" stroke="#b18453" strokeWidth="4"/>
  <path d="M200 246L367 282 M192 267L364 294 M369 246L202 287" stroke="#d6aa6d" strokeWidth="6"/>
  <ellipse cx="284" cy="224" rx="103" ry="28" fill="#fff4da" stroke="#b18453" strokeWidth="4"/>
  <path d="M225 226Q225 148 284 150Q343 148 343 226" stroke="#b18453" strokeWidth="8" fill="none"/>
 </g>;
 if(anchor==='tree')return <g>
  <rect x="273" y="168" width="36" height="123" rx="8" fill="#a06d4b"/>
  <circle cx="290" cy="174" r="70" fill="#8ac68d" stroke="#4e955f" strokeWidth="4"/>
  <circle cx="238" cy="187" r="44" fill="#99d09e"/>
  <circle cx="344" cy="187" r="44" fill="#99d09e"/>
  <path d="M0 296Q200 278 600 294" stroke="#83b18a" strokeWidth="4" fill="none"/>
 </g>;
 if(anchor==='shelf')return <g>
  <rect x="170" y="109" width="235" height="177" rx="8" fill="#f4dec1" stroke="#9e734c" strokeWidth="6"/>
  <path d="M170 181H405 M170 246H405" stroke="#9e734c" strokeWidth="8"/>
  <rect x="196" y="136" width="22" height="43" rx="2" fill="#89b4db"/>
  <rect x="221" y="142" width="17" height="38" rx="2" fill="#f0b57c"/>
  <rect x="345" y="202" width="37" height="43" rx="3" fill="#8abf99"/>
  </g>;
 if(anchor==='bench')return <g>
  <path d="M191 163H380 M191 193H380" stroke="#b18057" strokeWidth="19" strokeLinecap="round"/>
  <path d="M208 193L190 269 M362 193L381 269" stroke="#9c704d" strokeWidth="15" strokeLinecap="round"/>
  <rect x="187" y="146" width="198" height="13" rx="5" fill="#d6a874"/>
 </g>;
 return <g>
  <rect x="155" y="138" width="260" height="24" rx="9" fill="#e5b783" stroke="#af7a4d" strokeWidth="3"/>
  <rect x="175" y="161" width="25" height="117" rx="6" fill="#d29b67"/>
  <rect x="370" y="161" width="25" height="117" rx="6" fill="#d29b67"/>
  <rect x="218" y="118" width="56" height="20" rx="4" fill="#b4d4f8" stroke="#7c9fcf" strokeWidth="2"/>
  <path d="M64 295H538" stroke="#d4dfed" strokeWidth="3"/>
 </g>;
};
const ShapeGallery:React.FC<{rule:string}>=({rule})=>{
 const items=[
  {x:105,y:120,color:'#eb7269',kind:'circle',size:34},
  {x:225,y:120,color:'#eb7269',kind:'square',size:37},
  {x:345,y:120,color:'#7eb5e9',kind:'circle',size:37},
  {x:465,y:120,color:'#7eb5e9',kind:'square',size:25},
 ];
 const matching=rule==='colour'?[0,1]:rule==='shape'?[0,2]:[1,2];
 return <svg viewBox="0 0 580 250" role="img" aria-label={'Four coloured shapes demonstrating matching by '+rule}>
  {items.map((x,i)=><g key={i}>
   <rect x={x.x-49} y="62" width="98" height="122" rx="16"
    fill={matching.includes(i)?'#eaf3ff':'#fff'} stroke={matching.includes(i)?'#396cab':'#e4eaf3'} strokeWidth={matching.includes(i)?3:2}/>
   {x.kind==='circle'?<circle cx={x.x} cy={x.y} r={x.size} fill={x.color}/>:
    <rect x={x.x-x.size} y={x.y-x.size} width={x.size*2} height={x.size*2} rx="7" fill={x.color}/>}
   <text x={x.x} y="209" textAnchor="middle" fontSize="15" fill="#365982">{x.kind}</text>
  </g>)}
  <text x="289" y="32" textAnchor="middle" fontSize="16" fontWeight="700" fill="#2b5185">Look at colour, shape and size</text>
 </svg>;
};
const Morning:React.FC<{selected:string}>=({selected})=>{
 const labels=[['wake','Wake up','☀️'],['wash','Wash paws','🫧'],['eat','Eat breakfast','🍎']];
 return <div className="vg1m-morning" role="img" aria-label="Three pictures in order: wake up, wash, then eat breakfast">
  {labels.map(([key,label,emoji],i)=><div key={key} className={'vg1m-morning-step'+(key===selected?' active':'')}>
   <span className="vg1m-morning-number">{i+1}</span><span className="vg1m-morning-icon" aria-hidden="true">{emoji}</span>
   <strong>{label}</strong>
  </div>)}
 </div>;
};
export const OneGrade1MathsScene:React.FC<Props>=({scene,title})=>{
 const [selected,setSelected]=useState(()=>clampIndex(scene));
 useEffect(()=>setSelected(clampIndex(scene)),[scene.kind,scene.anchor,scene.positions.join('|')]);
 const mode=selected in positions?selected:'on';
 const point=positions[mode]||[285,107];
 const isPosition=scene.kind==='position';
 return <section className="vg1m-scene" aria-label={title+' picture explorer'}>
   <div className="vg1m-scene-top"><span><Eye size={17}/> LOOK · TOUCH · SAY</span>
    <span className="vg1m-scene-counter">No score · Just explore</span></div>
   <h4>{scene.prompt}</h4>
   {isPosition?<div className="vg1m-picture" aria-live="polite">
    <svg viewBox="0 0 600 320" role="img" aria-label={'Original picture: '+scene.actor+' is '+(spokenLabels[selected]||selected)+' relative to '+scene.anchor}>
     <rect x="1" y="1" width="598" height="318" rx="22" fill="#f4f9ff"/>
     <circle cx="75" cy="65" r="27" fill="#ffde92"/>
     <path d="M0 295Q285 271 600 295V320H0Z" fill="#e6f0e8"/>
     {selected==='behind'?<ArtObject scene={scene} point={point}/>:null}
     <Anchor anchor={scene.anchor}/>
     {selected==='behind'?null:<ArtObject scene={scene} point={point}/>}
     {scene.anchor==='basket'&&selected==='inside'&&<path
      d="M181 235 Q284 285 387 235 L370 289 Q284 315 198 289 Z"
      fill="#eecb8e" stroke="#b18453" strokeWidth="3" opacity=".95"/>}
    </svg>
   </div>:scene.kind==='sequence'?<Morning selected={selected}/>:<ShapeGallery rule={selected}/>}
   <div className="vg1m-choice-heading"><MousePointerClick size={16}/> Tap to change the picture</div>
   <div className="vg1m-controls" role="group" aria-label="Explore different positions or rules">
    {scene.positions.map(p=><button type="button" key={p} aria-pressed={selected===p}
     className={selected===p?'active':''} onClick={()=>setSelected(p)}>
     <span>{p==='front'?'In front':p[0].toUpperCase()+p.slice(1)}</span>
    </button>)}
   </div>
   <div className="vg1m-scene-response" role="status">
    <Hand size={17}/> {scene.kind==='position'?'Now the '+(scene.actor==='cat'?'cat':scene.actor)+' is '+(spokenLabels[selected]||selected)+' relative to the '+scene.anchor+'.':
     scene.kind==='sequence'?'You selected '+(spokenLabels[selected]||selected)+'. Which event comes before and after it?':
     'Now look for '+(spokenLabels[selected]||selected)+'. Explain your matching rule.'}
   </div>
 </section>;
};