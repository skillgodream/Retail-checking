import React, { useState } from "react";
import {
  Milestone,
  CheckCircle2,
  Clock,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  MapPin,
  Sparkles,
  Award,
  ShieldCheck,
  User,
  ArrowLeft,
  Eye,
  Info,
  AlertTriangle,
  Flame,
  Activity,
  Check,
  X,
  Target,
  Wrench,
  TrendingUp,
  AlertCircle,
  Footprints,
} from "lucide-react";
import {
  NewHire,
  DARK_STORE_CAPABILITIES,
  EvidenceLevel,
  MasteryStatus,
} from "../types";
import {
  getAllMilestones,
  getMilestoneForDay,
  compareLearnerToMilestone,
  evaluatePitStopDecision,
  IdealMilestoneDefinition,
  MilestoneComparisonResult,
  PitStopDecisionRecord,
  AdaptiveCurrentPlan,
} from "../models/milestones";
import { evaluateDay10Outcome, determineAdaptiveCurrentPlan } from "../services/intelligence";

interface TenDaySkillJourneyViewProps {
  newHires: NewHire[];
  activeHireId: string;
  onSelectHire: (hireId: string) => void;
  currentDay: number;
  onBackToManager?: () => void;
}

interface TimelineDayConfig {
  day: number;
  title: string;
  label: string;
  description: string;
  isMilestone: boolean;
}

const TIMELINE_DAYS: TimelineDayConfig[] = [
  {
    day: 0,
    title: "DAY 0",
    label: "Foundation",
    description: "Orientation, dark store layout, and safety gear verification",
    isMilestone: false,
  },
  {
    day: 1,
    title: "DAY 1",
    label: "Role understanding",
    description: "Handheld terminal setup and customer order pick concepts",
    isMilestone: false,
  },
  {
    day: 2,
    title: "DAY 2",
    label: "Scanning",
    description: "Ring-scanner Bluetooth pairing and barcode aiming discipline",
    isMilestone: false,
  },
  {
    day: 3,
    title: "DAY 3",
    label: "Basic Work Execution",
    description: "Independent single-order picking and aisle coordinate reading",
    isMilestone: true,
  },
  {
    day: 4,
    title: "DAY 4",
    label: "Routine practice",
    description: "Aisle navigation consolidation and scanner battery swaps",
    isMilestone: false,
  },
  {
    day: 5,
    title: "DAY 5",
    label: "Consistent Core Execution",
    description: "Variant checks, fragile item care, and balanced tote packing",
    isMilestone: true,
  },
  {
    day: 6,
    title: "DAY 6",
    label: "Pacing & balance",
    description: "Sustained pick rhythm and multi-aisle item retrieval",
    isMilestone: false,
  },
  {
    day: 7,
    title: "DAY 7",
    label: "Independent Multi-Task Execution",
    description: "Cold chain handling, produce scales, and stock exceptions",
    isMilestone: true,
  },
  {
    day: 8,
    title: "DAY 8",
    label: "Wave transitions",
    description: "Rush hour wave transitions and multi-quantity unit counts",
    isMilestone: false,
  },
  {
    day: 9,
    title: "DAY 9",
    label: "Near Job-Ready",
    description: "SLA timer pacing, serpentine route optimization, and damage QC",
    isMilestone: true,
  },
  {
    day: 10,
    title: "DAY 10",
    label: "Job Readiness",
    description: "Full shift autonomy across all 7 certification criteria",
    isMilestone: true,
  },
];

const CANONICAL_MILESTONE_DAYS = [3, 5, 7, 9, 10];

export const TenDaySkillJourneyView: React.FC<TenDaySkillJourneyViewProps> = ({
  newHires,
  activeHireId,
  onSelectHire,
  currentDay,
  onBackToManager,
}) => {
  const activeHire = newHires.find((h) => h.id === activeHireId) || newHires[0];
  const [expandedMilestoneDay, setExpandedMilestoneDay] = useState<number | null>(
    activeHire.currentDay <= 3 ? 3 : activeHire.currentDay <= 5 ? 5 : activeHire.currentDay <= 7 ? 7 : 10
  );
  const [activeTabMode, setActiveTabMode] = useState<"parallel_milestones" | "daily_timeline">(
    "parallel_milestones"
  );

  const learnerDay = activeHire.currentDay;
  const capabilities = activeHire.capabilities || {};
  const currentWork =
    activeHire.daysHistory[activeHire.daysHistory.length - 1]?.workSignal || {
      dayNumber: learnerDay,
      targetPickRate: 50,
      actualPickRate: 35,
      accuracyRate: 98,
      ordersCompleted: 30,
      targetOrders: 35,
    };

  // Check if learner has recorded capability evidence in state
  const hasRecordedCapabilities = Object.values(capabilities).some(
    (c) => c && c.evidence && c.evidence !== "none"
  );

  // Evaluate ideal vs actual comparisons across all 5 milestones
  const milestoneComparisons: Record<number, MilestoneComparisonResult> = {};
  for (const day of CANONICAL_MILESTONE_DAYS) {
    const def = getMilestoneForDay(day);
    if (def) {
      milestoneComparisons[day] = compareLearnerToMilestone(activeHire, def, currentWork);
    }
  }

  // Evaluate authoritative Pit Stop decisions across all 5 milestones
  const pitStopDecisions: Record<number, PitStopDecisionRecord> = {};
  for (const day of CANONICAL_MILESTONE_DAYS) {
    pitStopDecisions[day] = evaluatePitStopDecision(activeHire, day, currentWork);
  }

  // Active learner's live 3D plan synthesized authoritatively by Dean
  const activeAdaptivePlan: AdaptiveCurrentPlan = determineAdaptiveCurrentPlan(
    activeHire,
    currentWork
  );

  // Evaluate Day 10 commercial readiness authoritative result
  const day10Evaluation = evaluateDay10Outcome(activeHire, currentWork);

  // Determine ideal milestone for learner's current day
  let idealLabel = "Day 3 milestone";
  if (learnerDay <= 2) {
    idealLabel = "Day 0–2 Foundation (Approaching Day 3)";
  } else if (learnerDay === 3) {
    idealLabel = "Day 3 milestone";
  } else if (learnerDay === 4) {
    idealLabel = "Day 3 milestone (Approaching Day 5)";
  } else if (learnerDay === 5) {
    idealLabel = "Day 5 milestone";
  } else if (learnerDay === 6) {
    idealLabel = "Day 5 milestone (Approaching Day 7)";
  } else if (learnerDay === 7) {
    idealLabel = "Day 7 milestone";
  } else if (learnerDay === 8) {
    idealLabel = "Day 7 milestone (Approaching Day 9)";
  } else if (learnerDay === 9) {
    idealLabel = "Day 9 milestone";
  } else {
    idealLabel = "Day 10 milestone";
  }

  // Determine actual capability level based on actual evidence
  let actualLabel = "Not enough evidence";
  let statusLabel: "On track" | "Reached" | "Ahead" | "Behind milestone" | "Not enough evidence" =
    "Not enough evidence";

  if (hasRecordedCapabilities) {
    const day3Comp = milestoneComparisons[3];
    const day5Comp = milestoneComparisons[5];
    const day7Comp = milestoneComparisons[7];
    const day9Comp = milestoneComparisons[9];
    const day10Comp = milestoneComparisons[10];

    if (day10Comp?.isMet || day10Evaluation.isReady) {
      actualLabel = "Job Ready (Day 10)";
      statusLabel = "Reached";
    } else if (day9Comp?.isMet) {
      actualLabel = "Day 9 capability level";
      statusLabel = learnerDay <= 9 ? (learnerDay < 9 ? "Ahead" : "On track") : "Behind milestone";
    } else if (day7Comp?.isMet) {
      actualLabel = "Day 7 capability level";
      statusLabel = learnerDay <= 7 ? (learnerDay < 7 ? "Ahead" : "On track") : "Behind milestone";
    } else if (day5Comp?.isMet) {
      actualLabel = "Day 5 capability level";
      statusLabel = learnerDay <= 5 ? (learnerDay < 5 ? "Ahead" : "On track") : "Behind milestone";
    } else if (day3Comp?.isMet) {
      actualLabel = "Day 3 capability level";
      statusLabel = learnerDay <= 3 ? (learnerDay < 3 ? "Ahead" : "On track") : "Behind milestone";
    } else {
      const cap1 = capabilities[1]?.evidence === "demonstrated";
      const cap2 = capabilities[2]?.evidence === "demonstrated";
      if (cap1 && cap2) {
        actualLabel = "Day 2 capability level";
      } else {
        actualLabel = "Foundation capability level";
      }
      statusLabel = learnerDay >= 3 ? "Behind milestone" : "On track";
    }
  }

  // Determine checkpoint standing badge helper
  const getCheckpointStanding = (
    day: number
  ): {
    status: "ahead" | "reached" | "on_track" | "behind" | "not_enough_evidence" | "pending";
    label: string;
    chipClass: string;
    icon: React.ReactNode;
  } => {
    const comp = milestoneComparisons[day];
    if (!comp) {
      return {
        status: "pending",
        label: "Pending",
        chipClass: "bg-slate-100 text-slate-500 border-slate-200",
        icon: <span className="text-slate-400">·</span>,
      };
    }

    if (comp.status === "not_enough_evidence" || comp.evidenceSufficiency === "insufficient") {
      return {
        status: "not_enough_evidence",
        label: "Not Enough Evidence",
        chipClass: "bg-slate-100 text-slate-600 border-slate-200",
        icon: <HelpCircle className="w-3.5 h-3.5 text-slate-500" />,
      };
    }

    if (comp.isMet) {
      if (learnerDay < day) {
        return {
          status: "ahead",
          label: "Ahead",
          chipClass: "bg-indigo-100 text-indigo-800 border-indigo-200",
          icon: <Sparkles className="w-3.5 h-3.5 text-indigo-600" />,
        };
      }
      return {
        status: "reached",
        label: "Reached",
        chipClass: "bg-emerald-100 text-emerald-800 border-emerald-200",
        icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />,
      };
    }

    if (learnerDay > day) {
      return {
        status: "behind",
        label: "Behind",
        chipClass: "bg-amber-100 text-amber-900 border-amber-300",
        icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />,
      };
    }

    if (learnerDay === day) {
      return {
        status: "on_track",
        label: "On Track",
        chipClass: "bg-blue-100 text-blue-800 border-blue-200",
        icon: <Clock className="w-3.5 h-3.5 text-blue-600" />,
      };
    }

    return {
      status: "pending",
      label: "Pending",
      chipClass: "bg-slate-100 text-slate-500 border-slate-200",
      icon: <span className="text-slate-400 font-bold">·</span>,
    };
  };

  const toggleMilestone = (day: number) => {
    setExpandedMilestoneDay((prev) => (prev === day ? null : day));
  };

  return (
    <div className="max-w-md mx-auto px-4 py-3 space-y-4 pb-12 select-none">
      {/* ========================================================= */}
      {/* 1. TOP TITLE & SUBTITLE                                   */}
      {/* ========================================================= */}
      <div className="pt-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {onBackToManager && (
              <button
                id="back-to-previous-btn"
                onClick={onBackToManager}
                className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 active:scale-95 transition-all cursor-pointer"
                title="Go Back"
                aria-label="Go Back"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-1.5">
                <span>10-Day Skill Journey</span>
              </h1>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Where the learner should be vs where they are
              </p>
            </div>
          </div>

          <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold tracking-wide uppercase border border-slate-200/80">
            Manager View
          </span>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. LEARNER SELECTOR CAROUSEL                              */}
      {/* ========================================================= */}
      <div>
        <div className="flex items-center justify-between mb-1.5 px-0.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Active Cohort
          </span>
          <span className="text-[10px] text-slate-400">Tap to inspect journey</span>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none snap-x">
          {newHires.map((hire) => {
            const isSelected = hire.id === activeHire.id;
            return (
              <button
                key={hire.id}
                id={`journey-hire-${hire.id}`}
                onClick={() => onSelectHire(hire.id)}
                className={`snap-start min-w-[170px] p-2.5 rounded-2xl border text-left transition-all cursor-pointer shrink-0 shadow-2xs active:scale-97 ${
                  isSelected
                    ? "bg-slate-900 text-white border-slate-900 shadow-sm ring-2 ring-slate-900/10"
                    : "bg-white border-slate-200/90 text-slate-800 hover:border-blue-300"
                }`}
              >
                <div className="flex items-center gap-2">
                  <img
                    src={hire.avatar}
                    alt={hire.name}
                    className="w-7 h-7 rounded-full object-cover border border-slate-200 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold truncate leading-tight">{hire.name}</h4>
                    <span
                      className={`text-[10px] font-medium block truncate ${
                        isSelected ? "text-slate-300" : "text-slate-500"
                      }`}
                    >
                      Day {hire.currentDay} of 10
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2.5. ADAPTIVE PROGRESSION & PIT-STOP PHILOSOPHY BANNER    */}
      {/* ========================================================= */}
      <div className="p-3.5 rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white shadow-sm border border-indigo-800/60 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-lg bg-indigo-500/30 text-indigo-300 border border-indigo-400/30">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-black uppercase tracking-wider text-indigo-200">
              ADAPTIVE PROGRESSION • F1 PIT-STOP MODEL
            </span>
          </div>
          <span className="text-[10px] font-bold text-indigo-300 bg-indigo-950/80 px-2 py-0.5 rounded-full border border-indigo-700/50">
            One Brain (Dean)
          </span>
        </div>
        <p className="text-xs text-indigo-100/90 leading-relaxed">
          <strong>CheckIn is an Adaptive Productivity System:</strong> Everyone shares the same Ideal Destination (Day 10 Commercial Job Readiness), but each worker has a personalized Actual Trajectory. When calibration is needed, Dean triggers a <em>Pit-Stop</em>: assigning safe productive floor work while targeted practice clears the prerequisite before advancing.
        </p>
      </div>

      {/* ========================================================= */}
      {/* 3. IDEAL VS ACTUAL SUMMARY CARD                           */}
      {/* ========================================================= */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/90 shadow-2xs space-y-2.5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-900">
              {activeHire.name.split(" ")[0]}'s Journey Standing
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-medium">Shift Day {learnerDay} of 10</span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center pt-0.5">
          {/* IDEAL */}
          <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
              IDEAL
            </span>
            <span className="text-xs font-bold text-slate-800 leading-snug block">
              {idealLabel}
            </span>
          </div>

          {/* ACTUAL */}
          <div className="p-2.5 rounded-2xl bg-blue-50/60 border border-blue-100">
            <span className="block text-[10px] font-black uppercase tracking-wider text-blue-500 mb-1">
              ACTUAL
            </span>
            <span className="text-xs font-bold text-blue-950 leading-snug block">
              {actualLabel}
            </span>
          </div>

          {/* STATUS */}
          <div
            className={`p-2.5 rounded-2xl border ${
              statusLabel === "On track" || statusLabel === "Reached" || statusLabel === "Ahead"
                ? "bg-emerald-50/80 border-emerald-100 text-emerald-900"
                : statusLabel === "Behind milestone"
                ? "bg-amber-50/80 border-amber-100 text-amber-900"
                : "bg-slate-50 border-slate-100 text-slate-700"
            }`}
          >
            <span className="block text-[10px] font-black uppercase tracking-wider opacity-70 mb-1">
              STATUS
            </span>
            <span className="text-xs font-black leading-snug block">{statusLabel}</span>
          </div>
        </div>

        <p className="text-[11px] text-slate-500 leading-relaxed pt-1 flex items-start gap-1">
          <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
          <span>
            Milestones serve as formative diagnostic checkpoints to guide floor buddy support and practice, not pass/fail tests.
          </span>
        </p>
      </div>

      {/* ========================================================= */}
      {/* 3.5. CURRENT ACTIVE 3D PLAN (DEAN AUTHORITATIVE SYNTHESIS) */}
      {/* ========================================================= */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/90 shadow-2xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-purple-50 text-purple-700 border border-purple-200">
              <Wrench className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-black text-slate-900 leading-tight">
                Current 3D Adaptive Plan • {activeHire.name.split(" ")[0]}
              </h3>
              <p className="text-[10px] text-slate-500 font-medium">
                Authoritative floor calibration synthesized by Dean
              </p>
            </div>
          </div>
          <span
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
              activeAdaptivePlan.progressionGate.gateStatus === "released" ||
              activeAdaptivePlan.progressionGate.gateStatus === "ahead"
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : activeAdaptivePlan.progressionGate.gateStatus === "held"
                ? "bg-amber-50 text-amber-900 border-amber-300"
                : activeAdaptivePlan.progressionGate.gateStatus === "blocked"
                ? "bg-rose-50 text-rose-900 border-rose-300"
                : "bg-blue-50 text-blue-800 border-blue-200"
            }`}
          >
            Gate: {activeAdaptivePlan.progressionGate.gateStatus}
          </span>
        </div>

        {/* 3D Plan Grid */}
        <div className="space-y-2">
          {/* Dimension 1: Productive Work */}
          <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-100/90 space-y-1 text-emerald-950">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>DIMENSION 1: PRODUCTIVE FLOOR WORK</span>
              </span>
              <span className="text-[10px] font-bold text-emerald-700">
                Pacing: {activeAdaptivePlan.productiveWork.targetPacing} UPH
              </span>
            </div>
            <p className="text-xs font-bold text-slate-900">
              {activeAdaptivePlan.productiveWork.safeWorkTitle} ({activeAdaptivePlan.productiveWork.zoneOrAisles})
            </p>
            <p className="text-[11px] text-slate-600 leading-normal">
              <strong>Why Safe:</strong> {activeAdaptivePlan.productiveWork.whySafe}
            </p>
          </div>

          {/* Dimension 2: Targeted Development */}
          <div className="p-3 rounded-2xl bg-purple-50/70 border border-purple-100/90 space-y-1 text-purple-950">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-purple-800 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-purple-600" />
                <span>DIMENSION 2: TARGETED DEVELOPMENT DRILL</span>
              </span>
              <span className="text-[10px] font-bold text-purple-700">
                {activeAdaptivePlan.development.durationMinutes} min • {activeAdaptivePlan.development.actor}
              </span>
            </div>
            <p className="text-xs font-bold text-slate-900">
              Focus Capability #{activeAdaptivePlan.development.focusCapabilityId}: {activeAdaptivePlan.development.actionDescription}
            </p>
          </div>

          {/* Dimension 3: Progression Gate */}
          <div className="p-3 rounded-2xl bg-blue-50/70 border border-blue-100/90 space-y-1 text-blue-950">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-blue-800 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>DIMENSION 3: PROGRESSION GATE</span>
              </span>
              <span className="text-[10px] font-bold text-blue-700">
                Next Milestone: Day {activeAdaptivePlan.progressionGate.nextMilestoneTarget}
              </span>
            </div>
            {activeAdaptivePlan.progressionGate.holdReason && (
              <p className="text-xs font-semibold text-amber-900">
                <strong>Hold Reason:</strong> {activeAdaptivePlan.progressionGate.holdReason}
              </p>
            )}
            <p className="text-[11px] text-slate-700 leading-normal">
              <strong>Unlock Criteria:</strong> {activeAdaptivePlan.progressionGate.unlockCriteria}
            </p>
          </div>
        </div>

        {/* Dean Reasoning Snippet */}
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-700 space-y-0.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            DEAN AUTHORITATIVE RATIONALE:
          </span>
          <p className="leading-relaxed italic">"{activeAdaptivePlan.deanRationale}"</p>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 4. TWO PARALLEL JOURNEYS (IDEAL vs ACTUAL PARALLEL LINES) */}
      {/* ========================================================= */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-3xl p-4 shadow-md space-y-4 border border-slate-800">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <Milestone className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-black text-white tracking-tight">
                Parallel Journey Alignment
              </h2>
              <p className="text-[10px] text-slate-400 font-medium">
                Day 3 ── Day 5 ── Day 7 ── Day 9 ── Day 10
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
            Checkpoints
          </span>
        </div>

        {/* --- LINE 1: IDEAL JOURNEY --- */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-black text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-400"></span>
              <span>IDEAL JOURNEY</span>
            </span>
            <span className="text-[10px] text-slate-400 font-medium">Canonical Standards</span>
          </div>

          <div className="relative flex items-center justify-between px-1 py-2 rounded-2xl bg-slate-800/60 border border-slate-700/60">
            {/* Connecting Track Line */}
            <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-0.5 bg-slate-600 rounded-full z-0" />

            {CANONICAL_MILESTONE_DAYS.map((day) => {
              const def = getMilestoneForDay(day);
              const isSelected = expandedMilestoneDay === day;
              return (
                <button
                  key={`ideal-node-${day}`}
                  onClick={() => {
                    setExpandedMilestoneDay(day);
                    setActiveTabMode("parallel_milestones");
                  }}
                  className={`relative z-10 flex flex-col items-center gap-1 group cursor-pointer transition-all active:scale-95 ${
                    isSelected ? "scale-105" : "opacity-90 hover:opacity-100"
                  }`}
                  title={def?.name || `Day ${day}`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black border transition-all ${
                      isSelected
                        ? "bg-white text-slate-900 border-white shadow-sm ring-2 ring-blue-400/40"
                        : "bg-slate-700 text-slate-200 border-slate-500 group-hover:border-slate-300"
                    }`}
                  >
                    D{day}
                  </div>
                  <span
                    className={`text-[9px] font-bold whitespace-nowrap ${
                      isSelected ? "text-blue-300" : "text-slate-400"
                    }`}
                  >
                    {day === 10 ? "Ready" : `Day ${day}`}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* --- LINE 2: ACTUAL JOURNEY --- */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-black text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
              <span>ACTUAL JOURNEY ({activeHire.name.split(" ")[0]})</span>
            </span>
            <span className="text-[10px] text-blue-300 font-medium">Evidence-Based</span>
          </div>

          <div className="relative flex items-center justify-between px-1 py-2 rounded-2xl bg-slate-800/80 border border-blue-900/40">
            {/* Connecting Track Line */}
            <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-0.5 bg-blue-950/80 rounded-full z-0" />

            {CANONICAL_MILESTONE_DAYS.map((day) => {
              const standing = getCheckpointStanding(day);
              const isSelected = expandedMilestoneDay === day;
              const isCurrentDay = learnerDay === day;

              return (
                <button
                  key={`actual-node-${day}`}
                  onClick={() => {
                    setExpandedMilestoneDay(day);
                    setActiveTabMode("parallel_milestones");
                  }}
                  className={`relative z-10 flex flex-col items-center gap-1 group cursor-pointer transition-all active:scale-95 ${
                    isSelected ? "scale-105" : "opacity-90 hover:opacity-100"
                  }`}
                  title={`${standing.label} on Day ${day}`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black border transition-all ${
                      standing.status === "reached"
                        ? "bg-emerald-600 text-white border-emerald-400 shadow-sm shadow-emerald-900/40"
                        : standing.status === "ahead"
                        ? "bg-indigo-600 text-white border-indigo-400 shadow-sm"
                        : standing.status === "behind"
                        ? "bg-amber-500 text-slate-950 border-amber-300 font-black shadow-sm"
                        : standing.status === "on_track"
                        ? "bg-blue-600 text-white border-blue-300 shadow-sm ring-2 ring-blue-400/40"
                        : standing.status === "not_enough_evidence"
                        ? "bg-slate-700 text-slate-300 border-slate-500"
                        : "bg-slate-800 text-slate-500 border-slate-700"
                    } ${isCurrentDay ? "ring-2 ring-amber-400" : ""}`}
                  >
                    {standing.status === "reached" ? (
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    ) : standing.status === "ahead" ? (
                      <Sparkles className="w-3.5 h-3.5" />
                    ) : standing.status === "behind" ? (
                      <AlertTriangle className="w-3.5 h-3.5 stroke-[2.5]" />
                    ) : standing.status === "on_track" ? (
                      <Clock className="w-3.5 h-3.5" />
                    ) : standing.status === "not_enough_evidence" ? (
                      <HelpCircle className="w-3.5 h-3.5" />
                    ) : (
                      <span className="text-slate-500 font-bold">·</span>
                    )}
                  </div>

                  <span
                    className={`text-[9px] font-bold whitespace-nowrap px-1 rounded ${
                      standing.status === "reached"
                        ? "text-emerald-400"
                        : standing.status === "ahead"
                        ? "text-indigo-300"
                        : standing.status === "behind"
                        ? "text-amber-300 font-black"
                        : standing.status === "on_track"
                        ? "text-blue-300"
                        : "text-slate-400"
                    }`}
                  >
                    {standing.status === "reached"
                      ? "✓"
                      : standing.status === "ahead"
                      ? "★"
                      : standing.status === "behind"
                      ? "⚠"
                      : standing.status === "on_track"
                      ? "⚡"
                      : standing.status === "not_enough_evidence"
                      ? "?"
                      : "·"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex gap-1.5 p-1 bg-slate-800/80 rounded-2xl border border-slate-700/60 pt-1">
          <button
            onClick={() => setActiveTabMode("parallel_milestones")}
            className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all text-center cursor-pointer ${
              activeTabMode === "parallel_milestones"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Checkpoint Gaps (Ideal vs Actual)
          </button>
          <button
            onClick={() => setActiveTabMode("daily_timeline")}
            className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all text-center cursor-pointer ${
              activeTabMode === "daily_timeline"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Full 10-Day Daily Spine
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 5. MODE A: PARALLEL MILESTONES (IDEAL VS ACTUAL DEEP DIVE) */}
      {/* ========================================================= */}
      {activeTabMode === "parallel_milestones" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
              Canonical Checkpoints (Day 3, 5, 7, 9, 10)
            </span>
            <span className="text-[10px] text-slate-400 font-medium">Tap to view gap breakdown</span>
          </div>

          <div className="space-y-3">
            {CANONICAL_MILESTONE_DAYS.map((day) => {
              const def = getMilestoneForDay(day)!;
              const comp = milestoneComparisons[day];
              const standing = getCheckpointStanding(day);
              const isExpanded = expandedMilestoneDay === day;
              const isCurrentDay = learnerDay === day;
              const isDay10 = day === 10;

              // Gap summary extraction
              const capGaps = comp?.capabilityGaps.filter((c) => !c.isMet) || [];
              const metricGaps = comp?.metricGaps.filter((m) => !m.isMet) || [];
              const hasGaps = capGaps.length > 0 || metricGaps.length > 0;

              // Current Intervention / Dean action
              const activeRampPlan = activeHire.rampUpPlan?.isActive ? activeHire.rampUpPlan : null;
              const latestAction =
                activeHire.daysHistory[activeHire.daysHistory.length - 1]?.recommendedAction?.description ||
                activeHire.recommendedActionSnippet ||
                "Maintain demonstrated capability progression";

              return (
                <div
                  key={`checkpoint-card-${day}`}
                  id={`milestone-checkpoint-${day}`}
                  className={`rounded-3xl border transition-all ${
                    isCurrentDay
                      ? "bg-gradient-to-br from-white to-blue-50/40 border-blue-300 shadow-sm ring-1 ring-blue-200"
                      : isExpanded
                      ? "bg-white border-slate-300 shadow-sm"
                      : "bg-white border-slate-200/90 shadow-2xs hover:border-slate-300"
                  }`}
                >
                  {/* Header Accordion Button */}
                  <button
                    onClick={() => toggleMilestone(day)}
                    className="w-full p-4 text-left cursor-pointer flex items-start justify-between gap-3"
                  >
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-900 text-white">
                          ● DAY {day} CHECKPOINT
                        </span>

                        {isDay10 ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                            Commercial Certification Gate
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                            {def.shortTitle}
                          </span>
                        )}

                        {/* Status Badge */}
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 ${standing.chipClass}`}
                        >
                          {standing.icon}
                          <span>{standing.label}</span>
                        </span>
                      </div>

                      <h3 className="text-sm sm:text-base font-black text-slate-900 leading-tight">
                        {def.name}
                      </h3>
                      <p className="text-xs text-slate-500 leading-relaxed">{def.description}</p>
                    </div>

                    <div className="p-1 rounded-full text-slate-400 hover:text-slate-800 shrink-0 mt-0.5">
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </button>

                  {/* Expanded Breakdown */}
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-1 border-t border-slate-100 space-y-3.5 text-xs animate-in fade-in duration-150">
                      {/* ================================================= */}
                      {/* 1. IDEAL VS ACTUAL SIDE-BY-SIDE GRID               */}
                      {/* ================================================= */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                        {/* --- IDEAL STATE --- */}
                        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                          <div className="flex items-center justify-between border-b border-slate-200/60 pb-1.5">
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1">
                              <Target className="w-3 h-3 text-slate-500" />
                              <span>IDEAL STATE (DAY {day})</span>
                            </span>
                            <span className="text-[10px] font-bold text-slate-400">Target</span>
                          </div>

                          <div className="space-y-1.5 text-slate-700">
                            <div className="space-y-1">
                              <span className="text-[10px] font-bold uppercase text-slate-400 block">
                                Expected Capabilities:
                              </span>
                              <ul className="space-y-0.5 pl-3 list-disc text-[11px]">
                                {def.expectedCapabilities.map((exp, idx) => (
                                  <li key={idx} className="font-medium text-slate-800">
                                    {exp}
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div className="pt-1 space-y-1">
                              <span className="text-[10px] font-bold uppercase text-slate-400 block">
                                Floor Performance:
                              </span>
                              <div className="flex flex-wrap gap-1.5 text-[11px] font-semibold text-slate-700">
                                {typeof def.performanceExpectations.minPickRate === "number" && (
                                  <span className="px-2 py-0.5 rounded-lg bg-white border border-slate-200">
                                    Pick Rate: {def.performanceExpectations.minPickRate}+ /hr
                                  </span>
                                )}
                                {typeof def.performanceExpectations.minAccuracy === "number" && (
                                  <span className="px-2 py-0.5 rounded-lg bg-white border border-slate-200">
                                    Accuracy: {def.performanceExpectations.minAccuracy}%+
                                  </span>
                                )}
                                {typeof def.performanceExpectations.maxHelpRequestsPerShift === "number" && (
                                  <span className="px-2 py-0.5 rounded-lg bg-white border border-slate-200">
                                    Independence: &le; {def.performanceExpectations.maxHelpRequestsPerShift} help/shift
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* --- ACTUAL STATE --- */}
                        <div className="p-3 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-2">
                          <div className="flex items-center justify-between border-b border-blue-100 pb-1.5">
                            <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 flex items-center gap-1">
                              <Activity className="w-3 h-3 text-blue-600" />
                              <span>ACTUAL STATE ({activeHire.name.split(" ")[0]})</span>
                            </span>
                            <span className="text-[10px] font-bold text-blue-600">Evidence</span>
                          </div>

                          <div className="space-y-1.5 text-slate-800">
                            <div className="space-y-1">
                              <span className="text-[10px] font-bold uppercase text-blue-500 block">
                                Demonstrated Capabilities:
                              </span>
                              <div className="space-y-1">
                                {def.requiredCapabilities.map((req, idx) => {
                                  const capDef = DARK_STORE_CAPABILITIES.find(
                                    (c) => c.id === req.capabilityId
                                  );
                                  const state = capabilities[req.capabilityId];
                                  const evidence = state?.evidence || "none";
                                  const isCapMet =
                                    state &&
                                    (evidence === "demonstrated" ||
                                      (req.minEvidenceLevel === "emerging" && evidence === "emerging"));

                                  return (
                                    <div
                                      key={idx}
                                      className="flex items-center justify-between gap-1 text-[11px] p-1 rounded-lg bg-white/80 border border-blue-100/80"
                                    >
                                      <span className="font-medium text-slate-800 truncate">
                                        {capDef?.name || `CAP-${req.capabilityId}`}
                                      </span>
                                      <span
                                        className={`px-1.5 py-0.2 rounded text-[10px] font-bold shrink-0 ${
                                          evidence === "none"
                                            ? "bg-slate-100 text-slate-500"
                                            : isCapMet
                                            ? "bg-emerald-100 text-emerald-800"
                                            : "bg-amber-100 text-amber-800"
                                        }`}
                                      >
                                        {evidence === "none"
                                          ? "Not observed"
                                          : evidence === "demonstrated"
                                          ? "Demonstrated ✓"
                                          : evidence}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            <div className="pt-1 space-y-1">
                              <span className="text-[10px] font-bold uppercase text-blue-500 block">
                                Observed Floor Metrics:
                              </span>
                              <div className="flex flex-wrap gap-1.5 text-[11px] font-semibold text-slate-800">
                                <span className="px-2 py-0.5 rounded-lg bg-white border border-blue-100">
                                  Pick Rate: <strong>{currentWork.actualPickRate || 35} /hr</strong>
                                </span>
                                <span className="px-2 py-0.5 rounded-lg bg-white border border-blue-100">
                                  Accuracy: <strong>{currentWork.accuracyRate || 98}%</strong>
                                </span>
                                <span className="px-2 py-0.5 rounded-lg bg-white border border-blue-100">
                                  Help requests: <strong>{currentWork.helpRequestsCount ?? 0} /shift</strong>
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* ================================================= */}
                      {/* 2. GAP ANALYSIS (EXPLICIT DIFFERENCE)             */}
                      {/* ================================================= */}
                      <div
                        className={`p-3 rounded-2xl border space-y-1.5 ${
                          comp?.status === "not_enough_evidence"
                            ? "bg-slate-50 border-slate-200"
                            : comp?.isMet
                            ? "bg-emerald-50/70 border-emerald-200 text-emerald-900"
                            : "bg-amber-50/80 border-amber-200 text-amber-950"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            <span>GAP ANALYSIS</span>
                          </span>
                          <span className="text-[10px] font-bold">
                            {comp?.status === "not_enough_evidence"
                              ? "Awaiting Floor Telemetry"
                              : comp?.isMet
                              ? "Zero Gaps Detected"
                              : `${capGaps.length + metricGaps.length} Gap(s) Identified`}
                          </span>
                        </div>

                        {comp?.status === "not_enough_evidence" ? (
                          <p className="text-[11px] text-slate-600 leading-normal">
                            Not enough evidence observed yet for this checkpoint. Telemetry and work proof are awaiting shift generation.
                          </p>
                        ) : comp?.isMet ? (
                          <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-800">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>
                              Learner meets all ideal expectations for Day {day}. No capability or pacing gaps remain.
                            </span>
                          </div>
                        ) : (
                          <div className="space-y-1 text-[11px]">
                            {capGaps.map((cg, idx) => (
                              <div key={idx} className="flex items-start gap-1 text-amber-900 font-medium">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-1.5"></span>
                                <span>
                                  <strong>{cg.capabilityName}:</strong> Observed evidence is '{cg.actualEvidence}', expected '{cg.expectedEvidence}'.
                                </span>
                              </div>
                            ))}
                            {metricGaps.map((mg, idx) => (
                              <div key={idx} className="flex items-start gap-1 text-amber-900 font-medium">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-1.5"></span>
                                <span>
                                  <strong>{mg.metricName}:</strong> Actual {mg.actual} {mg.unit} vs Target {mg.expected} {mg.unit}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* ================================================= */}
                      {/* 3. DAY 10 SPECIFIC COMMERCIAL READINESS BLOCK     */}
                      {/* ================================================= */}
                      {isDay10 && (
                        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 text-white border border-slate-800 space-y-2.5">
                          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                            <div className="flex items-center gap-1.5">
                              <Award className="w-4 h-4 text-amber-400" />
                              <span className="text-xs font-black tracking-tight text-white">
                                Day 10 Commercial Certification Assessment
                              </span>
                            </div>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                day10Evaluation.isReady
                                  ? "bg-emerald-500 text-white"
                                  : "bg-amber-400 text-slate-950"
                              }`}
                            >
                              {day10Evaluation.status}
                            </span>
                          </div>

                          <div className="space-y-1.5">
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                              7 Commercial Readiness Criteria:
                            </span>
                            <div className="grid grid-cols-1 gap-1">
                              {day10Evaluation.verifiedCriteria.map((crit, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center justify-between p-1.5 rounded-xl bg-slate-800/70 border border-slate-700/60 text-[11px]"
                                >
                                  <div className="flex items-center gap-1.5">
                                    {crit.met ? (
                                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                    ) : (
                                      <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                    )}
                                    <span className={crit.met ? "text-slate-200" : "text-amber-200 font-bold"}>
                                      {crit.name}
                                    </span>
                                  </div>
                                  <span className="text-[10px] text-slate-400 font-mono">
                                    {crit.detail}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Blockers Display */}
                          {day10Evaluation.unresolvedBlockers.length > 0 && (
                            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-[11px] space-y-1">
                              <span className="font-bold text-amber-300 block">
                                Active Readiness Blocker(s):
                              </span>
                              <ul className="list-disc pl-4 space-y-0.5">
                                {day10Evaluation.unresolvedBlockers.map((b, idx) => (
                                  <li key={idx}>{b}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}

                      {/* ================================================= */}
                      {/* 4. AUTHORITATIVE DEAN PIT-STOP DECISION & 3D PLAN  */}
                      {/* ================================================= */}
                      {(() => {
                        const pit = pitStopDecisions[day];
                        if (!pit) return null;

                        return (
                          <div className="space-y-3 pt-1">
                            {/* 3D Plan Box */}
                            <div className="p-3.5 rounded-2xl bg-slate-900 text-white border border-slate-800 space-y-3">
                              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                                <div className="flex items-center gap-1.5">
                                  <Wrench className="w-3.5 h-3.5 text-indigo-400" />
                                  <span className="text-[11px] font-black uppercase tracking-wider text-indigo-300">
                                    DAY {day} PIT-STOP CALIBRATION (3D PLAN)
                                  </span>
                                </div>
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                    pit.progressionStatus === "released" ||
                                    pit.progressionStatus === "ahead"
                                      ? "bg-emerald-500 text-white"
                                      : pit.progressionStatus === "held"
                                      ? "bg-amber-400 text-slate-950"
                                      : pit.progressionStatus === "blocked"
                                      ? "bg-rose-500 text-white"
                                      : "bg-blue-500 text-white"
                                  }`}
                                >
                                  {pit.progressionStatus}
                                </span>
                              </div>

                              {/* Dimension A: Productive Work */}
                              <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-[11px] space-y-1">
                                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                                  Dimension A: Safe Productive Floor Work ({pit.currentPlan.productiveWork.targetPacing} UPH)
                                </span>
                                <p className="font-bold text-slate-200">
                                  {pit.currentPlan.productiveWork.safeWorkTitle} ({pit.currentPlan.productiveWork.zoneOrAisles})
                                </p>
                                <p className="text-slate-400 text-[10px] leading-relaxed">
                                  <strong>Why Safe:</strong> {pit.currentPlan.productiveWork.whySafe}
                                </p>
                              </div>

                              {/* Dimension B: Targeted Development */}
                              <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-[11px] space-y-1">
                                <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider block">
                                  Dimension B: Targeted Floor Drill ({pit.currentPlan.development.actor})
                                </span>
                                <p className="font-bold text-slate-200">
                                  {pit.currentPlan.development.actionDescription} ({pit.currentPlan.development.durationMinutes} min)
                                </p>
                              </div>

                              {/* Dimension C: Progression Gate */}
                              <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-[11px] space-y-1">
                                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block">
                                  Dimension C: Progression Gate ({pit.currentPlan.progressionGate.gateStatus.toUpperCase()})
                                </span>
                                {pit.currentPlan.progressionGate.holdReason && (
                                  <p className="text-amber-300 font-semibold text-[10px]">
                                    {pit.currentPlan.progressionGate.holdReason}
                                  </p>
                                )}
                                <p className="text-slate-300 text-[10px]">
                                  <strong>Unlock Criteria:</strong> {pit.currentPlan.progressionGate.unlockCriteria}
                                </p>
                              </div>

                              {/* Dean Reasoning */}
                              <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800 text-[10px] text-slate-400 space-y-0.5">
                                <span className="font-bold text-slate-300 block">DEAN AUTHORITATIVE REASONING:</span>
                                <p className="italic leading-relaxed">"{pit.deanReasoning}"</p>
                              </div>
                            </div>

                            {/* Manager Motivation & Empathy Coaching Card */}
                            <div className="p-3 rounded-2xl bg-indigo-50/80 border border-indigo-200 text-indigo-950 space-y-1.5">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-800 flex items-center gap-1">
                                  <Sparkles className="w-3 h-3 text-indigo-600" />
                                  <span>{pit.managerMotivation.heading}</span>
                                </span>
                                <span className="text-[10px] font-bold text-indigo-700">
                                  Floor Coaching Guide
                                </span>
                              </div>

                              <p className="text-[11px] text-indigo-900 leading-relaxed font-medium">
                                {pit.managerMotivation.message}
                              </p>

                              <div className="p-2 rounded-xl bg-white/90 border border-indigo-100 text-[11px] text-slate-700 space-y-0.5">
                                <span className="text-[10px] font-bold text-indigo-700 block">
                                  Suggested Manager/Buddy Script:
                                </span>
                                <p className="italic font-serif leading-relaxed text-slate-800">
                                  "{pit.managerMotivation.coachingPrompt}"
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 6. MODE B: FULL 10-DAY DAILY SPINE TIMELINE (DAY 0 TO 10) */}
      {/* ========================================================= */}
      {activeTabMode === "daily_timeline" && (
        <div className="relative pl-6 sm:pl-8 space-y-4 pt-2">
          {/* Continuous central vertical line */}
          <div className="absolute left-[17px] sm:left-[21px] top-4 bottom-4 w-1 bg-slate-200 rounded-full" />

          {TIMELINE_DAYS.map((cfg) => {
            const isCurrentDay = cfg.day === learnerDay;
            const isPastDay = cfg.day < learnerDay;
            const isMilestone = cfg.isMilestone;
            const milestoneDef = isMilestone ? getMilestoneForDay(cfg.day) : undefined;
            const comparison = isMilestone && milestoneDef ? milestoneComparisons[cfg.day] : undefined;

            return (
              <div key={cfg.day} className="relative group">
                {/* Vertical Spine Node Indicator */}
                <div
                  className={`absolute -left-[23px] sm:-left-[27px] top-3.5 flex items-center justify-center transition-all ${
                    isCurrentDay
                      ? "w-7 h-7 -ml-1 -mt-1 rounded-full bg-blue-600 text-white shadow-md shadow-blue-500/30 ring-4 ring-blue-100 z-20"
                      : isMilestone
                      ? isPastDay && comparison?.isMet
                        ? "w-6 h-6 -ml-0.5 rounded-full bg-emerald-600 text-white shadow-xs z-10"
                        : "w-6 h-6 -ml-0.5 rounded-full bg-slate-900 text-white shadow-xs z-10"
                      : isPastDay
                      ? "w-4 h-4 rounded-full bg-emerald-500 ring-2 ring-white z-10"
                      : "w-4 h-4 rounded-full bg-slate-300 ring-2 ring-white z-10"
                  }`}
                >
                  {isCurrentDay ? (
                    <MapPin className="w-3.5 h-3.5" />
                  ) : isMilestone ? (
                    isPastDay && comparison?.isMet ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : (
                      <span className="text-[10px] font-black">{cfg.day}</span>
                    )
                  ) : isPastDay ? (
                    <CheckCircle2 className="w-2.5 h-2.5 text-white" />
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  )}
                </div>

                {/* YOU ARE HERE INDICATOR */}
                {isCurrentDay && (
                  <div className="mb-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-600 text-white text-xs font-black shadow-sm animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-white"></span>
                    <span>YOU ARE HERE • {activeHire.name.split(" ")[0]} (Day {learnerDay})</span>
                  </div>
                )}

                {/* Day Container Card */}
                <div
                  className={`p-3.5 rounded-2xl border transition-all ${
                    isCurrentDay
                      ? "bg-white border-blue-300 shadow-2xs ring-1 ring-blue-100"
                      : isPastDay
                      ? "bg-white/90 border-slate-200/80 text-slate-700"
                      : "bg-slate-50/60 border-slate-200/50 text-slate-400"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-black tracking-tight ${
                            isCurrentDay
                              ? "text-blue-700"
                              : isPastDay
                              ? "text-slate-800"
                              : "text-slate-400"
                          }`}
                        >
                          {cfg.title}
                        </span>
                        <span className="text-xs font-bold text-slate-700">• {cfg.label}</span>
                        {isMilestone && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-900 text-white uppercase">
                            Milestone
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-normal">
                        {cfg.description}
                      </p>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isCurrentDay
                          ? "bg-blue-100 text-blue-800"
                          : isPastDay
                          ? "bg-slate-100 text-slate-600"
                          : "text-slate-400"
                      }`}
                    >
                      {isCurrentDay ? "Current Day" : isPastDay ? "Completed" : "Upcoming"}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
