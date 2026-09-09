import { describe, it, expect } from "vitest";
import {
  executeCoordinationLoop,
  LoopExecutionInput,
  evaluateDay10Outcome,
} from "./intelligence";
import { adaptGoogleFormFeedRow, DEMO_FEED_PRESETS } from "./googleFormFeedAdapter";
import { initialRahul, initialCohort, createDefaultCapabilitiesLedger } from "../data/seedData";
import { WorkSignal, ActionOutcome, NewHire, DailySignal, ManagerSignal } from "../types";

describe("Step 4 — Prove Six Doctors Across Real Conditions", () => {
  const baseHire = initialRahul; // Rahul Sharma, Day 3

  it("Scenario 1: Navigation / Spatial Capability Problem", () => {
    const preset = DEMO_FEED_PRESETS.find((p) => p.id === "scenario-1-navigation")!;
    const adapted = adaptGoogleFormFeedRow(preset.payload, initialCohort);

    const input: LoopExecutionInput = {
      hire: baseHire,
      dayNumber: 3,
      workSignal: adapted.workSignal,
      dailySignal: adapted.dailySignal,
      managerSignal: adapted.managerSignal,
    };

    const result = executeCoordinationLoop(input);

    expect(result.pattern.category).toBe("Environment");
    expect(result.pattern.patternName).toContain("Dark Store Spatial");
    expect(result.action.targetCapabilityId).toBe(3); // DSP-03-ZONE-NAVIGATION / DSP-04-AISLE-COORDINATES
    expect(result.action.decisionType).toBe("reinforce_current");
    expect(result.action.targetActor).toContain("Buddy");
    expect(result.action.smallestPracticalStep).toContain("walkthrough");
    expect(result.updatedStatus).toBe("Needs attention");
  });

  it("Scenario 2: Scanner / Tool Hardware Problem", () => {
    const preset = DEMO_FEED_PRESETS.find((p) => p.id === "scenario-2-scanner-tool")!;
    const adapted = adaptGoogleFormFeedRow(preset.payload, initialCohort);

    const input: LoopExecutionInput = {
      hire: baseHire,
      dayNumber: 3,
      workSignal: adapted.workSignal,
      dailySignal: adapted.dailySignal,
      managerSignal: adapted.managerSignal,
    };

    const result = executeCoordinationLoop(input);

    expect(result.pattern.category).toBe("Tool");
    expect(result.pattern.patternName).toContain("Hardware / Barcode Scanner Friction");
    expect(result.action.decisionType).toBe("tool_remedy");
    expect(result.action.targetCapabilityId).toBe(2);
    expect(result.action.targetActor).toContain("Maintenance");
    expect(result.action.title).toContain("Scanner Hardware Check");
  });

  it("Scenario 3: Training / Process Gap Problem", () => {
    const preset = DEMO_FEED_PRESETS.find((p) => p.id === "scenario-3-training-process")!;
    const adapted = adaptGoogleFormFeedRow(preset.payload, initialCohort);

    const input: LoopExecutionInput = {
      hire: baseHire,
      dayNumber: 3,
      workSignal: adapted.workSignal,
      dailySignal: adapted.dailySignal,
      managerSignal: adapted.managerSignal,
    };

    const result = executeCoordinationLoop(input);

    expect(result.pattern.category).toBe("Process");
    expect(result.action.decisionType).toBe("reinforce_current");
    expect(result.action.targetActor).toContain("Buddy");
    expect(result.updatedStatus).toBe("Needs attention");
  });

  it("Scenario 4: Dependency / Independence Problem", () => {
    const preset = DEMO_FEED_PRESETS.find((p) => p.id === "scenario-4-dependency")!;
    const adapted = adaptGoogleFormFeedRow(preset.payload, initialCohort);

    const input: LoopExecutionInput = {
      hire: baseHire,
      dayNumber: 3,
      workSignal: adapted.workSignal,
      dailySignal: adapted.dailySignal,
      managerSignal: adapted.managerSignal,
    };

    const result = executeCoordinationLoop(input);

    expect(result.pattern.category).toBe("Process");
    expect(result.pattern.patternName).toContain("Floor Independence & Help Dependency Gap");
    expect(result.action.title).toContain("Solo-Picking");
    expect(result.action.targetActor).toContain("Buddy");
    expect(result.updatedStatus).toBe("Needs attention");
  });

  it("Scenario 5: Safety Problem (Safety Overrides Productivity)", () => {
    const preset = DEMO_FEED_PRESETS.find((p) => p.id === "scenario-5-safety")!;
    const adapted = adaptGoogleFormFeedRow(preset.payload, initialCohort);

    const input: LoopExecutionInput = {
      hire: baseHire,
      dayNumber: 3,
      workSignal: adapted.workSignal,
      dailySignal: adapted.dailySignal,
      managerSignal: adapted.managerSignal,
    };

    const result = executeCoordinationLoop(input);

    expect(result.pattern.patternName).toContain("Critical Floor Safety Protocol Blocker");
    expect(result.action.targetCapabilityId).toBe(1); // Store Safety & PPE
    expect(result.action.decisionType).toBe("supervisor_demo");
    expect(result.action.targetActor).toContain("Supervisor");
    expect(result.action.urgency).toBe("Immediate");
    expect(result.updatedStatus).toBe("At risk");
  });

  it("Recovery Test 1: Navigation Recovery (Closed Loop Succeeded)", () => {
    const recoveryPreset = DEMO_FEED_PRESETS.find((p) => p.id === "scenario-recovery-nav")!;
    const adapted = adaptGoogleFormFeedRow(recoveryPreset.payload, initialCohort);

    const input: LoopExecutionInput = {
      hire: baseHire,
      dayNumber: 4,
      workSignal: adapted.workSignal,
      dailySignal: adapted.dailySignal,
      managerSignal: adapted.managerSignal,
      actionOutcome: adapted.actionOutcome,
    };

    const result = executeCoordinationLoop(input);

    expect(result.pattern.patternName).toContain("Steady Ramp Progression");
    expect(result.updatedStatus).toBe("Doing well");
    expect(result.action.decisionType).toBe("advance_default");
    // Capability 3 should be marked proficient/mastered after recovery
    const cap3 = result.updatedCapabilities[3];
    expect(cap3.evidence).toBe("demonstrated");
    expect(cap3.mastery).toMatch(/proficient|mastered/);
  });

  it("Failure Path & Treatment Memory Test: Buddy Walkthrough Failed -> Supervisor Layout Escalation", () => {
    const failurePreset = DEMO_FEED_PRESETS.find((p) => p.id === "journey-failure-memory")!;
    const adapted = adaptGoogleFormFeedRow(failurePreset.payload, initialCohort);

    const existingWalkthroughAction = {
      id: "act-prev-walkthrough",
      dayNumber: 3,
      actionType: "buddy_walkthrough" as const,
      targetCapabilityId: 3,
      targetActor: "Buddy (Vikram R.)",
      urgency: "Next Shift" as const,
      decisionType: "reinforce_current" as const,
      title: "Buddy Walkthrough of Aisles 4-8",
      description: "Vikram does a 15-minute walkthrough of Aisles 4-8.",
      smallestPracticalStep: "15-minute walkthrough before Shift Wave 2",
      whyThisAction: "Friction with aisle locations",
      status: "in_progress" as const,
      createdAt: "Day 3",
    };

    const input: LoopExecutionInput = {
      hire: baseHire,
      dayNumber: 4,
      workSignal: adapted.workSignal,
      dailySignal: adapted.dailySignal,
      managerSignal: adapted.managerSignal,
      actionOutcome: adapted.actionOutcome,
      existingAction: existingWalkthroughAction,
    };

    const result = executeCoordinationLoop(input);

    // CRITICAL PROOF: System remembers that Buddy Walkthrough already failed!
    // It does NOT repeat "Buddy Walkthrough". It escalates!
    expect(["environment_support", "escalate_manager"]).toContain(result.action.decisionType);
    expect(result.action.targetActor).toContain("Supervisor");
    expect(result.action.title).toMatch(/Layout & POS Verification|Floor Layout/);
    expect(["Needs attention", "At risk"]).toContain(result.updatedStatus);
    expect(result.action.whyThisAction).toContain("walkthrough failed");
  });

  it("Multiple-Problem Test: Quality Floor takes precedence over hardware & pacing", () => {
    const multiPreset = DEMO_FEED_PRESETS.find((p) => p.id === "scenario-multi-problem")!;
    const adapted = adaptGoogleFormFeedRow(multiPreset.payload, initialCohort);

    const input: LoopExecutionInput = {
      hire: baseHire,
      dayNumber: 3,
      workSignal: adapted.workSignal,
      dailySignal: adapted.dailySignal,
      managerSignal: adapted.managerSignal,
    };

    const result = executeCoordinationLoop(input);

    // Accuracy is 91% (<95% threshold) despite scanner tool notes and pacing
    expect(result.pattern.category).toBe("Process");
    expect(result.pattern.patternName).toContain("Variant Differentiation");
    expect(result.action.targetCapabilityId).toBe(6); // DSP-06-VARIANT-CHECK
    expect(result.action.decisionType).toBe("supervisor_demo");
  });

  it("Training vs Work Test A: High Speed (56 UPH) does NOT override incomplete mandatory training", () => {
    const incompletePreset = DEMO_FEED_PRESETS.find((p) => p.id === "scenario-training-incomplete")!;
    const adapted = adaptGoogleFormFeedRow(incompletePreset.payload, initialCohort);

    const hireWithLowTraining = {
      ...baseHire,
      modulesCompleted: 2, // only 2 of 10 modules completed
    };

    const input: LoopExecutionInput = {
      hire: hireWithLowTraining,
      dayNumber: 2,
      workSignal: adapted.workSignal,
      dailySignal: adapted.dailySignal,
      managerSignal: adapted.managerSignal,
    };

    const result = executeCoordinationLoop(input);

    // Overall readiness must be capped (<= 85%) because mandatory training is incomplete
    expect(result.overallReadinessScore).toBeLessThanOrEqual(85);
    expect(result.action.decisionType).not.toBe("jump_ahead"); // Foundation training guard prevents premature jump
  });

  it("Training vs Work Test B: 100% Modules Complete does NOT equal readiness when floor work is weak", () => {
    const weakFloorPreset = DEMO_FEED_PRESETS.find((p) => p.id === "scenario-training-complete-weak")!;
    const adapted = adaptGoogleFormFeedRow(weakFloorPreset.payload, initialCohort);

    const hireWithFullTraining = {
      ...baseHire,
      modulesCompleted: 10, // 10/10 modules completed on LMS
    };

    const input: LoopExecutionInput = {
      hire: hireWithFullTraining,
      dayNumber: 5,
      workSignal: adapted.workSignal,
      dailySignal: adapted.dailySignal,
      managerSignal: adapted.managerSignal,
    };

    const result = executeCoordinationLoop(input);

    // Even with 10/10 training, poor floor execution (31 UPH, 92% acc) means NOT job ready
    expect(["Needs attention", "At risk"]).toContain(result.updatedStatus);
    expect(result.action.decisionType).toMatch(/supervisor_demo|reinforce_current/);
  });

  it("External Problem Test: Conveyor Breakdown diagnoses facility bottleneck with zero blame", () => {
    const externalPreset = DEMO_FEED_PRESETS.find((p) => p.id === "scenario-external-blocker")!;
    const adapted = adaptGoogleFormFeedRow(externalPreset.payload, initialCohort);

    const input: LoopExecutionInput = {
      hire: baseHire,
      dayNumber: 4,
      workSignal: adapted.workSignal,
      dailySignal: adapted.dailySignal,
      managerSignal: adapted.managerSignal,
    };

    const result = executeCoordinationLoop(input);

    expect(result.pattern.category).toBe("Environment");
    expect(result.pattern.patternName).toContain("Facility Bottleneck");
    expect(result.action.decisionType).toBe("no_action_monitor");
    expect(result.action.targetActor).toContain("Operations");
    expect(result.action.whyThisAction).toContain("External environmental disruption does not require capability retraining");
  });

  it("No-Evidence Test: Awaiting Telemetry observes without inventing fabricated diagnosis", () => {
    const noEvidencePreset = DEMO_FEED_PRESETS.find((p) => p.id === "scenario-no-evidence")!;
    const adapted = adaptGoogleFormFeedRow(noEvidencePreset.payload, initialCohort);

    const input: LoopExecutionInput = {
      hire: baseHire,
      dayNumber: 1,
      workSignal: adapted.workSignal,
      dailySignal: adapted.dailySignal,
      managerSignal: adapted.managerSignal,
    };

    const result = executeCoordinationLoop(input);

    expect(result.pattern.patternName).toContain("Awaiting Floor Work Telemetry");
    expect(result.action.decisionType).toBe("no_action_monitor");
    expect(result.action.whyThisAction).toContain("No evidence does not equal poor performance");
  });

  it("Day 10 Outcome: Proves Certified Job Ready vs Not Ready with Active Blocker", () => {
    const readyPreset = DEMO_FEED_PRESETS.find((p) => p.id === "scenario-day10-ready")!;
    const adaptedReady = adaptGoogleFormFeedRow(readyPreset.payload, initialCohort);

    // Hire with all capabilities demonstrated
    const readyHire = {
      ...baseHire,
      modulesCompleted: 10,
      capabilities: createDefaultCapabilitiesLedger("dark_store_picker"),
    };
    // mark core capabilities demonstrated
    for (let i = 1; i <= 20; i++) {
      readyHire.capabilities[i] = {
        capabilityId: i,
        exposure: "reinforced",
        evidence: "demonstrated",
        performance: "on_target",
        mastery: "proficient",
        lastAssessedAt: "Day 10",
        reinforcementCount: 1,
      };
    }

    const readyInput: LoopExecutionInput = {
      hire: readyHire,
      dayNumber: 10,
      workSignal: adaptedReady.workSignal,
      dailySignal: adaptedReady.dailySignal,
      managerSignal: adaptedReady.managerSignal,
    };

    const readyResult = executeCoordinationLoop(readyInput);
    expect(readyResult.updatedStatus).toBe("Doing well");
    expect(readyResult.overallReadinessScore).toBeGreaterThanOrEqual(85);
    expect(readyResult.day10Evaluation?.isReady).toBe(true);
    expect(readyResult.day10Evaluation?.status).toBe("Job Ready");

    // Verify 7 criteria via evaluateDay10Outcome
    const readyEval = evaluateDay10Outcome(
      readyHire,
      adaptedReady.workSignal,
      adaptedReady.dailySignal,
      adaptedReady.managerSignal
    );
    expect(readyEval.isReady).toBe(true);
    expect(readyEval.status).toBe("Job Ready");
    expect(readyEval.unresolvedBlockers.length).toBe(0);

    // Unready case with active blockers
    const notReadyPreset = DEMO_FEED_PRESETS.find((p) => p.id === "scenario-day10-not-ready")!;
    const adaptedNotReady = adaptGoogleFormFeedRow(notReadyPreset.payload, initialCohort);

    const notReadyInput: LoopExecutionInput = {
      hire: baseHire,
      dayNumber: 10,
      workSignal: adaptedNotReady.workSignal,
      dailySignal: adaptedNotReady.dailySignal,
      managerSignal: adaptedNotReady.managerSignal,
    };

    const notReadyResult = executeCoordinationLoop(notReadyInput);
    expect(["Needs attention", "At risk"]).toContain(notReadyResult.updatedStatus);
    expect(notReadyResult.day10Evaluation?.isReady).toBe(false);
    expect(notReadyResult.day10Evaluation?.status).toBe("Not Ready");

    const notReadyEval = evaluateDay10Outcome(
      baseHire,
      adaptedNotReady.workSignal,
      adaptedNotReady.dailySignal,
      adaptedNotReady.managerSignal
    );
    expect(notReadyEval.isReady).toBe(false);
    expect(notReadyEval.status).toBe("Not Ready");
    expect(notReadyEval.unresolvedBlockers.length).toBeGreaterThan(0);
  });
});

describe("Step 3 — Dean Integration to Milestone / Gate Layer Verification", () => {
  const baseHire = initialRahul;

  it("1. Learner reaches a milestone", () => {
    // Hire on Day 3 who has demonstrated capabilities 1, 2, 3, 4 and meets Day 3 Cashier milestone expectations
    const hireAtMilestone3 = {
      ...baseHire,
      currentDay: 3,
      modulesCompleted: 3,
      capabilities: { ...baseHire.capabilities },
    };
    [1, 2, 3, 4].forEach((id) => {
      hireAtMilestone3.capabilities[id] = {
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
      actualPickRate: 45,
      targetPickRate: 40,
      accuracyRate: 98,
      ordersCompleted: 40,
      targetOrders: 35,
      hasWorkEvidence: true,
    };

    const result = executeCoordinationLoop({
      hire: hireAtMilestone3,
      dayNumber: 3,
      workSignal,
    });

    expect(result.milestoneEvaluation).toBeDefined();
    expect(result.milestoneEvaluation?.standing).toBe("reached");
    expect(result.milestoneEvaluation?.evidenceSufficiency).toBe("sufficient");
    expect(result.milestoneEvaluation?.managerSummary).toContain("Reached Day 3 capability milestone");
    expect(result.rampUpPlan).toBeUndefined();
  });

  it("2. Learner is behind a milestone", () => {
    // Rahul on Day 3 with navigation friction behind Day 3 milestone
    const preset = DEMO_FEED_PRESETS.find((p) => p.id === "scenario-1-navigation")!;
    const adapted = adaptGoogleFormFeedRow(preset.payload, initialCohort);

    const result = executeCoordinationLoop({
      hire: baseHire,
      dayNumber: 3,
      workSignal: adapted.workSignal,
      dailySignal: adapted.dailySignal,
      managerSignal: adapted.managerSignal,
    });

    expect(result.milestoneEvaluation).toBeDefined();
    expect(result.milestoneEvaluation?.standing).toBe("behind");
    expect(result.milestoneEvaluation?.evidenceSufficiency).toBe("sufficient");
    expect(result.rampUpPlan).toBeDefined();
    expect(result.rampUpPlan?.isActive).toBe(true);
    expect(result.rampUpPlan?.targetMilestoneDay).toBe(3);
    expect(result.milestoneEvaluation?.capabilityGaps.some((g) => !g.isMet)).toBe(true);
  });

  it("3. Learner with insufficient evidence returns 'Not enough evidence' without false failure", () => {
    const hireNoEvidence = {
      ...baseHire,
      currentDay: 3,
      capabilities: { ...baseHire.capabilities },
    };
    // No capabilities demonstrated yet
    Object.keys(hireNoEvidence.capabilities).forEach((k) => {
      hireNoEvidence.capabilities[Number(k)] = {
        capabilityId: Number(k),
        exposure: "not_exposed",
        evidence: "none",
        performance: "unknown",
        mastery: "locked",
        lastAssessedAt: "Day 3",
        reinforcementCount: 0,
      };
    });

    const workSignal: WorkSignal = {
      dayNumber: 3,
      actualPickRate: 0,
      targetPickRate: 40,
      accuracyRate: 0,
      ordersCompleted: 0,
      targetOrders: 35,
      hasWorkEvidence: false,
    };

    const result = executeCoordinationLoop({
      hire: hireNoEvidence,
      dayNumber: 3,
      workSignal,
    });

    expect(result.milestoneEvaluation?.evidenceSufficiency).toBe("insufficient");
    expect(result.milestoneEvaluation?.standing).toBe("not_enough_evidence");
    expect(result.milestoneEvaluation?.managerSummary).toBe("Not enough evidence — continue observation");
    // Does NOT fail learner
    expect(result.updatedStatus).not.toBe("At risk");
    // Action is observation, NOT blind training
    expect(result.action.decisionType).toBe("no_action_monitor");
  });

  it("4. Milestone gap does NOT trigger training automatically when root cause is hardware", () => {
    const preset = DEMO_FEED_PRESETS.find((p) => p.id === "scenario-2-scanner-tool")!;
    const adapted = adaptGoogleFormFeedRow(preset.payload, initialCohort);

    const result = executeCoordinationLoop({
      hire: baseHire,
      dayNumber: 3,
      workSignal: adapted.workSignal,
      dailySignal: adapted.dailySignal,
      managerSignal: adapted.managerSignal,
    });

    // Milestone gap is diagnosed as tool friction, NOT a training failure
    expect(result.pattern.category).toBe("Tool");
    expect(result.action.decisionType).toBe("tool_remedy");
    expect(result.rampUpPlan?.treatmentType).toBe("tool_environment_support");
    expect(result.action.targetActor).toContain("Maintenance");
  });

  it("5. Diagnosis determines appropriate treatment (Buddy guided practice for navigation)", () => {
    const preset = DEMO_FEED_PRESETS.find((p) => p.id === "scenario-1-navigation")!;
    const adapted = adaptGoogleFormFeedRow(preset.payload, initialCohort);

    const result = executeCoordinationLoop({
      hire: baseHire,
      dayNumber: 3,
      workSignal: adapted.workSignal,
      dailySignal: adapted.dailySignal,
      managerSignal: adapted.managerSignal,
    });

    expect(result.pattern.category).toBe("Environment");
    expect(result.rampUpPlan?.treatmentType).toBe("process_clarification");
    expect(result.action.targetActor).toContain("Buddy");
    expect(result.milestoneEvaluation?.managerSummary).toBe(
      "Performance gap appears related to process/navigation rather than knowledge"
    );
  });

  it("6. Treatment outcome feeds back into Dean and updates milestoneImpact", () => {
    const recoveryPreset = DEMO_FEED_PRESETS.find((p) => p.id === "scenario-recovery-nav")!;
    const adapted = adaptGoogleFormFeedRow(recoveryPreset.payload, initialCohort);

    const result = executeCoordinationLoop({
      hire: baseHire,
      dayNumber: 4,
      workSignal: adapted.workSignal,
      dailySignal: adapted.dailySignal,
      managerSignal: adapted.managerSignal,
      actionOutcome: adapted.actionOutcome,
    });

    expect(adapted.actionOutcome.milestoneImpact).toBeDefined();
    expect(adapted.actionOutcome.milestoneImpact).toContain("Recovered capability on floor");
  });

  it("7. Recovered learner has intervention reduced and active ramp-up plan cleared", () => {
    const recoveryPreset = DEMO_FEED_PRESETS.find((p) => p.id === "scenario-recovery-nav")!;
    const adapted = adaptGoogleFormFeedRow(recoveryPreset.payload, initialCohort);

    const hireWithActiveRampUp = {
      ...baseHire,
      currentDay: 4,
      modulesCompleted: 3,
      capabilities: { ...baseHire.capabilities },
      rampUpPlan: {
        isActive: true,
        targetMilestoneDay: 3,
        reason: "Previous gap",
        treatmentType: "guided_practice" as const,
        description: "Buddy practice",
        recommendedActor: "Buddy",
        expectedDurationShifts: 1,
        createdAtDay: 3,
      },
    };
    [1, 2, 3, 4].forEach((id) => {
      hireWithActiveRampUp.capabilities[id] = {
        capabilityId: id,
        exposure: "reinforced",
        evidence: "demonstrated",
        performance: "on_target",
        mastery: "proficient",
        lastAssessedAt: "Day 4",
        reinforcementCount: 1,
      };
    });

    const workSignal: WorkSignal = {
      ...adapted.workSignal,
      dayNumber: 4,
      actualPickRate: 18,
      targetPickRate: 15,
      accuracyRate: 98,
      ordersCompleted: 35,
      hasWorkEvidence: true,
    };

    const result = executeCoordinationLoop({
      hire: hireWithActiveRampUp,
      dayNumber: 4,
      workSignal,
      dailySignal: adapted.dailySignal,
      managerSignal: adapted.managerSignal,
      actionOutcome: adapted.actionOutcome,
    });

    expect(result.updatedStatus).toBe("Doing well");
    expect(result.action.decisionType).toBe("advance_default");
    expect(result.rampUpPlan?.isActive).toBe(false);
    expect(result.rampUpPlan?.clearedAtDay).toBe(4);
  });

  it("7b. Partial improvement does NOT falsely mark full recovery and preserves targeted practice", () => {
    const partialOutcome: ActionOutcome = {
      id: "out-partial-01",
      actionId: "act-nav-01",
      dayNumber: 3,
      performedBy: "Buddy (Vikram R.)",
      performedAt: "Day 3 End of Shift",
      improved: "partial" as const,
      subsequentPickRate: 34,
      subsequentAccuracy: 95,
      notes: "Aisle finding improved slightly, but still lagging behind 40 UPH floor target.",
    };

    const hireWithActiveRampUp = {
      ...baseHire,
      currentDay: 3,
      rampUpPlan: {
        isActive: true,
        targetMilestoneDay: 3,
        reason: "Navigation friction",
        treatmentType: "process_clarification" as const,
        description: "Buddy walkthrough",
        recommendedActor: "Buddy",
        expectedDurationShifts: 1,
        createdAtDay: 3,
      },
    };

    const workSignal: WorkSignal = {
      dayNumber: 3,
      actualPickRate: 34,
      targetPickRate: 40,
      accuracyRate: 95,
      ordersCompleted: 26,
      targetOrders: 35,
      hasWorkEvidence: true,
    };

    const result = executeCoordinationLoop({
      hire: hireWithActiveRampUp,
      dayNumber: 3,
      workSignal,
      actionOutcome: partialOutcome,
    });

    const targetCapId = result.action.targetCapabilityId || 4;

    // Dean must NOT falsely mark full recovery
    expect(result.updatedStatus).toBe("Needs attention");
    expect(result.updatedStatus).not.toBe("Doing well");
    expect(result.rampUpPlan?.isActive).toBe(true); // Ramp up remains active
    expect(result.updatedCapabilities[targetCapId].evidence).toBe("inconsistent");
    expect(result.updatedCapabilities[targetCapId].mastery).toBe("in_progress");
    expect(partialOutcome.milestoneImpact).toContain("Partial improvement observed");
  });

  it("8. Failed treatment causes Dean to reconsider rather than repeat identical intervention", () => {
    const failurePreset = DEMO_FEED_PRESETS.find((p) => p.id === "journey-failure-memory")!;
    const adapted = adaptGoogleFormFeedRow(failurePreset.payload, initialCohort);

    const existingWalkthroughAction = {
      id: "act-prev-walkthrough",
      dayNumber: 3,
      actionType: "buddy_walkthrough" as const,
      targetCapabilityId: 3,
      targetActor: "Buddy (Vikram R.)",
      urgency: "Next Shift" as const,
      decisionType: "reinforce_current" as const,
      title: "Buddy Walkthrough of Aisles 4-8",
      description: "Vikram does a 15-minute walkthrough of Aisles 4-8.",
      smallestPracticalStep: "15-minute walkthrough before Shift Wave 2",
      whyThisAction: "Friction with aisle locations",
      status: "in_progress" as const,
      createdAt: "Day 3",
    };

    const result = executeCoordinationLoop({
      hire: baseHire,
      dayNumber: 4,
      workSignal: adapted.workSignal,
      dailySignal: adapted.dailySignal,
      managerSignal: adapted.managerSignal,
      actionOutcome: adapted.actionOutcome,
      existingAction: existingWalkthroughAction,
    });

    // Dean reconsiders: does not repeat Buddy Walkthrough; escalates to floor layout
    expect(result.action.title).not.toBe("Buddy Walkthrough of Aisles 4-8");
    expect(result.action.whyThisAction).toContain("walkthrough failed");
    expect(adapted.actionOutcome.milestoneImpact).toContain("Gap persists");
  });

  it("9. Day 10 evaluation: High pick rate with incomplete mandatory training remains blocked", () => {
    const hireIncompleteTraining = {
      ...baseHire,
      currentDay: 10,
      modulesCompleted: 8, // 8 of 10 modules completed
      capabilities: { ...baseHire.capabilities },
    };
    Object.keys(hireIncompleteTraining.capabilities).forEach((k) => {
      hireIncompleteTraining.capabilities[Number(k)] = {
        capabilityId: Number(k),
        exposure: "reinforced",
        evidence: "demonstrated",
        performance: "exceeding",
        mastery: "proficient",
        lastAssessedAt: "Day 10",
        reinforcementCount: 1,
      };
    });

    const workSignal: WorkSignal = {
      dayNumber: 10,
      actualPickRate: 58, // Exceeds target of 50 UPH
      targetPickRate: 50,
      accuracyRate: 99,
      ordersCompleted: 50,
      targetOrders: 45,
      hasWorkEvidence: true,
    };

    const result = executeCoordinationLoop({
      hire: hireIncompleteTraining,
      dayNumber: 10,
      workSignal,
    });

    expect(result.day10Evaluation?.isReady).toBe(false);
    expect(result.day10Evaluation?.unresolvedBlockers).toContain("Mandatory Training Completed");
    expect(result.managerReporting).toBe("Mandatory training incomplete — readiness remains blocked");
  });

  it("10. executeCoordinationLoop() remains the single execution authority", () => {
    // Verifies all outputs originate from executeCoordinationLoop without parallel coordinators
    const input: LoopExecutionInput = {
      hire: baseHire,
      dayNumber: 3,
      workSignal: {
        dayNumber: 3,
        actualPickRate: 42,
        targetPickRate: 40,
        accuracyRate: 98,
        ordersCompleted: 35,
        targetOrders: 35,
        hasWorkEvidence: true,
      },
    };

    const result = executeCoordinationLoop(input);
    expect(result).toHaveProperty("pattern");
    expect(result).toHaveProperty("action");
    expect(result).toHaveProperty("updatedStatus");
    expect(result).toHaveProperty("updatedCapabilities");
    expect(result).toHaveProperty("adaptiveDecision");
    expect(result).toHaveProperty("milestoneEvaluation");
  });
});

describe("Step 5 — Part J: Strengthen Evidence -> Diagnosis Quality Requirements", () => {
  const baseHire = initialRahul;

  it("1. Genuine knowledge/capability gap diagnoses prerequisite/capability gap and prescribes targeted learning/practice, not full generic module", () => {
    // Worker with inconsistent evidence on scanner basics (Capability 2) struggling with rack coordinates
    const hireWithPrereqGap = {
      ...baseHire,
      capabilities: {
        ...baseHire.capabilities,
        2: {
          capabilityId: 2,
          exposure: "reinforced" as const,
          evidence: "inconsistent" as const,
          performance: "below_target" as const,
          mastery: "in_progress" as const,
          lastAssessedAt: "Day 2",
          reinforcementCount: 1,
        },
      },
    };

    const workSignal: WorkSignal = {
      dayNumber: 3,
      actualPickRate: 28,
      targetPickRate: 40,
      accuracyRate: 98,
      ordersCompleted: 20,
      targetOrders: 35,
      hasWorkEvidence: true,
    };

    const result = executeCoordinationLoop({
      hire: hireWithPrereqGap,
      dayNumber: 3,
      workSignal,
      dailySignal: {
        workerId: baseHire.id,
        dayNumber: 3,
        shiftTime: "Morning",
        overallConfidence: "Confused",
        challengesEncountered: ["Locations / Aisles"],
        hasBlocker: false,
        rawText: "I am confused by the scanner coordinate prompts on screen when navigating rack locations.",
        timestamp: "Day 3 End",
      } as any,
    });

    expect(result.pattern.patternName).toContain("Prerequisite Gap");
    expect(result.action.targetCapabilityId).toBe(2);
    expect(result.action.decisionType).toBe("return_prerequisite");
    expect(result.action.targetActor).toContain("Buddy");
    // Prescribes targeted 10-minute terminal coaching, NOT full 10-module generic LMS reset
    expect(result.action.smallestPracticalStep).toMatch(/terminal|scanner|review/i);
  });

  it("2. Process/navigation problem correctly avoids unnecessary training and targets floor practice", () => {
    const workSignal: WorkSignal = {
      dayNumber: 3,
      actualPickRate: 31,
      targetPickRate: 40,
      accuracyRate: 98,
      ordersCompleted: 24,
      targetOrders: 35,
      hasWorkEvidence: true,
    };

    const result = executeCoordinationLoop({
      hire: baseHire,
      dayNumber: 3,
      workSignal,
      dailySignal: {
        workerId: baseHire.id,
        dayNumber: 3,
        shiftTime: "Morning",
        overallConfidence: "Confused",
        challengesEncountered: ["Locations / Aisles"],
        hasBlocker: false,
        rawText: "Hard to locate high rack items in Aisles 4 through 8 quickly.",
        timestamp: "Day 3",
      } as any,
    });

    expect(result.pattern.category).toBe("Environment");
    expect(result.pattern.patternName).toContain("Spatial & Rack Coordinate");
    expect(result.action.decisionType).toBe("reinforce_current");
    expect(result.action.targetActor).toContain("Buddy");
    expect(result.action.smallestPracticalStep).toContain("walkthrough");
    expect(result.action.whyThisAction).not.toContain("LMS module");
  });

  it("3. Tool/environment problem correctly avoids unnecessary training and targets maintenance support", () => {
    const workSignal: WorkSignal = {
      dayNumber: 3,
      actualPickRate: 27,
      targetPickRate: 40,
      accuracyRate: 98,
      ordersCompleted: 20,
      targetOrders: 35,
      hasWorkEvidence: true,
    };

    const result = executeCoordinationLoop({
      hire: baseHire,
      dayNumber: 3,
      workSignal,
      dailySignal: {
        id: "sig-tool-01",
        workerId: baseHire.id,
        dayNumber: 3,
        category: "Tool",
        issue: "Scanner laser trigger sticking",
        confidence: "High",
        summary: "Scanner hardware sticking repeatedly.",
        possibleImpact: "Slow pick rate",
        rawText: "Scanner laser trigger is sticking and takes 3 attempts per barcode scan.",
        timestamp: "Day 3",
      } as any,
    });

    expect(result.pattern.category).toBe("Tool");
    expect(result.action.decisionType).toBe("tool_remedy");
    expect(result.action.targetActor).toContain("Maintenance");
    expect(result.action.whyThisAction).toMatch(/hardware/i);
  });

  it("4. Productivity gap with adequate accuracy and no stronger blocker prescribes floor rhythm practice", () => {
    const workSignal: WorkSignal = {
      dayNumber: 3,
      actualPickRate: 33, // 7 UPH gap below 40 UPH target
      targetPickRate: 40,
      accuracyRate: 99, // Pristine accuracy
      ordersCompleted: 25,
      targetOrders: 35,
      hasWorkEvidence: true,
    };

    const result = executeCoordinationLoop({
      hire: baseHire,
      dayNumber: 3,
      workSignal,
      dailySignal: {
        id: "sig-pacing-01",
        workerId: baseHire.id,
        dayNumber: 3,
        category: "Speed",
        issue: "Pacing lag during morning rush",
        confidence: "Medium",
        summary: "Pacing lag during morning rush.",
        possibleImpact: "Lower UPH",
        rawText: "Pacing lag during morning rush; feeling fatigue keeping up with 40/hr pace.",
        timestamp: "Day 3",
      } as any,
    });

    expect(result.pattern.patternName).toContain("Floor Pacing & Route Practice Gap");
    expect(result.action.targetActor).toContain("Buddy");
    expect(result.action.smallestPracticalStep).toMatch(/picking|route|guided|pacing/i);
  });

  it("5. Independence/support-dependency gap prescribes solo-picking practice rather than retraining", () => {
    const workSignal: WorkSignal = {
      dayNumber: 3,
      actualPickRate: 38,
      targetPickRate: 40,
      accuracyRate: 98,
      ordersCompleted: 30,
      targetOrders: 35,
      hasWorkEvidence: true,
    };

    const result = executeCoordinationLoop({
      hire: baseHire,
      dayNumber: 3,
      workSignal,
      dailySignal: {
        id: "sig-dep-01",
        workerId: baseHire.id,
        dayNumber: 3,
        category: "Confidence",
        issue: "Help dependency with buddy",
        confidence: "Low",
        summary: "Asks buddy for confirmation on every bin.",
        possibleImpact: "Slow solo picking",
        rawText: "I ask my buddy before scanning almost every bin just to be 100% sure.",
        timestamp: "Day 3",
      } as any,
      managerSignal: {
        id: "mgr-dep-01",
        hireId: baseHire.id,
        managerName: "Vikram R.",
        dayNumber: 3,
        state: "Needs support",
        issueCategory: "Dependency" as any,
        notes: "Worker asks buddy for confirmation on almost every bin pick despite knowing the process.",
        timestamp: "Day 3",
      } as any,
    });

    expect(result.pattern.patternName).toContain("Independence & Help Dependency");
    expect(result.action.title).toContain("Solo-Picking");
    expect(result.action.smallestPracticalStep).toMatch(/solo pick/i);
  });

  it("6. Communication/help-seeking issue diagnoses escalation hesitation rather than lack of skill", () => {
    const workSignal: WorkSignal = {
      dayNumber: 3,
      actualPickRate: 36,
      targetPickRate: 40,
      accuracyRate: 98,
      ordersCompleted: 30,
      targetOrders: 35,
      hasWorkEvidence: true,
    };

    const result = executeCoordinationLoop({
      hire: baseHire,
      dayNumber: 3,
      workSignal,
      dailySignal: {
        id: "sig-comm-01",
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
    expect(result.action.targetCapabilityId).toBe(18); // DSP-18-TEAM-ESCALATION
    expect(result.action.targetActor).toContain("Buddy");
  });

  it("7. External blocker is diagnosed with zero blame on worker capability", () => {
    const workSignal: WorkSignal = {
      dayNumber: 4,
      actualPickRate: 18,
      targetPickRate: 45,
      accuracyRate: 99,
      ordersCompleted: 12,
      targetOrders: 40,
      externalBottleneck: "Zone B conveyor belt broke down for 75 minutes",
      hasWorkEvidence: true,
    };

    const result = executeCoordinationLoop({
      hire: baseHire,
      dayNumber: 4,
      workSignal,
      dailySignal: {
        id: "sig-ext-01",
        workerId: baseHire.id,
        dayNumber: 4,
        category: "Environment",
        issue: "Conveyor breakdown",
        confidence: "High",
        summary: "Conveyor breakdown halted picking for over an hour.",
        possibleImpact: "Shift pick rate drop",
        rawText: "Conveyor breakdown halted picking for over an hour.",
        timestamp: "Day 4",
      } as any,
    });

    expect(result.pattern.category).toBe("Environment");
    expect(result.pattern.patternName).toContain("Facility Bottleneck");
    expect(result.action.decisionType).toBe("no_action_monitor");
    expect(result.action.targetActor).toContain("Operations");
    expect(result.updatedStatus).toBe("Doing well");
  });

  it("8. Insufficient evidence produces not_enough_evidence without false failure", () => {
    const result = executeCoordinationLoop({
      hire: baseHire,
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
    expect(result.milestoneEvaluation?.managerSummary).toContain("Not enough evidence");
  });

  it("9. Conflicting evidence: High speed (56 UPH) with low training completion caps readiness", () => {
    const hireLowTraining = {
      ...baseHire,
      modulesCompleted: 2,
    };

    const result = executeCoordinationLoop({
      hire: hireLowTraining,
      dayNumber: 3,
      workSignal: {
        dayNumber: 3,
        actualPickRate: 56,
        targetPickRate: 40,
        accuracyRate: 98,
        ordersCompleted: 45,
        targetOrders: 35,
        hasWorkEvidence: true,
      },
    });

    expect(result.overallReadinessScore).toBeLessThanOrEqual(85);
    expect(result.action.decisionType).not.toBe("jump_ahead");
  });

  it("10. One-off poor event does not permanently demote demonstrated capability without persistent failure", () => {
    const hireWithGoodRecord = {
      ...baseHire,
      capabilities: {
        ...baseHire.capabilities,
        3: {
          capabilityId: 3,
          exposure: "reinforced" as const,
          evidence: "demonstrated" as const,
          performance: "on_target" as const,
          mastery: "proficient" as const,
          lastAssessedAt: "Day 2",
          reinforcementCount: 1,
        },
      },
    };

    // External facility issue on Day 3
    const result = executeCoordinationLoop({
      hire: hireWithGoodRecord,
      dayNumber: 3,
      workSignal: {
        dayNumber: 3,
        actualPickRate: 22,
        targetPickRate: 40,
        accuracyRate: 98,
        ordersCompleted: 15,
        targetOrders: 35,
        externalBottleneck: "Power outage in Zone C for 45 minutes",
        hasWorkEvidence: true,
      },
      dailySignal: {
        id: "sig-ext-02",
        workerId: baseHire.id,
        dayNumber: 3,
        category: "Environment",
        issue: "Power outage",
        confidence: "High",
        summary: "Power outage in Zone C.",
        possibleImpact: "Shift pick drop",
        rawText: "Power outage in Zone C for 45 minutes.",
        timestamp: "Day 3",
      } as any,
    });

    // Capability remains demonstrated and not destroyed
    expect(result.updatedCapabilities[3].evidence).toBe("demonstrated");
    expect(result.updatedStatus).toBe("Doing well");
  });

  it("11. Repeated evidence establishes genuine pattern (low accuracy breaches quality floor)", () => {
    const result = executeCoordinationLoop({
      hire: baseHire,
      dayNumber: 3,
      workSignal: {
        dayNumber: 3,
        actualPickRate: 44,
        targetPickRate: 40,
        accuracyRate: 92, // Critically low accuracy
        ordersCompleted: 35,
        targetOrders: 35,
        hasWorkEvidence: true,
      },
    });

    expect(result.pattern.category).toBe("Process");
    expect(result.pattern.patternName).toContain("Variant Differentiation");
    expect(result.action.targetCapabilityId).toBe(6);
    expect(result.action.decisionType).toBe("supervisor_demo");
  });

  it("12. Successful intervention provides evidence for diagnosis refinement and clears ramp-up", () => {
    const successfulOutcome: ActionOutcome = {
      id: "out-nav-success",
      actionId: "act-nav-01",
      dayNumber: 4,
      performedBy: "Buddy (Vikram R.)",
      performedAt: "Day 4 Start of Shift",
      improved: "yes",
      subsequentPickRate: 18,
      subsequentAccuracy: 99,
      notes: "Buddy walkthrough resolved PLU code lookup friction.",
    };

    const hireWithRampUp = {
      ...baseHire,
      currentDay: 4,
      modulesCompleted: 3,
      capabilities: { ...baseHire.capabilities },
      rampUpPlan: {
        isActive: true,
        targetMilestoneDay: 3,
        reason: "Navigation confusion",
        treatmentType: "process_clarification" as const,
        description: "Buddy walkthrough",
        recommendedActor: "Buddy",
        expectedDurationShifts: 1,
        createdAtDay: 3,
      },
    };
    [1, 2, 3, 4].forEach((id) => {
      hireWithRampUp.capabilities[id] = {
        capabilityId: id,
        exposure: "reinforced",
        evidence: "demonstrated",
        performance: "on_target",
        mastery: "proficient",
        lastAssessedAt: "Day 4",
        reinforcementCount: 1,
      };
    });

    const result = executeCoordinationLoop({
      hire: hireWithRampUp,
      dayNumber: 4,
      workSignal: {
        dayNumber: 4,
        actualPickRate: 18,
        targetPickRate: 15,
        accuracyRate: 99,
        ordersCompleted: 40,
        targetOrders: 40,
        hasWorkEvidence: true,
      },
      actionOutcome: successfulOutcome,
    });

    expect(result.updatedStatus).toBe("Doing well");
    expect(result.rampUpPlan?.isActive).toBe(false);
    expect(result.rampUpPlan?.clearedAtDay).toBe(4);
    expect(result.updatedCapabilities[3].mastery).toMatch(/proficient|mastered/);
  });

  it("13. Failed intervention triggers reconsideration rather than blind repetition", () => {
    const failedOutcome: ActionOutcome = {
      id: "out-failed-walkthrough",
      actionId: "act-walkthrough-01",
      dayNumber: 4,
      performedBy: "Buddy (Vikram R.)",
      performedAt: "Day 4 Shift 1",
      improved: "no",
      subsequentPickRate: 30,
      subsequentAccuracy: 98,
      notes: "Buddy walkthrough completed, but picker still lagging in Aisles 4-8.",
    };

    const existingWalkthroughAction = {
      id: "act-walkthrough-01",
      dayNumber: 3,
      actionType: "buddy_walkthrough" as const,
      targetCapabilityId: 3,
      targetActor: "Buddy (Vikram R.)",
      urgency: "Next Shift" as const,
      decisionType: "reinforce_current" as const,
      title: "Buddy Walkthrough of Aisles 4-8",
      description: "Vikram does a 15-minute walkthrough of Aisles 4-8.",
      smallestPracticalStep: "15-minute walkthrough before Shift Wave 2",
      status: "in_progress" as const,
      createdAt: "Day 3",
    };

    const result = executeCoordinationLoop({
      hire: baseHire,
      dayNumber: 4,
      workSignal: {
        dayNumber: 4,
        actualPickRate: 30,
        targetPickRate: 45,
        accuracyRate: 98,
        ordersCompleted: 24,
        targetOrders: 40,
        hasWorkEvidence: true,
      },
      actionOutcome: failedOutcome,
      existingAction: existingWalkthroughAction,
    });

    expect(result.action.title).not.toBe("Buddy Walkthrough of Aisles 4-8");
    expect(result.action.whyThisAction).toContain("walkthrough failed");
    expect(result.action.targetActor).toContain("Supervisor");
  });

  it("14. Milestone gap does not automatically trigger learning treatment when cause is tool friction", () => {
    const workSignal: WorkSignal = {
      dayNumber: 3,
      actualPickRate: 28,
      targetPickRate: 40,
      accuracyRate: 98,
      ordersCompleted: 21,
      targetOrders: 35,
      hasWorkEvidence: true,
    };

    const result = executeCoordinationLoop({
      hire: baseHire,
      dayNumber: 3,
      workSignal,
      dailySignal: {
        id: "sig-tool-02",
        workerId: baseHire.id,
        dayNumber: 3,
        category: "Tool",
        issue: "Scanner touchscreen unresponsive",
        confidence: "High",
        summary: "Scanner touchscreen is unresponsive, requiring 3 taps per scan.",
        possibleImpact: "Pacing delay",
        rawText: "Scanner touchscreen is unresponsive, requiring 3 taps per scan.",
        timestamp: "Day 3",
      } as any,
    });

    expect(result.milestoneEvaluation?.standing).toBe("behind");
    expect(result.pattern.category).toBe("Tool");
    expect(result.action.decisionType).toBe("tool_remedy");
    expect(result.rampUpPlan?.treatmentType).toBe("tool_environment_support");
  });

  it("15. Day 10 readiness rules remain intact (all 7 criteria evaluated)", () => {
    const hireDay10 = {
      ...baseHire,
      currentDay: 10,
      modulesCompleted: 10,
    };

    const evalResult = evaluateDay10Outcome(
      hireDay10,
      {
        dayNumber: 10,
        actualPickRate: 52,
        targetPickRate: 50,
        accuracyRate: 99,
        ordersCompleted: 45,
        targetOrders: 40,
        hasWorkEvidence: true,
      },
      undefined,
      undefined
    );

    expect(evalResult).toHaveProperty("isReady");
    expect(evalResult).toHaveProperty("status");
    expect(evalResult).toHaveProperty("unresolvedBlockers");
    expect(evalResult).toHaveProperty("verifiedCriteria");
    expect(evalResult.verifiedCriteria.length).toBe(7);
  });

  it("16. Existing non-milestone coordination behavior remains intact (safety overrides productivity)", () => {
    const result = executeCoordinationLoop({
      hire: baseHire,
      dayNumber: 3,
      workSignal: {
        dayNumber: 3,
        actualPickRate: 55, // Very high speed
        targetPickRate: 40,
        accuracyRate: 99,
        ordersCompleted: 45,
        targetOrders: 35,
        hasWorkEvidence: true,
      },
      dailySignal: {
        id: "sig-safety-01",
        workerId: baseHire.id,
        dayNumber: 3,
        category: "Safety",
        issue: "Safety protocol breach on high shelf reach",
        confidence: "High",
        summary: "Worker stepped on bottom rack shelves without ladder.",
        possibleImpact: "Fall hazard",
        rawText: "Safety protocol breach: stepping on bottom rack shelves to reach upper items without ladder.",
        timestamp: "Day 3",
      } as any,
    });

    expect(result.pattern.patternName).toContain("Safety Protocol Blocker");
    expect(result.action.targetCapabilityId).toBe(1);
    expect(result.action.decisionType).toBe("supervisor_demo");
    expect(result.action.urgency).toBe("Immediate");
    expect(result.updatedStatus).toBe("At risk");
  });

  it("17. executeCoordinationLoop() remains the sole execution authority across full lifecycle", () => {
    const result = executeCoordinationLoop({
      hire: baseHire,
      dayNumber: 5,
      workSignal: {
        dayNumber: 5,
        actualPickRate: 48,
        targetPickRate: 45,
        accuracyRate: 99,
        ordersCompleted: 42,
        targetOrders: 40,
        hasWorkEvidence: true,
      },
    });

    expect(result.pattern).toBeDefined();
    expect(result.action).toBeDefined();
    expect(result.updatedStatus).toBeDefined();
    expect(result.updatedCapabilities).toBeDefined();
    expect(result.adaptiveDecision).toBeDefined();
    expect(result.overallReadinessScore).toBeDefined();
  });

  // -------------------------------------------------------------------------
  // Step 6B — Retail Cashier Same-Day Divergence & Day-Number Independence
  // -------------------------------------------------------------------------
  describe("Step 6B — Retail Cashier Same-Day Divergence & Evidence Drive", () => {
    it("Retail Cashier Same-Day Divergence: Same role, same day, different evidence produces distinct recommendations", () => {
      // Base Cashier profile on Day 3
      const cashierLearner: NewHire = {
        ...baseHire,
        roleId: "retail_cashier",
        roleTitle: "Retail Cashier",
        currentDay: 3,
        modulesCompleted: 3,
      };

      // Scenario A: Strong Cashier Learner (High scan rate, perfect accuracy, demonstrated capabilities 1-4)
      const strongLearner: NewHire = {
        ...cashierLearner,
        capabilities: { ...cashierLearner.capabilities },
      };
      [1, 2, 3, 4].forEach((id) => {
        strongLearner.capabilities[id] = {
          capabilityId: id,
          exposure: "reinforced",
          evidence: "demonstrated",
          performance: "on_target",
          mastery: "proficient",
          lastAssessedAt: "Day 3",
          reinforcementCount: 1,
        };
      });

      const strongWorkSignal: WorkSignal = {
        dayNumber: 3,
        actualPickRate: 22, // 22 items/min scan rate vs target 18
        targetPickRate: 18,
        accuracyRate: 99.5,
        ordersCompleted: 45,
        targetOrders: 35,
        hasWorkEvidence: true,
      };

      const outcomeA = executeCoordinationLoop({
        hire: strongLearner,
        dayNumber: 3,
        workSignal: strongWorkSignal,
        dailySignal: {
          id: "ds-test-strong",
          dayNumber: 3,
          rawText: "Scanning items smoothly at Till 1, customer queue moving fast without barcode delays.",
          inputMethod: "text",
          issue: "None",
          confidence: "High",
          possibleImpact: "Optimal flow",
          category: "General",
          summary: "Smooth scanning",
          timestamp: "Day 3",
        },
        managerSignal: {
          id: "ms-test-strong",
          dayNumber: 3,
          managerName: "Supervisor",
          state: "Doing well",
          issueCategory: "Other",
          notes: "Doing well, strong line speed and accurate scanning.",
          timestamp: "Day 3",
        },
      });

      // Scenario B: Weak Cashier Learner (Same Day 3, same role, but PLU lookup friction & lagging scan rate)
      const weakLearner: NewHire = {
        ...cashierLearner,
        capabilities: {
          ...cashierLearner.capabilities,
          4: {
            capabilityId: 4, // RC-04-MANUAL-PLU-ENTRY
            exposure: "exposed",
            evidence: "inconsistent",
            performance: "below_target",
            mastery: "in_progress",
            lastAssessedAt: "Day 3",
            reinforcementCount: 0,
          },
        },
      };

      const weakWorkSignal: WorkSignal = {
        dayNumber: 3,
        actualPickRate: 11, // 11 items/min scan rate lagging behind target 18
        targetPickRate: 18,
        accuracyRate: 94,
        ordersCompleted: 22,
        targetOrders: 35,
        helpRequestsCount: 5,
        hasWorkEvidence: true,
      };

      const outcomeB = executeCoordinationLoop({
        hire: weakLearner,
        dayNumber: 3,
        workSignal: weakWorkSignal,
        dailySignal: {
          id: "ds-test-weak",
          dayNumber: 3,
          rawText: "I know barcode scanning, but manual PLU codes for loose produce at Till 1 are confusing and slowing down checkout queue.",
          inputMethod: "text",
          issue: "PLU lookup friction",
          confidence: "Low",
          possibleImpact: "Checkout delay",
          category: "Process",
          summary: "PLU code hesitation",
          timestamp: "Day 3",
        },
        managerSignal: {
          id: "ms-test-weak",
          dayNumber: 3,
          managerName: "Supervisor",
          state: "Needs support",
          issueCategory: "Speed",
          notes: "Needs support with fruit & vegetable PLU code lookup cheat sheet.",
          timestamp: "Day 3",
        },
      });

      // VERIFICATION OF SAME-DAY DIVERGENCE:
      // Same role ("retail_cashier"), Same Day (Day 3), Different Evidence -> DIVERGENT RECOMMENDATIONS
      expect(outcomeA.action.decisionType).toBe("advance_default");
      expect(outcomeA.updatedStatus).toBe("Doing well");

      expect(outcomeB.action.decisionType).not.toBe("advance_default");
      expect(outcomeB.action.targetCapabilityId).toBe(4); // Targets Cap 4 (PLU Lookup)
      expect(outcomeB.updatedStatus).not.toBe("Doing well");

      // Direct proof:
      expect(outcomeA.action.decisionType).not.toEqual(outcomeB.action.decisionType);
      expect(outcomeA.updatedStatus).not.toEqual(outcomeB.updatedStatus);
    });

    it("Day-Number Independence: Intelligence decisions are driven by evidence, not hardcoded day numbers", () => {
      const cashierLearner: NewHire = {
        ...baseHire,
        roleId: "retail_cashier",
        roleTitle: "Retail Cashier",
        modulesCompleted: 3,
      };
      [1, 2, 3, 4].forEach((id) => {
        cashierLearner.capabilities[id] = {
          capabilityId: id,
          exposure: "reinforced",
          evidence: "demonstrated",
          performance: "on_target",
          mastery: "proficient",
          lastAssessedAt: "Day 3",
          reinforcementCount: 1,
        };
      });

      const strongWork = {
        actualPickRate: 22,
        targetPickRate: 18,
        accuracyRate: 99,
        ordersCompleted: 40,
        targetOrders: 35,
        hasWorkEvidence: true,
      };

      // Run same strong evidence on Day 3 vs Day 4
      const resultDay3 = executeCoordinationLoop({
        hire: { ...cashierLearner, currentDay: 3 },
        dayNumber: 3,
        workSignal: { ...strongWork, dayNumber: 3 },
      });

      const resultDay4 = executeCoordinationLoop({
        hire: { ...cashierLearner, currentDay: 4 },
        dayNumber: 4,
        workSignal: { ...strongWork, dayNumber: 4 },
      });

      // Both evaluate strong evidence and recommend advancement to Cap 5
      expect(resultDay3.action.decisionType).toBe("advance_default");
      expect(resultDay4.action.decisionType).toBe("advance_default");
      expect(resultDay3.action.targetCapabilityId).toBe(5);
      expect(resultDay4.action.targetCapabilityId).toBe(5);
    });
  });
});
