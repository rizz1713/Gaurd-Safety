// Emergency Response Orchestrator Component

export function initOrchestrator(state, onTriggerEmergency, onCancelEmergency) {
  const container = document.getElementById("app-viewport");
  if (!container) return;

  // Compile active incident timeline details
  const triggerTime = state.emergencyTriggerTime || "N/A";
  
  // Render structure
  container.innerHTML = `
    <div class="dashboard-view">
      <div class="dashboard-title-row">
        <div>
          <h1>Emergency Response Orchestrator</h1>
          <p>Autonomous evacuation, communication log, and compliance evidence preservation.</p>
        </div>
      </div>

      <div class="grid-2-1">
        <!-- Main Panel: Orchestrated Workflow Status -->
        <div class="panel" style="border-top: 4px solid ${state.emergencyMode ? 'var(--color-danger)' : 'var(--color-success)'};">
          <div class="panel-header">
            <div class="panel-title" style="color:${state.emergencyMode ? 'var(--color-danger)' : 'var(--color-success)'}">
              🚨 Automated Safety Evacuation Protocol
            </div>
            <span style="font-family:var(--font-mono); font-size:12px;">STATUS: ${state.emergencyMode ? 'ACTIVATED' : 'STANDBY'}</span>
          </div>

          <div style="margin-bottom:20px;">
            ${state.emergencyMode ? `
              <div style="background-color:var(--color-danger-bg); border:1px solid var(--color-danger); padding:16px; border-radius:8px; display:flex; flex-direction:column; gap:8px; margin-bottom:20px; animation:pulse-border 1.5s infinite;">
                <h3 style="color:var(--color-danger); font-size:16px; font-weight:700;">⚠ PLANT EVACUATION ACTIVE</h3>
                <p style="font-size:13px;">Critical compound hazard trigger occurred at <strong>${triggerTime}</strong>. Automated alarm sequences have bypassed manual operator checkpoints.</p>
                <div style="display:flex; gap:10px; margin-top:8px;">
                  <button class="btn" id="btn-cancel-evac" style="border-color:var(--color-success); color:var(--color-success); background:transparent;">CANCEL ALARM / FALSE ALARM</button>
                </div>
              </div>
            ` : `
              <div style="background-color:rgba(255,255,255,0.02); border:1px solid var(--border-color); padding:16px; border-radius:8px; display:flex; flex-direction:column; gap:8px; margin-bottom:20px;">
                <h3 style="font-size:15px; font-weight:600; color:var(--text-primary);">Manual Protocol Activation</h3>
                <p style="font-size:12px; color:var(--text-secondary);">Safety officers can force plant evacuation if localized hazardous fumes, fire, or structure threats are spotted visually.</p>
                <div style="margin-top:4px;">
                  <button class="btn btn-danger" id="btn-trigger-evac-manual">FORCE EVACUATION ALARM</button>
                </div>
              </div>
            `}

            <!-- Step by Step Orchestrated List -->
            <div style="display:flex; flex-direction:column; gap:12px;">
              <h4 style="font-size:13px; font-weight:700; color:var(--text-secondary); text-transform:uppercase;">Orchestrator Execution Checklist:</h4>
              
              <div class="dispatch-item ${state.emergencyMode ? 'arrived' : ''}">
                <div class="dispatch-status"></div>
                <div>
                  <strong>Siren & Broadcast Trigger:</strong> 
                  <span style="color:var(--text-secondary);">${state.emergencyMode ? 'Active. Audio alerts broadcasting on Coke Oven and Gas Mixing blocks.' : 'Inactive. Siren system set to Standby.'}</span>
                </div>
              </div>

              <div class="dispatch-item ${state.emergencyMode ? 'arrived' : ''}">
                <div class="dispatch-status"></div>
                <div>
                  <strong>Dynamic Escape Routing:</strong> 
                  <span style="color:var(--text-secondary);">${state.emergencyMode ? 'Active. Rendered green emergency vector arrows from Zones A & B to Zone E on layout.' : 'Inactive. Routing overlays disabled.'}</span>
                </div>
              </div>

              <div class="dispatch-item ${state.emergencyMode ? 'arrived' : ''}">
                <div class="dispatch-status"></div>
                <div>
                  <strong>Preserve Telemetry Audit:</strong> 
                  <span style="color:var(--text-secondary);">${state.emergencyMode ? 'Active. Locked SCADA registers, and archived 30-min window before alarm.' : 'Inactive. Telemetry writing active.'}</span>
                </div>
              </div>

              <div class="dispatch-item ${state.emergencyMode ? 'dispatched' : ''}">
                <div class="dispatch-status"></div>
                <div>
                  <strong>Emergency SMS broadcast:</strong> 
                  <span style="color:var(--text-secondary);">${state.emergencyMode ? 'Dispatched SMS: [GuardSafety Alert: Methane accumulation and fan failure in Zone A. Evacuate to Assembly Point immediately!]' : 'Inactive.'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar Panel: Dispatch & Reporting -->
        <div style="display:flex; flex-direction:column; gap:20px;">
          <!-- Incident Report compilation -->
          <div class="panel">
            <div class="panel-header">
              <div class="panel-title">📄 Factories Act Form 24 Report</div>
            </div>
            <p style="font-size:12px; color:var(--text-secondary); line-height:1.4; margin-bottom:12px;">
              Regulatory-compliant incident evidence report compiled automatically for Factory Inspectors (Factories Act Chapter IV, Section 38).
            </p>
            <button class="btn btn-primary" id="btn-download-report" style="width:100%;" ${state.emergencyMode ? '' : 'disabled'}>
              DOWNLOAD COMPLIANCE REPORT
            </button>
            ${!state.emergencyMode ? `
              <div style="font-size:11px; color:var(--text-muted); text-align:center; margin-top:8px;">
                Report compiles dynamically during active emergencies.
              </div>
            ` : ""}
          </div>

          <!-- Emergency Responders Dispatch -->
          <div class="panel">
            <div class="panel-header">
              <div class="panel-title">🚒 Responder Dispatch</div>
            </div>
            <div class="dispatch-list">
              <div class="dispatch-item ${state.emergencyMode ? 'arrived' : ''}">
                <div class="dispatch-status"></div>
                <div style="display:flex; justify-content:space-between; width:100%;">
                  <span>Fire Tender #1 (Refinery)</span>
                  <span style="color:var(--color-success);">${state.emergencyMode ? 'ARRIVED' : 'STANDBY'}</span>
                </div>
              </div>
              <div class="dispatch-item ${state.emergencyMode ? 'arrived' : ''}">
                <div class="dispatch-status"></div>
                <div style="display:flex; justify-content:space-between; width:100%;">
                  <span>Ambulance Medic #3</span>
                  <span style="color:var(--color-success);">${state.emergencyMode ? 'ARRIVED' : 'STANDBY'}</span>
                </div>
              </div>
              <div class="dispatch-item ${state.emergencyMode ? 'dispatched' : ''}">
                <div class="dispatch-status"></div>
                <div style="display:flex; justify-content:space-between; width:100%;">
                  <span>Safety Supervisor Rescue</span>
                  <span style="color:var(--color-warning);">${state.emergencyMode ? 'DISPATCHED' : 'STANDBY'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Attach button event handlers
  const cancelBtn = document.getElementById("btn-cancel-evac");
  if (cancelBtn) {
    cancelBtn.addEventListener("click", () => {
      if (onCancelEmergency) onCancelEmergency();
    });
  }

  const manualBtn = document.getElementById("btn-trigger-evac-manual");
  if (manualBtn) {
    manualBtn.addEventListener("click", () => {
      if (onTriggerEmergency) onTriggerEmergency();
    });
  }

  const downloadBtn = document.getElementById("btn-download-report");
  if (downloadBtn && state.emergencyMode) {
    downloadBtn.addEventListener("click", () => {
      downloadIncidentReport(state);
    });
  }
}

// Generate text payload representing Factories Act Form 24 Incident Report and prompt client-side download
function downloadIncidentReport(state) {
  const triggerTime = state.emergencyTriggerTime || new Date().toLocaleTimeString();
  const dateStr = new Date().toDateString();

  const reportText = `======================================================================
FACTORIES ACT 1948 - FORM 24: ACCIDENT / INCIDENT INVESTIGATION REPORT
======================================================================
Generated Automatically by: GuardSafety AI Command Layer
Audit Timestamp           : ${dateStr} at ${triggerTime}
Facility Location         : Steel Processing Plant - Coke Oven Battery

1. SYSTEM STATUS AT TRIGGER TIME
--------------------------------
Alarm Trigger Time       : ${triggerTime}
Compound Risk Rating     : ${state.compoundRiskScore}/100 (CRITICAL)
Initial Sensor Trigger   : Coke Oven Battery - Zone A
Telemetry Snapshot       :
  - Methane (CH4) Gas Index: ${state.telemetry.ch4.toFixed(2)}% (Safety Limit: 0.50%)
  - Carbon Monoxide (CO)   : ${state.telemetry.co} ppm (Safety Limit: 50 ppm)
  - Fan Ventilation Status : ${state.telemetry.fanStatus} (Safety Limit: ON)
  - Sensor Exhaust Temp    : ${state.telemetry.temp.toFixed(1)}°C (Safety Limit: 75°C)

2. ACTIVE PERMIT-TO-WORK (PTW) INVENTORY
----------------------------------------
Active Operations during trigger:
${state.permits.length > 0 ? state.permits.map(p => `  - ID: ${p.id} | Type: ${p.type} | Area: ${p.zone} | Supervisor: ${p.supervisor} | Status: ${p.status}`).join("\n") : "  - No active high-risk permits in system."}

3. MULTI-AGENT DIAGNOSIS
------------------------
Summary of Compound Danger detected by safety intelligence agents:
- IoT Agent Alert      : Methane levels are elevated above combustible risk parameters.
- Equipment Agent Alert: Primary extraction ventilation fans returned FAILURE status.
- Permit Agent Alert   : SIMOPS conflict detected! Active hot work permits were being carried out in proximity of gas accumulation.
- Shift Handover Alert : Warning telemetry co-occurred during shift changeover, leading to communications vulnerabilities.

4. AUTOMATED AUDIT AND EMERGENCY DISPATCH TIMELINE
--------------------------------------------------
[T-00m 00s] - Multi-Agent Core detected CH4 sensor at ${state.telemetry.ch4.toFixed(2)}% while ventilation status = OFF.
[T-00m 02s] - Automated alarm issued plant-wide, bypassing manual shift logs.
[T-00m 05s] - Terminated active Permits PTW-402 (Hot Work) in Zone A.
[T-00m 10s] - Evacuation arrows overlay rendered on Safety Heatmap.
[T-00m 12s] - Dispatched Fire Tender #1 and Ambulance Medic #3 to Zone A coordinates.
[T-00m 15s] - Broadcasted emergency SMS warnings to RFID tracking tags of 8 active workers.
[T-00m 20s] - Preservation lockout of SCADA telemetry databases completed.

5. REGULATORY CLAUSE INFRINGEMENT LOGS
--------------------------------------
- OISD-105 Section 6.2: INFRINGEMENT. Hot work welding permitted in flammable atmosphere (CH4 > 0.50%).
- Factories Act 1948 Section 36: INFRINGEMENT. Worker presence allowed in confined space while ventilation exhaust fans failed.
- OISD-GDN-115 Section 5.1: INFRINGEMENT. Safety alerts manual handoff delay exceeded critical boundary.

REPORT COMPILED BY: GUARDSAFETY AI ENGINE
======================================================================
`;

  const blob = new Blob([reportText], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `Factories_Act_Form24_Report_${dateStr.replace(/ /g, "_")}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
