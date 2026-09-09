import { IdealMilestoneDefinition } from "./milestones";

/**
 * =========================================================================
 * RETAIL CASHIER REFERENCE IDEAL JOURNEY (Informational Trajectory Only)
 * 
 * IMPORTANT: This defines the benchmark reference trajectory.
 * The intelligence makes all actual decisions based on learner evidence.
 * =========================================================================
 */
export const RETAIL_CASHIER_IDEAL_MILESTONES: IdealMilestoneDefinition[] = [
  // -----------------------------------------------------------------------
  // DAY 3 — CHECKPOINT 1: FOUNDATION SCANNING & POS ACCURACY
  // -----------------------------------------------------------------------
  {
    day: 3,
    id: "MILESTONE_CASHIER_DAY_03",
    name: "DAY 3 — POS HARDWARE & ACCURATE SCANNING",
    shortTitle: "POS Hardware & Accurate Scanning",
    theme: "POS Terminal Setup, Barcode Scanning & PLU Entry Basics",
    description:
      "Learner demonstrates reliable till setup, error-free barcode scanning, manual PLU lookups, and basic line accuracy without duplicate scans.",
    expectedCapabilities: [
      "Store safety & POS ergonomics adherence (Cap 1)",
      "POS terminal solo login, receipt roll reload & peripheral checks (Cap 2)",
      "Accurate barcode scanning with <1% re-scan rate (Cap 3)",
      "Manual PLU lookup for top 10 loose produce items (Cap 4)",
    ],
    requiredCapabilities: [
      {
        capabilityId: 1, // RC-01-COUNTER-SAFETY
        minEvidenceLevel: "demonstrated",
        description: "Store safety, till ergonomics, clean walkways & cash drawer latch safety",
        criticalForSafety: true,
      },
      {
        capabilityId: 2, // RC-02-POS-HARDWARE-LOGIN
        minEvidenceLevel: "demonstrated",
        description: "Solo POS login, scanner gun pairing, and receipt paper reload",
      },
      {
        capabilityId: 3, // RC-03-BARCODE-SCANNING
        minEvidenceLevel: "emerging",
        description: "Accurate product identification and barcode scanning tempo",
      },
      {
        capabilityId: 4, // RC-04-MANUAL-PLU-ENTRY
        minEvidenceLevel: "emerging",
        description: "Manual PLU lookups and digital tare weight scale integration",
      },
    ],
    performanceExpectations: {
      minPickRate: 15, // 15+ items/min
      minAccuracy: 96,
      maxHelpRequestsPerShift: 4,
      minDemonstratedCapabilitiesCount: 2,
      minModulesCompleted: 3,
      requireSafetyClear: true,
    },
    prerequisiteMilestoneDays: [],
    gateSeverity: "checkpoint",
  },

  // -----------------------------------------------------------------------
  // DAY 5 — CHECKPOINT 2: FINANCIAL TRANSACTIONS & TENDER FLOW
  // -----------------------------------------------------------------------
  {
    day: 5,
    id: "MILESTONE_CASHIER_DAY_05",
    name: "DAY 5 — FINANCIAL TRANSACTIONS & TENDER FLOW",
    shortTitle: "Financial Transactions & Tender Flow",
    theme: "Cash Change Verification, UPI/Card Payments & Bagging Standards",
    description:
      "Learner executes cash handling, change calculations, UPI and card payments accurately, performs line edits, and adheres to bagging standards.",
    expectedCapabilities: [
      "Product identification & smooth scanning tempo (Cap 3)",
      "BOGO and discount verification (Cap 5)",
      "Item voiding and line modification accuracy (Cap 6)",
      "Exact change calculation and currency counting (Cap 7)",
      "Digital payments (EDC Cards & UPI QR verification) (Cap 8)",
      "Weight-balanced bagging and security tag deactivation (Cap 9)",
    ],
    requiredCapabilities: [
      {
        capabilityId: 1, // RC-01-COUNTER-SAFETY
        minEvidenceLevel: "demonstrated",
        description: "Continuous till safety and tidy workspace",
        criticalForSafety: true,
      },
      {
        capabilityId: 2, // RC-02-POS-HARDWARE-LOGIN
        minEvidenceLevel: "demonstrated",
        minMastery: "proficient",
        description: "Fast terminal login and peripheral error recovery",
      },
      {
        capabilityId: 3, // RC-03-BARCODE-SCANNING
        minEvidenceLevel: "demonstrated",
        description: "Consistent 18+ items/min scanning tempo",
      },
      {
        capabilityId: 6, // RC-06-ITEM-MODS-VOIDS
        minEvidenceLevel: "demonstrated",
        description: "Accurate item voiding and quantity modifications before tender",
      },
      {
        capabilityId: 7, // RC-07-CASH-HANDLING
        minEvidenceLevel: "demonstrated",
        description: "Accurate cash counting, counterfeit note vigilance & change return",
      },
      {
        capabilityId: 8, // RC-08-DIGITAL-PAYMENTS
        minEvidenceLevel: "demonstrated",
        description: "EDC card charge slips and dynamic UPI QR transaction confirmation",
      },
      {
        capabilityId: 9, // RC-09-BAGGING-SECURITY-TAGS
        minEvidenceLevel: "emerging",
        description: "Bagging standards and 100% security tag deactivation",
      },
    ],
    performanceExpectations: {
      minPickRate: 18,
      minAccuracy: 98,
      maxHelpRequestsPerShift: 3,
      minDemonstratedCapabilitiesCount: 5,
      minModulesCompleted: 5,
      requireSafetyClear: true,
    },
    prerequisiteMilestoneDays: [3],
    gateSeverity: "checkpoint",
  },

  // -----------------------------------------------------------------------
  // DAY 7 — CHECKPOINT 3: QUEUE FLOW, RETURNS & LOSS PREVENTION
  // -----------------------------------------------------------------------
  {
    day: 7,
    id: "MILESTONE_CASHIER_DAY_07",
    name: "DAY 7 — QUEUE FLOW, RETURNS & LOSS PREVENTION",
    shortTitle: "Queue Flow, Returns & Loss Prevention",
    theme: "Peak Rush Pacing, Customer De-escalation & Policy Adherence",
    description:
      "Learner sustains composed counter pacing during peak customer rushes, captures loyalty numbers, processes authorized returns, and enforces loss prevention.",
    expectedCapabilities: [
      "Customer greetings and CRM loyalty number capture (Cap 10)",
      "Continuous queue pacing and stall management (Cap 11)",
      "Invoice verification for returns, exchanges and credit notes (Cap 12)",
      "Bottom-of-cart (BOC) check and fake note detection (Cap 13)",
    ],
    requiredCapabilities: [
      {
        capabilityId: 1, // RC-01-COUNTER-SAFETY
        minEvidenceLevel: "demonstrated",
        description: "Continuous till safety and emergency switch awareness",
        criticalForSafety: true,
      },
      {
        capabilityId: 7, // RC-07-CASH-HANDLING
        minEvidenceLevel: "demonstrated",
        description: "Zero change calculation errors over shift",
      },
      {
        capabilityId: 10, // RC-10-CUSTOMER-GREETINGS
        minEvidenceLevel: "demonstrated",
        description: "Courteous bilingual greetings and loyalty phone capture",
      },
      {
        capabilityId: 11, // RC-11-QUEUE-PACING
        minEvidenceLevel: "demonstrated",
        description: "Sub-90 second transaction cycle time during rush hours",
      },
      {
        capabilityId: 12, // RC-12-RETURNS-EXCHANGES
        minEvidenceLevel: "emerging",
        description: "Accurate return reason coding and exchange credit notes",
      },
      {
        capabilityId: 13, // RC-13-LOSS-PREVENTION
        minEvidenceLevel: "demonstrated",
        description: "Bottom-of-cart checks and fake currency watermark checks",
      },
    ],
    performanceExpectations: {
      minPickRate: 22,
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
  // DAY 9 — CHECKPOINT 4: TILL RECONCILIATION & SHIFT LIFECYCLE
  // -----------------------------------------------------------------------
  {
    day: 9,
    id: "MILESTONE_CASHIER_DAY_09",
    name: "DAY 9 — TILL RECONCILIATION & SHIFT LIFECYCLE",
    shortTitle: "Till Reconciliation & Shift Lifecycle",
    theme: "Opening Float, Cash Drops, End-of-Day Tally & Zero Variance",
    description:
      "Learner independently verifies opening till floats, executes mid-day cash drops, performs end-of-day reconciliation, and tallies cash with zero discrepancy.",
    expectedCapabilities: [
      "Shift opening float count and verification (Cap 14)",
      "End-of-day Z-Report printing and cash drawer reconciliation (Cap 15)",
      "Independent resolution of price disputes and voucher timeouts (Cap 12, 13)",
    ],
    requiredCapabilities: [
      {
        capabilityId: 1, // RC-01-COUNTER-SAFETY
        minEvidenceLevel: "demonstrated",
        description: "Safety protocols verified clear",
        criticalForSafety: true,
      },
      {
        capabilityId: 11, // RC-11-QUEUE-PACING
        minEvidenceLevel: "demonstrated",
        description: "Maintains smooth counter queue pacing under pressure",
      },
      {
        capabilityId: 13, // RC-13-LOSS-PREVENTION
        minEvidenceLevel: "demonstrated",
        description: "100% loss prevention compliance at checkout",
      },
      {
        capabilityId: 14, // RC-14-SHIFT-OPENING-FLOAT
        minEvidenceLevel: "demonstrated",
        description: "Accurate opening cash float sign-off in <5 mins",
      },
      {
        capabilityId: 15, // RC-15-TILL-RECONCILIATION
        minEvidenceLevel: "demonstrated",
        description: "Balanced physical cash vs POS report with zero variance",
      },
    ],
    performanceExpectations: {
      minPickRate: 24,
      minAccuracy: 99,
      maxHelpRequestsPerShift: 1,
      minDemonstratedCapabilitiesCount: 13,
      minModulesCompleted: 9,
      requireSafetyClear: true,
    },
    prerequisiteMilestoneDays: [3, 5, 7],
    gateSeverity: "checkpoint",
  },

  // -----------------------------------------------------------------------
  // DAY 10 — CRITICAL CERTIFICATION GATE: INDEPENDENT RETAIL CASHIER
  // -----------------------------------------------------------------------
  {
    day: 10,
    id: "MILESTONE_CASHIER_DAY_10",
    name: "DAY 10 — CERTIFIED INDEPENDENT CASHIER",
    shortTitle: "Certified Independent Cashier",
    theme: "Autonomous Peak Counter Operation & Customer Excellence",
    description:
      "Final operational sign-off gate. Confirms learner completes full 8-hour solo shift across peak customer traffic, cash/UPI payments, returns, zero till variance, and zero safety blockers.",
    expectedCapabilities: [
      "Full shift independence (Cap 16: <= 1 supervisor call across 120+ transactions)",
      "Commercial scanning velocity (25+ items/min, 99%+ accuracy)",
      "Zero till variance across consecutive shifts (Cap 15)",
      "Loss prevention and fake note vigilance (Cap 13)",
      "Polite customer handling and loyalty enrollment (Cap 10)",
    ],
    requiredCapabilities: [
      {
        capabilityId: 1, // RC-01-COUNTER-SAFETY
        minEvidenceLevel: "demonstrated",
        minMastery: "mastered",
        description: "Zero safety incidents or unlatched cash drawer violations",
        criticalForSafety: true,
      },
      {
        capabilityId: 7, // RC-07-CASH-HANDLING
        minEvidenceLevel: "demonstrated",
        minMastery: "mastered",
        description: "100% change accuracy and counterfeit note detection",
      },
      {
        capabilityId: 8, // RC-08-DIGITAL-PAYMENTS
        minEvidenceLevel: "demonstrated",
        minMastery: "mastered",
        description: "Rapid, seamless card and UPI QR settlement",
      },
      {
        capabilityId: 15, // RC-15-TILL-RECONCILIATION
        minEvidenceLevel: "demonstrated",
        minMastery: "mastered",
        description: "Flawless shift closing tally and denomination balancing",
      },
      {
        capabilityId: 16, // RC-16-INDEPENDENT-COUNTER-OPS
        minEvidenceLevel: "demonstrated",
        description: "Certified Autonomous Retail Cashier (120+ bills/shift, zero supervisor handholding)",
      },
    ],
    performanceExpectations: {
      minPickRate: 25,
      minAccuracy: 99,
      maxHelpRequestsPerShift: 1,
      minDemonstratedCapabilitiesCount: 14,
      minModulesCompleted: 10,
      requireSafetyClear: true,
    },
    prerequisiteMilestoneDays: [3, 5, 7, 9],
    gateSeverity: "critical_gate",
  },
];
