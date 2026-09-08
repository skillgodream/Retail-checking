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
  IdealMilestoneDefinition,
} from "../models/milestones";

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

  const learnerDay = activeHire.currentDay;
  const capabilities = activeHire.capabilities || {};

  // Check if learner has recorded capability evidence in state
  const hasRecordedCapabilities = Object.values(capabilities).some(
    (c) => c && c.evidence && c.evidence !== "none"
  );

  // Evaluate ideal vs actual summary
  const milestones = getAllMilestones();

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
  let statusLabel: "On track" | "Reached" | "Behind milestone" | "Not enough evidence" =
    "Not enough evidence";

  if (hasRecordedCapabilities) {
    // Check highest milestone met
    const day3Comp = compareLearnerToMilestone(activeHire, getMilestoneForDay(3)!);
    const day5Comp = compareLearnerToMilestone(activeHire, getMilestoneForDay(5)!);
    const day7Comp = compareLearnerToMilestone(activeHire, getMilestoneForDay(7)!);
    const day9Comp = compareLearnerToMilestone(activeHire, getMilestoneForDay(9)!);
    const day10Comp = compareLearnerToMilestone(activeHire, getMilestoneForDay(10)!);

    if (day10Comp.isMet) {
      actualLabel = "Job Ready (Day 10)";
      statusLabel = "Reached";
    } else if (day9Comp.isMet) {
      actualLabel = "Day 9 capability level";
      statusLabel = learnerDay <= 9 ? "On track" : "Behind milestone";
    } else if (day7Comp.isMet) {
      actualLabel = "Day 7 capability level";
      statusLabel = learnerDay <= 7 ? "On track" : "Behind milestone";
    } else if (day5Comp.isMet) {
      actualLabel = "Day 5 capability level";
      statusLabel = learnerDay <= 5 ? "On track" : "Behind milestone";
    } else if (day3Comp.isMet) {
      actualLabel = "Day 3 capability level";
      statusLabel = learnerDay <= 3 ? "On track" : "Behind milestone";
    } else {
      // Day 3 not fully met yet: check if Day 1-2 foundation capabilities are demonstrated
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
      {/* 3. IDEAL VS ACTUAL SUMMARY CARD                           */}
      {/* ========================================================= */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/90 shadow-2xs space-y-2.5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-900">
              {activeHire.name.split(" ")[0]}'s Journey Standing
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-medium">Shift Day {learnerDay}</span>
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
              statusLabel === "On track" || statusLabel === "Reached"
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

        {/* Gentle observational note: not a pass/fail indicator */}
        <p className="text-[11px] text-slate-500 leading-relaxed pt-1 flex items-start gap-1">
          <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
          <span>
            Milestones serve as formative checkpoints to guide buddy walkthroughs and floor support,
            not pass/fail tests.
          </span>
        </p>
      </div>

      {/* ========================================================= */}
      {/* 4. TWO PATHS LEGEND                                       */}
      {/* ========================================================= */}
      <div className="flex items-center justify-between px-1 text-xs">
        <div className="flex items-center gap-1.5 text-slate-600 font-semibold">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-300 border border-slate-400"></span>
          <span>
            <strong>Ideal Path:</strong> Where learner should be
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-blue-700 font-semibold">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
          <span>
            <strong>Actual Path:</strong> Current standing
          </span>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 5. SINGLE VERTICAL TIMELINE (DAY 0 TO DAY 10)             */}
      {/* ========================================================= */}
      <div className="relative pl-6 sm:pl-8 space-y-4 pt-2">
        {/* Continuous central vertical line */}
        <div className="absolute left-[17px] sm:left-[21px] top-4 bottom-4 w-1 bg-slate-200 rounded-full" />

        {TIMELINE_DAYS.map((cfg) => {
          const isCurrentDay = cfg.day === learnerDay;
          const isPastDay = cfg.day < learnerDay;
          const isMilestone = cfg.isMilestone;
          const milestoneDef = isMilestone ? getMilestoneForDay(cfg.day) : undefined;
          const isExpanded = expandedMilestoneDay === cfg.day;

          // Check actual milestone comparison if it's a milestone day
          const comparison = milestoneDef
            ? compareLearnerToMilestone(activeHire, milestoneDef)
            : undefined;

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

              {/* YOU ARE HERE INDICATOR (Placed prominently at learner's actual day) */}
              {isCurrentDay && (
                <div className="mb-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-600 text-white text-xs font-black shadow-sm animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-white"></span>
                  <span>YOU ARE HERE • {activeHire.name.split(" ")[0]} (Day {learnerDay})</span>
                </div>
              )}

              {/* Day Container Card */}
              {isMilestone ? (
                /* -------------------------------------------------- */
                /* MILESTONE CHECKPOINT CARD                          */
                /* -------------------------------------------------- */
                <div
                  className={`rounded-3xl border transition-all ${
                    isCurrentDay
                      ? "bg-gradient-to-br from-white to-blue-50/40 border-blue-300 shadow-sm ring-1 ring-blue-200"
                      : isPastDay
                      ? "bg-white border-slate-200 shadow-2xs"
                      : "bg-slate-50/80 border-slate-200/70"
                  }`}
                >
                  <button
                    onClick={() => toggleMilestone(cfg.day)}
                    className="w-full p-4 text-left cursor-pointer flex items-start justify-between gap-3"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-900 text-white">
                          ● DAY {cfg.day} MILESTONE
                        </span>

                        {cfg.day === 10 ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                            Final Certification Gate
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                            Checkpoint
                          </span>
                        )}

                        {/* Status chip for this milestone */}
                        {comparison && (
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              comparison.isMet
                                ? "bg-emerald-100 text-emerald-800"
                                : isPastDay || isCurrentDay
                                ? "bg-amber-100 text-amber-800"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {comparison.isMet
                              ? "Reached"
                              : isCurrentDay
                              ? "Current Checkpoint"
                              : isPastDay
                              ? "Needs support"
                              : "Upcoming"}
                          </span>
                        )}
                      </div>

                      <h3 className="text-sm sm:text-base font-black text-slate-900 leading-tight">
                        {cfg.label}
                      </h3>
                      <p className="text-xs text-slate-500 leading-relaxed">{cfg.description}</p>
                    </div>

                    <div className="p-1 rounded-full text-slate-400 hover:text-slate-800 shrink-0 mt-0.5">
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </button>

                  {/* Expanded Milestone Details */}
                  {isExpanded && milestoneDef && (
                    <div className="px-4 pb-4 pt-1 border-t border-slate-100 space-y-3.5 text-xs animate-in fade-in duration-150">
                      {/* Expected Capabilities Section */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-slate-400">
                          <span>Expected Capabilities</span>
                          <span>Actual Evidence</span>
                        </div>

                        <div className="space-y-1.5">
                          {milestoneDef.expectedCapabilities.map((exp, idx) => {
                            // Link to matching capability requirement if available
                            const req = milestoneDef.requiredCapabilities[idx];
                            const capDef = req
                              ? DARK_STORE_CAPABILITIES.find((c) => c.id === req.capabilityId)
                              : undefined;
                            const capState = req ? capabilities[req.capabilityId] : undefined;
                            const evidence: EvidenceLevel = capState?.evidence || "none";
                            const isMet = Boolean(
                              req &&
                              capState &&
                              (evidence === "demonstrated" ||
                                (req.minEvidenceLevel === "emerging" && evidence === "emerging"))
                            );

                            return (
                              <div
                                key={idx}
                                className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-start justify-between gap-3"
                              >
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0"></span>
                                    <span className="font-bold text-slate-800">{exp}</span>
                                  </div>
                                  {capDef && (
                                    <span className="text-[10px] text-slate-500 font-mono block pl-3">
                                      {capDef.code}: {capDef.name}
                                    </span>
                                  )}
                                </div>

                                <div className="shrink-0 text-right">
                                  {evidence === "none" ? (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-600">
                                      Not enough evidence
                                    </span>
                                  ) : isMet ? (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                                      <CheckCircle2 className="w-3 h-3" />
                                      <span>Demonstrated</span>
                                    </span>
                                  ) : (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      <span>{evidence === "inconsistent" ? "Needs support" : "In progress"}</span>
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Performance Expectations Pill Bar */}
                      <div className="p-3 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-1.5">
                        <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 block">
                          Floor Performance Expectations
                        </span>
                        <div className="flex flex-wrap gap-2 text-xs font-semibold text-slate-700">
                          {typeof milestoneDef.performanceExpectations.minPickRate === "number" && (
                            <span className="px-2.5 py-1 rounded-xl bg-white border border-blue-100">
                              Pick Rate: <strong>{milestoneDef.performanceExpectations.minPickRate}+ /hr</strong>
                            </span>
                          )}
                          {typeof milestoneDef.performanceExpectations.minAccuracy === "number" && (
                            <span className="px-2.5 py-1 rounded-xl bg-white border border-blue-100">
                              Accuracy: <strong>{milestoneDef.performanceExpectations.minAccuracy}%+</strong>
                            </span>
                          )}
                          {typeof milestoneDef.performanceExpectations.maxHelpRequestsPerShift === "number" && (
                            <span className="px-2.5 py-1 rounded-xl bg-white border border-blue-100">
                              Independence: <strong>&le; {milestoneDef.performanceExpectations.maxHelpRequestsPerShift} help requests/shift</strong>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Observational Summary Footer */}
                      <div className="pt-1 text-[11px] text-slate-500 flex items-center justify-between">
                        <span>
                          {comparison?.isMet
                            ? "All requirements demonstrated."
                            : comparison?.summary || "Checkpoint evaluation in progress."}
                        </span>
                        <span className="font-bold text-slate-700">
                          {cfg.day > learnerDay ? "Upcoming" : comparison?.isMet ? "Cleared" : "Active focus"}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* -------------------------------------------------- */
                /* REGULAR DAY NODE (NON-MILESTONE)                   */
                /* -------------------------------------------------- */
                <div
                  className={`p-3 rounded-2xl border transition-all ${
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
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
