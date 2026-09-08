import { describe, it, expect } from "vitest";
import {
  IDEAL_SKILL_PATH_MILESTONES,
  getMilestoneForDay,
  getAllMilestones,
  getPrerequisiteMilestones,
  compareLearnerToMilestone,
} from "./milestones";
import { DARK_STORE_CAPABILITIES } from "../types";
import { initialRahul, initialCohort } from "../data/seedData";

describe("Step 1 — Ideal Skill Path & Milestone / Gate Model", () => {
  it("defines exactly the 5 canonical milestone checkpoints: Day 3, 5, 7, 9, 10", () => {
    const milestones = getAllMilestones();
    expect(milestones).toHaveLength(5);
    expect(milestones.map((m) => m.day)).toEqual([3, 5, 7, 9, 10]);
  });

  it("references only valid capability IDs from DARK_STORE_CAPABILITIES (no duplicates or fake IDs)", () => {
    const validIds = new Set(DARK_STORE_CAPABILITIES.map((c) => c.id));
    const milestones = getAllMilestones();

    for (const milestone of milestones) {
      expect(milestone.requiredCapabilities.length).toBeGreaterThan(0);
      for (const req of milestone.requiredCapabilities) {
        expect(validIds.has(req.capabilityId)).toBe(true);
        expect(req.minEvidenceLevel).toBeDefined();
      }
    }
  });

  it("Day 3 describes required capability, not simply module completion", () => {
    const day3 = getMilestoneForDay(3);
    expect(day3).toBeDefined();
    expect(day3?.name).toBe("DAY 3 — BASIC WORK EXECUTION");
    expect(day3?.gateSeverity).toBe("checkpoint");

    // Required capabilities must include scanning (Cap 2), location nav (Cap 3), and basic pick (Cap 5)
    const capIds = day3?.requiredCapabilities.map((r) => r.capabilityId);
    expect(capIds).toContain(1); // Safety
    expect(capIds).toContain(2); // Handheld terminal & scanner basics
    expect(capIds).toContain(3); // Location / coordinate navigation
    expect(capIds).toContain(5); // Basic single-order pick

    // Expected capabilities must cover user's explicit checklist
    const expectations = day3?.expectedCapabilities.join(" ").toLowerCase();
    expect(expectations).toContain("scanning");
    expect(expectations).toContain("location navigation");
    expect(expectations).toContain("picking");
    expect(expectations).toContain("accuracy");
    expect(expectations).toContain("without constant assistance");
  });

  it("Day 5 defines consistent core execution", () => {
    const day5 = getMilestoneForDay(5);
    expect(day5).toBeDefined();
    expect(day5?.name).toBe("DAY 5 — CONSISTENT CORE EXECUTION");
    expect(day5?.prerequisiteMilestoneDays).toEqual([3]);

    const capIds = day5?.requiredCapabilities.map((r) => r.capabilityId);
    expect(capIds).toContain(5); // Single order pick
    expect(capIds).toContain(6); // 3-point variant check
    expect(capIds).toContain(8); // Fragile handling
    expect(capIds).toContain(10); // Tote packing

    expect(day5?.performanceExpectations.minPickRate).toBe(38);
    expect(day5?.performanceExpectations.minAccuracy).toBe(97);
  });

  it("Day 7 defines independent multi-task execution with stock exceptions & cold room", () => {
    const day7 = getMilestoneForDay(7);
    expect(day7).toBeDefined();
    expect(day7?.name).toBe("DAY 7 — INDEPENDENT MULTI-TASK EXECUTION");
    expect(day7?.prerequisiteMilestoneDays).toEqual([3, 5]);

    const capIds = day7?.requiredCapabilities.map((r) => r.capabilityId);
    expect(capIds).toContain(4); // Cold chain entry
    expect(capIds).toContain(7); // Produce weighment
    expect(capIds).toContain(9); // Multi-qty pick
    expect(capIds).toContain(11); // Stock exceptions

    expect(day7?.performanceExpectations.minPickRate).toBe(42);
    expect(day7?.performanceExpectations.minAccuracy).toBe(98);
  });

  it("Day 9 defines near job-ready workflow, route optimization & escalation", () => {
    const day9 = getMilestoneForDay(9);
    expect(day9).toBeDefined();
    expect(day9?.name).toBe("DAY 9 — NEAR JOB-READY");
    expect(day9?.prerequisiteMilestoneDays).toEqual([3, 5, 7]);

    const capIds = day9?.requiredCapabilities.map((r) => r.capabilityId);
    expect(capIds).toContain(12); // Damaged QC
    expect(capIds).toContain(13); // Manual barcode fallback
    expect(capIds).toContain(14); // Route optimization
    expect(capIds).toContain(15); // SLA timer pacing
    expect(capIds).toContain(18); // Team escalation

    expect(day9?.performanceExpectations.minPickRate).toBe(48);
  });

  it("Day 10 defines job readiness with critical gate severity across all 7 criteria", () => {
    const day10 = getMilestoneForDay(10);
    expect(day10).toBeDefined();
    expect(day10?.name).toBe("DAY 10 — JOB READINESS");
    expect(day10?.gateSeverity).toBe("critical_gate");
    expect(day10?.prerequisiteMilestoneDays).toEqual([3, 5, 7, 9]);

    const capIds = day10?.requiredCapabilities.map((r) => r.capabilityId);
    expect(capIds).toContain(1); // Safety
    expect(capIds).toContain(16); // Dispatch handoff
    expect(capIds).toContain(17); // Rider bag seal
    expect(capIds).toContain(19); // Shift closeout
    expect(capIds).toContain(20); // Autonomous mastery

    expect(day10?.performanceExpectations.minPickRate).toBe(50);
    expect(day10?.performanceExpectations.minAccuracy).toBe(98);
    expect(day10?.performanceExpectations.minModulesCompleted).toBe(10);
    expect(day10?.performanceExpectations.minDemonstratedCapabilitiesCount).toBe(14);
    expect(day10?.performanceExpectations.requireSafetyClear).toBe(true);
  });

  it("accessor functions work correctly", () => {
    expect(getMilestoneForDay(1)).toBeUndefined();
    expect(getMilestoneForDay(3)?.day).toBe(3);
    expect(getMilestoneForDay(5)?.day).toBe(5);
    expect(getMilestoneForDay(10)?.day).toBe(10);

    const prereqsForDay7 = getPrerequisiteMilestones(7);
    expect(prereqsForDay7.map((m) => m.day)).toEqual([3, 5]);
  });

  it("compareLearnerToMilestone performs pure observational comparison without mutating learner", () => {
    const day3Milestone = getMilestoneForDay(3)!;
    const rahul = JSON.parse(JSON.stringify(initialRahul));
    const comparison = compareLearnerToMilestone(rahul, day3Milestone);

    expect(comparison.milestoneDay).toBe(3);
    expect(comparison.gateSeverity).toBe("checkpoint");
    expect(comparison.capabilityGaps.length).toBeGreaterThan(0);
    expect(comparison.metricGaps.length).toBeGreaterThan(0);
    expect(comparison.safetyCleared).toBe(true);

    // Verify initial Rahul state was not mutated
    expect(rahul.currentDay).toBe(3);
    expect(rahul.status).toBe(initialRahul.status);
  });

  it("detects safety blockage as status 'blocked' if Capability 1 is locked or violated", () => {
    const day3Milestone = getMilestoneForDay(3)!;
    const unsafeHire = {
      ...initialRahul,
      capabilities: {
        ...initialRahul.capabilities,
        1: {
          ...initialRahul.capabilities[1],
          mastery: "locked" as const,
          evidence: "none" as const,
        },
      },
    };

    const comparison = compareLearnerToMilestone(unsafeHire, day3Milestone);
    expect(comparison.safetyCleared).toBe(false);
    expect(comparison.status).toBe("blocked");
  });

  it("handles learner with missing capabilities gracefully without throwing", () => {
    const day3Milestone = getMilestoneForDay(3)!;
    const blankHire = {
      ...initialRahul,
      capabilities: {},
      daysHistory: [],
    };

    const comparison = compareLearnerToMilestone(blankHire, day3Milestone);
    expect(comparison.isMet).toBe(false);
    expect(comparison.capabilityGaps.length).toBe(day3Milestone.requiredCapabilities.length);
    // Since safety cap 1 is missing, safety is not cleared
    expect(comparison.safetyCleared).toBe(false);
    expect(comparison.status).toBe("blocked");

    // With safety cleared, it should report not_met
    const safeHireWithGaps = {
      ...blankHire,
      capabilities: {
        1: {
          capabilityId: 1,
          exposure: "exposed" as const,
          evidence: "demonstrated" as const,
          performance: "on_target" as const,
          mastery: "proficient" as const,
          lastAssessedAt: "Day 1",
          reinforcementCount: 0,
        },
      },
    };
    const comp2 = compareLearnerToMilestone(safeHireWithGaps, day3Milestone);
    expect(comp2.safetyCleared).toBe(true);
    expect(comp2.status).toBe("in_progress");

    // If learner is on Day 5 and hasn't met Day 3, it should be gap_detected
    const olderHire = { ...safeHireWithGaps, currentDay: 5 };
    const comp3 = compareLearnerToMilestone(olderHire, day3Milestone);
    expect(comp3.status).toBe("gap_detected");
  });
});
