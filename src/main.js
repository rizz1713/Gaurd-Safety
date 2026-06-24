// GuardSafety AI — Master Client-side State & Simulation Engine

import './style.css';
import { computeCompoundRisk } from './components/riskEngine.js';
import { initHeatmap, updateHeatmap, inspectZone } from './components/heatmap.js';
import { initPermitAgent, renderActivePermits } from './components/permitAgent.js';
import { initRagAgent } from './components/ragAgent.js';
import { initOrchestrator } from './components/orchestrator.js';
import { initCompliance } from './components/compliance.js';
import { initArchitecture } from './components/architecture.js';

// Global Simulation State
const DEFAULT_STATE = {
  telemetry: {
    ch4: 0.12,          // Methane %, normal range: 0.05-0.20%
    co: 15,             // Carbon Monoxide ppm, normal: 5-25
    h2s: 2,             // Hydrogen Sulfide ppm, normal: 1-5
    temp: 38.5,         // Exhaust temperature °C
    fanStatus: "ON"     // Ventilation Fan: ON, OFF, BYPASS
  },
  permits: [
    { id: "PTW-402", type: "Hot Work", zone: "Coke Oven Battery (Zone A)", supervisor: "R. K. Prasad", status: "APPROVED" },
    { id: "PTW-204", type: "Confined Space", zone: "Coke Oven Battery (Zone A)", supervisor: "M. A. Khan", status: "APPROVED" },
    { id: "PTW-108", type: "Cold Work", zone: "Maintenance Workshop (Zone D)", supervisor: "J. S. Rao", status: "APPROVED" }
  ],
  alerts: [
    { id: 1, time: "15:45:10", type: "info", title: "Permit PTW-402 Approved", desc: "Hot Work welding permit authorized for Coke Oven maintenance.", zone: "Coke Oven Battery (Zone A)" },
    { id: 2, time: "15:40:02", type: "info", title: "Exhaust Fan Calibrated", desc: "Ventilation system performance check complete.", zone: "Coke Oven Battery (Zone A)" }
  ],
  workers: [
    { id: 101, name: "Amit Kumar", zone: "Coke Oven Battery (Zone A)", x: 120, y: 110, tx: 120, ty: 110 },
    { id: 102, name: "Sanjay Sen", zone: "Coke Oven Battery (Zone A)", x: 280, y: 150, tx: 280, ty: 150 },
    { id: 103, name: "Vijay Patil", zone: "Gas Mixing Station (Zone B)", x: 500, y: 100, tx: 500, ty: 100 },
    { id: 104, name: "Ramesh Lal", zone: "Gas Mixing Station (Zone B)", x: 620, y: 90, tx: 620, ty: 90 },
    { id: 105, name: "Preeti Rao", zone: "Blast Furnace (Zone C)", x: 180, y: 380, tx: 180, ty: 380 },
    { id: 106, name: "Gopal Dev", zone: "Maintenance Workshop (Zone D)", x: 450, y: 320, tx: 450, ty: 320 },
    { id: 107, name: "Mohan Lal", zone: "Maintenance Workshop (Zone D)", x: 520, y: 400, tx: 520, ty: 400 },
    { id: 108, name: "Devi Singh", zone: "Admin & Control (Zone E)", x: 680, y: 350, tx: 680, ty: 350 }
  ],
  activeTab: "dashboard",
  emergencyMode: false,
  emergencyTriggerTime: null,
  isShiftHandover: false,
  compoundRiskScore: 8,
  ragChatHistory: []
};

// Deep copy of state for resets
let appState = JSON.parse(JSON.stringify(DEFAULT_STATE));

// Preset Scenario Flags
let simGasLeak = false;
let simFanFailure = false;

// 1. App Entry Setup
document.addEventListener("DOMContentLoaded", () => {
  setupNavigation();
  setupSimulationTriggers();
  
  // Start simulation loop (1 tick per second)
  setInterval(simulationTick, 1000);

  // Initial View Render
  switchTab(appState.activeTab);
});

// 2. Navigation / Routing setup
function setupNavigation() {
  const tabs = ["dashboard", "heatmap", "permits", "rag", "emergency", "compliance", "architecture"];
  
  tabs.forEach(tab => {
    const navEl = document.getElementById(`nav-${tab}`);
    if (navEl) {
      navEl.addEventListener("click", () => {
        switchTab(tab);
      });
    }
  });
}

function switchTab(tabName) {
  appState.activeTab = tabName;

  // Update active styling
  document.querySelectorAll(".nav-item").forEach(el => el.classList.remove("active"));
  const activeEl = document.getElementById(`nav-${tabName}`);
  if (activeEl) activeEl.classList.add("active");

  // Load appropriate View module
  if (tabName === "dashboard") {
    renderDashboardView();
  } else if (tabName === "heatmap") {
    renderHeatmapView();
  } else if (tabName === "permits") {
    initPermitAgent(appState, () => {
      // Reload risk evaluation when permit gets added
      recalculateRisk();
    });
  } else if (tabName === "rag") {
    initRagAgent(appState);
  } else if (tabName === "emergency") {
    initOrchestrator(appState, triggerEmergency, cancelEmergency);
  } else if (tabName === "compliance") {
    initCompliance(appState);
  } else if (tabName === "architecture") {
    initArchitecture(appState);
  }
}

// 3. Setup Top Header controls & Presets
function setupSimulationTriggers() {
  const leakBtn = document.getElementById("btn-quick-leak");
  const fanBtn = document.getElementById("btn-quick-fan");
  const alarmBtn = document.getElementById("btn-trigger-alarm");
  const resetBtn = document.getElementById("btn-reset-sim");

  if (leakBtn) {
    leakBtn.addEventListener("click", () => {
      simGasLeak = true;
      leakBtn.style.backgroundColor = "var(--color-warning)";
      leakBtn.style.color = "var(--bg-darker)";
      
      // Add info alert
      addSystemAlert("warning", "Gas Leak Initialized", "Combustible methane leak simulated at Coke Oven Battery.", "Coke Oven Battery (Zone A)");
    });
  }

  if (fanBtn) {
    fanBtn.addEventListener("click", () => {
      simFanFailure = true;
      appState.telemetry.fanStatus = "OFF";
      fanBtn.style.backgroundColor = "var(--color-danger)";
      fanBtn.style.color = "white";
      
      addSystemAlert("critical", "Ventilation Fan Failure", "SCADA telemetry signals exhaust extraction Fan offline.", "Coke Oven Battery (Zone A)");
    });
  }

  if (alarmBtn) {
    alarmBtn.addEventListener("click", () => {
      if (appState.emergencyMode) {
        cancelEmergency();
      } else {
        triggerEmergency();
      }
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      // Clear flags
      simGasLeak = false;
      simFanFailure = false;
      
      // Reset state
      appState = JSON.parse(JSON.stringify(DEFAULT_STATE));
      
      // Reset button styles
      if (leakBtn) {
        leakBtn.style.backgroundColor = "transparent";
        leakBtn.style.color = "var(--color-warning)";
      }
      if (fanBtn) {
        fanBtn.style.backgroundColor = "transparent";
        fanBtn.style.color = "var(--color-danger)";
      }
      
      addSystemAlert("info", "System Reset Completed", "Simulation parameters reverted to safety baseline.", "Control Room");
      
      recalculateRisk();
      switchTab(appState.activeTab);
    });
  }
}

// 4. Real-time Simulation Tick Loop (Runs at 1Hz)
function simulationTick() {
  updateClock();
  
  // Drift Telemetry values
  if (simGasLeak) {
    // Drifts up methane gas leak
    appState.telemetry.ch4 += 0.08 + Math.random() * 0.04;
    appState.telemetry.co += Math.round(2 + Math.random() * 3);
  } else {
    // Standard minor fluctuation
    appState.telemetry.ch4 += (Math.random() - 0.5) * 0.01;
    appState.telemetry.ch4 = Math.max(0.06, Math.min(0.20, appState.telemetry.ch4));
    
    appState.telemetry.co += Math.round((Math.random() - 0.5) * 2);
    appState.telemetry.co = Math.max(5, Math.min(25, appState.telemetry.co));
  }

  if (appState.telemetry.fanStatus === "OFF") {
    // Temperature climbs if exhaust fan fails
    appState.telemetry.temp += 0.8 + Math.random() * 0.5;
    
    // Methane accumulation speeds up when fans are off
    if (simGasLeak) {
      appState.telemetry.ch4 += 0.12;
    }
  } else {
    // Temp drifts to baseline ambient
    appState.telemetry.temp += (Math.random() - 0.5) * 0.3;
    appState.telemetry.temp = Math.max(34, Math.min(42, appState.telemetry.temp));
  }

  // Simulate worker pings moving around layout
  updateWorkerMovement();

  // Shift change check (Trigger short handover overlap risk check dynamically)
  const seconds = new Date().getSeconds();
  appState.isShiftHandover = (seconds >= 20 && seconds <= 35);

  // Compute Risk Consensus
  recalculateRisk();

  // If score climbs past danger zone threshold (65) and emergency not triggered, fire automatically!
  if (appState.compoundRiskScore > 65 && !appState.emergencyMode) {
    triggerEmergency();
  }

  // Refresh active page elements
  refreshUIElements();
}

function updateClock() {
  const clockEl = document.getElementById("current-clock");
  if (clockEl) {
    clockEl.innerText = new Date().toLocaleTimeString();
  }
}

// Update worker target coordinates for random walk (RFID pings) or guide them to safety
function updateWorkerMovement() {
  appState.workers.forEach(w => {
    if (appState.emergencyMode) {
      // Guide all workers to Zone E (Safe Assembly Block)
      w.tx = 690;
      w.ty = 345 + (w.id % 20) * 4;
      w.zone = "Admin & Control (Zone E) [ASSEMBLY POINT]";
    } else {
      // Random walk within zone boundaries
      const distance = Math.sqrt((w.tx - w.x) ** 2 + (w.ty - w.y) ** 2);
      if (distance < 5) {
        // Find new target based on zone coordinates
        if (w.zone.includes("Coke Oven")) {
          w.tx = 80 + Math.random() * 200;
          w.ty = 80 + Math.random() * 100;
        } else if (w.zone.includes("Gas Mixing")) {
          w.tx = 420 + Math.random() * 280;
          w.ty = 80 + Math.random() * 80;
        } else if (w.zone.includes("Blast Furnace")) {
          w.tx = 80 + Math.random() * 200;
          w.ty = 300 + Math.random() * 120;
        } else if (w.zone.includes("Workshop")) {
          w.tx = 400 + Math.random() * 160;
          w.ty = 260 + Math.random() * 150;
        } else {
          w.tx = 650 + Math.random() * 80;
          w.ty = 260 + Math.random() * 150;
        }
      }
    }

    // Move worker closer to targets
    const speed = appState.emergencyMode ? 8 : 2;
    const dx = w.tx - w.x;
    const dy = w.ty - w.y;
    const length = Math.sqrt(dx * dx + dy * dy);

    if (length > 1) {
      w.x += (dx / length) * speed;
      w.y += (dy / length) * speed;
    }
  });
}

function recalculateRisk() {
  const result = computeCompoundRisk(appState);
  appState.compoundRiskScore = result.score;
  appState.riskExplanation = result.explanation;
  appState.agentVotes = result.agents;
}

function addSystemAlert(type, title, desc, zone) {
  const timeStr = new Date().toLocaleTimeString();
  appState.alerts.unshift({
    id: Date.now(),
    time: timeStr,
    type,
    title,
    desc,
    zone
  });

  // Limit to 20 alerts
  if (appState.alerts.length > 20) {
    appState.alerts.pop();
  }
}

// 5. Automated Emergency Trigger Actions
function triggerEmergency() {
  appState.emergencyMode = true;
  appState.emergencyTriggerTime = new Date().toLocaleTimeString();
  
  // Revoke all active permits to ensure immediate operational lockouts
  appState.permits.forEach(p => {
    p.status = "DENIED";
  });

  addSystemAlert("critical", "Plant Evacuation Triggered", "Automated alarm sequence active. Forced hot-work revocation applied system-wide.", "Coke Oven Battery (Zone A)");
  
  // Change header alarm button
  const alarmBtn = document.getElementById("btn-trigger-alarm");
  if (alarmBtn) {
    alarmBtn.innerText = "🚨 RECALL EVACUATION";
    alarmBtn.classList.remove("btn-danger");
    alarmBtn.style.backgroundColor = "transparent";
    alarmBtn.style.color = "var(--color-danger)";
    alarmBtn.style.borderColor = "var(--color-danger)";
  }

  recalculateRisk();
  
  // Force view redraw if on active tabs
  switchTab(appState.activeTab);
}

function cancelEmergency() {
  appState.emergencyMode = false;
  appState.emergencyTriggerTime = null;
  
  // Re-approve permits for simulation recovery
  appState.permits.forEach(p => {
    p.status = "APPROVED";
  });

  addSystemAlert("info", "Evacuation Recall Confirmed", "Emergency alarm canceled. All clear declared for safety blocks.", "Control Room");

  const alarmBtn = document.getElementById("btn-trigger-alarm");
  if (alarmBtn) {
    alarmBtn.innerText = "🚨 EVACUATE PLANT";
    alarmBtn.classList.add("btn-danger");
    alarmBtn.style.backgroundColor = "";
    alarmBtn.style.color = "";
    alarmBtn.style.borderColor = "";
  }

  recalculateRisk();
  switchTab(appState.activeTab);
}

// 6. UI Synchronization Functions
function refreshUIElements() {
  // Update Header Elements
  const headerScore = document.getElementById("head-risk-score");
  if (headerScore) {
    headerScore.innerText = `${appState.compoundRiskScore.toString().padStart(2, '0')}%`;
    headerScore.style.color = appState.compoundRiskScore > 65 ? "var(--color-danger)" : appState.compoundRiskScore > 30 ? "var(--color-warning)" : "var(--color-success)";
  }

  const badge = document.getElementById("system-status-badge");
  const badgeText = document.getElementById("system-status-text");
  if (badge && badgeText) {
    badge.className = "status-badge";
    if (appState.emergencyMode || appState.compoundRiskScore > 65) {
      badge.classList.add("critical");
      badgeText.innerText = "CRITICAL HAZARD";
    } else if (appState.compoundRiskScore > 30) {
      badge.classList.add("warning");
      badgeText.innerText = "RISK WARNING";
    } else {
      badge.classList.add("safe");
      badgeText.innerText = "SYSTEM SAFE";
    }
  }

  // Refresh active dashboard panels if user is viewing Dashboard
  if (appState.activeTab === "dashboard") {
    // Telemetry updates
    const ch4Val = document.getElementById("telemetry-ch4-val");
    if (ch4Val) ch4Val.innerText = `${appState.telemetry.ch4.toFixed(2)}`;
    
    const coVal = document.getElementById("telemetry-co-val");
    if (coVal) coVal.innerText = `${appState.telemetry.co}`;
    
    const tempVal = document.getElementById("telemetry-temp-val");
    if (tempVal) tempVal.innerText = `${appState.telemetry.temp.toFixed(1)}`;
    
    const fanVal = document.getElementById("telemetry-fan-val");
    if (fanVal) {
      fanVal.innerText = appState.telemetry.fanStatus;
      fanVal.style.color = appState.telemetry.fanStatus === "OFF" ? "var(--color-danger)" : "var(--color-success)";
    }

    // Risk Dial updates
    const fillRing = document.getElementById("risk-ring-fill");
    const ringScore = document.getElementById("risk-ring-score");
    if (fillRing && ringScore) {
      ringScore.innerText = `${appState.compoundRiskScore}%`;
      ringScore.style.color = appState.compoundRiskScore > 65 ? "var(--color-danger)" : appState.compoundRiskScore > 30 ? "var(--color-warning)" : "var(--color-success)";
      
      const circumference = 440;
      const offset = circumference - (appState.compoundRiskScore / 100) * circumference;
      fillRing.style.strokeDashoffset = offset;
      fillRing.style.stroke = appState.compoundRiskScore > 65 ? "var(--color-danger)" : appState.compoundRiskScore > 30 ? "var(--color-warning)" : "var(--color-success)";
    }

    const explanationEl = document.getElementById("risk-ai-explanation");
    if (explanationEl) {
      explanationEl.innerHTML = appState.riskExplanation;
    }

    // Refresh Agent Voting badges
    if (appState.agentVotes) {
      const agents = ["iot", "permit", "shift", "equipment"];
      agents.forEach(a => {
        const badge = document.getElementById(`agent-vote-${a}`);
        if (badge) {
          const vote = appState.agentVotes[a].vote;
          badge.innerText = vote;
          badge.className = "compliance-tag";
          if (vote === "CRITICAL") badge.classList.add("failed");
          else if (vote === "WARNING") {
            badge.style.backgroundColor = "var(--color-warning-bg)";
            badge.style.color = "var(--color-warning)";
          } else badge.classList.add("passed");
        }
      });
    }

    // Refresh Alerts list
    renderAlertList();
    
    // Refresh Heatmap circles
    updateHeatmap(appState);
  } else if (appState.activeTab === "heatmap") {
    updateHeatmap(appState);
  } else if (appState.activeTab === "permits") {
    // Redraw permits list
    renderActivePermits(appState);
  }
}

// 7. Dashboard View HTML renderer
function renderDashboardView() {
  const container = document.getElementById("app-viewport");
  if (!container) return;

  container.innerHTML = `
    <div class="dashboard-view">
      <!-- Title Row -->
      <div class="dashboard-title-row">
        <div>
          <h1>Operational Safety Command Center</h1>
          <p>Real-time telemetry, spatial hazard heatmaps, and autonomous multi-agent analysis.</p>
        </div>
        <div style="font-size:10px; color:var(--text-muted); font-family:var(--font-mono); letter-spacing:1px;">
          LATENCY: 14ms | LOG LINK: ESTABLISHED
        </div>
      </div>

      <!-- Top Row: Sensor Telemetry Cards -->
      <div class="grid-3">
        <!-- CH4 sensor -->
        <div class="panel telemetry-card">
          <span class="telemetry-label">Methane Index (CH4)</span>
          <div class="telemetry-value-container">
            <span class="telemetry-value" id="telemetry-ch4-val">0.12</span>
            <span class="telemetry-unit">% vol</span>
          </div>
          <div class="telemetry-trend ${simGasLeak ? 'up' : 'stable'}">
            <span>${simGasLeak ? '▲ INCREASING' : '■ STABLE'}</span>
            <span style="color:var(--text-muted)">• Coke Oven #3</span>
          </div>
        </div>

        <!-- CO sensor -->
        <div class="panel telemetry-card">
          <span class="telemetry-label">Carbon Monoxide (CO)</span>
          <div class="telemetry-value-container">
            <span class="telemetry-value" id="telemetry-co-val">15</span>
            <span class="telemetry-unit">ppm</span>
          </div>
          <div class="telemetry-trend ${simGasLeak ? 'up' : 'stable'}">
            <span>${simGasLeak ? '▲ INCREASING' : '■ STABLE'}</span>
            <span style="color:var(--text-muted)">• Blast Furnace</span>
          </div>
        </div>

        <!-- Fan & Temperature -->
        <div class="panel telemetry-card">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; width:100%;">
            <div>
              <span class="telemetry-label">Vent Exhaust Fan</span>
              <div style="font-family:var(--font-mono); font-size:18px; font-weight:700; margin-top:4px;" id="telemetry-fan-val">ON</div>
            </div>
            <div style="text-align:right;">
              <span class="telemetry-label">Exhaust Temp</span>
              <div style="font-family:var(--font-mono); font-size:18px; font-weight:700; margin-top:4px;"><span id="telemetry-temp-val">38.5</span>°C</div>
            </div>
          </div>
          <div class="telemetry-trend ${appState.telemetry.fanStatus === 'OFF' ? 'up' : 'stable'}" style="margin-top:auto;">
            <span>${appState.telemetry.fanStatus === 'OFF' ? '▲ OVERHEATING' : '■ NORMAL TEMP'}</span>
            <span style="color:var(--text-muted)">• Ventilation System</span>
          </div>
        </div>
      </div>

      <!-- Mid Row: Heatmap & Multi-Agent assessment -->
      <div class="grid-2-1">
        <!-- Spatial heatmap map block -->
        <div class="panel" style="display:flex; flex-direction:column; gap:10px;">
          <div class="panel-header">
            <div class="panel-title">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              Live Spatial Safety Layout Grid
            </div>
            <div style="font-family:var(--font-mono); font-size:10px; color:var(--text-muted); letter-spacing:0.5px;">RFID TRACKING ACTIVE</div>
          </div>
          
          <!-- Heatmap element mount target -->
          <div id="heatmap-container-el" class="heatmap-container">
            <!-- Heatmap loaded in Component -->
          </div>
        </div>

        <!-- Compound Risk & Voting Panel -->
        <div style="display:flex; flex-direction:column; gap:20px;">
          <!-- Risk score Gauge -->
          <div class="panel">
            <div class="panel-header">
              <div class="panel-title">Consensus Safety Score</div>
            </div>
            <div class="risk-gauge-container">
              <div class="risk-circle">
                <svg class="risk-circle-svg" viewBox="0 0 160 160">
                  <circle class="risk-circle-bg" cx="80" cy="80" r="70" />
                  <circle id="risk-ring-fill" class="risk-circle-fill" cx="80" cy="80" r="70" />
                </svg>
                <div class="risk-gauge-text">
                  <span id="risk-ring-score" class="risk-score-value">08%</span>
                  <span class="risk-score-label">Risk Rating</span>
                </div>
              </div>
            </div>

            <!-- Agent voting block -->
            <div style="margin-top:14px; border-top:1px solid rgba(99,130,202,0.08); padding-top:12px;">
              <h4 style="font-size:11px; font-weight:700; color:var(--text-muted); margin-bottom:10px; text-transform:uppercase; letter-spacing:1px;">Agent Votes:</h4>
              <div style="display:flex; flex-direction:column; gap:8px; font-size:12px; color:var(--text-secondary);">
                <div style="display:flex; justify-content:space-between;">
                  <span>IoT Telemetry Agent:</span>
                  <span id="agent-vote-iot" class="compliance-tag passed">SAFE</span>
                </div>
                <div style="display:flex; justify-content:space-between;">
                  <span>Permit Registry Agent:</span>
                  <span id="agent-vote-permit" class="compliance-tag passed">SAFE</span>
                </div>
                <div style="display:flex; justify-content:space-between;">
                  <span>Exhaust Fan Status Agent:</span>
                  <span id="agent-vote-equipment" class="compliance-tag passed">SAFE</span>
                </div>
                <div style="display:flex; justify-content:space-between;">
                  <span>Shift Transition Agent:</span>
                  <span id="agent-vote-shift" class="compliance-tag passed">SAFE</span>
                </div>
              </div>
            </div>
          </div>

          <!-- AI Explanation log -->
          <div class="panel">
            <div class="panel-header">
              <div class="panel-title">🛡️ Safety Explanation</div>
            </div>
            <p id="risk-ai-explanation" style="font-size:12px; line-height:1.5; color:var(--text-primary);">
              All systems safe. Single-sensors and operations are fully aligned. Risk is low.
            </p>
          </div>
        </div>
      </div>

      <!-- Bottom Row: Alarm Logs & Preset Scenarios triggers -->
      <div class="grid-2">
        <!-- Log Alert Stream -->
        <div class="panel">
          <div class="panel-header">
            <div class="panel-title">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Alarms & System Warnings Stream
            </div>
          </div>
          <div class="alert-list" id="alerts-list-el">
            <!-- Warning row logs loaded dynamically -->
          </div>
        </div>

        <!-- Preset Test Scenarios -->
        <div class="panel">
          <div class="panel-header">
            <div class="panel-title">🔬 Preset Hazard Simulation Sandbox</div>
          </div>
          <p style="font-size:12px; color:var(--text-muted); margin-bottom:14px; line-height:1.5;">
            Launch predefined dangerous operational states to verify multi-agent compound checks and autonomous siren alarm bypassing.
          </p>
          <div class="scenarios-grid">
            <button class="scenario-card" id="scen-gas-weld">
              <h3>1. Gas Leak + Hot Welding</h3>
              <p>Triggers CH4 leakage in Coke Battery containing active hot welding permit. (SIMOPS breach)</p>
            </button>

            <button class="scenario-card" id="scen-confined-fan">
              <h3>2. Confined Space + Fan Out</h3>
              <p>Fails extraction fans while workers are logged inside Coke Battery oven blocks.</p>
            </button>

            <button class="scenario-card" id="scen-shift-bypass">
              <h3>3. Handover Shift + Leak</h3>
              <p>Sparks methane leakage exactly during Shift Changeover logs lapse.</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Initialize geospatial plant heatmap inside container mount point
  initHeatmap(appState, (selectedZoneName) => {
    // Optional callback handler when clicking zones in map
  });

  // Render Alerts logs
  renderAlertList();

  // Attach Preset Scenario card listeners
  const sc1 = document.getElementById("scen-gas-weld");
  if (sc1) {
    sc1.addEventListener("click", () => {
      simGasLeak = true;
      // Re-style leak trigger button
      const leakBtn = document.getElementById("btn-quick-leak");
      if (leakBtn) {
        leakBtn.style.backgroundColor = "var(--color-warning)";
        leakBtn.style.color = "var(--bg-darker)";
      }

      addSystemAlert("warning", "SIMOPS Hazard Sequence Initiated", "Gas leakage starts inside Zone A which has active hot work PTW-402.", "Coke Oven Battery (Zone A)");
      recalculateRisk();
      refreshUIElements();
    });
  }

  const sc2 = document.getElementById("scen-confined-fan");
  if (sc2) {
    sc2.addEventListener("click", () => {
      simFanFailure = true;
      appState.telemetry.fanStatus = "OFF";
      const fanBtn = document.getElementById("btn-quick-fan");
      if (fanBtn) {
        fanBtn.style.backgroundColor = "var(--color-danger)";
        fanBtn.style.color = "white";
      }

      addSystemAlert("critical", "Ventilation Failure Sequence", "Exhaust fan shuts down. Zone A has active confined space permit PTW-204.", "Coke Oven Battery (Zone A)");
      recalculateRisk();
      refreshUIElements();
    });
  }

  const sc3 = document.getElementById("scen-shift-bypass");
  if (sc3) {
    sc3.addEventListener("click", () => {
      simGasLeak = true;
      const leakBtn = document.getElementById("btn-quick-leak");
      if (leakBtn) {
        leakBtn.style.backgroundColor = "var(--color-warning)";
        leakBtn.style.color = "var(--bg-darker)";
      }

      // Force Shift Handover window
      appState.isShiftHandover = true;

      addSystemAlert("warning", "Handoff Vulnerability Sequence", "Gas leak drifts while Shift handover block logs are active.", "Coke Oven Battery (Zone A)");
      recalculateRisk();
      refreshUIElements();
    });
  }

  // Pre-inspect Coke oven zone by default
  inspectZone("Coke Oven Battery (Zone A)", appState);
}

function renderAlertList() {
  const container = document.getElementById("alerts-list-el");
  if (!container) return;

  container.innerHTML = appState.alerts.map(a => `
    <div class="alert-item ${a.type}">
      <div class="alert-icon-container">
        ${a.type === 'critical' 
          ? `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>` 
          : a.type === 'warning'
          ? `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>`
          : `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`}
      </div>
      <div class="alert-content">
        <div class="alert-title">${a.title}</div>
        <div class="alert-desc">${a.desc}</div>
        <div class="alert-meta">
          <span>Time: ${a.time}</span>
          <span class="alert-zone">${a.zone}</span>
        </div>
      </div>
    </div>
  `).join("");
}

// 8. Renders separate standalone full layout view of heatmap
function renderHeatmapView() {
  const container = document.getElementById("app-viewport");
  if (!container) return;

  container.innerHTML = `
    <div class="dashboard-view">
      <div class="dashboard-title-row">
        <div>
          <h1>Real-time Geospatial Safety Layout Grid</h1>
          <p>Visualizing worker locations (RFID), hazardous zone status overlays, and evacuation vectors.</p>
        </div>
      </div>

      <div class="panel" style="display:flex; flex-direction:column; gap:10px;">
        <div class="panel-header">
          <div class="panel-title">
            🛡️ Facility Wide Safety Grid Map
          </div>
          <span style="font-family:var(--font-mono); font-size:12px; color:var(--text-secondary);" id="active-workers-count-heatmap">8 Workers RFID Beacons Online</span>
        </div>
        <div id="heatmap-container-el" class="heatmap-container" style="height: 520px;">
          <!-- Heatmap Component target -->
        </div>
      </div>
    </div>
  `;

  // Initialize heatmap component inside viewport mount point
  initHeatmap(appState, (selectedZoneName) => {
    // Inspect zone clicked details inside overlay inspector
  });

  // Pre-inspect Coke oven
  inspectZone("Coke Oven Battery (Zone A)", appState);
}
