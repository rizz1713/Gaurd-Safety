// Geospatial Safety Heatmap Component

export function initHeatmap(state, onZoneSelect) {
  const container = document.getElementById("heatmap-container-el");
  if (!container) return;

  // Render SVG Map and overlay elements
  container.innerHTML = `
    <div style="position: relative; width: 100%; height: 100%;">
      <!-- SVG Layout -->
      <svg class="heatmap-svg" id="plant-svg" viewBox="0 0 800 500">
        <defs>
          <radialGradient id="radar-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="var(--color-info)" stop-opacity="0.4" />
            <stop offset="100%" stop-color="var(--color-info)" stop-opacity="0" />
          </radialGradient>
        </defs>

        <!-- Grid Lines for Telemetry Aesthetic -->
        <g stroke="#1a2333" stroke-width="0.5">
          <line x1="0" y1="50" x2="800" y2="50" />
          <line x1="0" y1="100" x2="800" y2="100" />
          <line x1="0" y1="150" x2="800" y2="150" />
          <line x1="0" y1="200" x2="800" y2="200" />
          <line x1="0" y1="250" x2="800" y2="250" />
          <line x1="0" y1="300" x2="800" y2="300" />
          <line x1="0" y1="350" x2="800" y2="350" />
          <line x1="0" y1="400" x2="800" y2="400" />
          <line x1="0" y1="450" x2="800" y2="450" />
          
          <line x1="100" y1="0" x2="100" y2="500" />
          <line x1="200" y1="0" x2="200" y2="500" />
          <line x1="300" y1="0" x2="300" y2="500" />
          <line x1="400" y1="0" x2="400" y2="500" />
          <line x1="500" y1="0" x2="500" y2="500" />
          <line x1="600" y1="0" x2="600" y2="500" />
          <line x1="700" y1="0" x2="700" y2="500" />
        </g>

        <!-- Plant Zones -->
        <!-- Zone 1: Coke Oven Battery -->
        <polygon id="zone-coke-oven" class="plant-zone" points="50,50 350,50 350,220 50,220" />
        <!-- Zone 2: Gas Mixing Station -->
        <polygon id="zone-gas-mixing" class="plant-zone" points="400,50 750,50 750,180 400,180" />
        <!-- Zone 3: Blast Furnace -->
        <polygon id="zone-blast-furnace" class="plant-zone" points="50,280 320,280 320,450 50,450" />
        <!-- Zone 4: Maintenance Workshop -->
        <polygon id="zone-workshop" class="plant-zone" points="380,240 580,240 580,450 380,450" />
        <!-- Zone 5: Admin Block (Safe Assembly) -->
        <polygon id="zone-admin" class="plant-zone" points="630,240 750,240 750,450 630,450" />

        <!-- Zone Labels -->
        <text x="200" y="130" class="plant-label">COKE OVEN BATTERY (ZONE A)</text>
        <text x="575" y="110" class="plant-label">GAS MIXING STATION (ZONE B)</text>
        <text x="185" y="365" class="plant-label">BLAST FURNACE (ZONE C)</text>
        <text x="480" y="345" class="plant-label">MAINTENANCE WORKSHOP (ZONE D)</text>
        <text x="690" y="345" class="plant-label">ADMIN & CONTROL (ZONE E)</text>

        <!-- Evacuation Pathways (Hidden by default, animate in emergency) -->
        <g id="evacuation-paths" style="display: none;">
          <path id="path-coke" class="evac-path" d="M 200,220 L 200,250 L 600,250 L 690,240" />
          <path id="path-mixing" class="evac-path" d="M 575,180 L 575,220 L 690,240" />
          <path id="path-furnace" class="evac-path" d="M 185,280 L 185,250 L 600,250 L 690,240" />
          <path id="path-workshop" class="evac-path" d="M 480,240 L 480,250 L 690,240" />
        </g>

        <!-- Dynamic Group for RFID Workers -->
        <g id="workers-group"></g>
      </svg>

      <!-- Click Details Panel overlay -->
      <div class="map-overlay-panel" id="zone-inspector-panel">
        <h4 style="font-size:14px; font-weight:700; color:var(--color-info); margin-bottom:8px;" id="inspect-zone-title">ZONE INSPECTOR</h4>
        <p style="font-size:12px; color:var(--text-secondary); margin-bottom:12px;">Click any plant sector to view live telemetry and credentials.</p>
        <div id="inspect-zone-body" style="font-size:12px; display:flex; flex-direction:column; gap:6px;">
          <!-- Telemetry status loaded dynamically -->
        </div>
      </div>

      <!-- Map Legend -->
      <div class="map-legend">
        <div class="legend-item">
          <div class="legend-color" style="background-color: var(--color-success);"></div>
          <span>Safe (&lt;30)</span>
        </div>
        <div class="legend-item">
          <div class="legend-color" style="background-color: var(--color-warning);"></div>
          <span>Warning (30-65)</span>
        </div>
        <div class="legend-item">
          <div class="legend-color" style="background-color: var(--color-danger);"></div>
          <span>Hazard (&gt;65)</span>
        </div>
        <div class="legend-item">
          <div class="legend-color" style="background-color: var(--color-info);"></div>
          <span>Worker RFID</span>
        </div>
      </div>
    </div>
  `;

  // Attach event handlers to polygons
  const zones = [
    { id: "zone-coke-oven", name: "Coke Oven Battery (Zone A)" },
    { id: "zone-gas-mixing", name: "Gas Mixing Station (Zone B)" },
    { id: "zone-blast-furnace", name: "Blast Furnace (Zone C)" },
    { id: "zone-workshop", name: "Maintenance Workshop (Zone D)" },
    { id: "zone-admin", name: "Admin & Control (Zone E)" }
  ];

  zones.forEach(z => {
    const el = document.getElementById(z.id);
    if (el) {
      el.addEventListener("click", () => {
        inspectZone(z.name, state);
        if (onZoneSelect) onZoneSelect(z.name);
      });
    }
  });

  // Render initial frame
  updateHeatmap(state);
}

// Inspect specific zones to view sensor readings and active PTWs
export function inspectZone(zoneName, state) {
  const title = document.getElementById("inspect-zone-title");
  const body = document.getElementById("inspect-zone-body");
  if (!title || !body) return;

  title.innerText = zoneName.toUpperCase();

  let sensorsText = "";
  let permitsText = "";
  let riskAssessment = "";

  if (zoneName.includes("Coke Oven")) {
    sensorsText = `
      <div>Methane (CH4): <span style="font-family:var(--font-mono); color:${state.telemetry.ch4 > 1.0 ? 'var(--color-danger)' : 'var(--text-primary)'};">${state.telemetry.ch4.toFixed(2)}%</span></div>
      <div>Exhaust Fan: <span style="font-family:var(--font-mono); color:${state.telemetry.fanStatus === 'OFF' ? 'var(--color-danger)' : 'var(--color-success)'};">${state.telemetry.fanStatus}</span></div>
      <div>Exhaust Temp: <span style="font-family:var(--font-mono);">${state.telemetry.temp.toFixed(1)}°C</span></div>
    `;
    const zonePermits = state.permits.filter(p => p.zone.includes("Coke Oven"));
    permitsText = zonePermits.length > 0 
      ? zonePermits.map(p => `<div>ID: ${p.id} [${p.type}] - ${p.status}</div>`).join("")
      : "No active permits.";

    const currentZoneRisk = (state.telemetry.ch4 > 1.0 || state.telemetry.fanStatus === "OFF") ? state.compoundRiskScore : 10;
    riskAssessment = `Risk Index: <span style="font-weight:700; color:${currentZoneRisk > 65 ? 'var(--color-danger)' : currentZoneRisk > 30 ? 'var(--color-warning)' : 'var(--color-success)'};">${currentZoneRisk}/100</span>`;
  } else if (zoneName.includes("Gas Mixing")) {
    sensorsText = `
      <div>Carbon Monoxide (CO): <span style="font-family:var(--font-mono);">${state.telemetry.co} ppm</span></div>
      <div>Hydrogen Sulfide (H2S): <span style="font-family:var(--font-mono);">${state.telemetry.h2s} ppm</span></div>
    `;
    const zonePermits = state.permits.filter(p => p.zone.includes("Gas Mixing"));
    permitsText = zonePermits.length > 0 
      ? zonePermits.map(p => `<div>ID: ${p.id} [${p.type}] - ${p.status}</div>`).join("")
      : "No active permits.";
      
    riskAssessment = `Risk Index: <span style="font-weight:700; color:var(--color-success);">05/100</span>`;
  } else if (zoneName.includes("Blast Furnace")) {
    sensorsText = `
      <div>Ambient Temp: 42°C</div>
      <div>CO Gas Index: 12 ppm</div>
    `;
    const zonePermits = state.permits.filter(p => p.zone.includes("Blast Furnace"));
    permitsText = zonePermits.length > 0 
      ? zonePermits.map(p => `<div>ID: ${p.id} [${p.type}] - ${p.status}</div>`).join("")
      : "No active permits.";
    riskAssessment = `Risk Index: <span style="font-weight:700; color:var(--color-success);">08/100</span>`;
  } else if (zoneName.includes("Workshop")) {
    sensorsText = `
      <div>Power Feed: Stable</div>
      <div>Ambient Temp: 28°C</div>
    `;
    const zonePermits = state.permits.filter(p => p.zone.includes("Workshop"));
    permitsText = zonePermits.length > 0 
      ? zonePermits.map(p => `<div>ID: ${p.id} [${p.type}] - ${p.status}</div>`).join("")
      : "No active permits.";
    riskAssessment = `Risk Index: <span style="font-weight:700; color:var(--color-success);">04/100</span>`;
  } else {
    sensorsText = `<div>Control Link: Activated</div>`;
    permitsText = `None (Administrative).`;
    riskAssessment = `Risk Index: <span style="font-weight:700; color:var(--color-success);">02/100</span>`;
  }

  body.innerHTML = `
    <div style="border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom:6px; margin-bottom:6px;">
      <span style="color:var(--text-secondary); font-weight:600;">TELEMETRY:</span>
      ${sensorsText}
    </div>
    <div style="border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom:6px; margin-bottom:6px;">
      <span style="color:var(--text-secondary); font-weight:600;">ACTIVE PERMITS:</span>
      <div style="margin-top:2px; font-family:var(--font-mono); font-size:11px;">${permitsText}</div>
    </div>
    <div>
      <span style="color:var(--text-secondary); font-weight:600;">RISK PROFILE:</span>
      <div>${riskAssessment}</div>
    </div>
  `;
}

// Redraw heat colors and positions of workers in the plant
export function updateHeatmap(state) {
  const svg = document.getElementById("plant-svg");
  if (!svg) return;

  const cokeZone = document.getElementById("zone-coke-oven");
  const mixingZone = document.getElementById("zone-gas-mixing");
  const furnaceZone = document.getElementById("zone-blast-furnace");
  const workshopZone = document.getElementById("zone-workshop");
  const adminZone = document.getElementById("zone-admin");

  // Determine color bases based on telemetry anomalies
  let cokeRisk = 8;
  if (state.telemetry.ch4 > 1.2 || state.telemetry.fanStatus === "OFF") {
    cokeRisk = state.compoundRiskScore;
  } else if (state.telemetry.ch4 > 0.6) {
    cokeRisk = 40;
  }

  const mixingRisk = 6;
  const furnaceRisk = 12;
  const workshopRisk = 5;
  const adminRisk = 2;

  // Apply colors to zones based on calculated individual risk thresholds
  const getColor = (score) => {
    if (score > 65) return "var(--color-danger)";
    if (score > 30) return "var(--color-warning)";
    return "var(--color-success)";
  };

  if (cokeZone) cokeZone.style.fill = getColor(cokeRisk);
  if (mixingZone) mixingZone.style.fill = getColor(mixingRisk);
  if (furnaceZone) furnaceZone.style.fill = getColor(furnaceRisk);
  if (workshopZone) workshopZone.style.fill = getColor(workshopRisk);
  if (adminZone) adminZone.style.fill = getColor(adminRisk);

  // Evacuation pathing overlay control
  const evacPaths = document.getElementById("evacuation-paths");
  if (evacPaths) {
    evacPaths.style.display = state.emergencyMode ? "block" : "none";
  }

  // Draw Workers
  const workersGroup = document.getElementById("workers-group");
  if (workersGroup) {
    workersGroup.innerHTML = state.workers.map(w => {
      // Draw ping rings around worker nodes
      return `
        <circle class="worker-ping" cx="${w.x}" cy="${w.y}" r="12" />
        <circle class="worker-node" cx="${w.x}" cy="${w.y}" r="5" id="worker-node-${w.id}">
          <title>${w.name} (RFID #${w.id}) - Area: ${w.zone}</title>
        </circle>
        <text x="${w.x}" y="${w.y - 8}" fill="#ffffff" font-size="8px" font-family="var(--font-mono)" text-anchor="middle" font-weight="bold">${w.id}</text>
      `;
    }).join("");
  }
}
