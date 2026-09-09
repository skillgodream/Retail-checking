import {
  EvidenceLevel,
  MasteryStatus,
  DARK_STORE_CAPABILITIES,
  RETAIL_CASHIER_CAPABILITIES,
  NewHire,
  WorkSignal,
  CapabilityState,
} from "../types";
import { RETAIL_CASHIER_IDEAL_MILESTONES } from "./retailCashierMilestones";

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
 * 3-Dimensional Adaptive Current Plan:
 * A. Productive Work - What safe, useful work the learner can perform right now.
 * B. Development - What capability/knowledge/process needs targeted improvement.
 * C. Progression Gate - What must become true before the next ideal step is released.
 */
export interface ProductiveWorkPlan {
  safeWorkTitle: string;
  safeWorkDescription: string;
  targetPacing: number;
  zoneOrAisles: string;
  whySafe: string;
}

export interface DevelopmentPlan {
  focusCapabilityId: number;
  focusCapabilityName: string;
  developmentType: string;
  actionDescription: string;
  actor: string;
  durationMinutes: number;
}

export interface ProgressionGatePlan {
  idealStep: string;
  gateStatus:
    | "released"
    | "on_track"
    | "held"
    | "blocked"
    | "ahead"
    | "recovered"
    | "insufficient_evidence"
    | "not_enough_evidence"
    | "pending";
  nextMilestoneTarget?: number;
  blockedStepName?: string;
  holdReason?: string;
  unlockCriteria: string;
  isUnlocked: boolean;
  previousInterventionOutcome?: "yes" | "partial" | "no" | "insufficient_evidence";
}

export interface AdaptiveCurrentPlan {
  productiveWork: ProductiveWorkPlan;
  development: DevelopmentPlan;
  progressionGate: ProgressionGatePlan;
  deanRationale: string;
}

export interface ManagerMotivationPlan {
  heading: string;
  message: string;
  coachingPrompt: string;
}

export interface PitStopDecisionRecord {
  milestoneDay: number;
  milestoneName: string;
  shortTitle: string;
  idealPlan: {
    expectedCapabilities: string[];
    floorPerformance: string;
    milestoneName: string;
  };
  actualState: {
    demonstratedCapabilities: string[];
    floorMetrics: string;
    safetyStatus: string;
  };
  gap: {
    summary: string;
    hasGaps: boolean;
    capabilityGaps: CapabilityGapItem[];
    metricGaps: MetricGapItem[];
  };
  currentPlan: AdaptiveCurrentPlan;
  progressionStatus:
    | "released"
    | "on_track"
    | "held"
    | "blocked"
    | "ahead"
    | "recovered"
    | "not_enough_evidence"
    | "pending";
  deanReasoning: string;
  previousOutcome?: {
    action: string;
    outcome: "yes" | "partial" | "no";
    impact: string;
  };
  nextDecision: string;
  managerMotivation: ManagerMotivationPlan;
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

export { RETAIL_CASHIER_IDEAL_MILESTONES } from "./retailCashierMilestones";

/**
 * Retrieves the ideal milestone definition for a given shift day.
 * Returns undefined if the day is not one of the canonical milestone days (3, 5, 7, 9, 10).
 */
export function getMilestoneForDay(day: number, hire?: Partial<NewHire>): IdealMilestoneDefinition | undefined {
  const isRetailCashier = hire?.roleId === "retail_cashier";
  const milestones = isRetailCashier ? RETAIL_CASHIER_IDEAL_MILESTONES : IDEAL_SKILL_PATH_MILESTONES;
  return milestones.find((m) => m.day === day);
}

/**
 * Returns all canonical milestone definitions in the ideal skill path.
 */
export function getAllMilestones(hire?: Partial<NewHire>): IdealMilestoneDefinition[] {
  const isRetailCashier = hire?.roleId === "retail_cashier";
  return isRetailCashier ? [...RETAIL_CASHIER_IDEAL_MILESTONES] : [...IDEAL_SKILL_PATH_MILESTONES];
}

/**
 * Returns all prerequisite milestones for a given day.
 */
export function getPrerequisiteMilestones(day: number, hire?: Partial<NewHire>): IdealMilestoneDefinition[] {
  const target = getMilestoneForDay(day, hire);
  if (!target) return [];
  const milestones = getAllMilestones(hire);
  return milestones.filter((m) =>
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
export function getRelevantMilestoneForDay(dayNumber: number, hire?: Partial<NewHire>): IdealMilestoneDefinition | undefined {
  if (dayNumber < 3) return undefined;
  if (dayNumber <= 4) return getMilestoneForDay(3, hire);
  if (dayNumber <= 6) return getMilestoneForDay(5, hire);
  if (dayNumber <= 8) return getMilestoneForDay(7, hire);
  if (dayNumber === 9) return getMilestoneForDay(9, hire);
  return getMilestoneForDay(10, hire);
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

  if (hasExplicitNoWork || (hasZeroOrdersWithoutProof && !hasAnyCapabilityEvidence)) {
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

  const isDarkStore = hire.roleId === "dark_store_picker" || hire.roleTitle === "Dark Store Picker";
  const activeCaps = isDarkStore ? DARK_STORE_CAPABILITIES : RETAIL_CASHIER_CAPABILITIES;

  for (const req of milestone.requiredCapabilities) {
    const def = activeCaps.find((c) => c.id === req.capabilityId);
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

/**
 * Authoritatively evaluates a specific Pit-Stop Checkpoint (Day 3, 5, 7, 9, 10).
 * Generates the full 3-Dimensional Current Plan:
 * 1. Productive Work: Safe, useful floor contribution right now.
 * 2. Development: Minimum effective floor intervention/practice.
 * 3. Progression Gate: Hold vs Release with explicit unlock criteria.
 */
export function evaluatePitStopDecision(
  hire: NewHire,
  milestoneDay: number,
  currentWork: WorkSignal,
  previousOutcome?: {
    action: string;
    outcome: "yes" | "partial" | "no";
    impact: string;
  }
): PitStopDecisionRecord {
  const isDarkStore = hire.roleId !== "retail_cashier";
  const milestones = isDarkStore ? IDEAL_SKILL_PATH_MILESTONES : RETAIL_CASHIER_IDEAL_MILESTONES;
  const milestoneDef = getMilestoneForDay(milestoneDay, hire) || milestones[0];
  const comparison = compareLearnerToMilestone(hire, milestoneDef, currentWork);
  const firstName = (hire.name || "Learner").split(" ")[0];
  const capabilities = hire.capabilities || {};
  const learnerDay = hire.currentDay;
  const speedUnit = isDarkStore ? "UPH" : "items/min";

  const capGaps = comparison.capabilityGaps.filter((c) => !c.isMet);
  const metricGaps = comparison.metricGaps.filter((m) => !m.isMet);
  const hasGaps = capGaps.length > 0 || metricGaps.length > 0;
  const isEvidenceSufficient = currentWork.hasWorkEvidence !== false;

  // 1. Determine Progression Status
  let progressionStatus: PitStopDecisionRecord["progressionStatus"] = "on_track";
  let isUnlocked = false;
  let holdReason: string | undefined = undefined;
  let unlockCriteria = "";

  if (!comparison.safetyCleared) {
    progressionStatus = "blocked";
    isUnlocked = false;
    holdReason = "Unresolved safety violation or PPE non-compliance in live floor zone.";
    unlockCriteria = "Complete 100% safety zone protocol walkthrough with Supervisor and clear floor sign-off.";
  } else if (!isEvidenceSufficient) {
    progressionStatus = "not_enough_evidence";
    isUnlocked = false;
    holdReason = "Insufficient floor telemetry to verify independent capability.";
    unlockCriteria = isDarkStore
      ? "Complete at least 1 full picking shift wave to generate validated scanner telemetry."
      : "Complete at least 1 full cashier shift to generate validated POS transaction telemetry.";
  } else if (comparison.isMet) {
    if (learnerDay < milestoneDay) {
      progressionStatus = "ahead";
      isUnlocked = true;
      unlockCriteria = "Pacing and accuracy targets met early; cleared for accelerated module entry.";
    } else {
      progressionStatus = "released";
      isUnlocked = true;
      unlockCriteria = "All milestone capabilities and floor performance targets verified.";
    }
  } else if (previousOutcome?.outcome === "yes") {
    progressionStatus = "recovered";
    isUnlocked = true;
    unlockCriteria = "Previous floor intervention succeeded; gate released for next operational progression.";
  } else if (previousOutcome?.outcome === "partial") {
    progressionStatus = "held";
    isUnlocked = false;
    holdReason = "Partial improvement observed; prerequisite capability needs further floor consolidation.";
    unlockCriteria = isDarkStore
      ? `Demonstrate consistent ${capGaps[0]?.capabilityName || "target metric"} across 2 consecutive pick runs.`
      : `Demonstrate consistent ${capGaps[0]?.capabilityName || "target metric"} across 2 consecutive billing shifts.`;
  } else if (previousOutcome?.outcome === "no") {
    progressionStatus = "held";
    isUnlocked = false;
    holdReason = "Previous intervention did not clear capability gap; Dean re-evaluates support strategy.";
    unlockCriteria = isDarkStore
      ? "Supervisor 1-on-1 demonstration and verified solo pick run without errors."
      : "Supervisor 1-on-1 demonstration and verified solo checkout shift without errors.";
  } else if (learnerDay >= milestoneDay) {
    progressionStatus = "held";
    isUnlocked = false;
    holdReason = capGaps.length > 0
      ? `Prerequisite ${capGaps[0].capabilityName} not yet demonstrated at required evidence standard.`
      : `Floor performance pacing (${metricGaps[0]?.actual || currentWork.actualPickRate} ${speedUnit}) below ${milestoneDef.shortTitle} threshold.`;
    unlockCriteria = capGaps.length > 0
      ? `Demonstrate '${capGaps[0].capabilityName}' on floor with 0 buddy escalations.`
      : `Achieve target rate (${metricGaps[0]?.expected || (isDarkStore ? 40 : 20)} ${speedUnit}) with 98%+ accuracy.`;
  } else {
    progressionStatus = "on_track";
    isUnlocked = true;
    unlockCriteria = `Maintain daily ramp trajectory toward Day ${milestoneDay} checkpoint standards.`;
  }

  // 2. Derive Productive Safe Work Plan (Learner is NEVER left idle!)
  let safeWorkTitle = isDarkStore ? "Single-Order Ambient Picking (Aisles 1–3)" : "Standard Express Till Checkout (Till 1)";
  let safeWorkDescription = isDarkStore
    ? "Assigned to low-velocity dry grocery aisles with familiar shelf layout and minimal variant complexity."
    : "Assigned to Till 1 handling low-complexity barcode scanning and express item checkout.";
  let targetPacing = isDarkStore ? 35 : 15;
  let zoneOrAisles = isDarkStore ? "Aisles 1–3 (Dry Grocery & Staples)" : "Express Lane 1 (Express Grocery & Sundries)";
  let whySafe = isDarkStore
    ? "Utilizes demonstrated scanner aiming and basic bin navigation while location coordinates solidify."
    : "Utilizes demonstrated barcode scanning and basic POS till operations while billing workflow solidifies.";

  if (milestoneDay === 3) {
    safeWorkTitle = isDarkStore ? "Single-Order Dry Picking in Aisles 1–3" : "Express Till Checkout (Tills 1–2)";
    safeWorkDescription = isDarkStore
      ? "Focus on clean barcode scans and bin confirmation in primary dry aisles. Low SKU density."
      : "Focus on clean barcode scans and manual PLU lookups at Till 1 with low item count customer baskets.";
    targetPacing = isDarkStore ? 35 : 15;
    zoneOrAisles = isDarkStore ? "Aisles 1–3 (Snacks & Staples)" : "Express Lane 1–2 (Express Grocery & Sundries)";
    whySafe = isDarkStore
      ? "No cold chain or fragile multi-item pack risks; protects order accuracy floor."
      : "Low basket size reduces transaction complexity; protects billing accuracy floor.";
  } else if (milestoneDay === 5) {
    if (progressionStatus === "held" || progressionStatus === "blocked") {
      safeWorkTitle = isDarkStore ? "Standard Ambient Dry Picking (Aisles 1–5)" : "Standard Cash & Card POS Checkout";
      safeWorkDescription = isDarkStore
        ? "Continue high-confidence ambient picks while prerequisite scanning/variant checks solidify."
        : "Continue high-confidence barcode scanning and cash/card billing while item voids and line modifications solidify.";
      targetPacing = isDarkStore ? 40 : 18;
      zoneOrAisles = isDarkStore ? "Aisles 1–5 (Ambient Packaged)" : "Tills 1–3 (Standard Billing Counter)";
      whySafe = isDarkStore
        ? "Keeps learner productive on core picks without risk of cold chain delays or variant mismatches."
        : "Keeps learner productive on core transactions without risk of complex return or discount errors.";
    } else {
      safeWorkTitle = isDarkStore ? "Multi-Aisle Ambient & Chilled Order Picks" : "Multi-Tender Billing Counter & Digital Payments";
      safeWorkDescription = isDarkStore
        ? "Standard single & dual-item customer orders across ambient and chilled zones."
        : "Standard multi-item customer billing across cash, card, and UPI QR payment modes.";
      targetPacing = isDarkStore ? 45 : 20;
      zoneOrAisles = isDarkStore ? "Aisles 1–8 & Chilled Room Entry" : "Tills 1–5 (Main Checkout Counter)";
      whySafe = isDarkStore
        ? "Demonstrated reliable coordinate navigation and cold chain entry protocols."
        : "Demonstrated reliable POS terminal login and digital payment confirmation protocols.";
    }
  } else if (milestoneDay === 7) {
    if (progressionStatus === "held" || progressionStatus === "blocked") {
      safeWorkTitle = isDarkStore ? "Standard Multi-Item Ambient Batch Picking" : "Standard Express Billing & Loyalty Capture";
      safeWorkDescription = isDarkStore
        ? "Productive contribution picking ambient multi-item customer baskets while stock exception handling is reinforced."
        : "Productive contribution handling express billing baskets while return authorization and price override workflows are reinforced.";
      targetPacing = isDarkStore ? 48 : 22;
      zoneOrAisles = isDarkStore ? "Aisles 1–8 (Ambient)" : "Tills 1–5 (Express & Standard)";
      whySafe = isDarkStore
        ? "Keeps pick volume high while complex stock variance drills occur in 10-min coaching bursts."
        : "Keeps transaction volume steady while complex return policy drills occur in 10-min coaching bursts.";
    } else {
      safeWorkTitle = isDarkStore ? "Full-Store Multi-Zone Wave Picking" : "Full-Counter Queue Pacing & Returns";
      safeWorkDescription = isDarkStore
        ? "Independent picking across ambient, chilled, and produce weigh-scale zones."
        : "Independent cashier operations across standard billing, express checkout, and customer return desks.";
      targetPacing = isDarkStore ? 52 : 25;
      zoneOrAisles = isDarkStore ? "All Store Zones (Ambient, Chilled, Produce)" : "All Checkout Tills & Customer Desk";
      whySafe = isDarkStore
        ? "Multi-task capability and stock exception navigation validated on floor."
        : "Multi-tender capability and return exception processing validated at counter.";
    }
  } else if (milestoneDay === 9 || milestoneDay === 10) {
    safeWorkTitle = isDarkStore ? "Solo High-Velocity Wave Picking" : "Solo Peak-Hour Billing Counter Operation";
    safeWorkDescription = isDarkStore
      ? "Autonomous customer order picking across all store zones under SLA timer pacing."
      : "Autonomous customer checkout operation across all store tills under peak queue pacing.";
    targetPacing = isDarkStore ? 58 : 28;
    zoneOrAisles = isDarkStore ? "Store-wide Wave Dispatch" : "Store-wide Checkout Counter";
    whySafe = isDarkStore
      ? "Full operational independence and SLA pacing demonstrated."
      : "Full operational independence and sub-90 second transaction cycle time demonstrated.";
  }

  // 3. Derive Development Plan
  let focusCapId = capGaps[0]?.capabilityId || 2;
  let focusCapName = capGaps[0]?.capabilityName || (isDarkStore ? "Scanner & Location Navigation" : "POS Hardware & Barcode Scanning");
  let devType = "Targeted Floor Practice";
  let actionDesc = `10-minute floor drill with Supervisor on ${focusCapName}.`;
  let actor = "Supervisor Priya";
  let durationMins = 10;

  if (hire.rampUpPlan?.isActive) {
    focusCapId = hire.rampUpPlan.focusCapabilityId || focusCapId;
    devType = hire.rampUpPlan.treatmentType.replace(/_/g, " ");
    actionDesc = hire.rampUpPlan.description;
    actor = hire.rampUpPlan.recommendedActor || actor;
  } else if (capGaps.length > 0) {
    focusCapId = capGaps[0].capabilityId;
    focusCapName = capGaps[0].capabilityName;
    devType = "Prerequisite Recovery";
    actionDesc = `10-minute floor walkthrough focusing specifically on ${focusCapName}.`;
    actor = "Senior Buddy Amit";
  } else if (metricGaps.length > 0) {
    devType = "Pacing Rhythm Calibration";
    actionDesc = isDarkStore
      ? `15-minute pacing shadowing run to observe ergonomic pick-to-tote motion.`
      : `15-minute pacing shadowing run to observe ergonomic barcode scanning and billing rhythm.`;
    actor = "Supervisor Priya";
    durationMins = 15;
  } else {
    devType = "Autonomous Pacing Consolidation";
    actionDesc = isDarkStore
      ? "Self-timed solo pick runs with post-shift accuracy verification."
      : "Self-timed solo checkout shifts with post-shift accuracy verification.";
    actor = "Independent Worker";
    durationMins = 5;
  }

  // 4. Derive Dean Authoritative Rationale
  let deanReasoning = "";
  if (!isEvidenceSufficient) {
    deanReasoning = "Dean withholds milestone progression judgment pending floor telemetry collection.";
  } else if (comparison.isMet) {
    deanReasoning = learnerDay < milestoneDay
      ? `Dean confirms ${firstName} has demonstrated Day ${milestoneDay} capability standards ahead of schedule.`
      : `Dean verifies ${firstName} has met all required competencies and metrics for Day ${milestoneDay} milestone.`;
  } else if (!comparison.safetyCleared) {
    deanReasoning = `Dean holds progression strictly on Safety Protocol (CAP-1). Mandatory compliance clearance required.`;
  } else if (capGaps.length > 0) {
    deanReasoning = `Dean identifies prerequisite gap in ${capGaps.map((c) => c.capabilityName).join(", ")}. Progression held; productive safe work assigned while targeted floor practice closes the gap.`;
  } else if (metricGaps.length > 0) {
    deanReasoning = `Dean detects floor metric variance (${metricGaps.map((m) => `${m.metricName}: ${m.actual} vs ${m.expected}`).join(", ")}). Progression held for pacing stabilization.`;
  } else {
    deanReasoning = `Dean monitors steady ramp trajectory toward Day ${milestoneDay} checkpoint.`;
  }

  // 5. Derive Manager Motivation Plan (F1 Pit Stop Model - Framing deviation as targeted calibration, NOT failure)
  let heading = `Calibration for ${firstName}`;
  let message = "";
  let coachingPrompt = "";

  if (progressionStatus === "ahead" || progressionStatus === "released" || progressionStatus === "recovered") {
    heading = `Strong Forward Momentum for ${firstName}`;
    message = `${firstName} has demonstrated solid capability on the floor. Target milestone standards are satisfied.`;
    coachingPrompt = `"Great work on closing this checkpoint smoothly. You're demonstrating great pace and accuracy on the floor."`;
  } else if (progressionStatus === "held") {
    heading = `Targeted Pit-Stop Calibration for ${firstName}`;
    message = isDarkStore
      ? `${firstName} is making productive contributions on safe picking tasks while we calibrate ${focusCapName}.`
      : `${firstName} is making productive contributions on safe express billing tasks while we calibrate ${focusCapName}.`;
    coachingPrompt = isDarkStore
      ? `"You're doing great on ambient picking! Let's spend 10 minutes together on ${focusCapName} so you can unlock the next module with confidence."`
      : `"You're doing great on express checkout! Let's spend 10 minutes together on ${focusCapName} so you can unlock the next module with confidence."`;
  } else if (progressionStatus === "blocked") {
    heading = `Safety First Protocol for ${firstName}`;
    message = `Non-negotiable safety standards protect the team. Immediate 5-minute floor walkthrough required.`;
    coachingPrompt = `"Safety is our top priority. Let's do a quick walkthrough of the zone safety rules before our next shift wave."`;
  } else {
    heading = `Telemetry Observation for ${firstName}`;
    message = `Observing live floor telemetry to establish accurate baseline data.`;
    coachingPrompt = isDarkStore
      ? `"Keep following the standard pick sequence. We're observing your initial rhythm today."`
      : `"Keep following the standard billing sequence. We're observing your initial rhythm today."`;
  }

  return {
    milestoneDay,
    milestoneName: milestoneDef.name,
    shortTitle: milestoneDef.shortTitle,
    idealPlan: {
      expectedCapabilities: milestoneDef.expectedCapabilities,
      floorPerformance: `Speed: ${milestoneDef.performanceExpectations.minPickRate || (isDarkStore ? 35 : 15)}+ ${speedUnit}, Accuracy: ${milestoneDef.performanceExpectations.minAccuracy || 95}%+`,
      milestoneName: milestoneDef.name,
    },
    actualState: {
      demonstratedCapabilities: Object.values(capabilities)
        .filter((c) => c && (c.evidence === "demonstrated" || c.mastery === "proficient" || c.mastery === "mastered"))
        .map((c) => (isDarkStore ? DARK_STORE_CAPABILITIES : RETAIL_CASHIER_CAPABILITIES).find((d) => d.id === c.capabilityId)?.name || `CAP-${c.capabilityId}`),
      floorMetrics: `Speed: ${currentWork.actualPickRate || (isDarkStore ? 35 : 18)} ${speedUnit}, Accuracy: ${currentWork.accuracyRate || 98}%, Help: ${currentWork.helpRequestsCount ?? 0}/shift`,
      safetyStatus: comparison.safetyCleared ? "Safety Cleared ✓" : "Unresolved Safety Issue ⚠",
    },
    gap: {
      summary: comparison.summary,
      hasGaps,
      capabilityGaps: comparison.capabilityGaps,
      metricGaps: comparison.metricGaps,
    },
    currentPlan: {
      productiveWork: {
        safeWorkTitle,
        safeWorkDescription,
        targetPacing,
        zoneOrAisles,
        whySafe,
      },
      development: {
        focusCapabilityId: focusCapId,
        focusCapabilityName: focusCapName,
        developmentType: devType,
        actionDescription: actionDesc,
        actor,
        durationMinutes: durationMins,
      },
      progressionGate: {
        idealStep: `Day ${milestoneDay}: ${milestoneDef.shortTitle}`,
        nextMilestoneTarget: milestoneDay,
        gateStatus: progressionStatus,
        blockedStepName: progressionStatus === "held" || progressionStatus === "blocked" ? `Day ${milestoneDay} Progression Step` : undefined,
        holdReason,
        unlockCriteria,
        isUnlocked,
        previousInterventionOutcome: previousOutcome?.outcome,
      },
      deanRationale: deanReasoning,
    },
    progressionStatus,
    deanReasoning,
    previousOutcome,
    nextDecision: unlockCriteria,
    managerMotivation: {
      heading,
      message,
      coachingPrompt,
    },
  };
}
