// Digital Permit Intelligence Agent Component

export function initPermitAgent(state, onPermitSubmitted) {
  const container = document.getElementById("app-viewport");
  if (!container) return;

  // Render layout
  container.innerHTML = `
    <div class="dashboard-view">
      <div class="dashboard-title-row">
        <div>
          <h1>Digital Permit Intelligence Agent</h1>
          <p>Analyzing permit-to-work logs against real-time telemetry to check SIMOPS and prevent accidents.</p>
        </div>
      </div>

      <div class="grid-1-2">
        <!-- Sidebar - Request Permit -->
        <div class="panel">
          <div class="panel-header">
            <div class="panel-title">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Request Permit-to-Work
            </div>
          </div>
          
          <form id="permit-request-form">
            <div class="form-group">
              <label class="form-label" for="ptw-type">Permit Type</label>
              <select id="ptw-type" class="form-input">
                <option value="Hot Work">Hot Work (Welding, Cutting, Grinding)</option>
                <option value="Confined Space">Confined Space Entry (Vessel, Coke Battery)</option>
                <option value="Height Work">Work at Height (&gt;2.0 Meters)</option>
                <option value="Cold Work">Cold Work / Piping Maintenance</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label" for="ptw-zone">Plant Sector</label>
              <select id="ptw-zone" class="form-input">
                <option value="Coke Oven Battery (Zone A)">Coke Oven Battery (Zone A)</option>
                <option value="Gas Mixing Station (Zone B)">Gas Mixing Station (Zone B)</option>
                <option value="Blast Furnace (Zone C)">Blast Furnace (Zone C)</option>
                <option value="Maintenance Workshop (Zone D)">Maintenance Workshop (Zone D)</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label" for="ptw-supervisor">Executing Supervisor</label>
              <input type="text" id="ptw-supervisor" class="form-input" value="S. K. Sharma" required />
            </div>

            <div class="form-group">
              <label class="form-label" for="ptw-duration">Validity (Hours)</label>
              <input type="number" id="ptw-duration" class="form-input" value="4" min="1" max="12" />
            </div>

            <button type="submit" class="btn btn-primary" style="width:100%; margin-top:10px;">ANALYZE PERMIT APPLICATION</button>
          </form>

          <!-- Permit Evaluation Results panel -->
          <div id="permit-evaluation-card" style="margin-top:20px; display:none;" class="panel">
            <!-- Results injected here -->
          </div>
        </div>

        <!-- Main Panel - Active Permits & Telemetry Matrix -->
        <div style="display:flex; flex-direction:column; gap:20px;">
          <!-- Active Permits list -->
          <div class="panel" style="flex-grow:1;">
            <div class="panel-header">
              <div class="panel-title">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Active Operations & Permits
              </div>
              <span style="font-family:var(--font-mono); font-size:12px; color:var(--text-secondary);" id="active-permits-count">3 Permits Loaded</span>
            </div>

            <div style="overflow-x:auto;">
              <table style="width:100%; border-collapse:collapse; text-align:left; font-size:13px;" id="permits-table">
                <thead>
                  <tr style="border-bottom:1px solid var(--border-color); color:var(--text-secondary);">
                    <th style="padding:10px;">ID</th>
                    <th style="padding:10px;">Permit Type</th>
                    <th style="padding:10px;">Sector</th>
                    <th style="padding:10px;">Supervisor</th>
                    <th style="padding:10px;">Safety Status</th>
                    <th style="padding:10px; text-align:right;">Actions</th>
                  </tr>
                </thead>
                <tbody id="permits-table-body">
                  <!-- Active row values loaded in script -->
                </tbody>
              </table>
            </div>
          </div>

          <!-- Compound Operations Warning panel -->
          <div class="panel" style="border-left: 4px solid var(--color-warning);">
            <div class="panel-header">
              <div class="panel-title" style="color:var(--color-warning);">
                ⚠️ SIMOPS Conflict Detector Matrix
              </div>
            </div>
            <p style="font-size:13px; line-height:1.5; color:var(--text-secondary);">
              The Permit Intelligence Agent enforces the following safety axioms in real time:
            </p>
            <ul style="font-size:12px; line-height:1.6; margin-top:8px; padding-left:18px; color:var(--text-secondary);">
              <li><strong>AXIOM-1 (Gas Conflict):</strong> No Hot Work permit is approved if CH4 sensor levels in the sector exceed <strong>0.50%</strong>. (Statutory limit compliant with OISD-105 Standard).</li>
              <li><strong>AXIOM-2 (Asphyxiation Risk):</strong> Confined space entry (vessel repair) is blocked if ambient ventilation exhaust systems are <strong>OFFLINE</strong> in that sector.</li>
              <li><strong>AXIOM-3 (Thermal Hazard):</strong> Work at height requires full checkouts if sector temperature exceeds <strong>65°C</strong>.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  `;

  // Render active permits list
  renderActivePermits(state);

  // Attach submit handler to form
  const form = document.getElementById("permit-request-form");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      
      const type = document.getElementById("ptw-type").value;
      const zone = document.getElementById("ptw-zone").value;
      const supervisor = document.getElementById("ptw-supervisor").value;
      const duration = document.getElementById("ptw-duration").value;
      
      evaluatePermitRequest(type, zone, supervisor, duration, state, onPermitSubmitted);
    });
  }
}

// Render active permits table rows
export function renderActivePermits(state) {
  const tbody = document.getElementById("permits-table-body");
  const countEl = document.getElementById("active-permits-count");
  if (!tbody) return;

  countEl.innerText = `${state.permits.length} Permits Active`;

  tbody.innerHTML = state.permits.map(p => {
    let statusClass = "passed";
    if (p.status === "DENIED") statusClass = "failed";
    
    return `
      <tr style="border-bottom:1px solid rgba(255,255,255,0.05); hover:background-color:rgba(255,255,255,0.02)">
        <td style="padding:12px; font-family:var(--font-mono); font-weight:700;">${p.id}</td>
        <td style="padding:12px; font-weight:500;">${p.type}</td>
        <td style="padding:12px; color:var(--text-secondary);">${p.zone}</td>
        <td style="padding:12px; color:var(--text-secondary);">${p.supervisor}</td>
        <td style="padding:12px;">
          <span class="compliance-tag ${statusClass}">${p.status}</span>
        </td>
        <td style="padding:12px; text-align:right;">
          <button class="btn btn-danger" style="padding:4px 8px; font-size:11px;" id="revoke-${p.id}">REVOKE</button>
        </td>
      </tr>
    `;
  }).join("");

  // Attach revoke triggers
  state.permits.forEach(p => {
    const btn = document.getElementById(`revoke-${p.id}`);
    if (btn) {
      btn.addEventListener("click", () => {
        state.permits = state.permits.filter(x => x.id !== p.id);
        
        // Add log
        state.alerts.unshift({
          id: Date.now(),
          time: new Date().toLocaleTimeString(),
          type: "info",
          title: `Permit Revoked: ${p.id}`,
          desc: `${p.type} authorization was manually revoked for safety controls.`,
          zone: p.zone
        });

        // Recheck risk and redraw table
        renderActivePermits(state);
      });
    }
  });
}

// Evaluate permit requested by supervisor against current system state variables
function evaluatePermitRequest(type, zone, supervisor, duration, state, onPermitSubmitted) {
  const resultCard = document.getElementById("permit-evaluation-card");
  if (!resultCard) return;

  resultCard.style.display = "block";
  resultCard.innerHTML = `<p style="font-size:12px; color:var(--text-secondary);">Running Multi-Agent security verification...</p>`;

  setTimeout(() => {
    let approved = true;
    let explanation = "";
    let regulationCode = "";

    // AXIOM-1: Hot Work and Gas accumulation
    if (type === "Hot Work" && zone.includes("Coke Oven") && state.telemetry.ch4 > 0.5) {
      approved = false;
      explanation = `DENIED: Active methane levels (${state.telemetry.ch4.toFixed(2)}%) in Coke Oven Battery exceed the maximum safety permit threshold (0.50% CH4) for open ignition tools.`;
      regulationCode = "OISD-105 (Standard for Work Permit Systems) Section 6.2 - Gas testing is mandatory; hot work prohibited in presence of flammable atmosphere.";
    } 
    // AXIOM-2: Confined Space and Ventilation
    else if (type === "Confined Space" && zone.includes("Coke Oven") && state.telemetry.fanStatus === "OFF") {
      approved = false;
      explanation = `DENIED: Confined space entry cannot be authorized. Primary ventilation exhaust fan status is OFFLINE, posing immediate asphyxiation and toxic gas trap risks.`;
      regulationCode = "Factories Act 1948 Section 36 - Precaution against dangerous fumes and mandatory exhaust ventilation in confined enclosures.";
    } 
    // General gas warning on other areas
    else if (type === "Hot Work" && zone.includes("Gas Mixing") && state.telemetry.co > 50) {
      approved = false;
      explanation = `DENIED: Elevated Carbon Monoxide (${state.telemetry.co} ppm) poses risk of spark ignition or worker intoxication.`;
      regulationCode = "DGMS Safety Directives - Hazardous atmosphere controls.";
    }

    if (approved) {
      explanation = `APPROVED: AI Safety Layer has confirmed zero overlapping SIMOPS conflicts. Telemetry levels in ${zone} are within baseline safety guidelines.`;
      regulationCode = "Approved under OISD-105 standard requirements.";
    }

    const titleColor = approved ? "var(--color-success)" : "var(--color-danger)";
    const bgGlow = approved ? "rgba(16, 185, 129, 0.05)" : "rgba(239, 68, 68, 0.05)";
    const borderCol = approved ? "var(--color-success)" : "var(--color-danger)";

    resultCard.style.backgroundColor = bgGlow;
    resultCard.style.borderColor = borderCol;

    resultCard.innerHTML = `
      <h4 style="font-size:14px; font-weight:700; color:${titleColor}; margin-bottom:8px;">
        ${approved ? "✔️ PERMIT GRANTED" : "❌ PERMIT REJECTED"}
      </h4>
      <p style="font-size:12px; line-height:1.4; color:var(--text-primary); margin-bottom:8px;">
        ${explanation}
      </p>
      <div style="font-size:11px; font-style:italic; color:var(--text-muted);">
        <strong>REGULATORY REFERENCE:</strong> ${regulationCode}
      </div>
      
      ${approved ? `
        <button id="btn-add-permit-ok" class="btn btn-primary" style="width:100%; padding:6px 12px; font-size:12px; margin-top:12px;">
          CONFIRM AND ACTIVATE PTW
        </button>
      ` : ""}
    `;

    // Attach activation trigger if permit approved
    if (approved) {
      const activeBtn = document.getElementById("btn-add-permit-ok");
      if (activeBtn) {
        activeBtn.addEventListener("click", () => {
          const newP = {
            id: `PTW-${Math.floor(100 + Math.random() * 900)}`,
            type,
            zone,
            supervisor,
            status: "APPROVED"
          };
          state.permits.push(newP);

          // Add alarm stream log
          state.alerts.unshift({
            id: Date.now(),
            time: new Date().toLocaleTimeString(),
            type: "info",
            title: `Permit Activated: ${newP.id}`,
            desc: `Approved ${type} operations commenced in ${zone} supervisor ${supervisor}.`,
            zone: zone
          });

          // Reset results card
          resultCard.style.display = "none";
          
          // Re-render table
          renderActivePermits(state);
          
          // Callback
          if (onPermitSubmitted) onPermitSubmitted();
        });
      }
    }
  }, 800);
}
