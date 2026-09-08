import { describe, it, expect } from "vitest";
import {
  executeCoordinationLoop,
  LoopExecutionInput,
  evaluateDay10Outcome,
} from "./intelligence";
import { adaptGoogleFormFeedRow, DEMO_FEED_PRESETS } from "./googleFormFeedAdapter";
import { initialRahul, initialCohort } from "../data/seedData";
import { WorkSignal } from "../types";

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
    expect(result.action.title).toContain("Floor Layout & Shelf");
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
      capabilities: { ...baseHire.capabilities },
    };
    // mark core capabilities demonstrated
    Object.keys(readyHire.capabilities).forEach((k) => {
      readyHire.capabilities[Number(k)] = {
        capabilityId: Number(k),
        exposure: "reinforced",
        evidence: "demonstrated",
        performance: "on_target",
        mastery: "proficient",
        lastAssessedAt: "Day 10",
        reinforcementCount: 1,
      };
    });

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
    // Hire on Day 3 who has demonstrated capabilities 1, 2, 3 and meets 40 UPH floor target
    const hireAtMilestone3 = {
      ...baseHire,
      currentDay: 3,
      modulesCompleted: 3,
      capabilities: { ...baseHire.capabilities },
    };
    [1, 2, 3].forEach((id) => {
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

    const result = executeCoordinationLoop({
      hire: hireWithActiveRampUp,
      dayNumber: 4,
      workSignal: adapted.workSignal,
      dailySignal: adapted.dailySignal,
      managerSignal: adapted.managerSignal,
      actionOutcome: adapted.actionOutcome,
    });

    expect(result.updatedStatus).toBe("Doing well");
    expect(result.action.decisionType).toBe("advance_default");
    expect(result.rampUpPlan?.isActive).toBe(false);
    expect(result.rampUpPlan?.clearedAtDay).toBe(4);
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
