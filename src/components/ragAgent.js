// Incident Pattern Intelligence (RAG Agent) Component

const MOCK_RAG_DATABASE = [
  {
    title: "Visakhapatnam Steel Coke Oven Accident Audit (Jan 2025)",
    content: "Incident Summary: Eight fatalities occurred due to a sudden explosion inside Coke Oven Battery #3. Investigation found that gas sensor telemetry reported elevated methane (1.6%) and carbon monoxide levels 45 minutes prior. However, there was no connected intelligence layer between SCADA and shift managers. Hot work permits were active in the vicinity, creating an ignition source. Key lesson: Real-time sensor levels must automatically block or revoke active hot work permits via an automated lockouts/safety controller."
  },
  {
    title: "OISD-105: Work Permit Systems for Industrial Facilities",
    content: "Section 6.2 Flammable Atmosphere Rules: Prior to issuing any Hot Work Permit (welding, cutting), gas testing is mandatory. Methane levels must remain below 0.5% by volume. If methane exceeds 0.5%, permits must be denied, and active work suspended. For confined space entries (OISD-105 §5.4), continuous forced ventilation is required, and oxygen concentration must remain between 19.5% and 23.5%."
  },
  {
    title: "Factories Act 1948 — Section 36 (Precautions against dangerous fumes)",
    content: "Factories Act Section 36: No person shall be required or allowed to enter any chamber, tank, vat, pipe, or other confined space in any factory in which gas, fume, vapor or dust is likely to be present to such an extent as to involve risk to persons being asphyxiated, unless it is provided with a manhole and unless the space is certified safe. Active ventilation status must be verified."
  },
  {
    title: "DGMS Circular (Gas Hazard Overlap Rules)",
    content: "Safety Directive 142/2024: Simultaneous Operations (SIMOPS) involving maintenance (hot work) and coke oven operations carry a compounding explosion risk. Any gas sensor reporting higher than 1.0% CH4 must trigger an automated alarm audible across all shift blocks, bypassing the manual administrative handoffs."
  }
];

export function initRagAgent(state) {
  const container = document.getElementById("app-viewport");
  if (!container) return;

  container.innerHTML = `
    <div class="dashboard-view">
      <div class="dashboard-title-row">
        <div>
          <h1>Incident Pattern & Regulatory RAG Agent</h1>
          <p>Retrieve historical incident lessons and query Factory Act / OISD regulatory guidelines.</p>
        </div>
      </div>

      <div class="grid-2-1">
        <!-- Chat Area -->
        <div class="panel rag-chat-container">
          <div class="panel-header">
            <div class="panel-title">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a19.94 19.94 0 01-8.63-2.28L4 17V8a2 2 0 012-2h10a2 2 0 012 2z" />
              </svg>
              Safety Intelligence Chat
            </div>
            <span style="font-family:var(--font-mono); font-size:11px; color:var(--color-info);">● RETRIEVAL ACTIVE</span>
          </div>

          <div class="chat-messages" id="chat-messages-container">
            <!-- Messages render here -->
          </div>

          <div class="chat-input-bar">
            <input type="text" class="chat-input" id="chat-query-input" placeholder="Ask about regulations, Visakhapatnam accident, or safety limits..." />
            <button class="btn btn-primary" id="chat-send-btn">SEND</button>
          </div>
        </div>

        <!-- Sidebar Options -->
        <div style="display:flex; flex-direction:column; gap:20px;">
          <!-- Quick Queries -->
          <div class="panel">
            <div class="panel-header">
              <div class="panel-title">💡 Standard Inquiries</div>
            </div>
            <p style="font-size:12px; color:var(--text-secondary); margin-bottom:12px;">Click a pattern below to execute safety retrieval analysis:</p>
            <div class="quick-queries-container">
              <button class="quick-query-btn" data-query="What caused the Visakhapatnam Coke Oven accident in 2025?">💥 Visakhapatnam Incident Patterns</button>
              <button class="quick-query-btn" data-query="What is the methane threshold for hot work under OISD-105?">🔥 OISD-105 Hot Work Limits</button>
              <button class="quick-query-btn" data-query="What are the Factories Act requirements for entering confined spaces?">🚪 Confined Space Entry Clause</button>
              <button class="quick-query-btn" data-query="How does GuardSafety AI resolve the manual handoff issue?">🤖 AI vs Manual Handoffs</button>
            </div>
          </div>

          <!-- Active Corpora -->
          <div class="panel">
            <div class="panel-header">
              <div class="panel-title">📚 Indexed Knowledge Bases</div>
            </div>
            <div style="font-size:12px; display:flex; flex-direction:column; gap:8px;">
              <div style="display:flex; justify-content:space-between;">
                <span>Factories Act 1948</span>
                <span style="color:var(--color-success);">24 Chapters</span>
              </div>
              <div style="display:flex; justify-content:space-between;">
                <span>OISD Standard 105</span>
                <span style="color:var(--color-success);">Fully Indexed</span>
              </div>
              <div style="display:flex; justify-content:space-between;">
                <span>DGFASLI Incident Logs</span>
                <span style="color:var(--color-success);">6,500 Records</span>
              </div>
              <div style="display:flex; justify-content:space-between;">
                <span>Vizag Steel Incident Report</span>
                <span style="color:var(--color-success);">Complete Audit</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Render initial greeting if chat history is empty
  if (state.ragChatHistory.length === 0) {
    state.ragChatHistory.push({
      sender: "agent",
      text: "Welcome to safety intelligence RAG. You can query any statutory safety guidelines or historic incident databases. What information can I compile for you?",
      sources: []
    });
  }

  renderChat(state);

  // Attach handlers
  const sendBtn = document.getElementById("chat-send-btn");
  const queryInput = document.getElementById("chat-query-input");

  if (sendBtn && queryInput) {
    const handleSend = () => {
      const text = queryInput.value.trim();
      if (!text) return;

      queryInput.value = "";
      processUserMessage(text, state);
    };

    sendBtn.addEventListener("click", handleSend);
    queryInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") handleSend();
    });
  }

  // Attach quick query clicks
  document.querySelectorAll(".quick-query-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const q = btn.getAttribute("data-query");
      processUserMessage(q, state);
    });
  });
}

function renderChat(state) {
  const container = document.getElementById("chat-messages-container");
  if (!container) return;

  container.innerHTML = state.ragChatHistory.map(msg => {
    const isUser = msg.sender === "user";
    const bubbleClass = isUser ? "user" : "agent";
    
    return `
      <div class="chat-bubble ${bubbleClass}">
        <div>${msg.text}</div>
        ${msg.sources.length > 0 ? `
          <div class="rag-sources">
            <strong>SOURCES RETRIEVED:</strong>
            ${msg.sources.map(s => `<span class="rag-source-tag">${s}</span>`).join("")}
          </div>
        ` : ""}
      </div>
    `;
  }).join("");

  // Scroll to bottom
  container.scrollTop = container.scrollHeight;
}

function processUserMessage(text, state) {
  // Add user message
  state.ragChatHistory.push({
    sender: "user",
    text: text,
    sources: []
  });

  renderChat(state);

  // Simulate thinking
  const container = document.getElementById("chat-messages-container");
  if (container) {
    const typingBubble = document.createElement("div");
    typingBubble.className = "chat-bubble agent";
    typingBubble.innerHTML = `<span style="color:var(--text-muted)">Agent searching index & synthesizing response...</span>`;
    container.appendChild(typingBubble);
    container.scrollTop = container.scrollHeight;
  }

  setTimeout(() => {
    // Remove typing bubble and add response
    const formattedQuery = text.toLowerCase();
    let replyText = "";
    let matchedSources = [];

    if (formattedQuery.includes("visakhapatnam") || formattedQuery.includes("vizag") || formattedQuery.includes("accident")) {
      const match = MOCK_RAG_DATABASE[0];
      matchedSources.push("Vizag Steel Coke Oven Audit 2025");
      matchedSources.push("DGMS Circular §SIMOPS");
      replyText = `Based on the investigation report of the Visakhapatnam Coke Oven accident (January 2025):
      
The explosion was triggered by a dangerous build-up of explosive gas which co-occurred with active hot work welding in the battery. While sensors recorded pressure and methane warnings, there was a fatal delay in manual communications. 

To prevent this pattern:
1. Implement **Automated SIMOPS Interlocks**: Safety systems should automatically revoke hot work permits if methane detectors exceed 0.5% (refer to OISD-105 Section 6.2).
2. Remove manual shift coordinator handoffs for high-threat alerts.
3. Bridge telemetry monitoring (SCADA) directly into the permit issuance registry.`;
    } 
    else if (formattedQuery.includes("oisd") || formattedQuery.includes("methane") || formattedQuery.includes("limit")) {
      const match = MOCK_RAG_DATABASE[1];
      matchedSources.push("OISD-105 Section 6.2");
      replyText = `According to OISD-105 (Work Permit Systems for Industrial Facilities), the statutory safety boundary rules are:

1. **Flammable Gas Threshold**: No Hot Work (grinding, cutting, welding) is permitted where concentrations of methane (CH4) or other explosive gases exceed **0.50% by volume**.
2. **Mandatory Gas Testing**: Gas measurements must be completed immediately prior to permit activation, and re-tested during shift handovers.
3. **Oxygen Limits**: For confined space entry, oxygen must be verified between 19.5% and 23.5%.`;
    }
    else if (formattedQuery.includes("confined") || formattedQuery.includes("factories act") || formattedQuery.includes("section 36")) {
      const match = MOCK_RAG_DATABASE[2];
      matchedSources.push("Factories Act 1948 Section 36");
      matchedSources.push("OISD-105 Section 5.4");
      replyText = `Section 36 of the Indian Factories Act 1948 mandates precautions against toxic gases and dangerous fumes in confined enclosures:

1. **Prior Entry Clearance**: Entry is strictly barred unless a competent supervisor certifies the space as safe, and ventilation exhaust has been verified.
2. **Forced Ventilation**: Fans must be continuously operating to prevent gas pockets.
3. **Safety Gear**: Workers must carry portable RFID tracking and multi-gas monitors while performing tasks inside.`;
    }
    else {
      matchedSources.push("GuardSafety AI Documentation");
      replyText = `GuardSafety AI provides an active intelligence layer over industrial SCADA and Permit (PTW) logs. 

Instead of waiting for manual shift handovers (which a FICCI survey flags as the root cause of 60% of safety blindspots), the multi-agent engine scans telemetry continuously. If it detects a gas leak (CH4) alongside active hot work permits, it triggers an immediate automated alarm, flags the SIMOPS conflict, and notifies response personnel instantly, reducing warning-to-action delay from hours to milliseconds.`;
    }

    // Replace typing bubble
    state.ragChatHistory.push({
      sender: "agent",
      text: replyText,
      sources: matchedSources
    });

    // Remove typing indicator if we appended directly
    const messages = document.getElementById("chat-messages-container");
    if (messages && messages.lastChild) {
      messages.removeChild(messages.lastChild);
    }
    renderChat(state);

  }, 1000);
}
