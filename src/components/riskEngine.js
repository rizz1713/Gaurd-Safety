// Compound Risk Detection Engine — Multi-Agent Simulation

export function computeCompoundRisk(state) {
  let score = 5; // Baseline safety risk
  let explanationParts = [];
  const agents = {
    iot: { vote: "SAFE", riskContribution: 0, reason: "Normal readings" },
    permit: { vote: "SAFE", riskContribution: 0, reason: "No conflicting operations" },
    shift: { vote: "SAFE", riskContribution: 0, reason: "Standard operations" },
    equipment: { vote: "SAFE", riskContribution: 0, reason: "Systems operational" }
  };

  const ch4 = state.telemetry.ch4;
  const co = state.telemetry.co;
  const temp = state.telemetry.temp;
  const fan = state.telemetry.fanStatus;

  // 1. IoT Agent Check
  if (ch4 > 1.5 || co > 100 || temp > 100) {
    agents.iot.vote = "CRITICAL";
    agents.iot.riskContribution = 45;
    agents.iot.reason = `Hazardous levels detected: Methane is ${ch4.toFixed(2)}%, Carbon Monoxide is ${co} ppm, Temp is ${temp}°C.`;
    score += 45;
  } else if (ch4 > 0.8 || co > 50 || temp > 75) {
    agents.iot.vote = "WARNING";
    agents.iot.riskContribution = 20;
    agents.iot.reason = `Elevated levels: CH4 at ${ch4.toFixed(2)}%, CO at ${co} ppm.`;
    score += 20;
  } else {
    agents.iot.reason = `Sensor telemetry normal. (CH4: ${ch4.toFixed(2)}%, CO: ${co} ppm, Temp: ${temp}°C)`;
  }

  // 2. Equipment Agent Check (Ventilation Fan)
  if (fan === "OFF") {
    agents.equipment.vote = "CRITICAL";
    agents.equipment.riskContribution = 25;
    agents.equipment.reason = "Primary exhaust fan ventilation system is offline in Battery #2.";
    score += 25;
  } else if (fan === "BYPASS") {
    agents.equipment.vote = "WARNING";
    agents.equipment.riskContribution = 10;
    agents.equipment.reason = "Ventilation system is operating in manual bypass override mode.";
    score += 10;
  } else {
    agents.equipment.reason = "Ventilation exhaust fans running normally.";
  }

  // 3. Permit Agent Check
  const hasHotWork = state.permits.some(p => p.type === "Hot Work" && p.status === "APPROVED");
  const hasConfinedSpace = state.permits.some(p => p.type === "Confined Space" && p.status === "APPROVED");
  
  if (hasHotWork && ch4 > 0.5) {
    // Compound Risk: Hot work during gas leakage
    agents.permit.vote = "CRITICAL";
    const contribution = ch4 > 1.2 ? 30 : 15;
    agents.permit.riskContribution = contribution;
    agents.permit.reason = `CRITICAL OPERATIONAL CONFLICT: Active hot work (PTW-402) in Coke Oven Battery during gas accumulation (${ch4.toFixed(2)}% CH4). Spark hazard present in explosive atmosphere.`;
    score += contribution;
  } else if (hasConfinedSpace && fan === "OFF") {
    // Compound Risk: Confined space entry with no ventilation
    agents.permit.vote = "CRITICAL";
    agents.permit.riskContribution = 25;
    agents.permit.reason = `CRITICAL OPERATIONAL CONFLICT: Active Confined Space permit (PTW-204) with Ventilation Fan OFFLINE. High asphyxiation risk.`;
    score += 25;
  } else if (hasHotWork && hasConfinedSpace) {
    agents.permit.vote = "WARNING";
    agents.permit.riskContribution = 10;
    agents.permit.reason = "Simultaneous operations: Hot work and Confined Space entry active in proximity.";
    score += 10;
  } else if (hasHotWork) {
    agents.permit.reason = "Active Hot Work permit in Maintenance Workshop. Normal safety controls in place.";
  } else if (hasConfinedSpace) {
    agents.permit.reason = "Active Confined Space entry in Gas mixing station. Gas monitoring required.";
  } else {
    agents.permit.reason = "No active high-risk permits in areas with abnormal SCADA conditions.";
  }

  // 4. Shift Agent Check (Shift changeover pattern)
  // Simulate shift changeover (which FICCI notes is a prime window for safety information leakage and manual handoff errors)
  const isShiftHandover = state.isShiftHandover;
  if (isShiftHandover && (ch4 > 0.5 || fan === "OFF")) {
    agents.shift.vote = "CRITICAL";
    agents.shift.riskContribution = 15;
    agents.shift.reason = "Shift changeover in progress (B-to-C handover). High probability of information handoff failure regarding active bypasses and gas sensor warnings.";
    score += 15;
  } else if (isShiftHandover) {
    agents.shift.vote = "WARNING";
    agents.shift.riskContribution = 5;
    agents.shift.reason = "Facility shift changeover in progress. Routine inspection logs are temporarily suspended.";
    score += 5;
  } else {
    agents.shift.reason = "Shift operation is stable. No handoff lapses flagged.";
  }

  // Cap risk score between 0 and 100
  score = Math.min(Math.round(score), 100);

  // Generate Agent Reasoning Text
  if (score < 25) {
    explanationParts.push("All systems safe. Single-sensors and operations are fully aligned. Risk is low.");
  } else {
    if (agents.iot.vote !== "SAFE") explanationParts.push(agents.iot.reason);
    if (agents.equipment.vote !== "SAFE") explanationParts.push(agents.equipment.reason);
    if (agents.permit.vote !== "SAFE") explanationParts.push(agents.permit.reason);
    if (agents.shift.vote !== "SAFE") explanationParts.push(agents.shift.reason);
  }

  // Return the compound findings
  return {
    score,
    explanation: explanationParts.join(" "),
    agents
  };
}
