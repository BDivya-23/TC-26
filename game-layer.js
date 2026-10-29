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

  // ---------- Screens ----------
  document.body.insertAdjacentHTML('beforeend', `
   <div id="gl-start" class="gl-screen">
     <h1>TWINCITY</h1><p>DIGITAL CHENNAI · MAYOR SIMULATOR</p>
     <p style="max-width:520px;font-size:13px">Chennai is flooding and gridlocked. You have ₹250 Cr.
        Fix all 10 zones before the money runs out.</p>
     <div class="keys"><span>🖱️ Click a zone</span><span>⌨️ Type a fix</span><span>✅ Approve to build</span>
        <span>F Fullscreen</span><span>M Mute</span></div>
     <button class="gl-btn" id="gl-play">▶ PLAY</button></div>
   <div id="gl-over" class="gl-screen" style="display:none"><h1>GAME OVER</h1>
     <p>The treasury is empty. Chennai is still stuck.</p>
     <button class="gl-btn" onclick="resetGame()">↻ TRY AGAIN</button></div>
   <div id="hud"><div class="cell"><small>SCORE</small><b id="hud-score">0</b></div>
     <div class="cell"><small>ZONES</small><b id="hud-zones">0/${TOTAL}</b></div>
     <div class="cell"><small>RANK</small><b id="hud-rank" style="font-size:13px">ROOKIE</b></div>
     <button id="hud-mute" title="Mute (M)">🔊</button></div>
   <div id="gl-toast"></div><canvas id="gl-confetti"></canvas>`);
  const $ = id => document.getElementById(id);
  $('hud').style.display='none';

  $('gl-play').onclick = () => {
    started = true; sfx.start();
    $('gl-start').style.display='none'; $('hud').style.display='flex';
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
    // lose state: not enough money for the cheapest fix (₹15 Cr)
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

  // ---------- Map setup + keys ----------
  window.addEventListener('load', () => setTimeout(() => {
    if(!window.map) return;
    // Keep the standard OpenStreetMap tiles (free, no API key required)
    map.eachLayer(l => { if(l instanceof L.TileLayer) map.removeLayer(l); });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19, 
        attribution: '© OpenStreetMap'
    }).addTo(map);
    refreshHud();
  }, 400));
  
  function toggleMute(){ muted=!muted; $('hud-mute').textContent = muted?'🔇':'🔊'; }
  $('hud-mute').onclick = toggleMute;
  document.addEventListener('keydown', e => {
    if(/TEXTAREA|INPUT/.test(e.target.tagName)) return;
    if(e.key==='Enter' && !started) $('gl-play').click();
    if(e.key.toLowerCase()==='m') toggleMute();
    if(e.key.toLowerCase()==='f') document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen();
    if(e.key==='Escape') stopExploration();
  });
})();
