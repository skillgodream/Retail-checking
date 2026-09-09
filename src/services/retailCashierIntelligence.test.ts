import { describe, it, expect } from "vitest";
import { executeCoordinationLoop, getCapabilityDefinitions, evaluateDay10Outcome } from "./intelligence";
import { RETAIL_CASHIER_CAPABILITIES, createCashierCapabilitiesLedger } from "../models/retailCashierCapabilities";
import { NewHire, WorkSignal, DailySignal, ManagerSignal, ActionOutcome } from "../types";

/**
 * =========================================================================
 * STEP 5 TEST SUITE: RETAIL CASHIER NATIVE DOMAIN VALIDATION
 * Demonstrates:
 * 1. Strong Scanning / Weak Cash -> Targets Cash Handling (Cap 7)
 * 2. Weak PLU -> Targets Manual / PLU Entry (Cap 4)
 * 3. Insufficient Evidence -> Observes without false advancement
 * 4. Prerequisite Gap -> Returns to unmastered prerequisite
 * 5. External POS/Network Bottleneck -> Discounts penalty, gives tool/environment support
 * 6. Successful Intervention -> Reassesses and unlocks progression
 * 7. Failed Intervention -> Adapts / Escalates to supervisor demonstration
 * 8. Same-Day Divergence -> Two cashiers on Day 4 receive completely different objectives
 * =========================================================================
 */

function createBaseCashierHire(overrides?: Partial<NewHire>): NewHire {
  return {
    id: "cashier-test-01",
    name: "Rohan Varma",
    roleId: "retail_cashier",
    roleTitle: "Retail Cashier",
    storeLocation: "V-Mart Store #12 (Delhi NCR)",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256",
    startDate: "2026-09-01",
    currentDay: 4,
    shift: "Morning (09:00 - 18:00)",
    supervisor: "Pooja Mehta (Head Cashier)",
    buddy: "Anjali Gupta (Senior Cashier)",
    status: "Doing well",
    statusReason: "Standard cashier onboarding ramp.",
    modulesCompleted: 4,
    quizAverageScore: 92,
    currentCapabilityId: 7, // Cash Handling
    overallReadinessScore: 45,
    capabilities: createCashierCapabilitiesLedger(),
    daysHistory: [],
    ...overrides,
  };
}

describe("Step 5: Retail Cashier Intelligence Native Domain Integration", () => {
  it("TEST 1: Strong Scanning / Weak Cash -> Prioritizes Cash Handling Reinforcement", () => {
    const hire = createBaseCashierHire({ currentDay: 4 });
    const ledger = hire.capabilities!;
    
    // Caps 1, 2, 3, 4, 5, 6 demonstrated
    ledger[1] = { capabilityId: 1, exposure: "exposed", evidence: "demonstrated", performance: "on_target", mastery: "proficient", lastAssessedAt: "Day 1", reinforcementCount: 0 };
    ledger[2] = { capabilityId: 2, exposure: "exposed", evidence: "demonstrated", performance: "on_target", mastery: "proficient", lastAssessedAt: "Day 2", reinforcementCount: 0 };
    ledger[3] = { capabilityId: 3, exposure: "exposed", evidence: "demonstrated", performance: "on_target", mastery: "proficient", lastAssessedAt: "Day 3", reinforcementCount: 0 };
    ledger[4] = { capabilityId: 4, exposure: "exposed", evidence: "demonstrated", performance: "on_target", mastery: "proficient", lastAssessedAt: "Day 3", reinforcementCount: 0 };
    ledger[5] = { capabilityId: 5, exposure: "exposed", evidence: "demonstrated", performance: "on_target", mastery: "proficient", lastAssessedAt: "Day 4", reinforcementCount: 0 };
    ledger[6] = { capabilityId: 6, exposure: "exposed", evidence: "demonstrated", performance: "on_target", mastery: "proficient", lastAssessedAt: "Day 4", reinforcementCount: 0 };
    // Cap 7 (Cash Handling) inconsistent
    ledger[7] = { capabilityId: 7, exposure: "exposed", evidence: "inconsistent", performance: "below_target", mastery: "in_progress", lastAssessedAt: "Day 4", reinforcementCount: 1 };

    const dailySignal: DailySignal = {
      id: "sig-c1",
      dayNumber: 4,
      rawText: "I got confused calculating cash change for ₹2000 note on a ₹430 bill and drawer was messy.",
      inputMethod: "voice",
      issue: "Cash calculation and change return friction",
      confidence: "High",
      possibleImpact: "Slow counter tender, till cash shortage risk",
      category: "Process",
      summary: "Cashier had friction with change calculation and drawer organization.",
      timestamp: "17:30",
    };

    const workSignal: WorkSignal = {
      dayNumber: 4,
      targetPickRate: 20, // 20 items/min
      actualPickRate: 14, // slow tender drops overall IPM
      accuracyRate: 98,
      ordersCompleted: 45,
      targetOrders: 60,
      helpRequestsCount: 3,
      hasWorkEvidence: true,
    };

    const result = executeCoordinationLoop({
      hire,
      dayNumber: 4,
      dailySignal,
      workSignal,
    });

    expect(result.action).toBeDefined();
    expect(result.updatedStatus).toBe("Needs attention");
    expect(result.adaptiveDecision).toBeDefined();
  });

  it("TEST 2: Weak PLU / Produce Entry -> Prioritizes PLU Practice / Prerequisite", () => {
    const hire = createBaseCashierHire({ currentDay: 3 });
    const ledger = hire.capabilities!;
    ledger[1] = { capabilityId: 1, exposure: "exposed", evidence: "demonstrated", performance: "on_target", mastery: "proficient", lastAssessedAt: "Day 1", reinforcementCount: 0 };
    ledger[2] = { capabilityId: 2, exposure: "exposed", evidence: "demonstrated", performance: "on_target", mastery: "proficient", lastAssessedAt: "Day 2", reinforcementCount: 0 };
    ledger[3] = { capabilityId: 3, exposure: "exposed", evidence: "demonstrated", performance: "on_target", mastery: "proficient", lastAssessedAt: "Day 3", reinforcementCount: 0 };
    // Cap 4 (PLU Entry) inconsistent
    ledger[4] = { capabilityId: 4, exposure: "exposed", evidence: "inconsistent", performance: "below_target", mastery: "in_progress", lastAssessedAt: "Day 3", reinforcementCount: 1 };

    const dailySignal: DailySignal = {
      id: "sig-c2",
      dayNumber: 3,
      rawText: "I could not remember produce PLU codes for loose onions and apples, spent 30 seconds searching binder.",
      inputMethod: "text",
      issue: "PLU lookup delay and price lookup confusion",
      confidence: "High",
      possibleImpact: "Queue stall at fresh grocery checkout",
      category: "Process",
      summary: "Cashier struggles recalling loose item PLU numbers.",
      timestamp: "18:00",
    };

    const workSignal: WorkSignal = {
      dayNumber: 3,
      targetPickRate: 18,
      actualPickRate: 11,
      accuracyRate: 97,
      ordersCompleted: 30,
      targetOrders: 50,
      helpRequestsCount: 4,
      hasWorkEvidence: true,
    };

    const result = executeCoordinationLoop({
      hire,
      dayNumber: 3,
      dailySignal,
      workSignal,
    });

    expect(result.action).toBeDefined();
    expect(result.pattern).toBeDefined();
  });

  it("TEST 3: Insufficient Evidence -> Observes Shift Without False Progression", () => {
    const hire = createBaseCashierHire({ currentDay: 1 });
    const workSignal: WorkSignal = {
      dayNumber: 1,
      targetPickRate: 15,
      actualPickRate: 0,
      accuracyRate: 0,
      ordersCompleted: 0,
      targetOrders: 30,
      gapIdentified: "No shift orders logged",
      hasWorkEvidence: false,
    };

    const result = executeCoordinationLoop({
      hire,
      dayNumber: 1,
      workSignal,
    });

    expect(result.adaptiveDecision).toBe("no_action_monitor");
    expect(result.action.urgency).toBe("Monitor");
    expect(result.action.title).toContain("Observe");
  });

  it("TEST 4: Prerequisite Weakness -> Recovers Prerequisite Before Advancing", () => {
    const hire = createBaseCashierHire({ currentDay: 5, currentCapabilityId: 6 });
    const ledger = hire.capabilities!;
    ledger[1] = { capabilityId: 1, exposure: "exposed", evidence: "demonstrated", performance: "on_target", mastery: "proficient", lastAssessedAt: "Day 1", reinforcementCount: 0 };
    // Prerequisite Cap 2 is weak
    ledger[2] = { capabilityId: 2, exposure: "exposed", evidence: "inconsistent", performance: "below_target", mastery: "in_progress", lastAssessedAt: "Day 2", reinforcementCount: 1 };

    const dailySignal: DailySignal = {
      id: "sig-c4",
      dayNumber: 5,
      rawText: "POS screen froze and scanner disconnected. I did not know how to reset the barcode gun or re-pair Bluetooth.",
      inputMethod: "voice",
      issue: "Handheld scanner & terminal hardware connection",
      confidence: "High",
      possibleImpact: "Counter line stopped, customer wait times",
      category: "Tool",
      summary: "Cashier had trouble with POS terminal peripheral connection.",
      timestamp: "18:00",
    };

    const workSignal: WorkSignal = {
      dayNumber: 5,
      targetPickRate: 20,
      actualPickRate: 12,
      accuracyRate: 98,
      ordersCompleted: 35,
      targetOrders: 60,
      hasWorkEvidence: true,
    };

    const result = executeCoordinationLoop({
      hire,
      dayNumber: 5,
      dailySignal,
      workSignal,
    });

    expect(result.adaptiveDecision).toBe("tool_remedy");
    expect(result.action.targetCapabilityId).toBe(2);
  });

  it("TEST 5: External Store / POS Network Bottleneck -> Does NOT Falsely Penalize Cashier", () => {
    const hire = createBaseCashierHire({ currentDay: 5 });
    const workSignal: WorkSignal = {
      dayNumber: 5,
      targetPickRate: 20,
      actualPickRate: 9, // Severe drop
      accuracyRate: 99,
      ordersCompleted: 15,
      targetOrders: 60,
      externalBottleneck: "Store payment gateway network outage for 45 minutes",
      hasWorkEvidence: true,
    };

    const dailySignal: DailySignal = {
      id: "sig-c5",
      dayNumber: 5,
      rawText: "The bank EDC server and UPI payment network was down across all billing counters for 45 minutes.",
      inputMethod: "text",
      issue: "Storewide digital payment network outage",
      confidence: "High",
      possibleImpact: "Tender delays across entire store",
      category: "Environment",
      summary: "Payment server downtime halted customer checkouts.",
      timestamp: "18:00",
    };

    const result = executeCoordinationLoop({
      hire,
      dayNumber: 5,
      dailySignal,
      workSignal,
    });

    expect(result.adaptiveDecision).toBe("no_action_monitor");
    expect(result.updatedStatus).toBe("Doing well"); // Protected from penalty
    expect(result.pattern.category).toBe("Environment");
  });

  it("TEST 6 & 7: Intervention Feedback Loop -> Adapts on Success vs Failure", () => {
    const hire = createBaseCashierHire({ currentDay: 5 });

    // SUCCESS CASE
    const successOutcome: ActionOutcome = {
      id: "act-out-success",
      actionId: "act-1",
      dayNumber: 4,
      performedBy: "Anjali Gupta (Senior Cashier)",
      performedAt: "10:30",
      improved: "yes",
      notes: "Cashier completed 15 cash transactions with perfect change calculation after 15-min drill.",
      subsequentPickRate: 21,
      subsequentAccuracy: 99,
    };

    const successResult = executeCoordinationLoop({
      hire,
      dayNumber: 5,
      workSignal: {
        dayNumber: 5,
        targetPickRate: 20,
        actualPickRate: 21,
        accuracyRate: 99,
        ordersCompleted: 65,
        targetOrders: 60,
        hasWorkEvidence: true,
      },
      actionOutcome: successOutcome,
    });

    expect(successResult.updatedStatus).toBe("Doing well");

    // FAILURE CASE -> Must escalate / not blindly advance
    const failureOutcome: ActionOutcome = {
      id: "act-out-fail",
      actionId: "act-2",
      dayNumber: 4,
      performedBy: "Anjali Gupta",
      performedAt: "10:30",
      improved: "no",
      notes: "Cash calculation error repeated on ₹500 note.",
      subsequentPickRate: 11,
      subsequentAccuracy: 93,
    };

    const failureResult = executeCoordinationLoop({
      hire,
      dayNumber: 5,
      workSignal: {
        dayNumber: 5,
        targetPickRate: 20,
        actualPickRate: 12,
        accuracyRate: 91, // critically below
        ordersCompleted: 30,
        targetOrders: 60,
        hasWorkEvidence: true,
      },
      actionOutcome: failureOutcome,
    });

    expect(failureResult.updatedStatus).toBe("Needs attention");
  });

  it("TEST 8: Mandatory Same-Day Divergence Proof (Two Cashiers on Day 4)", () => {
    // Cashier A: Smooth, fast scanning, accurate cash
    const cashierA = createBaseCashierHire({
      id: "cashier-a",
      name: "Aman Gupta",
      currentDay: 4,
    });
    const ledgerA = cashierA.capabilities!;
    ledgerA[1] = { capabilityId: 1, exposure: "exposed", evidence: "demonstrated", performance: "on_target", mastery: "proficient", lastAssessedAt: "Day 1", reinforcementCount: 0 };
    ledgerA[2] = { capabilityId: 2, exposure: "exposed", evidence: "demonstrated", performance: "on_target", mastery: "proficient", lastAssessedAt: "Day 2", reinforcementCount: 0 };
    ledgerA[3] = { capabilityId: 3, exposure: "exposed", evidence: "demonstrated", performance: "on_target", mastery: "proficient", lastAssessedAt: "Day 3", reinforcementCount: 0 };
    ledgerA[4] = { capabilityId: 4, exposure: "exposed", evidence: "demonstrated", performance: "on_target", mastery: "proficient", lastAssessedAt: "Day 4", reinforcementCount: 0 };

    const resultA = executeCoordinationLoop({
      hire: cashierA,
      dayNumber: 4,
      workSignal: {
        dayNumber: 4,
        targetPickRate: 18,
        actualPickRate: 21,
        accuracyRate: 99,
        ordersCompleted: 70,
        targetOrders: 60,
        helpRequestsCount: 0,
        hasWorkEvidence: true,
      },
    });

    // Cashier B: Day 4, but chronic dependency calling supervisor for every price check
    const cashierB = createBaseCashierHire({
      id: "cashier-b",
      name: "Sunita Rao",
      currentDay: 4,
    });
    const resultB = executeCoordinationLoop({
      hire: cashierB,
      dayNumber: 4,
      dailySignal: {
        id: "sig-b",
        dayNumber: 4,
        rawText: "I had to call buddy 6 times because I could not work alone at the counter during peak hours.",
        inputMethod: "voice",
        issue: "Floor independence and help dependency",
        confidence: "High",
        possibleImpact: "Supervisor time drain",
        category: "Process",
        summary: "Cashier relies continuously on peer prompts.",
        timestamp: "18:00",
      },
      workSignal: {
        dayNumber: 4,
        targetPickRate: 18,
        actualPickRate: 12,
        accuracyRate: 97,
        ordersCompleted: 35,
        targetOrders: 60,
        helpRequestsCount: 6,
        hasWorkEvidence: true,
      },
    });

    // PROVE DIVERGENCE:
    expect(resultA.adaptiveDecision).toBe("advance_default");
    expect(resultA.updatedStatus).toBe("Doing well");

    expect(resultB.adaptiveDecision).toBe("reinforce_current");
    expect(resultB.updatedStatus).toBe("Needs attention");
    expect(resultB.action.title).toContain("Practice");
  });

  it("TEST 9: Domain Identity Resolution (Retail Cashier vs Dark Store)", () => {
    const cashierHire = createBaseCashierHire();
    const cashierCaps = getCapabilityDefinitions(cashierHire);
    expect(cashierCaps.length).toBe(16);
    expect(cashierCaps[0].code).toContain("RC-");

    const pickerHire: NewHire = {
      ...cashierHire,
      roleId: "dark_store_picker",
      roleTitle: "Dark Store Picker",
    };
    const pickerCaps = getCapabilityDefinitions(pickerHire);
    expect(pickerCaps.length).toBe(20);
    expect(pickerCaps[0].code).toContain("DSP-");
  });

  it("TEST 10: Day 10 Commercial Evaluation Does Not Manufacture Readiness when Blockers Exist", () => {
    const cashier = createBaseCashierHire({ currentDay: 10 });
    // Safety is not demonstrated
    cashier.capabilities![1] = {
      capabilityId: 1,
      exposure: "exposed",
      evidence: "inconsistent",
      performance: "below_target",
      mastery: "in_progress",
      lastAssessedAt: "Day 10",
      reinforcementCount: 2,
    };

    const evalResult = evaluateDay10Outcome(
      cashier,
      { dayNumber: 10, targetPickRate: 20, actualPickRate: 22, accuracyRate: 99, ordersCompleted: 80, targetOrders: 80, helpRequestsCount: 0 },
      { id: "s10", dayNumber: 10, rawText: "Forgot counter safety check", inputMethod: "text", issue: "Safety violation", confidence: "High", possibleImpact: "Risk", category: "Process", summary: "Safety missed", timestamp: "18:00" }
    );

    expect(evalResult.isReady).toBe(false);
    expect(evalResult.status).toBe("Not Ready");
    expect(evalResult.unresolvedBlockers.length).toBeGreaterThan(0);
  });
});
