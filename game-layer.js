  document.body.insertAdjacentHTML('beforeend', `
   <!-- START SCREEN -->
   <div id="gl-start" class="gl-screen">
     <!-- Background Grid & Nodes -->
     <div class="gl-grid"></div>
     <div class="gl-nodes" id="gl-nodes"></div>
     
     <!-- Main Content -->
     <div class="gl-content">
       
       <!-- THE DIGITAL TWIN 3D HOOK -->
       <div class="gl-3d-scene">
         <div class="gl-3d-city" id="gl-3d-city">
           <!-- JS will inject 3D buildings here -->
         </div>
       </div>

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
   <!-- ... rest of the injection (Game Over, HUD, etc.) ... -->
