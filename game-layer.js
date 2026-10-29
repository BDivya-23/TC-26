/* TwinCity game layer: add AFTER app.js. Reuses your existing game logic. */
(function(){
  const TOTAL = 10;
  let muted = false, prevSolved = 0, started = false, over = false, ac;

  // ---------- Sound (no audio files needed) ----------
  function beep(freq, dur, type='square', vol=.07, when=0){
    if(muted) return;
    ac = ac || new (window.AudioContext||window.webkitAudioContext)();
    const o=ac.createOscillator(), g=ac.createGain(), t=ac.currentTime+when;
    o.type=type; o.frequency.value=freq; g.gain.setValueAtTime(vol,t);
    g.gain.exponentialRampToValueAtTime(.001,t+dur);
    o.connect(g); g.connect(ac.destination); o.start(t); o.stop(t+dur);
  }
  const sfx = {
    click:()=>beep(520,.08),
    start:()=>[392,523,659,784].forEach((f,i)=>beep(f,.18,'triangle',.1,i*.1)),
    win:()=>[523,659,784,1047,1319].forEach((f,i)=>beep(f,.25,'triangle',.1,i*.09)),
    lose:()=>[400,300,200,120].forEach((f,i)=>beep(f,.3,'sawtooth',.08,i*.15))
  };

  // ---------- Screens & HTML Injection ----------
  document.body.insertAdjacentHTML('beforeend', `
   <!-- START SCREEN -->
   <div id="gl-start" class="gl-screen">
     <!-- Background Grid & Nodes -->
     <div class="gl-grid"></div>
     <div class="gl-nodes" id="gl-nodes"></div>
     
     <!-- THE DIGITAL TWIN 3D HOOK -->
     <div class="gl-3d-scene">
       <div class="gl-3d-city" id="gl-3d-city"></div>
     </div>

     <!-- Main Content -->
     <div class="gl-content">
       <h1>TWINCITY</h1>
       <p class="gl-type" id="gl-typewriter"></p>
       
       <!-- Briefing Panel -->
       <div class="gl-briefing">
         <p>Chennai is flooding and gridlocked. You have <strong>₹250 Cr</strong>.<br>Fix all 10 zones before the money runs out.</p>
       </div>

       <!-- Controls -->
       <div class="gl-controls">
         <button class="gl-btn" id="gl-play">▶ START MISSION</button>
         <div class="gl-toggles">
           <button class="gl-toggle" id="gl-toggle-fs">⛶ Fullscreen</button>
           <button class="gl-toggle" id="gl-toggle-mute">🔊 Sound On</button>
         </div>
       </div>
     </div>
   </div>

   <!-- GAME OVER SCREEN -->
   <div id="gl-over" class="gl-screen" style="display:none">
     <div class="gl-content">
       <h1>GAME OVER</h1>
       <p>The treasury is empty. Chennai is still stuck.</p>
       <button class="gl-btn" onclick="resetGame()">↻ TRY AGAIN</button>
     </div>
   </div>

   <!-- HUD -->
   <div id="hud">
     <div class="cell"><small>SCORE</small><b id="hud-score">0</b></div>
     <div class="cell"><small>ZONES</small><b id="hud-zones">0/${TOTAL}</b></div>
     <div class="cell"><small>RANK</small><b id="hud-rank" style="font-size:13px">ROOKIE</b></div>
   </div>
   
   <div id="gl-toast"></div><canvas id="gl-confetti"></canvas>`);

  const $ = id => document.getElementById(id);
  $('hud').style.display='none';

  // ---------- Typewriter Effect ----------
  const typeText = "DIGITAL CHENNAI · MAYOR SIMULATOR";
  let typeIndex = 0;
  function typeWriter() {
    if (typeIndex < typeText.length) {
      $('gl-typewriter').innerHTML += typeText.charAt(typeIndex);
      typeIndex++;
      setTimeout(typeWriter, 50);
    }
  }
  setTimeout(typeWriter, 400);

  // ---------- Generate Glowing Background Nodes ----------
  const nodesContainer = $('gl-nodes');
  for(let i=0; i<15; i++) {
    const node = document.createElement('div');
    node.className = 'gl-node';
    node.style.left = `${Math.random() * 80 + 10}%`;
    node.style.top = `${Math.random() * 80 + 10}%`;
    node.style.animationDelay = `${Math.random() * 2}s`;
    node.style.animationDuration = `${1.5 + Math.random() * 2}s`;
    nodesContainer.appendChild(node);
  }

  // ---------- Generate 3D City Blocks ----------
  const cityContainer = $('gl-3d-city');
  const gridSize = 5; 
  const blockSpacing = 28; 
  const offset = (gridSize * blockSpacing) / 2;

  for(let x=0; x<gridSize; x++) {
    for(let y=0; y<gridSize; y++) {
      const block = document.createElement('div');
      block.className = 'gl-3d-block';
      
      // Randomize height
      const h = Math.random() * 50 + 10;
      block.style.setProperty('--h', `${h}px`);
      
      // Center the grid
      const posX = (x * blockSpacing) - offset;
      const posY = (y * blockSpacing) - offset;
      
      block.style.left = `${posX}px`;
      block.style.top = `${posY}px`;
      
      // Make the center building a distinct, glowing "landmark"
      if(x === 2 && y === 2) {
          block.classList.add('highlight');
          block.style.setProperty('--h', `80px`); // Taller landmark
      } else if(Math.random() > 0.6) {
          block.classList.add('highlight');
      }
      
      block.style.animationDelay = `${Math.random() * 2}s`;
      cityContainer.appendChild(block);
    }
  }

  // Add floating data nodes to the 3D city
  for(let i=0; i<3; i++) {
    const dataNode = document.createElement('div');
    dataNode.className = 'gl-data-node';
    dataNode.style.animationDelay = `${i * 2}s`;
    cityContainer.appendChild(dataNode);
  }

  // ---------- Toggles ----------
  $('gl-toggle-fs').onclick = () => {
    if(document.fullscreenElement) {
      document.exitFullscreen();
      $('gl-toggle-fs').innerText = "⛶ Fullscreen";
    } else {
      document.documentElement.requestFullscreen();
      $('gl-toggle-fs').innerText = "⛶ Exit Fullscreen";
    }
  };

  $('gl-toggle-mute').onclick = () => {
    muted = !muted;
    $('gl-toggle-mute').innerText = muted ? "🔇 Sound Off" : "🔊 Sound On";
  };

  // ---------- Start Game ----------
  $('gl-play').onclick = () => {
    started = true; 
    sfx.start();
    $('gl-start').style.display='none'; 
    $('hud').style.display='flex';
    document.documentElement.requestFullscreen?.().catch(()=>{});
    setTimeout(()=>map && map.invalidateSize(), 300);
  };

  // ---------- HUD ----------
  function rank(n){return n>=10?'LEGENDARY MAYOR':n>=7?'MAYOR':n>=4?'DEPUTY MAYOR':n>=1?'COUNCILLOR':'ROOKIE'}
  function refreshHud(){
    const solved = Object.values(cityState.areas).filter(a=>a.solved).length;
    const score = solved*100 + cityState.budget*2 + cityState.happiness*3;
    $('hud-score').textContent = score; $('hud-zones').textContent = solved+'/'+TOTAL;
    $('hud-rank').textContent = rank(solved);
    if(solved > prevSolved){ toast('ZONE CLEARED! +100'); sfx.win(); confetti(); }
    prevSolved = solved;
    
    if(!over && solved < TOTAL && cityState.budget < 15){
      over = true; setTimeout(()=>{ sfx.lose(); $('gl-over').style.display='flex'; }, 1200);
    }
  }
  
  const _ud = window.updateDashboard;
  window.updateDashboard = function(){ _ud.apply(this, arguments); refreshHud(); };
  
  const _sa = window.selectArea;
  window.selectArea = function(){ sfx.click(); return _sa.apply(this, arguments); };

  // ---------- Effects ----------
  function toast(t){ const el=$('gl-toast'); el.textContent=t; el.classList.remove('show'); void el.offsetWidth; el.classList.add('show'); }
  function confetti(){
    const c=$('gl-confetti'), x=c.getContext('2d'); c.width=innerWidth; c.height=innerHeight;
    const P=Array.from({length:120},()=>({x:innerWidth/2,y:innerHeight/2,vx:(Math.random()-.5)*14,vy:Math.random()*-14,
      s:4+Math.random()*5,c:`hsl(${Math.random()*360},90%,60%)`}));
    let f=0;(function tick(){ x.clearRect(0,0,c.width,c.height);
      P.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.vy+=.4;x.fillStyle=p.c;x.fillRect(p.x,p.y,p.s,p.s)});
      if(++f<90) requestAnimationFrame(tick); else x.clearRect(0,0,c.width,c.height); })();
  }

  // ---------- Map Setup ----------
  window.addEventListener('load', () => setTimeout(() => {
    if(!window.map) return;
    map.eachLayer(l => { if(l instanceof L.TileLayer) map.removeLayer(l); });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19, 
        attribution: '© OpenStreetMap'
    }).addTo(map);
    refreshHud();
  }, 400));

  document.addEventListener('keydown', e => {
    if(/TEXTAREA|INPUT/.test(e.target.tagName)) return;
    if(e.key==='Enter' && !started) $('gl-play').click();
    if(e.key.toLowerCase()==='m') $('gl-toggle-mute').click();
    if(e.key.toLowerCase()==='f') $('gl-toggle-fs').click();
    if(e.key==='Escape') stopExploration();
  });
})();
