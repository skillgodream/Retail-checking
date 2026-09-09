import {
  CapabilityDefinition,
  ExposureState,
  EvidenceLevel,
  PerformanceHealth,
  MasteryStatus,
  CapabilityState,
} from "../types";

/**
 * =========================================================================
 * RETAIL CASHIER NATIVE DOMAIN CAPABILITIES (16 Core Capabilities)
 * Organized Retail Environments: V-Mart, Vishal Mega Mart, Reliance Retail, D-Mart
 * =========================================================================
 */

export const RETAIL_CASHIER_CAPABILITIES: CapabilityDefinition[] = [
  // -----------------------------------------------------------------------
  // PILLAR 1: FOUNDATIONS & ENVIRONMENT
  // -----------------------------------------------------------------------
  {
    id: 1,
    code: "RC-01-COUNTER-SAFETY",
    name: "Store, Counter Safety & POS Ergonomics",
    description: "Emergency exits, slip/trip hazard prevention, ergonomic till posture, cash drawer latch safety, and counter sanitation.",
    category: "Foundations & Safety",
    defaultOrder: 1,
    prerequisites: [],
  },
  {
    id: 2,
    code: "RC-02-POS-HARDWARE-LOGIN",
    name: "POS Terminal Hardware, Login & Basic Navigation",
    description: "Terminal login, barcode gun connectivity, receipt printer paper roll replacement, customer display check, and basic UI navigation.",
    category: "Foundations & Safety",
    defaultOrder: 2,
    prerequisites: [1],
  },

  // -----------------------------------------------------------------------
  // PILLAR 2: CORE POS OPERATIONS & SCANNING
  // -----------------------------------------------------------------------
  {
    id: 3,
    code: "RC-03-BARCODE-SCANNING",
    name: "Product Identification & Barcode Scanning",
    description: "Rapid barcode locating on FMCG/apparel, curved surface scanning, multi-barcode disambiguation (MRP vs SKU), and zero duplicate scans.",
    category: "Core Fulfillment & Accuracy",
    defaultOrder: 3,
    prerequisites: [2],
    targetMetrics: { minPickRate: 18, minAccuracy: 98 }, // 18+ items/min scanning tempo
  },
  {
    id: 4,
    code: "RC-04-MANUAL-PLU-ENTRY",
    name: "Manual / PLU Code Entry",
    description: "Produce codes, loose grains, unbarcoded bakery/apparel lookup, digital tare weight scale integration, and fast keying.",
    category: "Core Fulfillment & Accuracy",
    defaultOrder: 4,
    prerequisites: [2],
  },
  {
    id: 5,
    code: "RC-05-PROMOTIONS-DISCOUNTS",
    name: "Pricing, Promotions, Bundles & Discount Verification",
    description: "Buy-1-Get-1 (BOGO), combo packs, threshold coupon entry, loyalty point redemption, and price tag dispute clarification.",
    category: "Core Fulfillment & Accuracy",
    defaultOrder: 5,
    prerequisites: [3, 4],
  },
  {
    id: 6,
    code: "RC-06-ITEM-MODS-VOIDS",
    name: "Item Modification, Line Accuracy & Voids",
    description: "Quantity adjustments, pre-tender line item deletion/voids, mind-change handling, and line-item accuracy.",
    category: "Core Fulfillment & Accuracy",
    defaultOrder: 6,
    prerequisites: [5],
    targetMetrics: { minAccuracy: 99 },
  },

  // -----------------------------------------------------------------------
  // PILLAR 3: PAYMENTS, CASH & FINANCIAL CONTROLS
  // -----------------------------------------------------------------------
  {
    id: 7,
    code: "RC-07-CASH-HANDLING",
    name: "Cash Handling, Currency Verification & Change Calculation",
    description: "Currency counting, fake note tactile/watermark check, exact change return, cash drawer slot organization, and denomination verbal confirmation.",
    category: "Core Fulfillment & Accuracy",
    defaultOrder: 7,
    prerequisites: [6],
  },
  {
    id: 8,
    code: "RC-08-DIGITAL-PAYMENTS",
    name: "Digital Payments — Credit/Debit EDC, UPI QR, Loyalty & Gift Vouchers",
    description: "EDC card swipe/chip/NFC, static & dynamic UPI QR codes, wallet tender, split payments (Cash + UPI), and charge slip verification.",
    category: "Core Fulfillment & Accuracy",
    defaultOrder: 8,
    prerequisites: [6],
  },
  {
    id: 9,
    code: "RC-09-BAGGING-SECURITY-TAGS",
    name: "Bagging Standards, Security Tag Deactivation & Receipt Handover",
    description: "Food vs non-food separation, heavy goods at bottom, hard-tag detacher removal, magnetic tag deactivation, and polite receipt handover.",
    category: "Core Fulfillment & Accuracy",
    defaultOrder: 9,
    prerequisites: [7, 8],
  },

  // -----------------------------------------------------------------------
  // PILLAR 4: CUSTOMER, QUEUE & EXCEPTIONS
  // -----------------------------------------------------------------------
  {
    id: 10,
    code: "RC-10-CUSTOMER-GREETINGS",
    name: "Customer Interaction, Greetings & Loyalty Signup",
    description: "Warm bilingual greeting, customer assistance, polite mobile number capture for loyalty signup, and courteous farewell.",
    category: "Exceptions & Pacing",
    defaultOrder: 10,
    prerequisites: [9],
  },
  {
    id: 11,
    code: "RC-11-QUEUE-PACING",
    name: "Queue Pacing, Peak Rush Management & Stall Handling",
    description: "Pacing during high-rush hours, maintaining continuous scanning rhythm, stall prevention, and supervisor call without freezing the line.",
    category: "Exceptions & Pacing",
    defaultOrder: 11,
    prerequisites: [10],
    targetMetrics: { minPickRate: 22, minAccuracy: 98 },
  },
  {
    id: 12,
    code: "RC-12-RETURNS-EXCHANGES",
    name: "Returns, Exchanges, Credit Notes & Price Overrides",
    description: "Original tax invoice verification, item condition inspection, return reason coding, credit note issuance, and exchange billing.",
    category: "Exceptions & Pacing",
    defaultOrder: 12,
    prerequisites: [6],
  },
  {
    id: 13,
    code: "RC-13-LOSS-PREVENTION",
    name: "Loss Prevention, Fake Note Detection & Suspicious Transaction Controls",
    description: "Sweethearting prevention, barcode-swap vigilance, bottom-of-cart (BOC) check, fake currency UV checks, and suspicious transaction escalation.",
    category: "Exceptions & Pacing",
    defaultOrder: 13,
    prerequisites: [7, 9],
  },

  // -----------------------------------------------------------------------
  // PILLAR 5: ADVANCED AUTONOMY & SHIFT OWNERSHIP
  // -----------------------------------------------------------------------
  {
    id: 14,
    code: "RC-14-SHIFT-OPENING-FLOAT",
    name: "Shift Opening, Float Verification & Mid-Day Cash Drops",
    description: "Opening cash float denomination verification, receipt paper roll stock, scanner test, and scheduled mid-day cash drop box handovers.",
    category: "Dispatch & Autonomous Ops",
    defaultOrder: 14,
    prerequisites: [7, 13],
  },
  {
    id: 15,
    code: "RC-15-TILL-RECONCILIATION",
    name: "End-of-Day Till Reconciliation & Cash Tally Accuracy",
    description: "Z-Report / X-Report printing, physical cash vs POS system tally, denomination breakdown sheet completion, and zero cash discrepancy handover.",
    category: "Dispatch & Autonomous Ops",
    defaultOrder: 15,
    prerequisites: [7, 8, 14],
  },
  {
    id: 16,
    code: "RC-16-INDEPENDENT-COUNTER-OPS",
    name: "Certified Independent Counter Operation & Escalation Management",
    description: "Autonomous peak-shift counter operation across cash, UPI, returns, queue flow, and till reconciliation with zero supervisor intervention.",
    category: "Dispatch & Autonomous Ops",
    defaultOrder: 16,
    prerequisites: [11, 12, 13, 15],
    targetMetrics: { minPickRate: 25, minAccuracy: 99 },
  },
];

/**
 * Creates a blank 16-capability ledger for a Retail Cashier
 */
export function createCashierCapabilitiesLedger(): Record<number, CapabilityState> {
  const ledger: Record<number, CapabilityState> = {};
  for (const cap of RETAIL_CASHIER_CAPABILITIES) {
    ledger[cap.id] = {
      capabilityId: cap.id,
      exposure: "not_exposed",
      evidence: "none",
      performance: "unknown",
      mastery: "locked",
      lastAssessedAt: "Not started",
      reinforcementCount: 0,
    };
  }
  return ledger;
}
