import React,{useEffect,useState} from 'react';
import {ChevronRight} from 'lucide-react';
import '../styles/one-concept-studio.css';

export const ShapesScene:React.FC<{visual:string}>=({visual})=>{
 const [details,setDetails]=useState(false);
 useEffect(()=>setDetails(false),[visual]);
 return <section className="vgs-visual">
  <div className="vgs-visual-top"><span>INTERACTIVE VISUAL / {visual.toUpperCase()}</span>
   <button type="button" onClick={()=>setDetails(!details)}>{details?'Hide exploration':'Explore the drawing'} <ChevronRight size={15}/></button>
  </div>
  <svg viewBox="0 0 560 240" role="img" aria-label={
   visual==='circle'?'Circle showing its radius and diameter':
   visual==='angles'?'Acute, right and obtuse angles':
   visual==='net'?'Connected six-square cube net':
   visual==='families'?'Prism alongside a pyramid':
   visual==='solids'?'Cube, cylinder and sphere':
   'Cube with labeled face, edge and vertex'
  } xmlns="http://www.w3.org/2000/svg">
   <defs><linearGradient id="vgs-blue"><stop stopColor="#b9d7ff"/><stop offset="1" stopColor="#7aa7df"/></linearGradient><linearGradient id="vgs-gold"><stop stopColor="#f5e1ab"/><stop offset="1" stopColor="#dfae60"/></linearGradient></defs>
   {visual==='circle'?<>
    <circle cx="278" cy="120" r="90" fill="#e7f2ff" stroke="#285d9f" strokeWidth="4"/>
    <line x1="188" y1="120" x2="368" y2="120" stroke="#d2a355" strokeWidth="5"/>
    <line x1="278" y1="120" x2="342" y2="56" stroke="#26559e" strokeWidth="5"/>
    <circle cx="278" cy="120" r="5" fill="#173d81"/>
    <text x="285" y="145" fill="#183d76" fontSize="14">Centre</text>
    <text x="318" y="67" fill="#214e8d" fontSize="16" fontWeight="700">Radius</text>
    <text x="236" y="159" fill="#9c7338" fontSize="16" fontWeight="700">Diameter</text>
   </>:visual==='net'?<>
    {[[179,9],[179,64],[179,119],[179,174],[124,64],[234,64]].map(([x,y],i)=>
      <rect key={i} x={x} y={y} width="55" height="55" fill={i===1?'url(#vgs-gold)':'url(#vgs-blue)'} stroke="#25548e" strokeWidth="2.5"/>)}
    <text x="328" y="109" fill="#285185" fontSize="18" fontWeight="700">6 connected squares</text>
    <text x="328" y="132" fill="#6b819b" fontSize="13">One possible cube net</text>
   </>:visual==='angles'?<>
    {[[112,160,62,100,'Acute'],[282,160,282,75,'Right'],[456,160,516,62,'Obtuse']].map(([ox,oy,px,py,label],i)=><g key={i}>
     <path d={'M '+(Number(ox)-65)+' '+oy+' L '+ox+' '+oy+' L '+px+' '+py} fill="none" stroke={i===1?'#c79645':'#275a9e'} strokeWidth="6" strokeLinecap="round"/>
     <circle cx={Number(ox)} cy={Number(oy)} r="5" fill="#153978"/>
     <text x={Number(ox)-31} y="201" fill="#274979" fontSize="16" fontWeight="700">{label}</text>
    </g>)}
   </>:visual==='families'?<>
    <polygon points="64,160 131,119 202,160 135,205" fill="#b9d6f8" stroke="#244e88" strokeWidth="3"/>
    <polygon points="64,82 131,41 202,82 135,127" fill="#8eb8ed" stroke="#244e88" strokeWidth="3"/>
    <path d="M64 82V160M135 127V205M202 82V160" stroke="#244e88" strokeWidth="4"/>
    <text x="110" y="230" fill="#284b7a" fontSize="16">Prism</text>
    <polygon points="322,170 416,202 495,170 400,140" fill="#b7d5f8" stroke="#244e88" strokeWidth="3"/>
    <path d="M322 170 L410 37 L495 170 M410 37L416 202" fill="none" stroke="#be8b44" strokeWidth="4"/>
    <text x="387" y="230" fill="#284b7a" fontSize="16">Pyramid</text>
   </>:<>
    <polygon points="106,105 180,65 250,105 177,147" fill="#bbd8fb" stroke="#28558f" strokeWidth="3"/>
    <polygon points="106,105 177,147 177,217 106,177" fill="#83b1ed" stroke="#28558f" strokeWidth="3"/>
    <polygon points="177,147 250,105 250,177 177,217" fill="#d0e4ff" stroke="#28558f" strokeWidth="3"/>
    {visual==='solids'?<>
     <ellipse cx="362" cy="79" rx="40" ry="14" fill="#b8d8fa" stroke="#28558f" strokeWidth="3"/>
     <path d="M322 79V160 A40 14 0 0 0 402 160V79" fill="#95bdec" stroke="#28558f" strokeWidth="3"/>
     <ellipse cx="362" cy="160" rx="40" ry="14" fill="#95bdec" stroke="#28558f" strokeWidth="3"/>
     <circle cx="477" cy="128" r="44" fill="#f3d595" stroke="#b88946" strokeWidth="3"/>
     <text x="135" y="238" fill="#214878" fontSize="14">Cube</text>
     <text x="335" y="203" fill="#214878" fontSize="14">Cylinder</text>
     <text x="450" y="196" fill="#214878" fontSize="14">Sphere</text>
    </>:<>
     <circle cx="106" cy="105" r="7" fill="#be8741"/>
     <path d="M245 106L310 79M179 182L309 155M106 105L55 53" fill="none" stroke="#be8741" strokeWidth="3"/>
     <text x="318" y="85" fill="#234677" fontSize="16">Face</text>
     <text x="319" y="162" fill="#234677" fontSize="16">Edge</text>
     <text x="16" y="45" fill="#234677" fontSize="16">Vertex</text>
    </>}
   </>}
  </svg>
  {details&&<p role="note" className="vgs-visual-note">Describe what you see without reading a definition. Can you identify, trace, compare or measure the shape?</p>}
 </section>;
};
