import React, { useState } from "react";
import {
  Sparkles,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  Zap,
  Play,
  Dumbbell,
  FlaskConical,
  FileCheck2,
  Award,
  ChevronRight,
  Building2,
  PackageCheck,
  Volume2,
  AlertTriangle,
  Bell,
  X,
  BookOpen,
  Target,
  Cpu,
  Mic,
} from "lucide-react";
import {
  NewHire,
  CapabilityState,
  DARK_STORE_CAPABILITIES,
} from "../types";
import { evaluateDay10Outcome, assessReadiness } from "../services/intelligence";

interface JobReadyHumanFigureProps {
  newHire: NewHire;
  currentDay: number;
  isHindi?: boolean;
}

interface CapabilityCategory {
  id: "learning" | "practice" | "simulation" | "assessment";
  title: string;
  titleHi: string;
  weight: number;
  completedText: string;
  completedTextHi: string;
  color: string;
  gradientId: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
  icon: React.ReactNode;
  ratio: number;
  completedCount: number;
  totalCount: number;
}

export const JobReadyHumanFigure: React.FC<JobReadyHumanFigureProps> = ({
  newHire,
  currentDay,
  isHindi = false,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<
    "learning" | "practice" | "simulation" | "assessment"
  >("practice");
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [showAllCategoriesModal, setShowAllCategoriesModal] = useState<boolean>(false);
  const [activePillarModal, setActivePillarModal] = useState<
    "learning" | "practice" | "simulation" | "assessment" | null
  >(null);
  const [selectedCriterionIndex, setSelectedCriterionIndex] = useState<number | null>(null);

  const capabilities = newHire?.capabilities || {};
  const currentCapId = newHire?.currentCapabilityId || 3;

  // Calculate demonstrated capabilities
  const demonstratedCount = (
    Object.values(capabilities) as CapabilityState[]
  ).filter(
    (c) =>
      c &&
      (c.evidence === "demonstrated" ||
        c.mastery === "proficient" ||
        c.mastery === "mastered")
  ).length;

  // Modules completed (out of 10)
  const modulesCompleted = newHire?.modulesCompleted ?? Math.min(10, currentDay);
  const quizAvg = newHire?.quizAverageScore ?? 94;

  // 4 Core Reference Image Pillars calculated from real intelligence state:
  // 1. Learning (20% weight) - Video & Theory LMS modules
  const learningCompleted = Math.min(12, Math.round((modulesCompleted / 10) * 12));
  const learningRatio = Math.min(1, modulesCompleted / 10);
  const learningPct = Math.round(learningRatio * 20);

  // 2. Practice (25% weight) - Floor exercises & Aisle drills
  const practiceTotal = 10;
  const practiceCompleted = Math.min(
    practiceTotal,
    Math.round((demonstratedCount / 20) * 10) + (currentDay >= 3 ? 2 : 1)
  );
  const practiceRatio = Math.min(1, practiceCompleted / practiceTotal);
  const practicePct = Math.round(practiceRatio * 25);

  // 3. Simulation (25% weight) - Practical terminal activities & mock orders
  const simTotal = 8;
  const simCompleted = Math.min(
    simTotal,
    Math.round((demonstratedCount / 20) * 8) + (currentDay >= 4 ? 2 : 1)
  );
  const simRatio = Math.min(1, simCompleted / simTotal);
  const simPct = Math.round(simRatio * 25);

  // 4. Assessment (30% weight) - Real floor shift verification & solo SLA tests
  const assessTotal = 3;
  const assessCompleted =
    currentDay >= 5 && demonstratedCount >= 10
      ? 3
      : currentDay >= 4
      ? 2
      : currentDay >= 3
      ? 1
      : 0;
  const assessRatio = assessCompleted / assessTotal;
  const assessPct = Math.round(assessRatio * 30);

  // Overall readiness percentage matching reference image style
  const overallReadiness = Math.min(
    100,
    typeof newHire?.overallReadinessScore === "number"
      ? (newHire.overallReadinessScore <= 1
          ? Math.round(newHire.overallReadinessScore * 100)
          : Math.round(newHire.overallReadinessScore))
      : assessReadiness(capabilities, newHire)
  );

  const categories: CapabilityCategory[] = [
    {
      id: "learning",
      title: "Learning",
      titleHi: "थ्योरी और वीडियो",
      weight: 20,
      completedText: `Video modules completed ${learningCompleted}/12`,
      completedTextHi: `वीडियो मॉड्यूल पूर्ण ${learningCompleted}/12`,
      color: "#7025fb",
      gradientId: "grad-learning-purple",
      bgClass: "bg-[#7025fb]",
      textClass: "text-[#7025fb]",
      borderClass: "border-purple-200",
      icon: <BookOpen className="w-5 h-5 text-[#7025fb] stroke-[2]" />,
      ratio: learningRatio,
      completedCount: learningCompleted,
      totalCount: 12,
    },
    {
      id: "practice",
      title: "Practice",
      titleHi: "फ्लोर अभ्यास",
      weight: 25,
      completedText: `Exercises completed ${practiceCompleted}/${practiceTotal}`,
      completedTextHi: `अभ्यास ड्रिल पूर्ण ${practiceCompleted}/${practiceTotal}`,
      color: "#7025fb",
      gradientId: "grad-practice-purple",
      bgClass: "bg-[#7025fb]",
      textClass: "text-[#7025fb]",
      borderClass: "border-purple-200",
      icon: <Target className="w-5 h-5 text-[#7025fb] stroke-[2]" />,
      ratio: practiceRatio,
      completedCount: practiceCompleted,
      totalCount: practiceTotal,
    },
    {
      id: "simulation",
      title: "Simulation",
      titleHi: "सिमुलेशन लैब",
      weight: 25,
      completedText: `Practical activities completed ${simCompleted}/${simTotal}`,
      completedTextHi: `प्रैक्टिकल एक्टिविटी पूर्ण ${simCompleted}/${simTotal}`,
      color: "#7025fb",
      gradientId: "grad-sim-purple",
      bgClass: "bg-[#7025fb]",
      textClass: "text-[#7025fb]",
      borderClass: "border-purple-200",
      icon: <Cpu className="w-5 h-5 text-[#7025fb] stroke-[2]" />,
      ratio: simRatio,
      completedCount: simCompleted,
      totalCount: simTotal,
    },
    {
      id: "assessment",
      title: "Assessment",
      titleHi: "फ्लोर टेस्ट",
      weight: 30,
      completedText: `Final assessment passed ${assessCompleted}/${assessTotal}`,
      completedTextHi: `फाइनल टेस्ट पास ${assessCompleted}/${assessTotal}`,
      color: "#7025fb",
      gradientId: "grad-assess-purple",
      bgClass: "bg-[#7025fb]",
      textClass: "text-[#7025fb]",
      borderClass: "border-purple-200",
      icon: <Mic className="w-5 h-5 text-[#7025fb] stroke-[2]" />,
      ratio: assessRatio,
      completedCount: assessCompleted,
      totalCount: assessTotal,
    },
  ];

  // Learning journey stages matching reference image bottom bar
  const journeyStages = [
    {
      id: 1,
      title: isHindi ? "लर्निंग वीडियो" : "Learning Videos",
      sub: isHindi ? "ज्ञान बढ़ाएं" : "Build your knowledge",
      status: currentDay >= 1 ? "completed" : "locked",
      icon: <Play className="w-4 h-4" />,
      color: "text-blue-600 bg-blue-50 border-blue-200",
    },
    {
      id: 2,
      title: isHindi ? "फ्लोर प्रैक्टिस" : "Practice",
      sub: isHindi ? "हुनर तराशें" : "Sharpen your skills",
      status: currentDay >= 2 ? "completed" : "locked",
      icon: <Dumbbell className="w-4 h-4" />,
      color: "text-emerald-600 bg-emerald-50 border-emerald-200",
    },
    {
      id: 3,
      title: isHindi ? "सिमुलेशन लैब" : "Simulation Lab",
      sub: isHindi ? "प्रैक्टिकल अनुभव" : "Get hands-on experience",
      status: currentDay === 3 ? "active" : currentDay > 3 ? "completed" : "locked",
      icon: <FlaskConical className="w-4 h-4" />,
      color: "text-purple-600 bg-purple-50 border-purple-200",
    },
    {
      id: 4,
      title: isHindi ? "वर्कप्लेस इंग्लिश" : "Workplace Hindi/Eng",
      sub: isHindi ? "आत्मविश्वास से बोलें" : "Speak with confidence",
      status: currentDay >= 4 ? "completed" : "locked",
      icon: <Volume2 className="w-4 h-4" />,
      color: "text-cyan-600 bg-cyan-50 border-cyan-200",
    },
    {
      id: 5,
      title: isHindi ? "शिफ्ट इंटरव्यू" : "Interview Prep",
      sub: isHindi ? "तैयारी पूरी करें" : "Practice & get ready",
      status: currentDay >= 5 ? "completed" : "locked",
      icon: <ShieldCheck className="w-4 h-4" />,
      color: "text-violet-600 bg-violet-50 border-violet-200",
    },
    {
      id: 6,
      title: isHindi ? "फाइनल असेसमेंट" : "Final Assessment",
      sub: isHindi ? "अपनी क्षमता दिखाएं" : "Show what you can do",
      status: currentDay >= 5 && overallReadiness >= 70 ? "completed" : "locked",
      icon: <FileCheck2 className="w-4 h-4" />,
      color: "text-amber-600 bg-amber-50 border-amber-200",
    },
    {
      id: 7,
      title: isHindi ? "जॉब सर्टिफिकेट" : "Certificate",
      sub: isHindi ? "सर्टिफाइड बनें" : "Get your credential",
      status: overallReadiness >= 85 ? "completed" : "locked",
      icon: <Award className="w-4 h-4" />,
      color: "text-emerald-600 bg-emerald-50 border-emerald-200",
    },
  ];

  const activeCategoryData =
    categories.find((c) => c.id === selectedCategory) || categories[0];

  return (
    <section
      id="job-ready-human-dashboard"
      className="space-y-5 select-none"
    >
      {/* ------------------------------------------------------------- */}
      {/* MAIN PURPLE HERO CARD (MATCHING SCREEN 1 HERO IN ATTACHMENT)  */}
      {/* ------------------------------------------------------------- */}
      <div
        id="dashboard-hero-purple-card"
        className="w-full rounded-[32px] p-6 sm:p-7 bg-[#7025fb] text-white shadow-xl shadow-purple-600/30 relative overflow-hidden flex flex-col justify-between min-h-[220px]"
      >
        {/* Ambient watermark typographic layer (matching CREDITS in screenshot) */}
        <span
          className="absolute -right-4 -bottom-6 text-7xl sm:text-8xl font-black text-white/5 tracking-tighter select-none pointer-events-none"
          aria-hidden="true"
        >
          READINESS
        </span>

        {/* Top Title: CAREER READINESS & NOTIFICATION BELL */}
        <div className="relative z-10 flex items-start justify-between">
          <div className="space-y-0.5">
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-white">
              {isHindi ? "कुल जॉब तत्परता" : "CAREER READINESS"}
            </h2>
            <p className="text-xs text-white/80 font-medium">
              {isHindi ? "अपनी प्रगति देखें. भविष्य संवारें." : "See Your Progress. Build Your Future."}
            </p>
          </div>

          {/* Circular Notification Bell with Indicator Dot */}
          <button
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 transition-all flex items-center justify-center text-white relative cursor-pointer border border-white/20 shadow-xs shrink-0 ml-2"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5 stroke-[2]" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-300 ring-2 ring-[#7025fb] absolute top-2 right-2" />
          </button>
        </div>

        {/* Center: Gauge / Metric & Infinity Accent */}
        <div className="relative z-10 flex items-center justify-between gap-4 my-3">
          {/* Circular Donut Gauge */}
          <div className="relative w-22 h-22 sm:w-24 sm:h-24 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
              {/* Background Track */}
              <circle
                cx="60"
                cy="60"
                r="48"
                className="stroke-white/20"
                strokeWidth="11"
                fill="transparent"
              />
              {/* Progress Arc */}
              <circle
                cx="60"
                cy="60"
                r="48"
                stroke="url(#dashboard-purple-hero-grad)"
                strokeWidth="11"
                strokeLinecap="round"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 48}
                strokeDashoffset={2 * Math.PI * 48 * (1 - overallReadiness / 100)}
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="dashboard-purple-hero-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="60%" stopColor="#00d4ff" />
                  <stop offset="100%" stopColor="#00ffa3" />
                </linearGradient>
              </defs>
            </svg>

            {/* Center Percentage Display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-black text-white tracking-tight leading-none">
                {overallReadiness}%
              </span>
              <span className="text-[8.5px] font-bold text-white/80 uppercase tracking-wider mt-0.5">
                {isHindi ? "तैयार" : "READY"}
              </span>
            </div>
          </div>

          {/* Role Pill & Details */}
          <div className="flex-1 min-w-0 space-y-2">
            <div className="bg-white/15 backdrop-blur-md rounded-2xl p-2.5 border border-white/20">
              <div className="text-xs font-black text-white truncate">
                {isHindi ? "वेयरहाउस एसोसिएट" : "Warehouse Associate"}
              </div>
              <div className="text-[10px] text-white/80 truncate">
                {isHindi ? "डार्क स्टोर लॉजिस्टिक्स" : "Logistics & Supply Chain"}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Status Pill (matching the +2.4% badge in attachment) */}
        <div className="relative z-10 flex items-center justify-between gap-2 pt-1">
          <div className="px-3.5 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold flex items-center gap-2 w-fit border border-white/20 shadow-xs">
            <span className="font-black">+2.4%</span>
            <span className="opacity-60 font-normal">|</span>
            <span>
              {isHindi ? "ऑन-ट्रैक" : "On-Track"} • Day {currentDay}/14
            </span>
          </div>

          <div className="text-[11px] text-white/90 font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
            <span>{isHindi ? "सत्यापित" : "Live Score"}</span>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* CATEGORIES SECTION (MATCHING SCREEN 1 2x2 SQUIRCLE GRID)      */}
      {/* ------------------------------------------------------------- */}
      <div className="space-y-3">
        {/* Section Header with purple "See All" */}
        <div className="flex items-center justify-between px-1">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              {isHindi ? "श्रेणियां" : "Categories"}
            </h2>
            <p className="text-[11px] text-slate-500 font-medium">
              {isHindi ? "4 मुख्य सीखने के स्तंभ" : "4 core readiness pillars"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowAllCategoriesModal(true)}
            className="text-xs font-bold text-[#7025fb] hover:underline cursor-pointer"
          >
            {isHindi ? "सभी देखें" : "See All"}
          </button>
        </div>

        {/* 2x2 Squircle Category Cards */}
        <div className="grid grid-cols-2 gap-3">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            const catScore = Math.round(cat.ratio * cat.weight);

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setActivePillarModal(cat.id);
                }}
                className={`rounded-[24px] p-4 sm:p-5 flex flex-col justify-between aspect-4/3 text-left transition-all cursor-pointer border relative overflow-hidden group shadow-2xs ${
                  isSelected
                    ? "bg-white border-[#7025fb] ring-2 ring-[#7025fb]/25 shadow-md scale-[1.01]"
                    : "bg-[#E8E8EE] hover:bg-[#DFDFE7] border-slate-200/50"
                }`}
                title={isHindi ? "विस्तार से देखने के लिए क्लिक करें" : "Click to view pillar details"}
              >
                {/* Top: Vibrant Purple Icon & Pop-up Badge */}
                <div className="flex items-center justify-between w-full">
                  <div className="w-9 h-9 rounded-2xl bg-white/90 border border-slate-200/40 flex items-center justify-center shadow-2xs">
                    {cat.icon}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-[#7025fb] bg-purple-50 px-1.5 py-0.5 rounded-md border border-purple-100 hidden xs:inline">
                      {isHindi ? "विवरण" : "Details"}
                    </span>
                    <span className="text-xs font-black text-slate-900">
                      {catScore}%
                    </span>
                  </div>
                </div>

                {/* Bottom: Category Name & Completed Count */}
                <div className="space-y-0.5">
                  <div className="text-sm font-bold text-slate-900 leading-tight truncate flex items-center justify-between">
                    <span>{isHindi ? cat.titleHi : cat.title}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#7025fb] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium truncate">
                    {cat.completedCount}/{cat.totalCount} {isHindi ? "पूर्ण" : "done"}
                  </div>
                </div>

                {/* Mini subtle progress bar */}
                <div className="w-full h-1 bg-slate-200/80 rounded-full overflow-hidden mt-1">
                  <div
                    className="h-full rounded-full transition-all duration-500 bg-[#7025fb]"
                    style={{ width: `${Math.round(cat.ratio * 100)}%` }}
                  />
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Category Detail Pill Card */}
        <button
          type="button"
          onClick={() => setActivePillarModal(selectedCategory)}
          className="w-full bg-white hover:bg-purple-50/40 transition-colors rounded-[24px] p-4 border border-slate-200/70 shadow-xs flex items-center justify-between gap-3 text-left cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-[#7025fb] flex items-center justify-center shrink-0">
              {activeCategoryData.icon}
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <span>{isHindi ? activeCategoryData.titleHi : activeCategoryData.title} • {Math.round(activeCategoryData.ratio * activeCategoryData.weight)}%</span>
                <span className="text-[10px] text-[#7025fb] font-semibold underline underline-offset-2">
                  ({isHindi ? "जांचें" : "Check Details"})
                </span>
              </div>
              <div className="text-[11px] text-slate-500 font-medium">
                {isHindi ? activeCategoryData.completedTextHi : activeCategoryData.completedText}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-100">
              {Math.round(activeCategoryData.ratio * 100)}%
            </span>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#7025fb] transition-colors" />
          </div>
        </button>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* DAY 10 COMMERCIAL CERTIFICATION AUDIT (7 CRITERIA)            */}
      {/* ------------------------------------------------------------- */}
      {(() => {
        const day10Audit = evaluateDay10Outcome(newHire);
        return (
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs space-y-3">
            {/* DEDICATED HEADER CARD: HEADING NAME & NOT READY / JOB READY ICON */}
            <button
              type="button"
              id="day10-certification-header-card"
              onClick={() => setSelectedCriterionIndex(0)}
              className={`w-full text-left p-3.5 sm:p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 shadow-xs cursor-pointer group ${
                day10Audit.isReady
                  ? "bg-gradient-to-r from-emerald-50 via-white to-emerald-50/50 border-emerald-200/90 hover:border-emerald-400"
                  : "bg-gradient-to-r from-rose-50 via-white to-amber-50/40 border-rose-200/90 hover:border-rose-400"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border shadow-xs ${
                    day10Audit.isReady
                      ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                      : "bg-rose-100 text-rose-700 border-rose-200"
                  }`}
                >
                  <Award className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs sm:text-sm font-black text-slate-900 tracking-tight">
                      {isHindi ? "डे 10 कमर्शियल सर्टिफिकेशन (7 क्राइटेरिया)" : "Day 10 Commercial Certification (7 Criteria)"}
                    </h3>
                    <span className="text-[10px] font-bold text-slate-600 bg-white/80 px-2 py-0.5 rounded-full border border-slate-200 shrink-0">
                      {isHindi ? "जांचें" : "View Details"}
                    </span>
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium">
                    {isHindi
                      ? "केवल प्रतिशत नहीं — 7 आवश्यक व्यावसायिक मानदंडों का वास्तविक मूल्यांकन"
                      : "Not reduced to one percentage — 7 non-negotiable operational conditions"}
                  </p>
                </div>
              </div>

              {/* Status Badge with Ready / Not Ready Icon */}
              <div className="shrink-0 flex items-center gap-1.5">
                <div
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border shadow-xs ${
                    day10Audit.isReady
                      ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                      : "bg-rose-100 text-rose-800 border-rose-300"
                  }`}
                >
                  {day10Audit.isReady ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{isHindi ? "जॉब रेडी" : "JOB READY"}</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{isHindi ? "नॉट रेडी" : "NOT READY"}</span>
                    </>
                  )}
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition-colors" />
              </div>
            </button>

            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              {day10Audit.summary}
            </p>

            {/* 7 Criteria Checklist - Clickable Pop-up Trigger Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {day10Audit.verifiedCriteria.map((crit, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedCriterionIndex(idx)}
                  className={`p-2.5 rounded-2xl border flex items-start gap-2 text-left cursor-pointer transition-all hover:scale-[1.01] active:scale-95 group ${
                    crit.met
                      ? "bg-slate-50/80 hover:bg-emerald-50/40 border-slate-200/80 hover:border-emerald-300 text-slate-800"
                      : "bg-rose-50/80 hover:bg-rose-100/60 border-rose-200/90 hover:border-rose-300 text-rose-950"
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {crit.met ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-50" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-xs flex items-center justify-between gap-1">
                      <span className="truncate">{idx + 1}. {crit.name}</span>
                      <span className="text-[10px] text-purple-700 font-semibold opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        {isHindi ? "विवरण" : "Check"} →
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium truncate">{crit.detail}</div>
                  </div>
                </button>
              ))}
            </div>

            {!day10Audit.isReady && day10Audit.unresolvedBlockers.length > 0 && (
              <div className="p-3 bg-amber-50/90 border border-amber-200/90 rounded-2xl text-xs text-amber-900 font-medium flex items-center justify-between gap-2">
                <div>
                  <div className="font-black text-amber-950 mb-0.5">
                    {isHindi ? "मुख्य रुकावट → आवश्यक अगला कदम:" : "Main blocker → Required next action:"}
                  </div>
                  <div>
                    {day10Audit.unresolvedBlockers[0]} • {day10Audit.recommendedAction}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedCriterionIndex(0)}
                  className="px-2.5 py-1.5 rounded-xl bg-amber-200/80 hover:bg-amber-300/80 text-amber-950 text-[11px] font-bold shrink-0 cursor-pointer"
                >
                  {isHindi ? "जांचें" : "Audit Tab"}
                </button>
              </div>
            )}
          </div>
        );
      })()}

      {/* ------------------------------------------------------------- */}
      {/* BOTTOM SECTION: "Your Learning Journey" (7 STAGE PROGRESSION) */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-white rounded-[28px] p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-3">
        <div>
          <h3 className="text-sm font-black text-slate-900 tracking-tight">
            {isHindi ? "आपकी लर्निंग जर्नी" : "Your Learning Journey"}
          </h3>
          <p className="text-[11px] text-slate-500 font-medium">
            {isHindi
              ? "अपने करियर के लक्ष्य तक पहुंचने के लिए प्रत्येक चरण पूरा करें।"
              : "Complete each stage to reach your career goal."}
          </p>
        </div>

        {/* Horizontal Scrollable Stage Step Cards */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 no-scrollbar">
          {journeyStages.map((stage, idx) => (
            <React.Fragment key={stage.id}>
              <div
                className={`min-w-[125px] sm:min-w-[135px] p-3 rounded-2xl border transition-all shrink-0 flex flex-col justify-between ${
                  stage.status === "completed"
                    ? "bg-white border-emerald-200/80 shadow-2xs"
                    : stage.status === "active"
                    ? "bg-white border-purple-500 ring-2 ring-purple-500/20 shadow-xs"
                    : "bg-slate-100/70 border-slate-200 opacity-60"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs ${stage.color}`}
                    >
                      {stage.icon}
                    </div>
                    {stage.status === "completed" && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-50" />
                    )}
                    {stage.status === "active" && (
                      <span className="w-2.5 h-2.5 rounded-full bg-[#7025fb] animate-ping" />
                    )}
                  </div>
                  <h4 className="text-xs font-black text-slate-900 leading-snug">
                    {stage.title}
                  </h4>
                  <p className="text-[10px] text-slate-500 font-medium mt-0.5 leading-tight line-clamp-2">
                    {stage.sub}
                  </p>
                </div>

                <div className="pt-2 mt-2 border-t border-slate-100 text-[10px] font-black">
                  {stage.status === "completed" ? (
                    <span className="text-emerald-700">✓ {isHindi ? "पूर्ण" : "Completed"}</span>
                  ) : stage.status === "active" ? (
                    <span className="text-purple-700 font-black">● {isHindi ? "प्रगति पर" : "In Progress"}</span>
                  ) : (
                    <span className="text-slate-400">{isHindi ? "आगामी" : "Upcoming"}</span>
                  )}
                </div>
              </div>

              {idx < journeyStages.length - 1 && (
                <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* MODAL: NOTIFICATIONS (WHEN TOP BELL BUTTON CLICKED)           */}
      {/* ------------------------------------------------------------- */}
      {showNotifications && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[28px] max-w-sm w-full p-5 shadow-2xl space-y-4 border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-purple-100 text-[#7025fb] flex items-center justify-center">
                  <Bell className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">
                  {isHindi ? "सूचनाएं व अलर्ट" : "Notifications & Alerts"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowNotifications(false)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-2xl bg-purple-50/80 border border-purple-100 space-y-1">
                <div className="font-bold text-purple-950 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#7025fb]" />
                  <span>{isHindi ? "शिफ्ट स्थिति" : "Current Shift Status"}</span>
                </div>
                <p className="text-slate-600">
                  {isHindi
                    ? `डे ${currentDay}/14: समग्र तत्परता स्कोर ${overallReadiness}% है। ऑन-ट्रैक प्रदर्शन जारी रखें।`
                    : `Day ${currentDay}/14: Overall readiness score is ${overallReadiness}%. Keep up on-track performance.`}
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{isHindi ? "ट्रेनिंग प्रगति" : "Training Progress"}</span>
                </div>
                <p className="text-slate-600">
                  {isHindi
                    ? `${modulesCompleted}/10 मॉड्यूल पूरे हो चुके हैं। औसत क्विज स्कोर: ${quizAvg}%।`
                    : `${modulesCompleted}/10 modules completed. Average quiz score: ${quizAvg}%.`}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowNotifications(false)}
              className="w-full py-2.5 rounded-xl bg-[#7025fb] text-white text-xs font-bold shadow-md shadow-purple-500/20 active:scale-95 transition-transform cursor-pointer"
            >
              {isHindi ? "बंद करें" : "Dismiss"}
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: SEE ALL CATEGORIES BREAKDOWN (WHEN "SEE ALL" CLICKED)   */}
      {/* ------------------------------------------------------------- */}
      {showAllCategoriesModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[28px] max-w-md w-full p-5 shadow-2xl space-y-4 border border-slate-200 max-h-[85vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {isHindi ? "सभी श्रेणियां" : "All Categories Breakdown"}
                </h3>
                <p className="text-xs text-slate-500">
                  {isHindi ? "4 मुख्य स्तंभों का विवरण" : "Detailed breakdown of the 4 pillars"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAllCategoriesModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center">
                        {cat.icon}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">
                          {isHindi ? cat.titleHi : cat.title}
                        </h4>
                        <span className="text-[10px] text-slate-500">
                          {isHindi ? "वेटेज" : "Weight"}: {cat.weight}%
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-black text-[#7025fb]">
                      {Math.round(cat.ratio * cat.weight)}%
                    </span>
                  </div>

                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#7025fb]"
                      style={{ width: `${Math.round(cat.ratio * 100)}%` }}
                    />
                  </div>

                  <div className="text-[11px] text-slate-600 font-medium">
                    {isHindi ? cat.completedTextHi : cat.completedText}
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setShowAllCategoriesModal(false)}
              className="w-full py-2.5 rounded-xl bg-[#7025fb] text-white text-xs font-bold shadow-md shadow-purple-500/20 active:scale-95 transition-transform cursor-pointer"
            >
              {isHindi ? "पूर्ण" : "Done"}
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* POP-UP TAB MODAL 1: FOUR PILLARS DETAILED TAB POPUP           */}
      {/* ------------------------------------------------------------- */}
      {activePillarModal !== null && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-[28px] max-w-lg w-full p-5 sm:p-6 shadow-2xl space-y-4 border border-slate-200 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#7025fb] bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100">
                    {isHindi ? "4 मुख्य स्तंभ" : "4 Core Pillars"}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">• Interactive Tab</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  {isHindi ? "लर्निंग एवं स्किल पिलर विवरण" : "Readiness Pillar Details"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActivePillarModal(null)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 active:scale-95 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Pillar Tab Selector Bar */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl overflow-x-auto no-scrollbar">
              {categories.map((cat) => {
                const isActive = activePillarModal === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActivePillarModal(cat.id)}
                    className={`flex-1 min-w-[90px] py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer ${
                      isActive
                        ? "bg-[#7025fb] text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                    }`}
                  >
                    <span>{isHindi ? cat.titleHi : cat.title}</span>
                    <span className={`text-[10px] px-1 rounded-full ${isActive ? "bg-white/20 text-white" : "bg-slate-200 text-slate-600"}`}>
                      {cat.weight}%
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Active Pillar Tab View Content */}
            {(() => {
              const currentCat = categories.find((c) => c.id === activePillarModal) || categories[0];
              const scorePct = Math.round(currentCat.ratio * currentCat.weight);
              const totalPct = Math.round(currentCat.ratio * 100);

              // Detailed Sub-items based on Pillar ID
              const subItems =
                currentCat.id === "learning"
                  ? [
                      { title: isHindi ? "10 थ्योरी व वीडियो मॉड्यूल" : "10 Theory & LMS Video Modules", detail: `${modulesCompleted}/10 Completed`, met: modulesCompleted >= 10, icon: "BookOpen" },
                      { title: isHindi ? "डार्क स्टोर लेआउट व शेल्फ कोऑर्डिनेट मैप" : "Dark Store Aisle Layout Coordinates", detail: "Interactive Map Exposure Verified", met: currentDay >= 2, icon: "MapPin" },
                      { title: isHindi ? "पैकेजिंग और कोल्ड चैन सुरक्षा नियम" : "Product Variants & Cold Chain Safety Rules", detail: "Quality SOP Certified", met: currentDay >= 3, icon: "ShieldCheck" },
                      { title: isHindi ? "दैनिक क्विज और ज्ञान मूल्यांकन" : "Daily Knowledge Assessment Quiz", detail: `Avg Quiz Score: ${quizAvg}%`, met: quizAvg >= 80, icon: "Award" },
                    ]
                  : currentCat.id === "practice"
                  ? [
                      { title: isHindi ? "फ्लोर आयल और रैक्स सर्च प्रैक्टिस" : "Aisle Search & Rack Navigation Drills", detail: `${practiceCompleted}/${practiceTotal} Floor Drills Done`, met: practiceCompleted >= 5, icon: "Target" },
                      { title: isHindi ? "बारकोड स्कैनर डिवाइस कोऑर्डिनेट स्पीड" : "Barcode Scanner Terminal Speed", detail: "Scan Latency < 1.2s", met: currentDay >= 3, icon: "Zap" },
                      { title: isHindi ? "मल्टी-आइटम पिकिंग व टोट सॉर्टिंग" : "Multi-Item Pick & Tote Sorting", detail: "Multi-order Batching Verified", met: currentDay >= 4, icon: "PackageCheck" },
                      { title: isHindi ? "स्टेजिंग एरिया व ट्रॉली ट्रांसफर" : "Physical Staging & Trolley Transfer", detail: "Floor Logistics Practice Completed", met: currentDay >= 4, icon: "TrendingUp" },
                    ]
                  : currentCat.id === "simulation"
                  ? [
                      { title: isHindi ? "टर्मिनल पिकिंग सिम्युलेटर लैब" : "Terminal Order Simulator Drills", detail: `${simCompleted}/${simTotal} Mock Orders Completed`, met: simCompleted >= 4, icon: "FlaskConical" },
                      { title: isHindi ? "पेरिसेबल व टेम्परेचर संवेदनशील उत्पाद" : "Cold Chain & Perishable Temp Lab", detail: "Expiry & Quality Check Passed", met: currentDay >= 3, icon: "Cpu" },
                      { title: isHindi ? "10 मिनट एक्सप्रेस पिकिंग रश" : "10-Min Express Fulfillment Rush", detail: "SLA Speed Simulation", met: currentDay >= 4, icon: "Zap" },
                      { title: isHindi ? "स्टॉक न होने पर एक्सेप्शन रिपोर्टिंग" : "Out-of-Stock Exception Handling", detail: "Item Missing Recovery Workflow", met: currentDay >= 4, icon: "AlertTriangle" },
                    ]
                  : [
                      { title: isHindi ? "शिफ्ट सुपरवाइजर ऑब्जर्वेशन टेस्ट" : "Shift Supervisor Observational Test", detail: `${assessCompleted}/${assessTotal} Assessments Cleared`, met: assessCompleted >= 2, icon: "Mic" },
                      { title: isHindi ? "सोलो शिफ्ट पिकिंग स्पीड टेस्ट" : "Solo SLA Pick Rate Audit", detail: "Target SLA Pace Evaluation", met: currentDay >= 5, icon: "FileCheck2" },
                      { title: isHindi ? "स्कैनिंग शुद्धता और शून्य मिस्पिक जांच" : "Scan Accuracy Floor Verification", detail: "Mispick Rate < 2%", met: true, icon: "CheckCircle2" },
                    ];

              return (
                <div className="space-y-4">
                  {/* Banner Card */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-50 via-white to-purple-50/50 border border-purple-200/80 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-[#7025fb] text-white flex items-center justify-center shadow-md shadow-purple-500/20 shrink-0">
                        {currentCat.icon}
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-slate-900">
                          {isHindi ? currentCat.titleHi : currentCat.title}
                        </h4>
                        <p className="text-xs text-slate-500 font-medium">
                          {isHindi ? "कुल वेटेज" : "Overall Weight"}: {currentCat.weight}% • {currentCat.completedCount}/{currentCat.totalCount} {isHindi ? "पूर्ण" : "done"}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xl font-black text-[#7025fb]">{scorePct}%</div>
                      <div className="text-[10px] text-slate-500 font-bold uppercase">{totalPct}% {isHindi ? "प्रगति" : "Score"}</div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                      <span>{isHindi ? "स्तंभ पूर्णता स्तर" : "Pillar Completion Level"}</span>
                      <span className="text-[#7025fb]">{totalPct}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60">
                      <div
                        className="h-full rounded-full bg-[#7025fb] transition-all duration-500"
                        style={{ width: `${totalPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Sub-items List */}
                  <div className="space-y-2">
                    <h5 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                      {isHindi ? "इस पिलर की जांच सूची व सबूत:" : "Verified Operational Components:"}
                    </h5>
                    <div className="space-y-2">
                      {subItems.map((item, idx) => (
                        <div
                          key={idx}
                          className={`p-3 rounded-2xl border flex items-center justify-between gap-3 transition-colors ${
                            item.met
                              ? "bg-slate-50/80 border-slate-200/80 text-slate-900"
                              : "bg-amber-50/60 border-amber-200/80 text-amber-950"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="shrink-0">
                              {item.met ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-50" />
                              ) : (
                                <AlertTriangle className="w-4 h-4 text-amber-600" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-bold truncate">{item.title}</div>
                              <div className="text-[11px] text-slate-500 font-medium truncate">{item.detail}</div>
                            </div>
                          </div>

                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                            item.met ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-900"
                          }`}>
                            {item.met ? (isHindi ? "सत्यापित" : "Verified") : (isHindi ? "प्रगति पर" : "In Progress")}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <div className="text-[11px] text-slate-500 font-medium">
                {isHindi ? "वास्तविक कार्य संकेतों से संचालित" : "Grounded in real floor work signals"}
              </div>
              <button
                type="button"
                onClick={() => setActivePillarModal(null)}
                className="px-5 py-2 rounded-xl bg-[#7025fb] text-white text-xs font-bold shadow-md shadow-purple-500/20 active:scale-95 transition-transform cursor-pointer"
              >
                {isHindi ? "बंद करें" : "Close"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* POP-UP TAB MODAL 2: SEVEN CRITERIA DETAILED TAB POPUP         */}
      {/* ------------------------------------------------------------- */}
      {selectedCriterionIndex !== null && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          {(() => {
            const day10Audit = evaluateDay10Outcome(newHire);
            const verifiedList = day10Audit.verifiedCriteria;
            const currentCriterion = verifiedList[selectedCriterionIndex] || verifiedList[0];

            return (
              <div className="bg-white rounded-[28px] max-w-lg w-full p-5 sm:p-6 shadow-2xl space-y-4 border border-slate-200 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-800 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                        {isHindi ? "7 क्राइटेरिया ऑदिट" : "7 Commercial Criteria Audit"}
                      </span>
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                        day10Audit.isReady ? "bg-emerald-100 text-emerald-800 border-emerald-300" : "bg-rose-100 text-rose-800 border-rose-300"
                      }`}>
                        {day10Audit.isReady ? (isHindi ? "जॉब रेडी" : "JOB READY") : (isHindi ? "नॉट रेडी" : "NOT READY")}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mt-0.5">
                      {isHindi ? "डे 10 व्यावसायिक तत्परता मानदंड विवरण" : "Day 10 Commercial Certification Criteria"}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedCriterionIndex(null)}
                    className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 active:scale-95 transition-all cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Horizontal Tab Bar for 7 Criteria */}
                <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl overflow-x-auto no-scrollbar">
                  {verifiedList.map((crit, idx) => {
                    const isActive = selectedCriterionIndex === idx;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedCriterionIndex(idx)}
                        className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                          isActive
                            ? "bg-slate-900 text-white shadow-xs"
                            : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${crit.met ? "bg-emerald-400" : "bg-rose-400"}`} />
                        <span>#{idx + 1}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Active Criterion Details View */}
                <div className="space-y-4">
                  {/* Status Banner */}
                  <div className={`p-4 rounded-2xl border flex items-start gap-3 ${
                    currentCriterion.met
                      ? "bg-emerald-50/80 border-emerald-200 text-emerald-950"
                      : "bg-rose-50/80 border-rose-200 text-rose-950"
                  }`}>
                    <div className="mt-0.5 shrink-0">
                      {currentCriterion.met ? (
                        <CheckCircle2 className="w-6 h-6 text-emerald-600 fill-emerald-100" />
                      ) : (
                        <AlertTriangle className="w-6 h-6 text-rose-600 fill-rose-100" />
                      )}
                    </div>
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-sm font-black tracking-tight">
                          Criterion #{selectedCriterionIndex + 1}: {currentCriterion.name}
                        </h4>
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border shrink-0 ${
                          currentCriterion.met ? "bg-emerald-100 text-emerald-800 border-emerald-300" : "bg-rose-100 text-rose-800 border-rose-300"
                        }`}>
                          {currentCriterion.met ? (isHindi ? "शर्त पूरी" : "MET") : (isHindi ? "रुकावट" : "BLOCKER")}
                        </span>
                      </div>
                      <p className="text-xs font-medium opacity-90 leading-relaxed">
                        {currentCriterion.detail}
                      </p>
                    </div>
                  </div>

                  {/* Requirements & Evidence Card */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 text-xs">
                    <div className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                      {isHindi ? "ऑपरेशन्स मानदंड सबूत व स्रोत:" : "Operational Requirements & Telemetry Source:"}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-3 bg-white rounded-xl border border-slate-200/70">
                        <div className="text-[10px] text-slate-400 font-bold uppercase">{isHindi ? "आवश्यक मानक" : "Commercial Standard"}</div>
                        <div className="text-xs font-bold text-slate-800 mt-0.5">
                          {selectedCriterionIndex === 0 && "10 Foundation Modules"}
                          {selectedCriterionIndex === 1 && "≥18/20 Floor Capabilities"}
                          {selectedCriterionIndex === 2 && "≥50 picks/hr (Dark Store)"}
                          {selectedCriterionIndex === 3 && "≥98.0% Scan Accuracy"}
                          {selectedCriterionIndex === 4 && "≤1 Help Request / Shift"}
                          {selectedCriterionIndex === 5 && "Zero Safety & PPE Violations"}
                          {selectedCriterionIndex === 6 && "No Active Floor Blockers"}
                        </div>
                      </div>

                      <div className="p-3 bg-white rounded-xl border border-slate-200/70">
                        <div className="text-[10px] text-slate-400 font-bold uppercase">{isHindi ? "सत्यापन स्रोत" : "Evidence Source"}</div>
                        <div className="text-xs font-bold text-slate-800 mt-0.5">
                          {selectedCriterionIndex === 0 && "LMS Video Progress Ledger"}
                          {selectedCriterionIndex === 1 && "Demonstrated Capability State"}
                          {selectedCriterionIndex === 2 && "Work Telemetry Pick Rate"}
                          {selectedCriterionIndex === 3 && "Barcode Terminal Scanner Log"}
                          {selectedCriterionIndex === 4 && "Shift Buddy Call Signal"}
                          {selectedCriterionIndex === 5 && "Manager Observation & PPE"}
                          {selectedCriterionIndex === 6 && "Coordination Engine Audit"}
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-slate-200/70 text-slate-600 leading-relaxed">
                      <span className="font-bold text-slate-800">{isHindi ? "समीक्षा टिप्पणी:" : "Audit Context:"} </span>
                      {currentCriterion.met
                        ? isHindi
                          ? "ट्रेनी ने इस मानदंड को सफलतापूर्वक पास कर लिया है और यह स्वतंत्र ऑपरेशंस के लिए पूरी तरह से तैयार है।"
                          : "Learner has successfully demonstrated compliance with this condition for autonomous shift work."
                        : isHindi
                          ? `ट्रेनी का वर्तमान प्रदर्शन इस मानदंड को पूरा नहीं करता है। सिफारिश की जाती है: ${day10Audit.recommendedAction}`
                          : `Learner does not meet this threshold. Recommended action: ${day10Audit.recommendedAction}`}
                    </div>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={selectedCriterionIndex === 0}
                      onClick={() => setSelectedCriterionIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : 0))}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      ← {isHindi ? "पिछला" : "Prev"}
                    </button>
                    <button
                      type="button"
                      disabled={selectedCriterionIndex === verifiedList.length - 1}
                      onClick={() => setSelectedCriterionIndex((prev) => (prev !== null && prev < verifiedList.length - 1 ? prev + 1 : verifiedList.length - 1))}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {isHindi ? "अगला" : "Next"} →
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedCriterionIndex(null)}
                    className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold shadow-md active:scale-95 transition-transform cursor-pointer"
                  >
                    {isHindi ? "पूर्ण" : "Done"}
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </section>
  );
};

