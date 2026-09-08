import {
  EvidenceLevel,
  MasteryStatus,
  DARK_STORE_CAPABILITIES,
  NewHire,
  WorkSignal,
  CapabilityState,
} from "../types";

/**
 * Gate severity classifies how critical a milestone check is along the 10-day journey.
 * - "advisory": Formative milestone check; informational telemetry for shift planning.
 * - "checkpoint": Structured capability assessment gate at key operational transitions (Day 3, 5, 7, 9).
 * - "critical_gate": Commercial certification gate required for autonomous role sign-off (Day 10).
 */
export type GateSeverity = "advisory" | "checkpoint" | "critical_gate";

/**
 * Gate status describes the learner's current standing relative to an ideal milestone trajectory.
 * Important: This status is an observational diagnosis, NOT an autonomous blocker or treatment decider.
 */
export type GateStatus =
  | "pending"       // Future milestone, shift day not yet reached
  | "in_progress"   // Current shift day corresponds to this milestone
  | "met"           // Learner has demonstrated all required capabilities and performance metrics
  | "gap_detected"  // One or more capability or performance expectations are not yet demonstrated
  | "blocked"       // Non-negotiable safety violation or critical hardware block prevents gate clearance
  | "not_enough_evidence"; // Insufficient telemetry to evaluate milestone reliably

export type MilestoneStanding =
  | "reached"
  | "on_track"
  | "behind"
  | "ahead"
  | "not_enough_evidence"
  | "pending";

export type EvidenceSufficiency = "sufficient" | "insufficient";

export type RampUpTreatmentType =
  | "refresh_capability"
  | "targeted_module"
  | "guided_practice"
  | "buddy_support"
  | "supervisor_support"
  | "floor_practice"
  | "process_clarification"
  | "tool_environment_support"
  | "communication_support"
  | "monitor_only";

export interface RampUpPlanState {
  isActive: boolean;
  targetMilestoneDay: number;
  reason: string;
  treatmentType: RampUpTreatmentType;
  focusCapabilityId?: number;
  description: string;
  recommendedActor: string;
  expectedDurationShifts: number;
  createdAtDay: number;
  clearedAtDay?: number;
}

export interface MilestoneEvaluationRecord {
  dayNumber: number;
  milestoneDay: number;
  milestoneName: string;
  standing: MilestoneStanding;
  evidenceSufficiency: EvidenceSufficiency;
  gapCount: number;
  managerSummary: string;
  evaluatedAt: string;
  rampUpActive?: boolean;
}

/**
 * Explicit requirement for a specific capability at a milestone gate.
 * References existing capability IDs in DARK_STORE_CAPABILITIES (1 to 20).
 */
export interface RequiredCapabilityRequirement {
  capabilityId: number;
  minEvidenceLevel: EvidenceLevel;
  minMastery?: MasteryStatus;
  description: string;
  criticalForSafety?: boolean;
}

/**
 * Minimum evidence and floor performance requirements defined for an ideal milestone.
 */
export interface MilestonePerformanceRequirement {
  minPickRate?: number;                   // items/hr
  minAccuracy?: number;                   // accuracy percentage (e.g. 98)
  maxHelpRequestsPerShift?: number;       // Upper limit of assistance requests before dependency is flagged
  minDemonstratedCapabilitiesCount?: number; // Minimum count of capabilities with demonstrated/proficient/mastered status
  minModulesCompleted?: number;           // Foundation LMS modules completed
  requireSafetyClear: boolean;            // Whether Capability 1 (Safety) must have zero open violations
}

/**
 * Complete definition of an ideal milestone gate along the 10-day journey.
 * Defines WHAT capabilities and performance must be achieved at Day 3, 5, 7, 9, and 10.
 */
export interface IdealMilestoneDefinition {
  day: number;                                          // 3, 5, 7, 9, 10
  id: string;                                           // e.g. "MILESTONE_DAY_03"
  name: string;                                         // e.g. "DAY 3 — BASIC WORK EXECUTION"
  shortTitle: string;                                   // e.g. "Basic Work Execution"
  theme: string;                                        // e.g. "Foundational Scanning & Location Navigation"
  description: string;
  expectedCapabilities: string[];                       // Human-readable capability expectations
  requiredCapabilities: RequiredCapabilityRequirement[]; // Formal references to DARK_STORE_CAPABILITIES
  performanceExpectations: MilestonePerformanceRequirement;
  prerequisiteMilestoneDays: number[];                  // Days of predecessor milestones that must precede this gate
  gateSeverity: GateSeverity;
}

/**
 * Breakdown of capability comparison against an ideal milestone.
 */
export interface CapabilityGapItem {
  capabilityId: number;
  capabilityCode: string;
  capabilityName: string;
  expectedEvidence: EvidenceLevel;
  actualEvidence: EvidenceLevel;
  actualMastery: MasteryStatus;
  isMet: boolean;
  gapReason?: string;
}

/**
 * Breakdown of floor metric comparison against an ideal milestone.
 */
export interface MetricGapItem {
  metricName: string;
  expected: string | number;
  actual: string | number;
  isMet: boolean;
  unit?: string;
}

/**
 * Read-only comparison result between an actual learner state and an ideal milestone.
 * IMPORTANT: This represents ideal vs. actual evidence comparison.
 * It does NOT decide treatment and does NOT override Dean or execute coordination loops.
 */
export interface MilestoneComparisonResult {
  milestoneDay: number;
  milestoneName: string;
  gateSeverity: GateSeverity;
  status: GateStatus;
  isMet: boolean;
  evidenceSufficiency?: EvidenceSufficiency;
  summary: string;
  capabilityGaps: CapabilityGapItem[];
  metricGaps: MetricGapItem[];
  unmetPrerequisites: number[];
  safetyCleared: boolean;
}

/**
 * Authoritative coordination decision synthesized by Dean from milestone comparison.
 */
export interface MilestoneCoordinationDecision {
  currentMilestone: number;
  milestoneName: string;
  standing: MilestoneStanding;
  evidenceSufficiency: EvidenceSufficiency;
  comparison: MilestoneComparisonResult;
  capabilityGaps: CapabilityGapItem[];
  metricGaps: MetricGapItem[];
  rampUpState?: RampUpPlanState;
  managerSummary: string;
  milestoneImpact?: string;
}

// =========================================================================
// CANONICAL MILESTONE DEFINITIONS (DAY 3, DAY 5, DAY 7, DAY 9, DAY 10)
// Days 0-2 remain the foundation period.
// Capabilities described as required competencies, NOT simply module completions.
// =========================================================================

export const IDEAL_SKILL_PATH_MILESTONES: IdealMilestoneDefinition[] = [
  // -----------------------------------------------------------------------
  // DAY 3 — BASIC WORK EXECUTION
  // -----------------------------------------------------------------------
  {
    day: 3,
    id: "MILESTONE_DAY_03",
    name: "DAY 3 — BASIC WORK EXECUTION",
    shortTitle: "Basic Work Execution",
    theme: "Device Handling, Rack Navigation & Basic Picking",
    description:
      "Learner transitions from foundational orientation to live floor picking. Demonstrates correct scanner aiming, rack-bay-bin coordinate orientation, and initial order pick execution with acceptable baseline accuracy and reduced reliance on constant 1-on-1 handholding.",
    expectedCapabilities: [
      "Basic scanning capability (terminal login, ring-scanner pairing, barcode aiming)",
      "Basic product/location navigation (reading Rack-Bay-Shelf-Bin coordinates in Aisles 1–8)",
      "Basic picking capability (accepting single-order pick sequence and confirming bin scans)",
      "Acceptable initial accuracy (minimum 95% scanning accuracy floor)",
      "Basic ability to perform without constant assistance (<= 4 help requests/shift)",
    ],
    requiredCapabilities: [
      {
        capabilityId: 1, // DSP-01-SAFETY-ZONES
        minEvidenceLevel: "demonstrated",
        description: "Store Safety, PPE compliance & traffic zone adherence",
        criticalForSafety: true,
      },
      {
        capabilityId: 2, // DSP-02-SCANNER-BASICS
        minEvidenceLevel: "demonstrated",
        description: "Handheld terminal login, ring-scanner pairing, battery exchange & barcode aiming",
      },
      {
        capabilityId: 3, // DSP-03-LOCATION-NAV
        minEvidenceLevel: "emerging",
        description: "Reading aisle, rack, bay, shelf, bin coordinate numbering system",
      },
      {
        capabilityId: 5, // DSP-05-SINGLE-ORDER-PICK
        minEvidenceLevel: "emerging",
        description: "Basic single customer order pick sequence on handheld terminal",
      },
    ],
    performanceExpectations: {
      minPickRate: 30,
      minAccuracy: 95,
      maxHelpRequestsPerShift: 4,
      minDemonstratedCapabilitiesCount: 2,
      minModulesCompleted: 3,
      requireSafetyClear: true,
    },
    prerequisiteMilestoneDays: [], // Days 0-2 foundation period
    gateSeverity: "checkpoint",
  },

  // -----------------------------------------------------------------------
  // DAY 5 — CONSISTENT CORE EXECUTION
  // -----------------------------------------------------------------------
  {
    day: 5,
    id: "MILESTONE_DAY_05",
    name: "DAY 5 — CONSISTENT CORE EXECUTION",
    shortTitle: "Consistent Core Execution",
    theme: "Core Fulfillment Workflow, Item Differentiation & Tote Organization",
    description:
      "Learner solidifies the core picking routine. Consistently differentiates look-alike packaging variants, balances grocery totes correctly, and demonstrates rising pick velocity with noticeably reduced buddy intervention.",
    expectedCapabilities: [
      "Core picking workflow (sustained single & multi-item picking with minimal navigation pause)",
      "Improved accuracy (3-point packaging variant check preventing brand/weight/size mix-ups)",
      "Improving productivity (elevating floor pick velocity toward 38+ items/hr)",
      "Reduced unnecessary help (fewer buddy interruptions; resolving minor ambiguities solo)",
      "Basic process independence (proper tote weight distribution and fragile handling)",
    ],
    requiredCapabilities: [
      {
        capabilityId: 1, // DSP-01-SAFETY-ZONES
        minEvidenceLevel: "demonstrated",
        description: "Store safety, PPE compliance, and zero emergency thoroughfare obstructions",
        criticalForSafety: true,
      },
      {
        capabilityId: 2, // DSP-02-SCANNER-BASICS
        minEvidenceLevel: "demonstrated",
        minMastery: "proficient",
        description: "Fast ring-scanner optical sweep and battery dock maintenance",
      },
      {
        capabilityId: 3, // DSP-03-LOCATION-NAV
        minEvidenceLevel: "demonstrated",
        description: "Direct routing to high-frequency pick coordinates without aisle backtracking",
      },
      {
        capabilityId: 5, // DSP-05-SINGLE-ORDER-PICK
        minEvidenceLevel: "demonstrated",
        description: "Consistent single-order pick completion within standard dispatch windows",
      },
      {
        capabilityId: 6, // DSP-06-VARIANT-CHECK
        minEvidenceLevel: "demonstrated",
        description: "3-point variant differentiation (brand, weight, flavor) prior to scanning",
      },
      {
        capabilityId: 8, // DSP-08-FRAGILE-HANDLING
        minEvidenceLevel: "emerging",
        description: "Fragile, glass and bakery item isolation to prevent crushing",
      },
      {
        capabilityId: 10, // DSP-10-TOTE-PACKING
        minEvidenceLevel: "emerging",
        description: "Tote organization, weight balancing, and chemical-food physical separation",
      },
    ],
    performanceExpectations: {
      minPickRate: 38,
      minAccuracy: 97,
      maxHelpRequestsPerShift: 3,
      minDemonstratedCapabilitiesCount: 5,
      minModulesCompleted: 5,
      requireSafetyClear: true,
    },
    prerequisiteMilestoneDays: [3],
    gateSeverity: "checkpoint",
  },

  // -----------------------------------------------------------------------
  // DAY 7 — INDEPENDENT MULTI-TASK EXECUTION
  // -----------------------------------------------------------------------
  {
    day: 7,
    id: "MILESTONE_DAY_07",
    name: "DAY 7 — INDEPENDENT MULTI-TASK EXECUTION",
    shortTitle: "Independent Multi-Task Execution",
    theme: "Cold Chain Protocol, Produce Weighment & Exception Handling",
    description:
      "Learner executes across diverse dark-store categories, including perishable produce scales and cold-chain chillers. Successfully manages stock exceptions and out-of-stock items according to floor SOPs with limited senior peer support.",
    expectedCapabilities: [
      "Performs multiple core tasks (cold-chain retrieval, produce digital scale weighment, batch multi-qty picks)",
      "Maintains acceptable accuracy (stable 98%+ scanning accuracy across diverse product types)",
      "Reasonable productivity (sustaining 42+ items/hr across full shift waves)",
      "Works with limited support (handles standard shift waves without active buddy shadowing)",
      "Handles normal process situations (short-pick, 30-sec secondary shelf searches & authorized substitutions)",
    ],
    requiredCapabilities: [
      {
        capabilityId: 1, // DSP-01-SAFETY-ZONES
        minEvidenceLevel: "demonstrated",
        description: "Continuous floor safety and hazard reporting",
        criticalForSafety: true,
      },
      {
        capabilityId: 4, // DSP-04-COLD-CHAIN-ENTRY
        minEvidenceLevel: "demonstrated",
        description: "Cold room entry protocol, 90-sec thermal timer, and rapid door closure discipline",
      },
      {
        capabilityId: 5, // DSP-05-SINGLE-ORDER-PICK
        minEvidenceLevel: "demonstrated",
        minMastery: "proficient",
        description: "Fluent single-order picking without operational hesitation",
      },
      {
        capabilityId: 7, // DSP-07-PRODUCE-WEIGH
        minEvidenceLevel: "demonstrated",
        description: "Fresh produce selection, visual freshness QC, tare calibration, and label printing",
      },
      {
        capabilityId: 9, // DSP-09-MULTI-QTY-PICK
        minEvidenceLevel: "demonstrated",
        description: "Accurate multi-item and multi-quantity unit counts directly into tote",
      },
      {
        capabilityId: 10, // DSP-10-TOTE-PACKING
        minEvidenceLevel: "demonstrated",
        description: "Balanced, damage-free tote staging",
      },
      {
        capabilityId: 11, // DSP-11-STOCK-EXCEPTIONS
        minEvidenceLevel: "emerging",
        description: "Short-pick, secondary bin query, and system substitution workflow",
      },
    ],
    performanceExpectations: {
      minPickRate: 42,
      minAccuracy: 98,
      maxHelpRequestsPerShift: 2,
      minDemonstratedCapabilitiesCount: 9,
      minModulesCompleted: 7,
      requireSafetyClear: true,
    },
    prerequisiteMilestoneDays: [3, 5],
    gateSeverity: "checkpoint",
  },

  // -----------------------------------------------------------------------
  // DAY 9 — NEAR JOB-READY
  // -----------------------------------------------------------------------
  {
    day: 9,
    id: "MILESTONE_DAY_09",
    name: "DAY 9 — NEAR JOB-READY",
    shortTitle: "Near Job-Ready",
    theme: "SLA Pacing, Route Optimization & Quality Control Flagging",
    description:
      "Learner functions near full operational tempo. Anticipates pick routes along serpentine aisles, paces against 10-minute order SLA timers, flags damaged goods proactively, and escalates facility bottlenecks through appropriate shift channels.",
    expectedCapabilities: [
      "Performs the normal role workflow (serpentine routing, dispatch buffer handoff, full-shift wave execution)",
      "Reliable accuracy (consistent 98%+ scanning accuracy under speed conditions)",
      "Acceptable productivity (reaches 48+ picks/hr, approaching commercial 50 picks/hr benchmark)",
      "Independent execution (operates autonomously on floor; self-reliant during order rushes)",
      "Appropriate escalation when needed (radio communication of aisle bottlenecks and inventory discrepancies)",
    ],
    requiredCapabilities: [
      {
        capabilityId: 1, // DSP-01-SAFETY-ZONES
        minEvidenceLevel: "demonstrated",
        minMastery: "mastered",
        description: "Flawless safety record with verified zone adherence",
        criticalForSafety: true,
      },
      {
        capabilityId: 12, // DSP-12-DAMAGED-QC
        minEvidenceLevel: "demonstrated",
        description: "Damaged packaging, broken seal, and near-expiry goods flagging to quarantine",
      },
      {
        capabilityId: 13, // DSP-13-MANUAL-BARCODE
        minEvidenceLevel: "demonstrated",
        description: "Manual 13-digit EAN barcode recovery when labels are smudged or torn",
      },
      {
        capabilityId: 14, // DSP-14-ROUTE-OPTIMIZE
        minEvidenceLevel: "demonstrated",
        description: "Serpentine pick route anticipation eliminating backtracking",
      },
      {
        capabilityId: 15, // DSP-15-SLA-TIMER-PACING
        minEvidenceLevel: "demonstrated",
        description: "Pacing pick waves against 10-minute delivery countdown timers",
      },
      {
        capabilityId: 18, // DSP-18-TEAM-ESCALATION
        minEvidenceLevel: "demonstrated",
        description: "Clear floor radio escalation to supervisor for facility blockers",
      },
    ],
    performanceExpectations: {
      minPickRate: 48,
      minAccuracy: 98,
      maxHelpRequestsPerShift: 1,
      minDemonstratedCapabilitiesCount: 13,
      minModulesCompleted: 9,
      requireSafetyClear: true,
    },
    prerequisiteMilestoneDays: [3, 5, 7],
    gateSeverity: "checkpoint",
  },

  // -----------------------------------------------------------------------
  // DAY 10 — JOB READINESS
  // -----------------------------------------------------------------------
  {
    day: 10,
    id: "MILESTONE_DAY_10",
    name: "DAY 10 — JOB READINESS",
    shortTitle: "Job Readiness / Autonomous Certification",
    theme: "Commercial Certification Across All 7 Core Verification Pillars",
    description:
      "Final operational certification gate. Confirms worker has completed mandatory foundation training, demonstrated core floor capabilities, achieved commercial productivity (50+ picks/hr) and accuracy (98%+), executes independently, and possesses zero unresolved safety blockers.",
    expectedCapabilities: [
      "Required training completed (10/10 foundation learning modules finished and verified)",
      "Required capabilities demonstrated (14+ verified floor capabilities in the ledger)",
      "Acceptable performance (sustained 50+ picks/hr commercial productivity target)",
      "Acceptable accuracy (sustained 98%+ scanning accuracy across all shifts)",
      "Independence (solo execution with <= 1 help request; no recurring buddy handholding)",
      "Consistency / reliability (reliable execution across peak order waves and category shifts)",
      "No unresolved critical safety blocker (Capability 1 verified clear; zero safety violations)",
    ],
    requiredCapabilities: [
      {
        capabilityId: 1, // DSP-01-SAFETY-ZONES
        minEvidenceLevel: "demonstrated",
        minMastery: "mastered",
        description: "Zero open safety/PPE violations verified across all 10 days",
        criticalForSafety: true,
      },
      {
        capabilityId: 16, // DSP-16-DISPATCH-HANDOFF
        minEvidenceLevel: "demonstrated",
        description: "Dispatch staging buffer handoff, barcode scanning, and QC checker coordination",
      },
      {
        capabilityId: 17, // DSP-17-RIDER-BAG-SEAL
        minEvidenceLevel: "demonstrated",
        description: "Tamper-evident zip seals and thermal insulation bags for chilled delivery riders",
      },
      {
        capabilityId: 19, // DSP-19-SHIFT-CLOSEOUT
        minEvidenceLevel: "demonstrated",
        description: "Terminal docking in charging bay, tote sanitation, and shift log submission",
      },
      {
        capabilityId: 20, // DSP-20-AUTONOMOUS-MASTERY
        minEvidenceLevel: "demonstrated",
        description: "Autonomous multi-zone peak pacing across all 8 aisles under live delivery SLAs",
      },
    ],
    performanceExpectations: {
      minPickRate: 50,
      minAccuracy: 98,
      maxHelpRequestsPerShift: 1,
      minDemonstratedCapabilitiesCount: 14,
      minModulesCompleted: 10,
      requireSafetyClear: true,
    },
    prerequisiteMilestoneDays: [3, 5, 7, 9],
    gateSeverity: "critical_gate",
  },
];

// =========================================================================
// CLEAN ACCESSORS & COMPARISON HELPERS FOR EXISTING INTELLIGENCE
// =========================================================================

/**
 * Retrieves the ideal milestone definition for a given shift day.
 * Returns undefined if the day is not one of the canonical milestone days (3, 5, 7, 9, 10).
 */
export function getMilestoneForDay(day: number): IdealMilestoneDefinition | undefined {
  return IDEAL_SKILL_PATH_MILESTONES.find((m) => m.day === day);
}

/**
 * Returns all canonical milestone definitions in the ideal skill path.
 */
export function getAllMilestones(): IdealMilestoneDefinition[] {
  return [...IDEAL_SKILL_PATH_MILESTONES];
}

/**
 * Returns all prerequisite milestones for a given day.
 */
export function getPrerequisiteMilestones(day: number): IdealMilestoneDefinition[] {
  const target = getMilestoneForDay(day);
  if (!target) return [];
  return IDEAL_SKILL_PATH_MILESTONES.filter((m) =>
    target.prerequisiteMilestoneDays.includes(m.day)
  );
}

/**
 * Resolves the relevant milestone definition for a given shift day.
 * - Days 0-2: Foundation period (returns undefined as no milestone gate is active yet).
 * - Day 3-4: Evaluates against Day 3 milestone.
 * - Day 5-6: Evaluates against Day 5 milestone.
 * - Day 7-8: Evaluates against Day 7 milestone.
 * - Day 9: Evaluates against Day 9 milestone.
 * - Day 10+: Evaluates against Day 10 milestone.
 */
export function getRelevantMilestoneForDay(dayNumber: number): IdealMilestoneDefinition | undefined {
  if (dayNumber < 3) return undefined;
  if (dayNumber <= 4) return getMilestoneForDay(3);
  if (dayNumber <= 6) return getMilestoneForDay(5);
  if (dayNumber <= 8) return getMilestoneForDay(7);
  if (dayNumber === 9) return getMilestoneForDay(9);
  return getMilestoneForDay(10);
}

/**
 * Performs a pure, read-only comparison between a learner's actual state and an ideal milestone.
 *
 * IMPORTANT ARCHITECTURAL RULE:
 * - This function is an observational diagnostic lens comparing ideal trajectory vs. actual state.
 * - It does NOT decide interventions or treatment.
 * - It does NOT override the Dean.
 * - It does NOT automatically block learners or mutate learner state.
 */
export function compareLearnerToMilestone(
  hire: NewHire,
  milestone: IdealMilestoneDefinition,
  workSignal?: WorkSignal
): MilestoneComparisonResult {
  const capabilities = hire.capabilities || {};
  const currentWork =
    workSignal ||
    hire.daysHistory[hire.daysHistory.length - 1]?.workSignal || {
      dayNumber: milestone.day,
      targetPickRate: milestone.performanceExpectations.minPickRate || 40,
      actualPickRate: 35,
      accuracyRate: 98,
      ordersCompleted: 30,
      targetOrders: 35,
    };

  // Check evidence sufficiency: If no floor telemetry or capabilities observed yet
  const hasExplicitNoWork = currentWork.hasWorkEvidence === false;
  const hasZeroOrdersWithoutProof = currentWork.ordersCompleted === 0 && currentWork.hasWorkEvidence !== true;
  const hasAnyCapabilityEvidence = Object.values(capabilities).some(
    (c) => c && c.evidence !== "none"
  );

  if ((hasExplicitNoWork || hasZeroOrdersWithoutProof) && !hasAnyCapabilityEvidence) {
    return {
      milestoneDay: milestone.day,
      milestoneName: milestone.name,
      gateSeverity: milestone.gateSeverity,
      status: "not_enough_evidence",
      isMet: false,
      evidenceSufficiency: "insufficient",
      summary: "Not enough evidence — continue observation",
      capabilityGaps: [],
      metricGaps: [],
      unmetPrerequisites: [],
      safetyCleared: true,
    };
  }

  const capStates = Object.values(capabilities) as CapabilityState[];
  const demonstratedCount = capStates.filter(
    (c) =>
      c &&
      (c.evidence === "demonstrated" ||
        c.mastery === "proficient" ||
        c.mastery === "mastered")
  ).length;

  const pickRate = currentWork.actualPickRate;
  const accuracy = currentWork.accuracyRate;
  const helpRequests = currentWork.helpRequestsCount ?? 0;
  const modulesCompleted = hire.modulesCompleted ?? 0;

  // 1. Check required capabilities against evidence levels
  const capabilityGaps: CapabilityGapItem[] = [];
  const evidenceHierarchy: Record<EvidenceLevel, number> = {
    none: 0,
    inconsistent: 1,
    emerging: 2,
    demonstrated: 3,
  };

  for (const req of milestone.requiredCapabilities) {
    const def = DARK_STORE_CAPABILITIES.find((c) => c.id === req.capabilityId);
    const state = capabilities[req.capabilityId];

    const actualEvidence: EvidenceLevel = state?.evidence || "none";
    const actualMastery: MasteryStatus = state?.mastery || "locked";

    const meetsEvidence =
      evidenceHierarchy[actualEvidence] >= evidenceHierarchy[req.minEvidenceLevel];
    const meetsMastery = req.minMastery
      ? actualMastery === req.minMastery || actualMastery === "mastered"
      : true;

    const isMet = meetsEvidence && meetsMastery;

    capabilityGaps.push({
      capabilityId: req.capabilityId,
      capabilityCode: def?.code || `CAP-${req.capabilityId}`,
      capabilityName: def?.name || `Capability ${req.capabilityId}`,
      expectedEvidence: req.minEvidenceLevel,
      actualEvidence,
      actualMastery,
      isMet,
      gapReason: isMet
        ? undefined
        : `Expected evidence level '${req.minEvidenceLevel}', observed '${actualEvidence}'`,
    });
  }

  // 2. Check performance metrics
  const metricGaps: MetricGapItem[] = [];

  if (typeof milestone.performanceExpectations.minPickRate === "number") {
    const minP = milestone.performanceExpectations.minPickRate;
    metricGaps.push({
      metricName: "Pick Rate",
      expected: minP,
      actual: pickRate,
      isMet: pickRate >= minP,
      unit: "picks/hr",
    });
  }

  if (typeof milestone.performanceExpectations.minAccuracy === "number") {
    const minA = milestone.performanceExpectations.minAccuracy;
    metricGaps.push({
      metricName: "Scanning Accuracy",
      expected: minA,
      actual: accuracy,
      isMet: accuracy >= minA,
      unit: "%",
    });
  }

  if (typeof milestone.performanceExpectations.maxHelpRequestsPerShift === "number") {
    const maxH = milestone.performanceExpectations.maxHelpRequestsPerShift;
    metricGaps.push({
      metricName: "Independence (Help Requests)",
      expected: `<= ${maxH}`,
      actual: helpRequests,
      isMet: helpRequests <= maxH,
      unit: "requests/shift",
    });
  }

  if (typeof milestone.performanceExpectations.minDemonstratedCapabilitiesCount === "number") {
    const minC = milestone.performanceExpectations.minDemonstratedCapabilitiesCount;
    metricGaps.push({
      metricName: "Demonstrated Capabilities Count",
      expected: minC,
      actual: demonstratedCount,
      isMet: demonstratedCount >= minC,
      unit: "capabilities",
    });
  }

  if (typeof milestone.performanceExpectations.minModulesCompleted === "number") {
    const minM = milestone.performanceExpectations.minModulesCompleted;
    metricGaps.push({
      metricName: "Mandatory Training Modules",
      expected: minM,
      actual: modulesCompleted,
      isMet: modulesCompleted >= minM,
      unit: "modules",
    });
  }

  // 3. Safety check
  const safetyCap = capabilities[1];
  const safetyCleared = Boolean(
    safetyCap &&
      safetyCap.mastery !== "locked" &&
      safetyCap.evidence !== "inconsistent"
  );

  if (milestone.performanceExpectations.requireSafetyClear) {
    metricGaps.push({
      metricName: "Safety Protocol Compliance",
      expected: "Clear",
      actual: safetyCleared ? "Clear" : "Unresolved Safety Issue",
      isMet: safetyCleared,
    });
  }

  // 4. Prerequisite milestone check
  const unmetPrerequisites: number[] = [];
  // Informational check only; does not block evaluation

  // 5. Synthesis of overall milestone alignment
  const allCapsMet = capabilityGaps.every((c) => c.isMet);
  const allMetricsMet = metricGaps.every((m) => m.isMet);
  const isMet = allCapsMet && allMetricsMet && safetyCleared;

  let status: GateStatus = "gap_detected";
  if (!safetyCleared) {
    status = "blocked";
  } else if (isMet) {
    status = "met";
  } else if (hire.currentDay < milestone.day) {
    status = "pending";
  } else if (hire.currentDay === milestone.day) {
    status = "in_progress";
  } else {
    status = "gap_detected";
  }

  const firstName = (hire.name || "Learner").split(" ")[0];
  const summary = isMet
    ? `${firstName} meets all ideal milestone expectations for Day ${milestone.day} (${milestone.shortTitle}).`
    : `${firstName} has ${capabilityGaps.filter((c) => !c.isMet).length} capability gap(s) and ${
        metricGaps.filter((m) => !m.isMet).length
      } metric gap(s) against the Day ${milestone.day} ideal trajectory.`;

  return {
    milestoneDay: milestone.day,
    milestoneName: milestone.name,
    gateSeverity: milestone.gateSeverity,
    status,
    isMet,
    evidenceSufficiency: "sufficient",
    summary,
    capabilityGaps,
    metricGaps,
    unmetPrerequisites,
    safetyCleared,
  };
}
