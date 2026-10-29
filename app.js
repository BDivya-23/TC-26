// === STATE ===
const cityState = {
    budget: 100,
    happiness: 85,
    selectedArea: null,
    areas: {
        Velachery:  { flood: 80, traffic: 60, solved: false },
        Vadapalani: { flood: 35, traffic: 75, solved: false },
        Porur:      { flood: 45, traffic: 70, solved: false }
    }
};

// === RULE-BASED ADVISOR ===
const advisorRules = [
    { keywords: ['drain', 'water', 'flood'], cost: 20, impact: 30, text: "Drainage system: reduces flooding significantly. Estimated cost: ₹20 crore. May cause 3 months of local disruption." },
    { keywords: ['metro', 'train', 'transport'], cost: 40, impact: 25, text: "Metro extension: improves connectivity and traffic. Estimated cost: ₹40 crore. High construction impact." },
    { keywords: ['park', 'green', 'tree'], cost: 10, impact: 10, text: "Green spaces: improves citizen happiness. Estimated cost: ₹10 crore. Minor flood benefit." },
    { keywords: ['road', 'pothole'], cost: 15, impact: 15, text: "Road repairs: improves accessibility. Estimated cost: ₹15 crore." }
];

let currentProposal = null;
let map;
let mapMarkers = {}; 

// === SELECT AREA ===
function selectArea(name) {
    cityState.selectedArea = name;
    const area = cityState.areas[name];
    document.getElementById('problem-panel').innerHTML =
        `<strong>${name}</strong><br>
         Flood Severity: ${area.flood}/100<br>
         Traffic: ${area.traffic}/100`;
    document.getElementById('proposal-input').value = '';
    document.getElementById('advisor-response').style.display = 'none';
    document.getElementById('approve-btn').disabled = true;
    document.getElementById('what-if-result').style.display = 'none';
}

// === EVALUATE PROPOSAL ===
function evaluateProposal() {
    const text = document.getElementById('proposal-input').value.toLowerCase();
    
    if (!cityState.selectedArea) {
        alert("Please click a location on the map first!");
        return;
    }

    const area = cityState.areas[cityState.selectedArea];
    let matched = null;

    for (const rule of advisorRules) {
        if (rule.keywords.some(k => text.includes(k))) { matched = rule; break; }
    }

    const box = document.getElementById('advisor-response');
    box.style.display = 'block';

    if (matched && !area.solved) {
        currentProposal = matched;
        box.innerHTML = `<span style="color:#4ade80">✅ Recommended</span><br>${matched.text}<br>
            <em>Reason: recognized keyword matching proposal.</em>`;
        document.getElementById('approve-btn').disabled = false;
    } else if (area.solved) {
        box.innerHTML = `<span style="color:#ef4444">⚠️ Already solved.</span>`;
        document.getElementById('approve-btn').disabled = true;
    } else {
        currentProposal = null;
        box.innerHTML = `<span style="color:#facc15">🤔 Unrecognized idea.</span> Try words like "drainage", "metro", "park", or "road".`;
        document.getElementById('approve-btn').disabled = true;
    }
}

// === APPROVE & SIMULATE ===
function approveProposal() {
    if (!currentProposal) return;
    const area = cityState.areas[cityState.selectedArea];

    if (cityState.budget < currentProposal.cost) {
        const responseBox = document.getElementById('advisor-response');
        responseBox.innerHTML = `<span style="color:#ef4444; font-weight:bold;">❌ INSUFFICIENT FUNDS!</span><br>
        This solution costs ₹${currentProposal.cost} Cr, but you only have ₹${cityState.budget} Cr left.<br>
        <em>The city council has rejected your proposal.</em>`;
        return;
    }

    cityState.budget -= currentProposal.cost;
    area.flood = Math.max(0, area.flood - currentProposal.impact);
    area.solved = true;
    
    let happinessBonus = 5; 
    if (currentProposal.keywords.includes('park')) happinessBonus = 15; 
    if (currentProposal.keywords.includes('drain')) happinessBonus = 10; 
    if (currentProposal.keywords.includes('metro')) happinessBonus = 5;  
    
    cityState.happiness = Math.min(100, cityState.happiness + happinessBonus);

    updateDashboard();
    saveGame();
    
    document.getElementById('approve-btn').disabled = true;
    document.getElementById('advisor-response').innerHTML +=
        `<br><br><span style="color:#4ade80">✔ Implemented! Budget: ₹${cityState.budget} Cr</span>`;
        
    checkWinCondition(); 
}

// === UPDATE UI ===
function updateDashboard() {
    document.getElementById('budget').textContent = `₹${cityState.budget} Cr`;
    document.getElementById('happiness').textContent = `${cityState.happiness}%`;
    
    const budgetPercent = (cityState.budget / 100) * 100;
    document.getElementById('budget-bar').style.width = `${budgetPercent}%`;
    if (budgetPercent < 30) {
        document.getElementById('budget-bar').style.background = '#ef4444'; 
    }

    document.getElementById('happiness-bar').style.width = `${cityState.happiness}%`;

    // Update Leaflet Markers
    for (let name in cityState.areas) {
        if (cityState.areas[name].solved && mapMarkers[name]) {
            mapMarkers[name].setIcon(L.divIcon({
                className: 'custom-div-icon',
                html: `<div class='map-marker solved'>✅ ${name} (Solved)</div>`,
                iconSize: [150, 30],
                iconAnchor: [75, 15]
            }));
        }
    }

    if (cityState.selectedArea) selectArea(cityState.selectedArea);
}

// === INITIALIZE ON LOAD ===
window.onload = function() {
    const savedState = localStorage.getItem('twinCityState');
    if (savedState) {
        Object.assign(cityState, JSON.parse(savedState));
    }
    
    initMap();
    updateDashboard();
    checkWinCondition(); 
    
    // Leaflet needs this to resize properly if the page loads slowly
    setTimeout(() => { map.invalidateSize(); }, 200);
};

function saveGame() {
    localStorage.setItem('twinCityState', JSON.stringify(cityState));
}

function checkWinCondition() {
    const allSolved = Object.values(cityState.areas).every(a => a.solved);
    if (allSolved) {
        setTimeout(() => {
            alert("🏆 MISSION ACCOMPLISHED!\n\nYou have successfully resolved all major crises in Chennai! The citizens thank you, Mayor.");
        }, 500);
    }
}

// === WHAT IF SIMULATOR ===
function simulateWhatIf(type) {
    if (!cityState.selectedArea) {
        alert("Please select an area on the map first!");
        return;
    }
    
    const area = cityState.areas[cityState.selectedArea];
    const resultBox = document.getElementById('what-if-result');
    resultBox.style.display = 'block';

    if (type === 'metro') {
        resultBox.innerHTML = `<strong>🚇 Metro Extension</strong><br>
        Cost: ₹40 Cr<br>
        Traffic Impact: -25 points<br>
        Flood Impact: 0 points<br>
        <em>Budget after: ₹${cityState.budget - 40} Cr</em>`;
        document.getElementById('proposal-input').value = "Build a metro extension";
    } 
    else if (type === 'drainage') {
        const floodReduction = area.flood > 50 ? "High" : "Medium";
        resultBox.innerHTML = `<strong>🌊 Drainage System</strong><br>
        Cost: ₹20 Cr<br>
        Flood Impact: -30 points (${floodReduction})<br>
        Traffic Impact: 0 points<br>
        <em>Budget after: ₹${cityState.budget - 20} Cr</em>`;
        document.getElementById('proposal-input').value = "Build a new drainage system";
    }
    evaluateProposal(); 
}

// === REAL INTERACTIVE MAP SETUP ===
function initMap() {
    map = L.map('map').setView([13.0500, 80.2100], 11);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19
    }).addTo(map);

    const locations = [
        { name: 'Velachery', coords: [12.9750, 80.2210] },
        { name: 'Vadapalani', coords: [13.0503, 80.2121] },
        { name: 'Porur', coords: [13.0358, 80.1568] }
    ];

    locations.forEach(loc => {
        const customIcon = L.divIcon({
            className: 'custom-div-icon',
            html: `<div class='map-marker'>📍 ${loc.name}</div>`,
            iconSize: [100, 30],
            iconAnchor: [50, 15]
        });

        const marker = L.marker(loc.coords, { icon: customIcon }).addTo(map);
        mapMarkers[loc.name] = marker;

        marker.on('click', function() {
            selectArea(loc.name); 
        });
    });
}
/* ================================================================
   DASHBOARD UPGRADE — 5 FEATURES
   Adds: Pulse row, Area cards, Budget donut, Approval meter, Chips
   Requires: existing cityState, updateDashboard, selectArea etc.
   ================================================================ */

/* ---- Helper: population weights for "Citizens Affected" ---- */
const AREA_POPULATION = {
    Velachery: 500000,
    Porur: 300000,
    Vadapalani: 400000
};

/* ---- Days-as-mayor counter (persisted) ---- */
if (typeof window.mayorDays === 'undefined') {
    window.mayorDays = parseInt(localStorage.getItem('twinCityDays') || '1', 10);
}

/* =============================================================
   FEATURE 1: PULSE ROW
   ============================================================= */
/* =============================================================
   FEATURE 2: PER-AREA MINI-CARDS
   ============================================================= */
function renderAreaCards() {
    const container = document.getElementById('area-cards-container');
    if (!container) return;

    const names = Object.keys(cityState.areas);

    container.innerHTML = names.map(name => {
        const a = cityState.areas[name];
        const isSelected = cityState.selectedArea === name;

        // If the area is solved, force the visual stats to 0
        const displayFlood = a.solved ? 0 : a.flood;
        const displayTraffic = a.solved ? 0 : a.traffic;

        let cls = 'area-card';
        if (isSelected) cls += ' selected';
        if (a.solved)   cls += ' solved';
        if (!a.solved && !isSelected) cls += ' pick-hint';

        let tag = '';
        if (a.solved) {
            tag = `<span class="area-solved-tag">✅ Solved</span>`;
        } else if (isSelected) {
            tag = `<span class="area-solved-tag">Selected</span>`;
        }

        return `
            <div class="${cls}" data-area="${name}" onclick="handleAreaCardClick('${name}')">
                <div class="area-card-header">
                    <span class="area-status-dot"></span>
                    <span class="area-name">${name}</span>
                    ${tag}
                </div>
                <div class="area-stat-row">
                    <span class="stat-emoji">🌊</span>
                    <span class="stat-name">Flood</span>
                    <div class="area-stat-bar flood">
                        <div style="width:${displayFlood}%;"></div>
                    </div>
                    <span class="area-stat-val">${displayFlood}</span>
                </div>
                <div class="area-stat-row">
                    <span class="stat-emoji">🚗</span>
                    <span class="stat-name">Traffic</span>
                    <div class="area-stat-bar traffic">
                        <div style="width:${displayTraffic}%;"></div>
                    </div>
                    <span class="area-stat-val">${displayTraffic}</span>
                </div>
            </div>
        `;
    }).join('');
}

function formatCompact(n) {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(0) + 'K';
    return String(n);
}

/* Auto-tick days once per 60 seconds */
if (!window._mayorDaysTimer) {
    window._mayorDaysTimer = setInterval(() => {
        window.mayorDays += 1;
        localStorage.setItem('twinCityDays', String(window.mayorDays));
        renderPulse();
    }, 60000);
}

/* =============================================================
   FEATURE 3: BUDGET DONUT
   ============================================================= */
function renderDonut() {
    const remaining = cityState.budget;
    const total = 100;
    const spent = Math.max(0, total - remaining);
    const circumference = 2 * Math.PI * 50; // r = 50 → ~314.16

    const remainingLen = (remaining / total) * circumference;
    const spentLen = (spent / total) * circumference;

    const remainingCircle = document.getElementById('donut-remaining');
    const spentCircle = document.getElementById('donut-spent');

    if (remainingCircle) {
        // draw remaining arc after spent arc
        remainingCircle.setAttribute(
            'stroke-dasharray',
            `${remainingLen} ${circumference - remainingLen}`
        );
        remainingCircle.setAttribute(
            'stroke-dashoffset',
            `${-spentLen}`
        );
    }
    if (spentCircle) {
        spentCircle.setAttribute(
            'stroke-dasharray',
            `${spentLen} ${circumference - spentLen}`
        );
    }

    // Center text
    const amountEl = document.getElementById('donut-amount');
    if (amountEl) {
        amountEl.textContent = '₹' + remaining;
        amountEl.style.color = remaining < 30 ? '#ef4444' : '#10b981';
    }

    // Legend
    const legendRem = document.getElementById('legend-remaining');
    const legendSpent = document.getElementById('legend-spent');
    if (legendRem) legendRem.textContent = '₹' + remaining + ' Cr';
    if (legendSpent) legendSpent.textContent = '₹' + spent + ' Cr';
}

/* =============================================================
   FEATURE 4: APPROVAL METER
   ============================================================= */
function renderApproval() {
    const h = cityState.happiness;

    // Emoji
    let emoji = '😐';
    let color = '#facc15';
    if (h < 40)      { emoji = '😡'; color = '#ef4444'; }
    else if (h < 60) { emoji = '😟'; color = '#f97316'; }
    else if (h < 75) { emoji = '😐'; color = '#facc15'; }
    else if (h < 90) { emoji = '🙂'; color = '#3b82f6'; }
    else             { emoji = '😄'; color = '#10b981'; }

    const emojiEl = document.getElementById('approval-emoji');
    const happinessEl = document.getElementById('happiness');
    const fill = document.getElementById('happiness-bar');
    const stars = document.getElementById('star-rating');

    if (emojiEl && emojiEl.textContent !== emoji) {
        emojiEl.textContent = emoji;
        emojiEl.classList.remove('bump');
        // Force reflow so animation restarts
        void emojiEl.offsetWidth;
        emojiEl.classList.add('bump');
    }
    if (happinessEl) {
        happinessEl.textContent = h + '%';
        happinessEl.style.color = color;
    }
    if (fill) {
        fill.style.width = h + '%';
        fill.style.background = color;
    }

    // Stars: 1 star per 20%
    if (stars) {
        const filled = Math.round(h / 20);
        stars.textContent = '★'.repeat(filled) + '☆'.repeat(5 - filled);
    }
}

/* =============================================================
   FEATURE 2: PER-AREA MINI-CARDS
   ============================================================= */
function renderAreaCards() {
    const container = document.getElementById('area-cards-container');
    if (!container) return;

    const names = Object.keys(cityState.areas);

    container.innerHTML = names.map(name => {
        const a = cityState.areas[name];
        const isSelected = cityState.selectedArea === name;

        let cls = 'area-card';
        if (isSelected) cls += ' selected';
        if (a.solved)   cls += ' solved';
        if (!a.solved && !isSelected) cls += ' pick-hint';

        let tag = '';
        if (a.solved) {
            tag = `<span class="area-solved-tag">✅ Solved</span>`;
        } else if (isSelected) {
            tag = `<span class="area-solved-tag">Selected</span>`;
        }

        return `
            <div class="${cls}" data-area="${name}" onclick="handleAreaCardClick('${name}')">
                <div class="area-card-header">
                    <span class="area-status-dot"></span>
                    <span class="area-name">${name}</span>
                    ${tag}
                </div>
                <div class="area-stat-row">
                    <span class="stat-emoji">🌊</span>
                    <span class="stat-name">Flood</span>
                    <div class="area-stat-bar flood">
                        <div style="width:${a.flood}%;"></div>
                    </div>
                    <span class="area-stat-val">${a.flood}</span>
                </div>
                <div class="area-stat-row">
                    <span class="stat-emoji">🚗</span>
                    <span class="stat-name">Traffic</span>
                    <div class="area-stat-bar traffic">
                        <div style="width:${a.traffic}%;"></div>
                    </div>
                    <span class="area-stat-val">${a.traffic}</span>
                </div>
            </div>
        `;
    }).join('');
}

/* Card click → reuse existing selectArea(), then re-render + update problem panel */
function handleAreaCardClick(name) {
    if (typeof selectArea === 'function') {
        selectArea(name);
    }
    renderAreaCards();
    // Keep the hidden problem-panel text in sync (old JS writes to it)
    const panel = document.getElementById('problem-panel');
    if (panel) {
        const a = cityState.areas[name];
        panel.innerHTML = `<strong>${name}</strong><br>Flood Severity: ${a.flood}/100<br>Traffic: ${a.traffic}/100`;
    }
}

/* =============================================================
   FEATURE 5: QUICK-ACTION CHIPS
   ============================================================= */
function appendChip(text) {
    const input = document.getElementById('proposal-input');
    if (!input) return;

    const existing = input.value.trim();
    if (!existing) {
        input.value = text;
    } else {
        // avoid duplicate appends
        if (existing.toLowerCase().includes(text.toLowerCase())) return;
        input.value = existing + ', ' + text;
    }

    // Focus + move caret to end
    input.focus();
    input.setSelectionRange(input.value.length, input.value.length);
}

/* =============================================================
   MASTER REFRESH — call this anywhere cityState changes
   ============================================================= */
function refreshDashboard() {
    renderPulse();
    renderDonut();
    renderApproval();
    renderAreaCards();
}

/* =============================================================
   BOOTSTRAP + HOOKS
   ============================================================= */

/* ---- Wrap existing updateDashboard so it also refreshes new UI ---- */
(function patchUpdateDashboard() {
    if (typeof updateDashboard !== 'function') return;
    if (window._updateDashboardPatched) return;
    const original = updateDashboard;
    window.updateDashboard = function() {
        original.apply(this, arguments);
        try { refreshDashboard(); } catch (e) { console.warn('refreshDashboard:', e); }
    };
    window._updateDashboardPatched = true;
})();

/* ---- Wrap approveProposal to bump days + refresh ---- */
(function patchApproveProposal() {
    if (typeof approveProposal !== 'function') return;
    if (window._approvePatched) return;
    const original = approveProposal;
    window.approveProposal = function() {
        const before = cityState.budget;
        original.apply(this, arguments);
        // Only bump day if a real spend happened
        if (cityState.budget < before) {
            window.mayorDays += 1;
            localStorage.setItem('twinCityDays', String(window.mayorDays));
        }
        try { refreshDashboard(); } catch (e) { console.warn(e); }
    };
    window._approvePatched = true;
})();

/* ---- Wrap selectArea so cards stay in sync when map is clicked ---- */
(function patchSelectArea() {
    if (typeof selectArea !== 'function') return;
    if (window._selectAreaPatched) return;
    const original = selectArea;
    window.selectArea = function(name) {
        original.apply(this, arguments);
        try { renderAreaCards(); } catch (e) { console.warn(e); }
    };
    window._selectAreaPatched = true;
})();

/* ---- Initial paint after DOM + Leaflet ready ---- */
window.addEventListener('load', () => {
    // Small delay so original onload (initMap etc.) runs first
    setTimeout(() => {
        try {
            refreshDashboard();
            // Sync hidden problem-panel with current selection (if restored)
            if (cityState.selectedArea) {
                const a = cityState.areas[cityState.selectedArea];
                const panel = document.getElementById('problem-panel');
                if (panel) {
                    panel.innerHTML = `<strong>${cityState.selectedArea}</strong><br>Flood Severity: ${a.flood}/100<br>Traffic: ${a.traffic}/100`;
                }
            }
        } catch (e) {
            console.warn('Initial dashboard paint failed:', e);
        }
    }, 250);
});
