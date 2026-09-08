import React, { useState } from "react";
import {
  Calendar,
  TrendingUp,
  ShieldCheck,
  Package,
  AlertTriangle,
  ArrowRight,
  Volume2,
  Sparkles,
  ThumbsUp,
  FileText,
  Heart,
  Zap,
  GraduationCap,
  BookOpen,
} from "lucide-react";
import { NewHire, DayRecord } from "../types";
import { speakMessage, stopSpeaking } from "../utils/speech";

interface LearnerDailyReportCardProps {
  newHire: NewHire;
  currentDay: number;
  isHindi?: boolean;
  onOpenDashboard?: () => void;
  onOpenDetailedModal?: () => void;
  onOpenWorkTools?: () => void;
  onOpenBuddy?: () => void;
  onOpenModules?: () => void;
  isDashboardVariant?: boolean;
}

export const LearnerDailyReportCard: React.FC<LearnerDailyReportCardProps> = ({
  newHire,
  currentDay,
  isHindi = false,
  onOpenDashboard,
  onOpenDetailedModal,
  isDashboardVariant = false,
}) => {
  const [playingAudio, setPlayingAudio] = useState<boolean>(false);

  // 1. Resolve yesterday's completed day record
  const yesterdayNumber = Math.max(1, currentDay - 1);
  const isFirstDay = currentDay === 1;

  const yesterdayRecord: DayRecord | undefined = isFirstDay
    ? undefined
    : newHire.daysHistory.find((d) => d.dayNumber === yesterdayNumber) ||
      newHire.daysHistory.filter((d) => d.dayNumber < currentDay).pop();

  // 2. Extract key metrics from yesterday
  const prevWork = yesterdayRecord?.workSignal;
  const actualPace = prevWork?.actualPickRate ?? (isFirstDay ? 20 : 32);
  const targetPace = prevWork?.targetPickRate ?? (isFirstDay ? 25 : 35);
  const pacePct = Math.min(100, Math.round((actualPace / targetPace) * 100));

  const accuracy = prevWork?.accuracyRate ?? 99;
  const ordersCompleted = prevWork?.ordersCompleted ?? (isFirstDay ? 15 : 38);
  const targetOrders = prevWork?.targetOrders ?? (isFirstDay ? 20 : 40);
  const ordersPct = Math.min(100, Math.round((ordersCompleted / targetOrders) * 100));

  // Training Completion Metric (Modules completed up to yesterday + quiz score)
  const targetModulesByYesterday = Math.max(1, yesterdayNumber);
  const actualModulesDone = Math.min(
    targetModulesByYesterday,
    newHire.modulesCompleted ?? targetModulesByYesterday
  );
  const trainingCompletionPct = Math.min(
    100,
    Math.round((actualModulesDone / targetModulesByYesterday) * 100)
  );
  const quizScore = newHire.quizAverageScore ?? 95;
  const trainingScore = Math.min(
    100,
    Math.round(trainingCompletionPct * 0.7 + quizScore * 0.3)
  );

  // Targets check for red blinking & area of improvement
  const isTrainingBelow = actualModulesDone < targetModulesByYesterday || quizScore < 80;
  const isSpeedBelow = actualPace < targetPace;
  const isAccuracyBelow = accuracy < 98;
  const isSlaBelow = ordersPct < 85;

  // Single-word Area of Improvement (picking, SLA, Training etc whatever wrong dont put details just one word)
  let improvementWord = "None";
  let improvementWordHi = "कोई नहीं";

  if (isSpeedBelow) {
    improvementWord = "Picking";
    improvementWordHi = "पिकिंग";
  } else if (isAccuracyBelow) {
    improvementWord = "Accuracy";
    improvementWordHi = "सटीकता";
  } else if (isSlaBelow) {
    improvementWord = "SLA";
    improvementWordHi = "एसएलए";
  } else if (isTrainingBelow) {
    improvementWord = "Training";
    improvementWordHi = "ट्रेनिंग";
  }

  // 4-PILLAR COMPOSITE DAILY PERFORMANCE SCORE (0 - 100%)
  // 1. Training (25%) + 2. Speed (30%) + 3. Accuracy (30%) + 4. Orders SLA (15%)
  const dailyPerformancePct = Math.min(
    100,
    Math.round(
      trainingScore * 0.25 +
      pacePct * 0.30 +
      accuracy * 0.30 +
      ordersPct * 0.15
    )
  );

  const prevDailySignal = yesterdayRecord?.dailySignal;
  const prevPattern = yesterdayRecord?.identifiedPattern;
  const prevActionOutcome = yesterdayRecord?.actionOutcome;

  // 3. Evaluate Shift Assessment based on daily composite score & signals
  const isPaceBelow = actualPace < targetPace - 3;
  const hasQuizGap = quizScore < 70;
  const hasFloorIssue =
    prevDailySignal?.category === "Environment" ||
    prevPattern?.category === "Environment" ||
    (prevDailySignal?.rawText || "").toLowerCase().includes("aisle");
  const isRecovered = prevActionOutcome?.improved === "yes";

  let isShiftGood = dailyPerformancePct >= 75;
  let signTitle = isHindi ? "शानदार प्रदर्शन" : "GOOD SHIFT";
  let signTag = isHindi ? `✓ ${dailyPerformancePct}% स्कोर` : `✓ ${dailyPerformancePct}% Score`;
  let signSub = isHindi ? "ट्रेनिंग व फ्लोर लक्ष्य पर" : "Training & Floor On Track";

  if (isRecovered || dailyPerformancePct >= 85) {
    isShiftGood = true;
    signTitle = isHindi ? "शानदार (GOOD)" : "GOOD SHIFT";
    signTag = isHindi ? `✓ ${dailyPerformancePct}% उत्कृष्ट` : `✓ ${dailyPerformancePct}% High Ramp`;
    signSub = isHindi ? "सटीक पिकिंग व मॉड्यूल पूर्ण" : "Modules Done & Fast Picks";
  } else if (dailyPerformancePct < 75 || isPaceBelow || hasFloorIssue || hasQuizGap) {
    isShiftGood = false;
    signTitle = isHindi ? "सुधार जरूरी (NEEDS WORK)" : "NEEDS ATTENTION";
    signTag = hasFloorIssue
      ? isHindi
        ? "⚠️ आइसल रूट"
        : "⚠️ Aisle Route"
      : isPaceBelow
      ? isHindi
        ? "⚠️ गति धीमी"
        : "⚠️ Below Target"
      : isHindi
      ? "⚠️ क्विज़ रिवीजन"
      : "⚠️ Quiz Review";
    signSub = hasFloorIssue
      ? isHindi
        ? "आइसल 4-8 वॉकथ्रू तय"
        : "15m Walkthrough Set"
      : isPaceBelow
      ? isHindi
        ? "धीमी गति पर ध्यान दें"
        : "Speed Support Active"
      : isHindi
      ? "नियम दोहराना आवश्यक"
      : "Reinforcement Needed";
  }

  // Audio speech narration
  const handlePlayAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (playingAudio) {
      stopSpeaking();
      setPlayingAudio(false);
      return;
    }

    const text = isHindi
      ? `कल का समग्र प्रदर्शन स्कोर ${dailyPerformancePct} प्रतिशत है। ट्रेनिंग में ${actualModulesDone} मॉड्यूल पूरे हुए, पिकिंग स्पीड ${actualPace} सामान प्रति घंटा, एक्यूरेसी ${accuracy} प्रतिशत। सुधार का मुख्य क्षेत्र: ${improvementWordHi}।`
      : `Yesterday's overall daily performance score is ${dailyPerformancePct} percent. Training: ${actualModulesDone} modules done. Pick rate: ${actualPace} items per hour, accuracy: ${accuracy} percent. Primary improvement area: ${improvementWord}.`;

    setPlayingAudio(true);
    speakMessage(text, isHindi, () => {
      setPlayingAudio(false);
    });
  };

  const handleCardClick = () => {
    if (isDashboardVariant && onOpenDetailedModal) {
      onOpenDetailedModal();
    } else if (onOpenDashboard) {
      onOpenDashboard();
    }
  };

  return (
    <div
      id={isDashboardVariant ? "dashboard-yesterday-snapshot-card" : "yesterday-quick-snapshot-card"}
      onClick={handleCardClick}
      className={`rounded-[28px] p-4.5 sm:p-5 text-white shadow-xl shadow-purple-950/20 space-y-3.5 cursor-pointer select-none transition-all hover:shadow-2xl active:scale-[0.995] relative overflow-hidden border border-white/20 ${
        !isShiftGood
          ? "bg-gradient-to-br from-violet-700 via-purple-700 to-rose-600"
          : "bg-gradient-to-br from-[#7025fb] via-[#6115ee] to-[#5010d4]"
      }`}
    >
      {/* CARD HEADING: YESTERDAY'S PERFORMANCE */}
      <div className="flex items-center justify-between border-b border-white/15 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-300 shadow-xs shadow-amber-400/50" />
          <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-white">
            YESTERDAY'S PERFORMANCE
          </h2>
        </div>
      </div>

      {/* 1. HEADER: COMPOSITE PERFORMANCE PROGRESS CIRCLE */}
      <div className="flex items-center justify-between gap-3 pt-0.5">
        {/* Small circular progress ring displaying overall Daily Performance % */}
        <div className="flex items-center gap-3">
          <div className="relative w-15 h-15 shrink-0 flex items-center justify-center">
            <svg className="w-15 h-15 -rotate-90 transform" viewBox="0 0 60 60">
              <circle
                cx="30"
                cy="30"
                r="24"
                stroke="rgba(255, 255, 255, 0.2)"
                strokeWidth="5.5"
                fill="none"
              />
              <circle
                cx="30"
                cy="30"
                r="24"
                stroke="#FFFFFF"
                strokeWidth="5.5"
                strokeDasharray={150.8}
                strokeDashoffset={150.8 * (1 - Math.min(1, dailyPerformancePct / 100))}
                strokeLinecap="round"
                fill="none"
                className="transition-all duration-700 ease-out drop-shadow-sm"
              />
            </svg>
            {/* Center readout inside small progress circle */}
            <div className="absolute inset-0 flex flex-col items-center justify-center leading-none select-none">
              <span className="text-sm sm:text-base font-black text-white">
                {dailyPerformancePct}
              </span>
              <span className="text-[8px] font-bold text-amber-300">
                %
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/20 text-white border border-white/25 backdrop-blur-xs">
            {signTag}
          </span>
          <button
            type="button"
            onClick={handlePlayAudio}
            className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer border border-white/25"
            title="Listen aloud"
          >
            <Volume2 className={`w-4 h-4 ${playingAudio ? "animate-bounce text-fuchsia-300" : ""}`} />
          </button>
          <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center border border-white/20">
            <Heart className="w-4 h-4 text-white fill-white/30" />
          </div>
        </div>
      </div>

      {/* 2. GRIDS: 4 TILES (TRAINING, SPEED, ACCURACY, AREA OF IMPROVEMENT) */}
      <div className="grid grid-cols-2 gap-2.5 pt-0.5">
        {/* Tile 1: Training Completion (Modules & Quiz) */}
        <div
          className={`p-3 rounded-2xl border flex flex-col justify-between space-y-2 transition-all shadow-md ${
            isTrainingBelow
              ? "bg-white border-red-300 ring-2 ring-red-100"
              : "bg-white border-white/90 hover:shadow-lg"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
              {isHindi ? "ट्रेनिंग पूर्ण" : "Training"}
            </span>
            <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${isTrainingBelow ? "bg-red-50 text-red-600" : "bg-purple-50 text-purple-700"}`}>
              <GraduationCap className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className={`text-xl font-black ${isTrainingBelow ? "text-red-600 animate-pulse" : "text-slate-900"}`}>
                {actualModulesDone}
              </span>
              <span className="text-xs font-semibold text-slate-400">
                /{targetModulesByYesterday} {isHindi ? "मॉड्यूल" : "done"}
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1.5 overflow-hidden">
              <div
                className={`h-1.5 rounded-full transition-all duration-500 ${isTrainingBelow ? "bg-red-500 animate-pulse" : "bg-purple-600"}`}
                style={{ width: `${trainingCompletionPct}%` }}
              />
            </div>
            <span className={`text-[10px] font-bold block mt-1 truncate ${isTrainingBelow ? "text-red-600 animate-pulse" : "text-slate-500"}`}>
              {isTrainingBelow && <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500 animate-ping mr-1" />}
              🎯 {quizScore}% {isHindi ? "क्विज़ स्कोर" : "quiz score"}
            </span>
          </div>
        </div>

        {/* Tile 2: Pick Speed vs Goal (Red blinking if below target) */}
        <div
          className={`p-3 rounded-2xl border flex flex-col justify-between space-y-2 transition-all shadow-md ${
            isSpeedBelow
              ? "bg-white border-red-300 ring-2 ring-red-100"
              : "bg-white border-white/90 hover:shadow-lg"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
              {isHindi ? "पिकिंग रफ़्तार" : "Speed"}
            </span>
            <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${isSpeedBelow ? "bg-red-50 text-red-600" : "bg-purple-50 text-purple-700"}`}>
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className={`text-xl font-black ${isSpeedBelow ? "text-red-600 animate-pulse" : "text-slate-900"}`}>
                {actualPace}
              </span>
              <span className="text-xs font-semibold text-slate-400">
                /hr
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1.5 overflow-hidden">
              <div
                className={`h-1.5 rounded-full transition-all duration-500 ${isSpeedBelow ? "bg-red-500 animate-pulse" : "bg-purple-600"}`}
                style={{ width: `${pacePct}%` }}
              />
            </div>
            <span className={`text-[10px] font-bold block mt-1 truncate ${isSpeedBelow ? "text-red-600 animate-pulse flex items-center gap-1" : "text-slate-500"}`}>
              {isSpeedBelow && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping shrink-0" />}
              <span>🎯 {isHindi ? `लक्ष्य ${targetPace}/hr (${pacePct}%)` : `Goal ${targetPace}/hr (${pacePct}%)`}</span>
            </span>
          </div>
        </div>

        {/* Tile 3: Accuracy Rate (Red blinking if below target) */}
        <div
          className={`p-3 rounded-2xl border flex flex-col justify-between space-y-2 transition-all shadow-md ${
            isAccuracyBelow
              ? "bg-white border-red-300 ring-2 ring-red-100"
              : "bg-white border-white/90 hover:shadow-lg"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
              {isHindi ? "सटीकता" : "Accuracy"}
            </span>
            <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${isAccuracyBelow ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"}`}>
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className={`text-xl font-black ${isAccuracyBelow ? "text-red-600 animate-pulse" : "text-slate-900"}`}>
                {accuracy}%
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1.5 overflow-hidden">
              <div
                className={`h-1.5 rounded-full transition-all duration-500 ${isAccuracyBelow ? "bg-red-500 animate-pulse" : "bg-emerald-500"}`}
                style={{ width: `${accuracy}%` }}
              />
            </div>
            <span className={`text-[10px] font-bold block mt-1 truncate ${isAccuracyBelow ? "text-red-600 animate-pulse" : "text-slate-500"}`}>
              {isAccuracyBelow && <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500 animate-ping mr-1" />}
              {accuracy >= 98 ? `✓ ${isHindi ? "0 त्रुटियां" : "Zero Errors"}` : (isHindi ? "⚠️ त्रुटि सुधारें" : "⚠️ High Errors")}
            </span>
          </div>
        </div>

        {/* Tile 4: Area of Improvement (NO METRIC - JUST ONE WORD - RED BLINKING IF ISSUE) */}
        <div
          className={`p-3 rounded-2xl border flex flex-col justify-between space-y-2 transition-all shadow-md ${
            improvementWord !== "None"
              ? "bg-white border-red-300 ring-2 ring-red-100"
              : "bg-white border-white/90 hover:shadow-lg"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
              {isHindi ? "सुधार क्षेत्र" : "Improvement"}
            </span>
            <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${improvementWord !== "None" ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"}`}>
              <AlertTriangle className={`w-3.5 h-3.5 ${improvementWord !== "None" ? "animate-pulse text-red-600" : ""}`} />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5 pt-0.5">
              {improvementWord !== "None" && (
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping shrink-0" />
              )}
              <span
                className={`text-xl sm:text-2xl font-black tracking-tight leading-none ${
                  improvementWord !== "None"
                    ? "text-red-600 animate-pulse"
                    : "text-emerald-700 font-bold"
                }`}
              >
                {isHindi ? improvementWordHi : improvementWord}
              </span>
            </div>
            <span
              className={`text-[10px] font-bold block mt-2 truncate ${
                improvementWord !== "None" ? "text-red-600 animate-pulse" : "text-slate-500"
              }`}
            >
              {improvementWord !== "None"
                ? isHindi
                  ? "⚠️ प्राथमिक सुधार क्षेत्र"
                  : "⚠️ Focus Area"
                : isHindi
                ? "✓ सभी लक्ष्य सही"
                : "✓ Target Met"}
            </span>
          </div>
        </div>
      </div>

      {/* 3. NOMINAL FOOTER WITH VIEW DETAILS TRIGGER */}
      <div className="pt-2 border-t border-white/20 flex items-center justify-between text-xs">
        <span className="text-xs font-medium text-purple-200 truncate pr-2">
          {prevPattern ? prevPattern.diagnosis : (isHindi ? "सटीक व सुरक्षित कार्य जारी रखें" : "Pace steady, zero misscans recorded.")}
        </span>
        <div className="text-xs font-black text-white hover:text-purple-200 flex items-center gap-1 shrink-0 transition-colors">
          <span>{isHindi ? "विवरण →" : "Details →"}</span>
        </div>
      </div>
    </div>
  );
};
