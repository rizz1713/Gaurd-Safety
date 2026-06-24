// System Architecture Diagram Component

const ARCH_NODES = {
  telemetry: {
    title: "SCADA & Telemetry Ingestion (IoT)",
    details: "Feeds real-time data from localized PLC gas pressure, methane sensors, carbon monoxide logs, temperature detectors, and exhaust fan relays.",
    format: "Data Protocol: Modbus / OPC-UA / MQTT broker stream."
  },
  permits: {
    title: "Permit-to-Work database (PTW)",
    details: "Contains digital safety records of authorized maintenance, hot work, height work, or vessel entries, tagged with sector coordinates.",
    format: "Data Protocol: REST API / SQL Database logs."
  },
  rfid: {
    title: "Worker RFID tracking tags",
    details: "Tracks personnel zone locations continuously to check safety clearances and coordinate evacuation routes.",
    format: "Data Protocol: RFID / BLE beacons spatial coordinates."
  },
  multiagent: {
    title: "Multi-Agent safety layer",
    details: "Spawns autonomous validation agents (IoT agent, Permit agent, Shift agent) which evaluate telemetry, overlaps, and shift records independently.",
    format: "Algorithm: Consensus-voting and regulatory compliance axioms check."
  },
  rag: {
    title: "Regulatory RAG Database",
    details: "Indexed corpus containing OISD-105 standards, Factory Act Section regulations, DGMS safety circulars, and historical incident records (Visakhapatnam coke oven accident details).",
    format: "Retrieval Method: Vector semantic search and text chunk ingestion."
  },
  consensus: {
    title: "Compound Risk consensus engine",
    details: "Fuses isolated warnings into a combined Compound Risk score (0-100) and formulates natural language alerts explaining SIMOPS conflicts.",
    format: "Model: Multi-agent heuristic scoring + simulated LLM synthesis."
  },
  emergency: {
    title: "Emergency Response Orchestrator",
    details: "Bypasses manual communication queues to fire PA siren alerts, deploy safety responders, push RFID SMS, and write Factories Act compliance logs.",
    format: "Actions: Webhook alerts, SMS dispatch, Factories Act Form 24 PDF compilation."
  }
};

export function initArchitecture(state) {
  const container = document.getElementById("app-viewport");
  if (!container) return;

  container.innerHTML = `
    <div class="dashboard-view">
      <div class="dashboard-title-row">
        <div>
          <h1>System Architecture & Data Pipelines</h1>
          <p>Interactive diagram showing GuardSafety AI data ingestion, agent voting, and response pipelines.</p>
        </div>
      </div>

      <div class="grid-2-1">
        <!-- Diagram Area -->
        <div class="panel arch-diagram-container" style="background-color:var(--bg-darker); min-height:480px;">
          <svg width="100%" height="420" viewBox="0 0 700 420" id="arch-svg">
            <defs>
              <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--border-color-glow)" />
              </marker>
            </defs>

            <!-- 1. Input Layer -->
            <g class="arch-node" id="node-telemetry">
              <rect x="30" y="50" width="160" height="50" rx="6" fill="var(--bg-surface)" stroke="var(--color-info)" stroke-width="1.5" />
              <text x="110" y="80" fill="#fff" font-size="12px" text-anchor="middle" font-weight="600">IoT Telemetry (SCADA)</text>
            </g>

            <g class="arch-node" id="node-permits">
              <rect x="30" y="140" width="160" height="50" rx="6" fill="var(--bg-surface)" stroke="var(--color-info)" stroke-width="1.5" />
              <text x="110" y="170" fill="#fff" font-size="12px" text-anchor="middle" font-weight="600">Permit Registry (PTW)</text>
            </g>

            <g class="arch-node" id="node-rfid">
              <rect x="30" y="230" width="160" height="50" rx="6" fill="var(--bg-surface)" stroke="var(--color-info)" stroke-width="1.5" />
              <text x="110" y="260" fill="#fff" font-size="12px" text-anchor="middle" font-weight="600">Personnel RFID (GPS)</text>
            </g>

            <!-- Arrows to Processing -->
            <path class="arch-link" d="M 190,75 L 290,140" stroke="var(--border-color-glow)" stroke-width="1.5" fill="none" marker-end="url(#arrow)" />
            <path class="arch-link" d="M 190,165 L 285,165" stroke="var(--border-color-glow)" stroke-width="1.5" fill="none" marker-end="url(#arrow)" />
            <path class="arch-link" d="M 190,255 L 290,190" stroke="var(--border-color-glow)" stroke-width="1.5" fill="none" marker-end="url(#arrow)" />

            <!-- 2. Processing Layer -->
            <g class="arch-node" id="node-multiagent">
              <rect x="290" y="130" width="160" height="70" rx="6" fill="var(--bg-surface)" stroke="var(--color-warning)" stroke-width="1.5" />
              <text x="370" y="165" fill="#fff" font-size="13px" text-anchor="middle" font-weight="700">Multi-Agent Core</text>
              <text x="370" y="182" fill="var(--color-warning)" font-size="10px" text-anchor="middle">(IoT + Permit + Shift)</text>
            </g>

            <!-- RAG Database support -->
            <g class="arch-node" id="node-rag">
              <rect x="290" y="290" width="160" height="50" rx="6" fill="var(--bg-surface)" stroke="var(--color-success)" stroke-width="1.5" />
              <text x="370" y="320" fill="#fff" font-size="12px" text-anchor="middle" font-weight="600">Regulatory RAG DB</text>
            </g>

            <!-- Arrow from RAG and Processing to Consensus -->
            <path class="arch-link" d="M 370,200 L 370,285" stroke="var(--border-color-glow)" stroke-width="1.5" fill="none" marker-end="url(#arrow)" />
            <path class="arch-link" d="M 450,165 L 530,165" stroke="var(--border-color-glow)" stroke-width="1.5" fill="none" marker-end="url(#arrow)" />

            <!-- 3. Consensus Engine -->
            <g class="arch-node" id="node-consensus">
              <rect x="535" y="130" width="140" height="70" rx="6" fill="var(--bg-surface)" stroke="var(--color-info)" stroke-width="1.5" />
              <text x="605" y="165" fill="#fff" font-size="12px" text-anchor="middle" font-weight="700">Compound Risk</text>
              <text x="605" y="182" fill="var(--color-info)" font-size="10px" text-anchor="middle">Consensus Engine</text>
            </g>

            <!-- Arrow to Action Gateway -->
            <path class="arch-link" d="M 605,200 L 605,285" stroke="var(--border-color-glow)" stroke-width="1.5" fill="none" marker-end="url(#arrow)" />

            <!-- 4. Action Gateway Layer -->
            <g class="arch-node" id="node-emergency">
              <rect x="525" y="290" width="150" height="60" rx="6" fill="var(--bg-surface)" stroke="var(--color-danger)" stroke-width="1.5" />
              <text x="600" y="320" fill="#fff" font-size="12px" text-anchor="middle" font-weight="700">Emergency Protocol</text>
              <text x="600" y="335" fill="var(--color-danger)" font-size="10px" text-anchor="middle">Orchestrator</text>
            </g>
          </svg>
        </div>

        <!-- Sidebar Inspector -->
        <div class="panel" id="arch-node-inspector">
          <h4 style="font-size:14px; font-weight:700; color:var(--color-warning); margin-bottom:8px;" id="arch-inspect-title">PIPELINE INSPECTOR</h4>
          <p style="font-size:12px; color:var(--text-secondary); margin-bottom:12px;">Click any pipeline box in the architecture diagram to inspect data flows, messaging protocols, and API boundaries.</p>
          <div id="arch-inspect-body" style="font-size:12px; display:flex; flex-direction:column; gap:8px;">
            <!-- Render details -->
          </div>
        </div>
      </div>
    </div>
  `;

  // Attach SVG node click listeners
  const nodeIds = [
    { id: "node-telemetry", key: "telemetry" },
    { id: "node-permits", key: "permits" },
    { id: "node-rfid", key: "rfid" },
    { id: "node-multiagent", key: "multiagent" },
    { id: "node-rag", key: "rag" },
    { id: "node-consensus", key: "consensus" },
    { id: "node-emergency", key: "emergency" }
  ];

  nodeIds.forEach(n => {
    const el = document.getElementById(n.id);
    if (el) {
      el.addEventListener("click", () => {
        showPipelineDetails(n.key);
      });
    }
  });

  // Default display
  showPipelineDetails("multiagent");
}

function showPipelineDetails(key) {
  const node = ARCH_NODES[key];
  const title = document.getElementById("arch-inspect-title");
  const body = document.getElementById("arch-inspect-body");
  if (!node || !title || !body) return;

  title.innerText = node.title.toUpperCase();
  title.style.color = "var(--color-info)";

  body.innerHTML = `
    <div>
      <span style="color:var(--text-secondary); font-weight:600; text-transform:uppercase;">DESCRIPTION:</span>
      <p style="color:var(--text-primary); margin-top:4px; line-height:1.4;">${node.details}</p>
    </div>
    <div style="margin-top:8px; border-top:1px dashed rgba(255,255,255,0.05); padding-top:8px;">
      <span style="color:var(--text-secondary); font-weight:600; text-transform:uppercase;">SPECIFICATIONS:</span>
      <p style="font-family:var(--font-mono); color:var(--color-warning); margin-top:4px; font-size:11px;">${node.format}</p>
    </div>
  `;
}
