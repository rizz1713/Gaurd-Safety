// Quality & Compliance Audit Agent Component

export function initCompliance(state) {
  const container = document.getElementById("app-viewport");
  if (!container) return;

  // Dynamically calculate compliance score based on active hazards
  let complianceScore = 100;
  const violations = [];
  const capaTickets = [];

  const ch4 = state.telemetry.ch4;
  const fan = state.telemetry.fanStatus;
  const hasHotWork = state.permits.some(p => p.type === "Hot Work" && p.status === "APPROVED");
  const hasConfinedSpace = state.permits.some(p => p.type === "Confined Space" && p.status === "APPROVED");

  // Audit Rule checks
  if (ch4 > 0.5) {
    complianceScore -= 15;
    violations.push({
      code: "OISD-105 §6.2",
      standard: "Work Permit Systems",
      desc: `Methane concentration (${ch4.toFixed(2)}%) exceeds the statutory hot work threshold limit (0.50%).`
    });
    
    capaTickets.push({
      id: "CAPA-901",
      task: "Halt Hot Work Operations & Flush Lines",
      priority: "IMMEDIATE",
      status: "OPEN",
      owner: "Safety Inspector (Shift A)"
    });
  }

  if (fan === "OFF") {
    complianceScore -= 20;
    violations.push({
      code: "Factories Act §36",
      standard: "Dangerous Fumes & Ventilation",
      desc: "Forced extraction ventilation fan in Coke Oven Battery is reporting OFFLINE."
    });

    capaTickets.push({
      id: "CAPA-902",
      task: "Inspect Fan Motor Exhaust Circuits",
      priority: "HIGH",
      status: "OPEN",
      owner: "Maintenance Engineer (Electrical)"
    });
  }

  if (hasHotWork && ch4 > 0.5) {
    complianceScore -= 25;
    violations.push({
      code: "DGMS Circular (SIMOPS)",
      standard: "Simultaneous Operations Protection",
      desc: "Simultaneous Operations (SIMOPS) overlap: Active hot work welding permits overlap with elevated gas leakage levels."
    });

    capaTickets.push({
      id: "CAPA-903",
      task: "Force-Revoke Hot Work Permit PTW-402",
      priority: "IMMEDIATE",
      status: state.emergencyMode ? "RESOLVED (AUTO-REVOKED)" : "OPEN",
      owner: "System Safety AI Core"
    });
  }

  if (hasConfinedSpace && fan === "OFF") {
    complianceScore -= 20;
    violations.push({
      code: "Factories Act §36(2)",
      standard: "Confined Space Entry Certs",
      desc: "Confined Space entry active in Coke Oven area while forced ventilation exhaust is offline."
    });

    capaTickets.push({
      id: "CAPA-904",
      task: "Evacuate Vessel entry teams & Verify O2 levels",
      priority: "IMMEDIATE",
      status: state.emergencyMode ? "RESOLVED (AUTO-REVOKED)" : "OPEN",
      owner: "Shift Supervisor B"
    });
  }

  complianceScore = Math.max(10, complianceScore);

  // Render view
  container.innerHTML = `
    <div class="dashboard-view">
      <div class="dashboard-title-row">
        <div>
          <h1>Quality & Compliance Audit Center</h1>
          <p>Continuous facility safety validation against Factories Act, OISD, and DGMS circulars.</p>
        </div>
      </div>

      <div class="grid-3" style="margin-bottom:10px;">
        <!-- Card 1: Score -->
        <div class="panel" style="text-align:center;">
          <h3 style="font-size:12px; color:var(--text-secondary); text-transform:uppercase; margin-bottom:8px;">Compliance Rating</h3>
          <div style="font-family:var(--font-mono); font-size:48px; font-weight:900; color:${complianceScore > 80 ? 'var(--color-success)' : complianceScore > 50 ? 'var(--color-warning)' : 'var(--color-danger)'}">
            ${complianceScore}%
          </div>
          <p style="font-size:12px; color:var(--text-muted); margin-top:4px;">
            ${complianceScore > 80 ? 'OISD Audit Rating: EXCELLENT' : complianceScore > 50 ? 'OISD Audit Rating: ACTION REQUIRED' : 'OISD Audit Rating: CRITICAL NON-COMPLIANCE'}
          </p>
        </div>

        <!-- Card 2: Standards Checked -->
        <div class="panel">
          <h3 style="font-size:12px; color:var(--text-secondary); text-transform:uppercase; margin-bottom:12px;">Regulatory Checklists</h3>
          <div class="compliance-row">
            <span class="compliance-text">OISD-105 (Permit Systems)</span>
            <span class="compliance-tag ${ch4 > 0.5 ? 'failed' : 'passed'}">${ch4 > 0.5 ? 'FAIL' : 'PASS'}</span>
          </div>
          <div class="compliance-row">
            <span class="compliance-text">Factories Act §36 (Fume Safety)</span>
            <span class="compliance-tag ${fan === 'OFF' ? 'failed' : 'passed'}">${fan === 'OFF' ? 'FAIL' : 'PASS'}</span>
          </div>
          <div class="compliance-row">
            <span class="compliance-text">DGMS Circular (SIMOPS safety)</span>
            <span class="compliance-tag ${(hasHotWork && ch4 > 0.5) ? 'failed' : 'passed'}">${(hasHotWork && ch4 > 0.5) ? 'FAIL' : 'PASS'}</span>
          </div>
        </div>

        <!-- Card 3: Active Violations counter -->
        <div class="panel">
          <h3 style="font-size:12px; color:var(--text-secondary); text-transform:uppercase; margin-bottom:8px;">Active Infringements</h3>
          <div style="font-family:var(--font-mono); font-size:48px; font-weight:900; color:${violations.length > 0 ? 'var(--color-danger)' : 'var(--color-success)'}">
            ${violations.length}
          </div>
          <p style="font-size:12px; color:var(--text-muted); margin-top:4px;">
            Requires immediate supervisor sign-off.
          </p>
        </div>
      </div>

      <div class="grid-2">
        <!-- Violations logs -->
        <div class="panel">
          <div class="panel-header">
            <div class="panel-title" style="color:var(--color-danger);">
              ⚠️ Audit Infringements Detected
            </div>
          </div>
          <div style="display:flex; flex-direction:column; gap:12px; max-height:280px; overflow-y:auto; padding-right:6px;">
            ${violations.length === 0 ? `
              <div style="font-size:13px; color:var(--text-secondary); text-align:center; padding:40px 0;">
                ✔️ Zero regulatory infringements flagged in active operations.
              </div>
            ` : violations.map(v => `
              <div style="background-color:rgba(239, 68, 68, 0.03); border:1px solid var(--border-color); padding:10px 14px; border-radius:6px;">
                <div style="display:flex; justify-content:space-between; font-size:12px; font-weight:700; margin-bottom:4px;">
                  <span style="color:var(--color-danger); font-family:var(--font-mono);">${v.code}</span>
                  <span style="color:var(--text-secondary);">${v.standard}</span>
                </div>
                <p style="font-size:12px; color:var(--text-primary);">${v.desc}</p>
              </div>
            `).join("")}
          </div>
        </div>

        <!-- Corrective Action Tickets (CAPA) -->
        <div class="panel">
          <div class="panel-header">
            <div class="panel-title">
              📋 Corrective & Preventive Actions (CAPA)
            </div>
          </div>
          <div style="display:flex; flex-direction:column; gap:10px; max-height:280px; overflow-y:auto; padding-right:6px;">
            ${capaTickets.length === 0 ? `
              <div style="font-size:13px; color:var(--text-secondary); text-align:center; padding:40px 0;">
                No open corrective tickets generated.
              </div>
            ` : capaTickets.map(c => `
              <div style="background-color:var(--bg-accent); border:1px solid var(--border-color); padding:10px 14px; border-radius:6px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                  <span style="font-family:var(--font-mono); font-size:11px; font-weight:700; color:var(--color-info);">${c.id}</span>
                  <span style="font-size:10px; padding:2px 6px; border-radius:4px; font-weight:600; background-color:${c.priority === 'IMMEDIATE' ? 'var(--color-danger-bg)' : 'var(--color-warning-bg)'}; color:${c.priority === 'IMMEDIATE' ? 'var(--color-danger)' : 'var(--color-warning)'};">${c.priority}</span>
                </div>
                <div style="font-size:13px; font-weight:600; color:var(--text-primary);">${c.task}</div>
                <div style="display:flex; justify-content:space-between; margin-top:6px; font-size:11px; color:var(--text-secondary);">
                  <span>Owner: ${c.owner}</span>
                  <span style="font-weight:700; color:${c.status.includes('RESOLVED') ? 'var(--color-success)' : 'var(--color-warning)'};">${c.status}</span>
                </div>
              </div>
            `).join("")}
          </div>
        </div>
      </div>
    </div>
  `;
}
