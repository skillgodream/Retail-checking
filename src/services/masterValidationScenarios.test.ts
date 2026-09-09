import { describe, it, expect } from "vitest";
import {
  executeCoordinationLoop,
  determineAdaptiveCurrentPlan,
  evaluateDay10Outcome,
} from "./intelligence";
import {
  evaluatePitStopDecision,
  compareLearnerToMilestone,
  getMilestoneForDay,
} from "../models/milestones";
import { initialRahul } from "../data/seedData";
import { NewHire, WorkSignal, ActionOutcome } from "../types";

describe("Step 8 — Master Real-World Validation (24 Scenarios)", () => {
  const baseHire: NewHire = initialRahul;

  // -------------------------------------------------------------------------
  // Scenario 1: Normal Learner
  // -------------------------------------------------------------------------
  it("Scenario 1 — Normal Learner: progresses normally without artificial holds", () => {
    const normalHire: NewHire = {
      ...baseHire,
      currentDay: 3,
      modulesCompleted: 3,
      capabilities: { ...baseHire.capabilities },
    };
    [1, 2, 3, 4].forEach((id) => {
      normalHire.capabilities[id] = {
        capabilityId: id,
        exposure: "reinforced",
        evidence: "demonstrated",
        performance: "on_target",
        mastery: "proficient",
        lastAssessedAt: "Day 3",
        reinforcementCount: 1,
      };
    });

    const workSignal: WorkSignal = {
      dayNumber: 3,
      actualPickRate: 18,
      targetPickRate: 15,
      accuracyRate: 98,
      ordersCompleted: 36,
      targetOrders: 35,
      hasWorkEvidence: true,
    };

    const result = executeCoordinationLoop({
      hire: normalHire,
      dayNumber: 3,
      workSignal,
    });

    expect(result.updatedStatus).toBe("Doing well");
    expect(result.action.decisionType).toBe("advance_default");
    expect(result.milestoneEvaluation?.standing).toBe("reached");
    expect(result.rampUpPlan).toBeUndefined();
  });

  // -------------------------------------------------------------------------
  // Scenario 2: Missing Prerequisite
  // -------------------------------------------------------------------------
  it("Scenario 2 — Missing Prerequisite: next progression step is held/blocked, targeted drill assigned, safe work continues", () => {
    const hireMissingPrereq: NewHire = {
      ...baseHire,
      currentDay: 5,
      modulesCompleted: 4,
      capabilities: {
        ...baseHire.capabilities,
        4: {
          capabilityId: 4, // Manual PLU code entry
          exposure: "not_exposed",
          evidence: "none",
          performance: "below_target",
          mastery: "locked",
          lastAssessedAt: "Day 4",
          reinforcementCount: 0,
        },
      },
    };

    const workSignal: WorkSignal = {
      dayNumber: 5,
      actualPickRate: 14,
      targetPickRate: 18,
      accuracyRate: 97,
      ordersCompleted: 30,
      targetOrders: 40,
      hasWorkEvidence: true,
    };

    const plan = determineAdaptiveCurrentPlan(hireMissingPrereq, workSignal);

    expect(plan.progressionGate.gateStatus).toMatch(/held|blocked/);
    expect(plan.progressionGate.isUnlocked).toBe(false);
    expect(plan.productiveWork.safeWorkTitle).toMatch(/Standard Cash & Card POS Checkout|Checkout Zone|POS Checkout/);
    expect(plan.development.developmentType).toMatch(/Prerequisite|Targeted Floor Practice|process/i);
    expect(plan.development.durationMinutes).toBeGreaterThan(0);
  });

  // -------------------------------------------------------------------------
  // Scenario 3: Missing Prerequisite + Productive Ability
  // -------------------------------------------------------------------------
  it("Scenario 3 — Missing Prerequisite + Productive Ability: protects both productivity and development, learner never idle", () => {
    const hireOnDay5: NewHire = {
      ...baseHire,
      currentDay: 5,
      modulesCompleted: 4,
    };

    const pitStop = evaluatePitStopDecision(
      hireOnDay5,
      5,
      {
        dayNumber: 5,
        actualPickRate: 38,
        targetPickRate: 42,
        accuracyRate: 98,
        ordersCompleted: 35,
        targetOrders: 40,
        hasWorkEvidence: true,
      }
    );

    // Dimension 1: Safe productive floor work
    expect(pitStop.currentPlan.productiveWork.safeWorkTitle).toBeDefined();
    expect(pitStop.currentPlan.productiveWork.targetPacing).toBeGreaterThan(0);
    expect(pitStop.currentPlan.productiveWork.whySafe).toBeDefined();

    // Dimension 2: Prerequisite development drill
    expect(pitStop.currentPlan.development.focusCapabilityId).toBeDefined();
    expect(pitStop.currentPlan.development.actor).toBeDefined();

    // Dimension 3: Progression gate held
    expect(pitStop.currentPlan.progressionGate.gateStatus).toMatch(/held|blocked/);
    expect(pitStop.currentPlan.progressionGate.isUnlocked).toBe(false);
  });

  // -------------------------------------------------------------------------
  // Scenario 4: Successful Development Drill
  // -------------------------------------------------------------------------
  it("Scenario 4 — Successful Development Drill: evidence recovery actually changes progression to released", () => {
    const successfulOutcome: ActionOutcome = {
      id: "out-success-drill",
      actionId: "act-cold-01",
      dayNumber: 5,
      performedBy: "Senior Buddy (Amit K.)",
      performedAt: "Day 5 Shift 1",
      improved: "yes",
      subsequentPickRate: 44,
      subsequentAccuracy: 99,
      notes: "Demonstrated proper cold-chain temperature zone checks and thermal bag sealing.",
      milestoneImpact: "Recovered cold chain capability on floor",
    };

    const hireRecovered: NewHire = {
      ...baseHire,
      currentDay: 5,
      modulesCompleted: 5,
      capabilities: {
        ...baseHire.capabilities,
        4: {
          capabilityId: 4,
          exposure: "reinforced",
          evidence: "demonstrated",
          performance: "on_target",
          mastery: "proficient",
          lastAssessedAt: "Day 5",
          reinforcementCount: 1,
        },
        5: {
          capabilityId: 5,
          exposure: "reinforced",
          evidence: "demonstrated",
          performance: "on_target",
          mastery: "proficient",
          lastAssessedAt: "Day 5",
          reinforcementCount: 1,
        },
        6: {
          capabilityId: 6,
          exposure: "reinforced",
          evidence: "demonstrated",
          performance: "on_target",
          mastery: "proficient",
          lastAssessedAt: "Day 5",
          reinforcementCount: 1,
        },
      },
    };

    const workSignal: WorkSignal = {
      dayNumber: 5,
      actualPickRate: 45,
      targetPickRate: 42,
      accuracyRate: 99,
      ordersCompleted: 42,
      targetOrders: 40,
      hasWorkEvidence: true,
    };

    const pitStop = evaluatePitStopDecision(
      hireRecovered,
      5,
      workSignal,
      {
        action: successfulOutcome.notes || "Floor drill",
        outcome: successfulOutcome.improved,
        impact: successfulOutcome.milestoneImpact || "Recovered",
      }
    );

    expect(pitStop.progressionStatus).toMatch(/released|on_track|ahead|recovered/);
    expect(pitStop.currentPlan.progressionGate.isUnlocked).toBe(true);
  });

  // -------------------------------------------------------------------------
  // Scenario 5: Failed Development Drill
  // -------------------------------------------------------------------------
  it("Scenario 5 — Failed Development Drill: failure causes reconsideration, not automatic advancement", () => {
    const failedOutcome: ActionOutcome = {
      id: "out-failed-drill",
      actionId: "act-scanner-01",
      dayNumber: 4,
      performedBy: "Buddy (Vikram R.)",
      performedAt: "Day 4 Shift 1",
      improved: "no",
      subsequentPickRate: 28,
      subsequentAccuracy: 96,
      notes: "Buddy coaching completed, but picker still struggles with sub-aisle bin numbering.",
      milestoneImpact: "Gap persists on floor",
    };

    const hireOnDay5: NewHire = {
      ...baseHire,
      currentDay: 5,
    };

    const pitStop = evaluatePitStopDecision(
      hireOnDay5,
      5,
      {
        dayNumber: 5,
        actualPickRate: 28,
        targetPickRate: 42,
        accuracyRate: 96,
        ordersCompleted: 22,
        targetOrders: 40,
        hasWorkEvidence: true,
      },
      {
        action: failedOutcome.notes || "Coaching",
        outcome: failedOutcome.improved,
        impact: failedOutcome.milestoneImpact || "Persisting",
      }
    );

    expect(pitStop.progressionStatus).toMatch(/held|blocked/);
    expect(pitStop.currentPlan.progressionGate.isUnlocked).toBe(false);
    expect(pitStop.previousOutcome?.outcome).toBe("no");
  });

  // -------------------------------------------------------------------------
  // Scenario 6: Partial Intervention Outcome
  // -------------------------------------------------------------------------
  it("Scenario 6 — Partial Intervention Outcome: partial improvement recognized without false full release", () => {
    const partialOutcome: ActionOutcome = {
      id: "out-partial-01",
      actionId: "act-nav-01",
      dayNumber: 3,
      performedBy: "Buddy (Vikram R.)",
      performedAt: "Day 3 End of Shift",
      improved: "partial",
      subsequentPickRate: 35,
      subsequentAccuracy: 96,
      notes: "Aisle finding improved slightly, but still below the 40 UPH floor target.",
      milestoneImpact: "Partial improvement observed on floor",
    };

    const result = executeCoordinationLoop({
      hire: baseHire,
      dayNumber: 3,
      workSignal: {
        dayNumber: 3,
        actualPickRate: 35,
        targetPickRate: 40,
        accuracyRate: 96,
        ordersCompleted: 28,
        targetOrders: 35,
        hasWorkEvidence: true,
      },
      actionOutcome: partialOutcome,
    });

    expect(result.updatedStatus).toBe("Needs attention");
    expect(result.updatedStatus).not.toBe("Doing well");
    expect(result.updatedCapabilities[4].evidence).toMatch(/inconsistent|emerging/);
  });

  // -------------------------------------------------------------------------
  // Scenario 7: Tool / Scanner Failure
  // -------------------------------------------------------------------------
  it("Scenario 7 — Tool / Scanner Failure: tool failure != learner skill failure", () => {
    const result = executeCoordinationLoop({
      hire: baseHire,
      dayNumber: 3,
      workSignal: {
        dayNumber: 3,
        actualPickRate: 26,
        targetPickRate: 40,
        accuracyRate: 98,
        ordersCompleted: 20,
        targetOrders: 35,
        hasWorkEvidence: true,
      },
      dailySignal: {
        id: "sig-tool-fail",
        workerId: baseHire.id,
        dayNumber: 3,
        category: "Tool",
        issue: "Scanner trigger sticking",
        confidence: "High",
        summary: "Barcode trigger physically sticking.",
        possibleImpact: "Slow pick rate",
        rawText: "Scanner laser trigger is sticking and takes 3 attempts per barcode scan.",
        timestamp: "Day 3",
      } as any,
    });

    expect(result.pattern.category).toBe("Tool");
    expect(result.action.decisionType).toBe("tool_remedy");
    expect(result.action.targetActor).toContain("Maintenance");
  });

  // -------------------------------------------------------------------------
  // Scenario 8: Slow but Accurate
  // -------------------------------------------------------------------------
  it("Scenario 8 — Slow but Accurate: slow != unskilled (targeted pacing drill, not retraining)", () => {
    const result = executeCoordinationLoop({
      hire: baseHire,
      dayNumber: 3,
      workSignal: {
        dayNumber: 3,
        actualPickRate: 31,
        targetPickRate: 40,
        accuracyRate: 99, // High accuracy
        ordersCompleted: 24,
        targetOrders: 35,
        hasWorkEvidence: true,
      },
      dailySignal: {
        id: "sig-pacing",
        workerId: baseHire.id,
        dayNumber: 3,
        category: "Speed",
        issue: "Pacing lag during morning rush",
        confidence: "Medium",
        summary: "Pacing lag during morning rush.",
        possibleImpact: "Lower UPH",
        rawText: "I am being careful with items; pace is a bit slow keeping up with 40/hr.",
        timestamp: "Day 3",
      } as any,
    });

    expect(result.pattern.patternName).toContain("Floor Pacing & Route Practice Gap");
    expect(result.action.targetActor).toContain("Buddy");
    expect(result.action.smallestPracticalStep).toMatch(/picking|route|guided|pacing/i);
  });

  // -------------------------------------------------------------------------
  // Scenario 9: Fast but Inaccurate
  // -------------------------------------------------------------------------
  it("Scenario 9 — Fast but Inaccurate: speed != readiness (accuracy floor enforced)", () => {
    const result = executeCoordinationLoop({
      hire: baseHire,
      dayNumber: 3,
      workSignal: {
        dayNumber: 3,
        actualPickRate: 46, // High speed
        targetPickRate: 40,
        accuracyRate: 91, // Low accuracy (< 95%)
        ordersCompleted: 38,
        targetOrders: 35,
        hasWorkEvidence: true,
      },
    });

    expect(result.pattern.category).toBe("Process");
    expect(result.pattern.patternName).toContain("Variant Differentiation");
    expect(result.action.targetCapabilityId).toBe(6); // DSP-06-VARIANT-CHECK
    expect(result.action.decisionType).toBe("supervisor_demo");
  });

  // -------------------------------------------------------------------------
  // Scenario 10: Chronic Buddy Dependency
  // -------------------------------------------------------------------------
  it("Scenario 10 — Chronic Buddy Dependency: repeated dependency != isolated help", () => {
    const result = executeCoordinationLoop({
      hire: baseHire,
      dayNumber: 3,
      workSignal: {
        dayNumber: 3,
        actualPickRate: 38,
        targetPickRate: 40,
        accuracyRate: 98,
        ordersCompleted: 30,
        targetOrders: 35,
        helpRequestsCount: 8,
        hasWorkEvidence: true,
      },
      managerSignal: {
        id: "mgr-dep",
        hireId: baseHire.id,
        managerName: "Vikram R.",
        dayNumber: 3,
        state: "Needs support",
        issueCategory: "Dependency" as any,
        notes: "Worker asks buddy for confirmation on every bin pick despite knowing the process.",
        timestamp: "Day 3",
      } as any,
    });

    expect(result.pattern.patternName).toContain("Independence & Help Dependency");
    expect(result.action.title).toContain("Solo-Picking");
    expect(result.action.smallestPracticalStep).toMatch(/solo pick/i);
  });

  // -------------------------------------------------------------------------
  // Scenario 11: Communication / Help-Seeking Problem
  // -------------------------------------------------------------------------
  it("Scenario 11 — Communication / Help-Seeking Problem: correctly classified as escalation hesitation", () => {
    const result = executeCoordinationLoop({
      hire: baseHire,
      dayNumber: 3,
      workSignal: {
        dayNumber: 3,
        actualPickRate: 36,
        targetPickRate: 40,
        accuracyRate: 98,
        ordersCompleted: 28,
        targetOrders: 35,
        hasWorkEvidence: true,
      },
      dailySignal: {
        id: "sig-comm",
        workerId: baseHire.id,
        dayNumber: 3,
        category: "Confidence",
        issue: "Communication hesitation",
        confidence: "Low",
        summary: "Nervous asking shift lead during rush.",
        possibleImpact: "Unresolved blockers",
        rawText: "I felt nervous asking the shift lead for clarification when the aisle was crowded.",
        timestamp: "Day 3",
      } as any,
    });

    expect(result.pattern.patternName).toContain("Floor Escalation & Peer Communication Hesitation");
    expect(result.action.targetCapabilityId).toBe(18); // Team escalation
  });

  // -------------------------------------------------------------------------
  // Scenario 12: Safety Issue
  // -------------------------------------------------------------------------
  it("Scenario 12 — Safety Issue: safety overrides productivity with immediate blocker", () => {
    const result = executeCoordinationLoop({
      hire: baseHire,
      dayNumber: 3,
      workSignal: {
        dayNumber: 3,
        actualPickRate: 50,
        targetPickRate: 40,
        accuracyRate: 99,
        ordersCompleted: 40,
        targetOrders: 35,
        hasWorkEvidence: true,
      },
      dailySignal: {
        id: "sig-safe",
        workerId: baseHire.id,
        dayNumber: 3,
        category: "Safety",
        issue: "Safety protocol breach",
        confidence: "High",
        summary: "Worker stepped on lower shelf beams to reach upper bins.",
        possibleImpact: "Fall hazard",
        rawText: "Safety breach: stepping on bottom rack shelves without ladder.",
        timestamp: "Day 3",
      } as any,
    });

    expect(result.pattern.patternName).toContain("Safety Protocol Blocker");
    expect(result.action.targetCapabilityId).toBe(1);
    expect(result.action.decisionType).toBe("supervisor_demo");
    expect(result.action.urgency).toBe("Immediate");
    expect(result.updatedStatus).toBe("At risk");
  });

  // -------------------------------------------------------------------------
  // Scenario 13: Insufficient Evidence
  // -------------------------------------------------------------------------
  it("Scenario 13 — Insufficient Evidence: missing evidence != failure (returns not_enough_evidence on milestone day)", () => {
    const result = executeCoordinationLoop({
      hire: {
        ...baseHire,
        currentDay: 3,
        capabilities: {},
        daysHistory: [],
      },
      dayNumber: 3,
      workSignal: {
        dayNumber: 3,
        actualPickRate: 0,
        targetPickRate: 40,
        accuracyRate: 0,
        ordersCompleted: 0,
        targetOrders: 35,
        hasWorkEvidence: false,
      },
    });

    expect(result.pattern.patternName).toContain("Awaiting Floor Work Telemetry");
    expect(result.action.decisionType).toBe("no_action_monitor");
    expect(result.milestoneEvaluation?.standing).toBe("not_enough_evidence");
    expect(result.updatedStatus).not.toBe("At risk");
  });

  // -------------------------------------------------------------------------
  // Scenario 14: One-Off Poor Performance
  // -------------------------------------------------------------------------
  it("Scenario 14 — One-Off Poor Performance: one-off problem != chronic failure", () => {
    const hireWithGoodRecord: NewHire = {
      ...baseHire,
      capabilities: {
        ...baseHire.capabilities,
        3: {
          capabilityId: 3,
          exposure: "reinforced",
          evidence: "demonstrated",
          performance: "on_target",
          mastery: "proficient",
          lastAssessedAt: "Day 2",
          reinforcementCount: 1,
        },
      },
    };

    const result = executeCoordinationLoop({
      hire: hireWithGoodRecord,
      dayNumber: 3,
      workSignal: {
        dayNumber: 3,
        actualPickRate: 20,
        targetPickRate: 40,
        accuracyRate: 98,
        ordersCompleted: 15,
        targetOrders: 35,
        externalBottleneck: "Zone C lighting power trip for 40 minutes",
        hasWorkEvidence: true,
      },
    });

    expect(result.updatedCapabilities[3].evidence).toBe("demonstrated");
    expect(result.updatedStatus).toBe("Doing well");
  });

  // -------------------------------------------------------------------------
  // Scenario 15: Repeated Deterioration
  // -------------------------------------------------------------------------
  it("Scenario 15 — Repeated Deterioration: temporal reasoning detects pattern and escalates", () => {
    const deterioratingHire: NewHire = {
      ...baseHire,
      currentDay: 4,
      daysHistory: [
        {
          dayNumber: 2,
          date: "Day 2",
          workSignal: {
            dayNumber: 2,
            actualPickRate: 32,
            targetPickRate: 38,
            accuracyRate: 93,
            ordersCompleted: 24,
            targetOrders: 32,
            hasWorkEvidence: true,
          },
          statusAtEnd: "Needs attention",
          statusReason: "Low picking accuracy",
        },
        {
          dayNumber: 3,
          date: "Day 3",
          workSignal: {
            dayNumber: 3,
            actualPickRate: 30,
            targetPickRate: 40,
            accuracyRate: 91,
            ordersCompleted: 22,
            targetOrders: 35,
            hasWorkEvidence: true,
          },
          statusAtEnd: "Needs attention",
          statusReason: "Continued accuracy drop",
        },
      ],
    };

    const result = executeCoordinationLoop({
      hire: deterioratingHire,
      dayNumber: 4,
      workSignal: {
        dayNumber: 4,
        actualPickRate: 28,
        targetPickRate: 42,
        accuracyRate: 90,
        ordersCompleted: 20,
        targetOrders: 38,
        hasWorkEvidence: true,
      },
    });

    expect(["Needs attention", "At risk"]).toContain(result.updatedStatus);
    expect(result.action.targetActor).toContain("Supervisor");
  });

  // -------------------------------------------------------------------------
  // Scenario 16: Recovered Learner
  // -------------------------------------------------------------------------
  it("Scenario 16 — Recovered Learner: recovered != permanently behind", () => {
    const recoveryOutcome: ActionOutcome = {
      id: "out-recov",
      actionId: "act-nav-01",
      dayNumber: 4,
      performedBy: "Buddy (Vikram R.)",
      performedAt: "Day 4 Shift 1",
      improved: "yes",
      subsequentPickRate: 46,
      subsequentAccuracy: 99,
      notes: "Buddy walkthrough resolved aisle coordinate navigation.",
      milestoneImpact: "Recovered capability on floor",
    };

    const hireWithPreviousHold: NewHire = {
      ...baseHire,
      currentDay: 4,
      rampUpPlan: {
        isActive: true,
        targetMilestoneDay: 3,
        reason: "Navigation gap",
        treatmentType: "process_clarification",
        description: "Buddy walkthrough",
        recommendedActor: "Buddy",
        expectedDurationShifts: 1,
        createdAtDay: 3,
      },
    };

    const result = executeCoordinationLoop({
      hire: hireWithPreviousHold,
      dayNumber: 4,
      workSignal: {
        dayNumber: 4,
        actualPickRate: 46,
        targetPickRate: 42,
        accuracyRate: 99,
        ordersCompleted: 40,
        targetOrders: 38,
        hasWorkEvidence: true,
      },
      actionOutcome: recoveryOutcome,
    });

    expect(result.updatedStatus).toBe("Doing well");
    expect(result.action.decisionType).toBe("advance_default");
    expect(result.rampUpPlan?.isActive).toBe(false);
  });

  // -------------------------------------------------------------------------
  // Scenario 17: Strong Work, Incomplete Training
  // -------------------------------------------------------------------------
  it("Scenario 17 — Strong Work, Incomplete Training: strong work != automatic commercial readiness", () => {
    const hireIncompleteTraining: NewHire = {
      ...baseHire,
      currentDay: 10,
      modulesCompleted: 6, // Incomplete (6 of 10)
    };

    const evalResult = evaluateDay10Outcome(
      hireIncompleteTraining,
      {
        dayNumber: 10,
        actualPickRate: 58, // Exceeds target
        targetPickRate: 50,
        accuracyRate: 99,
        ordersCompleted: 50,
        targetOrders: 40,
        hasWorkEvidence: true,
      },
      undefined,
      undefined
    );

    expect(evalResult.isReady).toBe(false);
    expect(evalResult.status).toBe("Not Ready");
    expect(evalResult.unresolvedBlockers).toContain("Mandatory Training Completed");
  });

  // -------------------------------------------------------------------------
  // Scenario 18: Training Complete, Weak Real Work
  // -------------------------------------------------------------------------
  it("Scenario 18 — Training Complete, Weak Real Work: training completion != readiness", () => {
    const hireFullTraining: NewHire = {
      ...baseHire,
      currentDay: 10,
      modulesCompleted: 10, // 100% training
    };

    const evalResult = evaluateDay10Outcome(
      hireFullTraining,
      {
        dayNumber: 10,
        actualPickRate: 32, // Weak floor work (target 50)
        targetPickRate: 50,
        accuracyRate: 93, // Low accuracy (< 98%)
        ordersCompleted: 25,
        targetOrders: 40,
        hasWorkEvidence: true,
      },
      undefined,
      undefined
    );

    expect(evalResult.isReady).toBe(false);
    expect(evalResult.status).toBe("Not Ready");
    expect(evalResult.unresolvedBlockers.length).toBeGreaterThan(0);
  });

  // -------------------------------------------------------------------------
  // Scenario 19: Ahead of Ideal Journey
  // -------------------------------------------------------------------------
  it("Scenario 19 — Ahead of Ideal Journey: Ideal Journey is the target, not an artificial ceiling", () => {
    const fastHire: NewHire = {
      ...baseHire,
      currentDay: 3, // Day 3 calendar
      modulesCompleted: 6,
      capabilities: { ...baseHire.capabilities },
    };
    // Demonstrates Day 5 milestone capabilities on Day 3
    [1, 2, 3, 4, 5, 6, 7, 8, 9].forEach((id) => {
      fastHire.capabilities[id] = {
        capabilityId: id,
        exposure: "reinforced",
        evidence: "demonstrated",
        performance: "exceeding",
        mastery: "mastered",
        lastAssessedAt: "Day 3",
        reinforcementCount: 2,
      };
    });

    const pitStop = evaluatePitStopDecision(fastHire, 5, {
      dayNumber: 3,
      actualPickRate: 46,
      targetPickRate: 38,
      accuracyRate: 99,
      ordersCompleted: 42,
      targetOrders: 35,
      hasWorkEvidence: true,
    });

    expect(pitStop.progressionStatus).toBe("ahead");
    expect(pitStop.currentPlan.progressionGate.isUnlocked).toBe(true);
  });

  // -------------------------------------------------------------------------
  // Scenario 20: Behind Ideal Journey but Recoverable
  // -------------------------------------------------------------------------
  it("Scenario 20 — Behind Ideal Journey but Recoverable: deviation = information, not automatic failure", () => {
    const hireOnDay5: NewHire = {
      ...baseHire,
      currentDay: 5,
    };

    const pitStop = evaluatePitStopDecision(hireOnDay5, 5, {
      dayNumber: 5,
      actualPickRate: 32,
      targetPickRate: 42,
      accuracyRate: 97,
      ordersCompleted: 26,
      targetOrders: 40,
      hasWorkEvidence: true,
    });

    expect(pitStop.progressionStatus).toMatch(/held|blocked/);
    expect(pitStop.managerMotivation.heading).toContain("Pit-Stop Calibration");
    expect(pitStop.managerMotivation.coachingPrompt).toContain("10 minutes together");
    expect(pitStop.currentPlan.productiveWork.safeWorkTitle).toBeDefined();
  });

  // -------------------------------------------------------------------------
  // Scenario 21: Day 10 Readiness with Mixed Evidence
  // -------------------------------------------------------------------------
  it("Scenario 21 — Day 10 Readiness with Mixed Evidence: readiness is multi-factor and evidence-based across all 7 criteria", () => {
    const mixedHire: NewHire = {
      ...baseHire,
      currentDay: 10,
      modulesCompleted: 10,
      capabilities: { ...baseHire.capabilities },
    };
    // 10 demonstrated capabilities (minimum required is 14)
    for (let i = 1; i <= 10; i++) {
      mixedHire.capabilities[i] = {
        capabilityId: i,
        exposure: "reinforced",
        evidence: "demonstrated",
        performance: "on_target",
        mastery: "proficient",
        lastAssessedAt: "Day 10",
        reinforcementCount: 1,
      };
    }
    for (let i = 11; i <= 20; i++) {
      mixedHire.capabilities[i] = {
        capabilityId: i,
        exposure: "not_exposed",
        evidence: "none",
        performance: "unknown",
        mastery: "locked",
        lastAssessedAt: "Day 10",
        reinforcementCount: 0,
      };
    }

    const evalResult = evaluateDay10Outcome(
      mixedHire,
      {
        dayNumber: 10,
        actualPickRate: 52,
        targetPickRate: 50,
        accuracyRate: 98.5,
        ordersCompleted: 44,
        targetOrders: 40,
        hasWorkEvidence: true,
      },
      undefined,
      undefined
    );

    expect(evalResult.isReady).toBe(false);
    expect(evalResult.unresolvedBlockers).toContain("Required Capabilities Demonstrated");
  });

  // -------------------------------------------------------------------------
  // Scenario 22: Day 10 Safety Block
  // -------------------------------------------------------------------------
  it("Scenario 22 — Day 10 Safety Block: safety remains authoritative, overriding high metrics", () => {
    const unsafeHireDay10: NewHire = {
      ...baseHire,
      currentDay: 10,
      modulesCompleted: 10,
      capabilities: {
        ...baseHire.capabilities,
        1: {
          capabilityId: 1,
          exposure: "not_exposed",
          evidence: "none",
          performance: "below_target",
          mastery: "locked",
          lastAssessedAt: "Day 10",
          reinforcementCount: 0,
        },
      },
    };

    const evalResult = evaluateDay10Outcome(
      unsafeHireDay10,
      {
        dayNumber: 10,
        actualPickRate: 60, // High pick rate
        targetPickRate: 50,
        accuracyRate: 99.5, // High accuracy
        ordersCompleted: 55,
        targetOrders: 40,
        hasWorkEvidence: true,
      },
      undefined,
      undefined
    );

    expect(evalResult.isReady).toBe(false);
    expect(evalResult.status).toBe("Not Ready");
    expect(evalResult.unresolvedBlockers).toContain("Safety & Zone Compliance Clear");
  });

  // -------------------------------------------------------------------------
  // Scenario 23: Gate Bypass Attempt
  // -------------------------------------------------------------------------
  it("Scenario 23 — Gate Bypass Attempt: gate is real and cannot be bypassed", () => {
    const day5Milestone = getMilestoneForDay(5)!;
    const comparison = compareLearnerToMilestone(baseHire, day5Milestone);

    // Initial learner on Day 3 has not met Day 5 prerequisites
    expect(comparison.isMet).toBe(false);

    const hireOnDay5: NewHire = {
      ...baseHire,
      currentDay: 5,
    };

    const pitStop = evaluatePitStopDecision(hireOnDay5, 5, {
      dayNumber: 5,
      actualPickRate: 35,
      targetPickRate: 42,
      accuracyRate: 98,
      ordersCompleted: 28,
      targetOrders: 40,
      hasWorkEvidence: true,
    });

    expect(pitStop.currentPlan.progressionGate.isUnlocked).toBe(false);
    expect(pitStop.currentPlan.progressionGate.gateStatus).toMatch(/held|blocked/);
  });

  // -------------------------------------------------------------------------
  // Scenario 24: Full Closed Loop
  // -------------------------------------------------------------------------
  it("Scenario 24 — Full Closed Loop: problem -> diagnosis -> intervention -> work -> outcome -> check -> milestone reassessment -> gate decision -> next plan", () => {
    // Step 1: Observe problem
    const day3Input = {
      hire: baseHire,
      dayNumber: 3,
      workSignal: {
        dayNumber: 3,
        actualPickRate: 30,
        targetPickRate: 40,
        accuracyRate: 98,
        ordersCompleted: 24,
        targetOrders: 35,
        hasWorkEvidence: true,
      },
      dailySignal: {
        id: "sig-loop-01",
        workerId: baseHire.id,
        dayNumber: 3,
        category: "Environment",
        issue: "Aisle confusion",
        confidence: "Medium",
        summary: "Confusion with rack numbering in Aisles 4-8.",
        possibleImpact: "Pacing delay",
        rawText: "Confusion with rack numbering in Aisles 4-8.",
        timestamp: "Day 3",
      } as any,
    };

    // Step 2 & 3: Dean loop diagnoses and assigns intervention
    const loop1 = executeCoordinationLoop(day3Input);
    expect(loop1.pattern.category).toBe("Environment");
    expect(loop1.action.targetActor).toContain("Buddy");
    expect(loop1.adaptiveCurrentPlan?.progressionGate.gateStatus).toBe("held");

    // Step 4 & 5: Worker completes buddy drill with positive outcome
    const drillOutcome: ActionOutcome = {
      id: "out-loop-01",
      actionId: loop1.action.id,
      dayNumber: 4,
      performedBy: loop1.action.targetActor,
      performedAt: "Day 4 Shift 1",
      improved: "yes",
      subsequentPickRate: 44,
      subsequentAccuracy: 99,
      notes: "Buddy walkthrough resolved aisle coordinate confusion completely.",
      milestoneImpact: "Recovered capability on floor",
    };

    // Step 6 & 7: Dean reassesses closed loop with new evidence
    const loop2 = executeCoordinationLoop({
      hire: {
        ...baseHire,
        currentDay: 4,
        capabilities: loop1.updatedCapabilities,
        rampUpPlan: loop1.rampUpPlan,
      },
      dayNumber: 4,
      workSignal: {
        dayNumber: 4,
        actualPickRate: 44,
        targetPickRate: 42,
        accuracyRate: 99,
        ordersCompleted: 38,
        targetOrders: 38,
        hasWorkEvidence: true,
      },
      actionOutcome: drillOutcome,
    });

    // Step 8: Gate decision and next plan updated
    expect(loop2.updatedStatus).toBe("Doing well");
    expect(loop2.action.decisionType).toBe("advance_default");
    expect(loop2.updatedCapabilities[3].mastery).toMatch(/proficient|mastered/);
  });
});
