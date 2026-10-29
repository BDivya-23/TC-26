/* TwinCity avatar creator. Load AFTER app.js and BEFORE game-layer.js.
   Opens between START MISSION and the map. Saved to localStorage('twinCityAvatar')
   and exposed as window.twinCityPlayer for the map screen to use later. */
(function(){
const SK=['#ffe0bd','#f1c27d','#d9a066','#b9783f','#8d5524','#5c3a21','#94a3b8','#fbbf24'];
const SKL=['Fair','Wheatish','Tan','Brown','Deep','Ebony','Cyber','Golden'];
const HC=['#111827','#3b2314','#7c4a21','#d6a84f','#9ca3af','#a855f7','#22d3ee'];
const HAIR=['Bald','Crop','Quiff','Curly','Long','Braid'];
const OUT=['Classic Mayor','Site Engineer','Eco Warrior','Cyber Mayor','Yellow Jersey','Tamil Pride'];
const HEAD=['None','Hard Hat','Cap','Crown'];
const EYES=['None','Round','Shades','Visor'];
const AURA=[null,'#22d3ee','#fbbf24','#a855f7'], AURAL=['None','Neon','Gold','Violet'];
const PET=['','🤖','🐕','🦜'], PETL=['None','Drone','Kutty','Parrot'];
const T='M36 245C36 188 62 156 100 156 138 156 164 188 164 245Z';
const FACE='40 28 120 140', BODY='20 120 160 125';
const TABS=[
 {k:'skin',n:'SKIN',l:SKL,vb:FACE},{k:'hair',n:'HAIR',l:HAIR,vb:FACE},
 {k:'outfit',n:'OUTFIT',l:OUT,vb:BODY},{k:'head',n:'HEADGEAR',l:HEAD,vb:FACE},
 {k:'eyes',n:'EYEWEAR',l:EYES,vb:FACE},{k:'aura',n:'AURA',l:AURAL,vb:null},
 {k:'pet',n:'COMPANION',l:PETL}
];
let uid=0, tab=0, cb={}, built=false, S;
try{ S=JSON.parse(localStorage.getItem('twinCityAvatar')||'null'); }catch(e){}
S=Object.assign({name:'',skin:1,hair:1,hc:0,outfit:0,head:0,eyes:0,aura:1,pet:0},S||{});

function R(s,vb){
 const id='ag'+(uid++), k=SK[s.skin], c=HC[s.hc], a=AURA[s.aura];
 const crop=`<path d="M54 98C50 50 150 50 146 98 138 78 118 68 100 68 82 68 62 78 54 98Z" fill="${c}"/>`;
 const back=['','','','',`<path d="M50 100C42 170 54 205 72 208H128C146 205 158 170 150 100Z" fill="${c}"/>`,''][s.hair];
 const front=['',crop,
  crop+`<path d="M60 82C58 36 124 28 142 68 120 58 88 58 60 82Z" fill="${c}"/>`,
  `<g fill="${c}"><circle cx="64" cy="78" r="16"/><circle cx="84" cy="60" r="18"/><circle cx="110" cy="58" r="18"/><circle cx="134" cy="76" r="16"/><circle cx="100" cy="72" r="16"/></g>`,
  crop,
  crop+`<path d="M142 118C166 150 152 190 142 216" stroke="${c}" stroke-width="15" fill="none" stroke-linecap="round"/>`][s.hair];
 const outfit=[
  `<path d="${T}" fill="#1e3a8a"/><path d="M76 157L100 218 124 157Z" fill="#f8fafc"/><path d="M100 168L94 180 100 214 106 180Z" fill="#dc2626"/><circle cx="126" cy="196" r="4" fill="#fbbf24"/>`,
  `<path d="${T}" fill="#64748b"/><path d="M64 170L88 158 100 200 112 158 136 170 150 245H50Z" fill="#f97316"/><path d="M58 218H142" stroke="#e5e7eb" stroke-width="7"/>`,
  `<path d="${T}" fill="#16a34a"/><path d="M68 160C80 192 120 192 132 160 120 172 80 172 68 160Z" fill="#14532d"/><path d="M92 218C90 200 112 196 112 196 112 196 114 216 96 218Z" fill="#bbf7d0"/>`,
  `<path d="${T}" fill="#0f172a"/><path d="M66 176L100 204 134 176M100 204V245" stroke="#22d3ee" stroke-width="3" fill="none"/><circle cx="100" cy="204" r="5" fill="#22d3ee"/>`,
  `<path d="${T}" fill="#facc15"/><path d="M78 158Q100 184 122 158" stroke="#1d4ed8" stroke-width="8" fill="none"/><text x="100" y="228" text-anchor="middle" font-size="28" font-weight="800" fill="#1d4ed8" font-family="Orbitron,sans-serif">10</text>`,
  `<path d="${T}" fill="#f8fafc"/><path d="M60 162L92 156 160 232V245H132Z" fill="#fef3c7" stroke="#f59e0b" stroke-width="5"/>`][s.outfit];
 const face=`<circle cx="54" cy="104" r="8" fill="${k}"/><circle cx="146" cy="104" r="8" fill="${k}"/><ellipse cx="100" cy="100" rx="46" ry="50" fill="${k}"/><circle cx="84" cy="104" r="4.5" fill="#111"/><circle cx="116" cy="104" r="4.5" fill="#111"/><path d="M76 92Q84 87 92 92M108 92Q116 87 124 92" stroke="#0004" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M88 124Q100 136 112 124" stroke="#7f1d1d" stroke-width="3" fill="none" stroke-linecap="round"/><circle cx="72" cy="118" r="6" fill="#f472b6" opacity=".25"/><circle cx="128" cy="118" r="6" fill="#f472b6" opacity=".25"/>`;
 const eyes=['',
  `<g stroke="#111" stroke-width="3" fill="rgba(255,255,255,.15)"><circle cx="84" cy="104" r="12"/><circle cx="116" cy="104" r="12"/><path d="M96 104H104"/></g>`,
  `<g fill="#111"><rect x="68" y="94" width="30" height="18" rx="7"/><rect x="102" y="94" width="30" height="18" rx="7"/><rect x="96" y="100" width="8" height="3"/></g>`,
  `<rect x="64" y="94" width="72" height="18" rx="9" fill="rgba(34,211,238,.55)" stroke="#22d3ee" stroke-width="2"/>`][s.eyes];
 const head=['',
  `<path d="M54 76C54 38 146 38 146 76Z" fill="#fbbf24"/><rect x="48" y="74" width="104" height="9" rx="4" fill="#f59e0b"/><rect x="93" y="40" width="14" height="34" fill="#f59e0b"/>`,
  `<path d="M55 80C56 44 144 44 145 80Z" fill="#ef4444"/><path d="M100 80H162C162 92 112 90 100 86Z" fill="#b91c1c"/>`,
  `<path d="M64 64L70 32 88 52 100 26 112 52 130 32 136 64Z" fill="#fbbf24" stroke="#f59e0b" stroke-width="3"/><circle cx="100" cy="52" r="4" fill="#ef4444"/>`][s.head];
 const aura=a?`<defs><radialGradient id="${id}"><stop offset="55%" stop-color="${a}" stop-opacity=".55"/><stop offset="100%" stop-color="${a}" stop-opacity="0"/></radialGradient></defs><circle cx="100" cy="125" r="110" fill="url(#${id})"/>`:'';
 return `<svg viewBox="${vb||'0 0 200 245'}" xmlns="http://www.w3.org/2000/svg">${aura}${back}<rect x="88" y="138" width="24" height="26" fill="${k}"/>${outfit}${face}${front}${eyes}${head}</svg>`;
}

const $=id=>document.getElementById(id);
function save(){ try{ localStorage.setItem('twinCityAvatar',JSON.stringify(S)); }catch(e){} window.twinCityPlayer=S; }
function snd(){ cb.sfx && cb.sfx.click(); }

function draw(){
 $('av-prev').innerHTML=R(S);
 $('av-pet').textContent=PET[S.pet];
 $('av-title').textContent=OUT[S.outfit].toUpperCase();
 $('av-tabs').innerHTML=TABS.map((x,i)=>`<button class="av-tab${i==tab?' on':''}" data-t="${i}">${x.n}</button>`).join('');
 const t=TABS[tab]; let h='';
 if(t.k==='hair') h+=`<div class="av-sw">${HC.map((c,i)=>`<button data-c="${i}" class="${i==S.hc?'on':''}" style="background:${c}"></button>`).join('')}</div>`;
 h+=t.l.map((l,i)=>`<button class="av-opt${i==S[t.k]?' on':''}" data-i="${i}">${t.k==='pet'?`<span class="av-em">${PET[i]||'✖'}</span>`:R(Object.assign({},S,{[t.k]:i}),t.vb)}<small>${l}</small></button>`).join('');
 $('av-grid').innerHTML=h;
}

function build(){
 built=true;
 document.body.insertAdjacentHTML('beforeend',`
<div id="gl-avatar" class="gl-screen" style="display:none">
 <div class="gl-grid"></div>
 <div class="av-wrap">
  <div class="av-stage">
   <h2>CREATE YOUR MAYOR</h2>
   <div class="av-ped"><div id="av-pet"></div><div id="av-prev"></div></div>
   <input id="av-name" maxlength="12" placeholder="YOUR NAME" autocomplete="off">
   <div id="av-title"></div>
  </div>
  <div class="av-panel">
   <div class="av-tabs" id="av-tabs"></div>
   <div class="av-grid" id="av-grid"></div>
   <div class="av-actions">
    <button class="gl-toggle" id="av-back">← BACK</button>
    <button class="gl-toggle" id="av-rand">🎲 RANDOMIZE</button>
    <button class="gl-btn" id="av-go">ENTER CITY ▶</button>
   </div>
  </div>
 </div>
</div>`);
 const el=$('gl-avatar');
 el.addEventListener('click',e=>{
  const b=e.target.closest('button'); if(!b) return;
  if(b.dataset.t!==undefined){ tab=+b.dataset.t; snd(); draw(); }
  else if(b.dataset.c!==undefined){ S.hc=+b.dataset.c; snd(); draw(); }
  else if(b.dataset.i!==undefined){ S[TABS[tab].k]=+b.dataset.i; snd(); draw(); }
 });
 $('av-name').oninput=e=>{ S.name=e.target.value; };
 $('av-name').onkeydown=e=>{ if(e.key==='Enter') $('av-go').click(); };
 $('av-rand').onclick=()=>{
  const r=n=>Math.floor(Math.random()*n);
  Object.assign(S,{skin:r(8),hair:r(6),hc:r(7),outfit:r(6),head:r(4),eyes:r(4),aura:r(4),pet:r(4)});
  snd(); draw();
 };
 $('av-back').onclick=()=>{ snd(); el.style.display='none'; cb.onBack&&cb.onBack(); };
 $('av-go').onclick=()=>{
  S.name=($('av-name').value.trim()||'MAYOR').toUpperCase();
  save(); el.style.display='none'; cb.onDone&&cb.onDone(S);
 };
}

window.TwinAvatar={
 open(o){ cb=o||{}; if(!built) build(); $('av-name').value=S.name||''; $('gl-avatar').style.display='flex'; draw(); },
 get:()=>S,
 svg:()=>R(S)
};
window.twinCityPlayer=S;
})();
