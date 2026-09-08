import React, { useState, useRef, useEffect } from "react";
import {
  BookOpen,
  CheckCircle2,
  Lock,
  PlayCircle,
  HelpCircle,
  Cpu,
  Target,
  FileCheck,
  ChevronDown,
  ChevronUp,
  Clock,
  Sparkles,
  Award,
  AlertCircle,
  ArrowRight,
  X,
  Check,
  Zap,
  Play,
  ShieldCheck,
  ScanLine,
  MapPin,
  Snowflake,
  PackageCheck,
  Boxes,
  ShoppingCart,
  AlertTriangle,
  Trophy,
  User,
  MoreHorizontal,
  Lightbulb,
  Tv,
  Volume2,
  Video,
  Thermometer,
  Wifi,
  Plus,
  Languages,
  ChevronRight,
  Phone,
} from "lucide-react";
import { NewHire, TrainingModule, ModuleActivity, DARK_STORE_CAPABILITIES } from "../types";
import { MANDATORY_TRAINING_MODULES } from "../data/modulesData";
import { ActiveTab } from "./Header";
import { LearnerSection } from "./FloatingGlassMenu";

interface ModulesViewProps {
  newHire: NewHire;
  onUpdateHire?: (updatedHire: NewHire) => void;
  isHindi?: boolean;
  onToggleLanguage?: () => void;
  onSelectTab?: (tab: ActiveTab) => void;
  onOpenBuddy?: () => void;
  onOpenTelemetryDial?: () => void;
  onSelectSection?: (section: LearnerSection) => void;
}

export const ModulesView: React.FC<ModulesViewProps> = ({
  newHire,
  onUpdateHire,
  isHindi = false,
  onToggleLanguage,
  onSelectTab,
  onOpenBuddy,
  onOpenTelemetryDial,
  onSelectSection,
}) => {
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(
    `lms-mod-0${Math.min(10, Math.max(1, (newHire.modulesCompleted || 3) + 1))}`
  );
  const [activeDetailModule, setActiveDetailModule] = useState<TrainingModule | null>(null);
  const [activeActivityModal, setActiveActivityModal] = useState<{
    module: TrainingModule;
    activity: ModuleActivity;
  } | null>(null);

  const [quizAnswerSelected, setQuizAnswerSelected] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [practiceChecked, setPracticeChecked] = useState<boolean>(false);

  // Quick Action Sheet modal
  const [isQuickActionOpen, setIsQuickActionOpen] = useState<boolean>(false);

  // Three dots menu dropdown state
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Filter state for pillars: "all" | "foundation" | "floor" | "cert"
  const [pillarFilter, setPillarFilter] = useState<"all" | "foundation" | "floor" | "cert">("all");

  // Secondary modal for Quick Tools: "video_guide" | "audio_brief" | "records" | "tips" | null
  const [quickToolModal, setQuickToolModal] = useState<
    "video_guide" | "audio_brief" | "records" | "tips" | null
  >(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  const modulesCompletedCount = newHire.modulesCompleted ?? 3;
  const completedIds = newHire.completedModuleIds || [
    "lms-mod-01",
    "lms-mod-02",
    "lms-mod-03",
  ];
  const quizAvg = newHire.quizAverageScore ?? 94;
  const firstName = (newHire.name || "Rahul").split(" ")[0];

  const handleCompleteActivity = (modId: string, actId: string) => {
    const mod = MANDATORY_TRAINING_MODULES.find((m) => m.id === modId);
    if (!mod) return;

    if (!completedIds.includes(modId)) {
      const updatedCompletedIds = [...completedIds, modId];
      const newCompletedCount = updatedCompletedIds.length;

      const updatedCapabilities = { ...(newHire.capabilities || {}) };
      mod.mappedCapabilityIds.forEach((capId) => {
        if (!updatedCapabilities[capId]) {
          updatedCapabilities[capId] = {
            capabilityId: capId,
            exposure: "exposed",
            evidence: "none",
            performance: "unknown",
            mastery: "in_progress",
            lastAssessedAt: `Day ${mod.dayNumber} LMS Module`,
            reinforcementCount: 0,
          };
        } else if (updatedCapabilities[capId].exposure === "not_exposed") {
          updatedCapabilities[capId] = {
            ...updatedCapabilities[capId],
            exposure: "exposed",
          };
        }
      });

      const updatedHire: NewHire = {
        ...newHire,
        modulesCompleted: newCompletedCount,
        completedModuleIds: updatedCompletedIds,
        capabilities: updatedCapabilities,
      };

      if (onUpdateHire) {
        onUpdateHire(updatedHire);
      }
    }

    setActiveActivityModal(null);
  };

  const getActivityIcon = (type: ModuleActivity["type"]) => {
    switch (type) {
      case "video":
        return <PlayCircle className="w-4 h-4 text-blue-600" />;
      case "quiz":
        return <HelpCircle className="w-4 h-4 text-purple-600" />;
      case "simulation":
        return <Cpu className="w-4 h-4 text-emerald-600" />;
      case "practice":
        return <Target className="w-4 h-4 text-amber-600" />;
      case "assessment":
        return <FileCheck className="w-4 h-4 text-rose-600" />;
    }
  };

  const getActivityTypeName = (type: ModuleActivity["type"]) => {
    switch (type) {
      case "video":
        return isHindi ? "वीडियो पाठ" : "Video Lesson";
      case "quiz":
        return isHindi ? "इंटरएक्टिव क्विज" : "Interactive Quiz";
      case "simulation":
        return isHindi ? "फ्लोर सिमुलेशन" : "Floor Simulation";
      case "practice":
        return isHindi ? "प्रैक्टिकल ड्रिल" : "Floor Practice Drill";
      case "assessment":
        return isHindi ? "मॉड्यूल मूल्यांकन" : "Module Assessment";
    }
  };

  // Filter modules based on selected pillar
  const displayedModules = MANDATORY_TRAINING_MODULES.filter((m) => {
    if (pillarFilter === "foundation") return m.dayNumber <= 3;
    if (pillarFilter === "floor") return m.dayNumber >= 4 && m.dayNumber <= 7;
    if (pillarFilter === "cert") return m.dayNumber >= 8;
    return true;
  });

  const nextModuleToStudy =
    MANDATORY_TRAINING_MODULES.find((m) => m.dayNumber === modulesCompletedCount + 1) ||
    MANDATORY_TRAINING_MODULES[0];

  const getModuleIcon = (dayNumber: number) => {
    switch (dayNumber) {
      case 1:
        return ShieldCheck;
      case 2:
        return ScanLine;
      case 3:
        return Snowflake;
      case 4:
        return ShoppingCart;
      case 5:
        return Boxes;
      case 6:
        return PackageCheck;
      case 7:
        return Zap;
      case 8:
        return FileCheck;
      case 9:
        return Target;
      case 10:
        return Trophy;
      default:
        return BookOpen;
    }
  };

  const getModuleShortTitle = (dayNumber: number) => {
    switch (dayNumber) {
      case 1:
        return isHindi ? "सुरक्षा व PPE" : "Safety & PPE";
      case 2:
        return isHindi ? "PDA बारकोड" : "PDA Scan";
      case 3:
        return isHindi ? "कोल्ड चेन" : "Cold Chain";
      case 4:
        return isHindi ? "हाई पिकिंग" : "Fast Picking";
      case 5:
        return isHindi ? "मल्टी टोट्स" : "Batch Totes";
      case 6:
        return isHindi ? "पैकेजिंग" : "Bag & Care";
      case 7:
        return isHindi ? "स्पीड ड्रिल" : "Speed Drill";
      case 8:
        return isHindi ? "क्वालिटी चेक" : "QA & Audit";
      case 9:
        return isHindi ? "रश ऑवर्स" : "Peak Rush";
      case 10:
        return isHindi ? "सर्टिफिकेशन" : "Final Cert";
      default:
        return `Day ${dayNumber}`;
    }
  };

  const getModuleCardStyle = (isCurrent: boolean, isCompleted: boolean) => {
    // 1. Completed: Apple iOS blue
    if (isCompleted) {
      return "bg-[#007AFF] text-white shadow-md shadow-[#007AFF]/25 hover:bg-[#0071E3] border border-blue-400/30";
    }
    // 2. Current module: Purple, blinking
    if (isCurrent) {
      return "bg-[#7C3AED] text-white shadow-lg shadow-purple-600/40 animate-module-blink ring-2 ring-purple-300 hover:bg-[#6D28D9]";
    }
    // 3. Not started / locked: Light grey
    return "bg-[#EFEFF4] text-slate-700 border border-slate-200/90 shadow-2xs hover:bg-[#E5E5EA]";
  };

  return (
    <div className="max-w-md mx-auto pb-28 select-none bg-slate-50 min-h-screen">
      {/* ========================================================= */}
      {/* 1. TOP LIVE GRADIENT HERO BANNER (MATCHING ATTACHMENT)     */}
      {/* ========================================================= */}
      <div
        id="modules-hero-banner"
        className="w-full live-gradient-bg rounded-b-[36px] shadow-2xl shadow-purple-950/25 text-white pt-3 pb-6 px-4 sm:px-5 relative overflow-hidden"
      >
        {/* Animated Fluid Mesh Orbs (Live gradient motion matching attachment) */}
        <div
          className="absolute -top-12 -left-12 w-56 h-56 rounded-full bg-[#7C3AED]/40 blur-3xl pointer-events-none animate-orb-1"
          aria-hidden="true"
        />
        <div
          className="absolute top-1/4 -right-12 w-64 h-64 rounded-full bg-[#0066FF]/50 blur-3xl pointer-events-none animate-orb-2"
          aria-hidden="true"
        />
        <div
          className="absolute -bottom-16 left-1/3 w-72 h-72 rounded-full bg-[#00D4FF]/45 blur-3xl pointer-events-none animate-orb-3"
          aria-hidden="true"
        />

        {/* Top Subtle Pill Notch (matching phone screen bar in screenshot) */}
        <div className="w-12 h-1 bg-white/30 rounded-full mx-auto mb-3 relative z-10" />

        {/* Top Right Three Dots Menu Button */}
        <div className="absolute top-3 right-4 z-20" ref={menuRef}>
          <button
            id="modules-menu-btn"
            type="button"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className="p-1.5 rounded-full text-white/85 hover:text-white hover:bg-white/15 transition-all cursor-pointer active:scale-95"
            title="Options Menu"
          >
            <MoreHorizontal className="w-6 h-6 stroke-[2.5]" />
          </button>

          {/* Three dots dropdown */}
          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-white text-slate-900 border border-slate-200 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-1 border-b border-slate-100 flex items-center justify-between text-[10px] font-black uppercase text-slate-400">
                <span>Modules Options</span>
              </div>
              {onToggleLanguage && (
                <button
                  type="button"
                  onClick={() => {
                    onToggleLanguage();
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 flex items-center justify-between cursor-pointer"
                >
                  <span>Language</span>
                  <span className="text-purple-600 font-black">{isHindi ? "हिंदी (Hindi)" : "English"}</span>
                </button>
              )}
              {onSelectTab && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      onSelectTab("manager");
                      setIsMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 flex items-center justify-between cursor-pointer"
                  >
                    <span>Supervisor View</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onSelectTab("organization");
                      setIsMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 flex items-center justify-between cursor-pointer"
                  >
                    <span>Store Operations</span>
                  </button>
                </>
              )}
              <button
                type="button"
                onClick={() => {
                  setPillarFilter("all");
                  setIsMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 flex items-center justify-between cursor-pointer"
              >
                <span>Show All 10 Modules</span>
              </button>
            </div>
          )}
        </div>

        {/* Center Circular White Avatar with Purple User Silhouette */}
        <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-white shadow-xl shadow-purple-950/25 flex items-center justify-center mx-auto mt-2">
          <User className="w-9 h-9 sm:w-10 sm:h-10 text-[#6015d8] fill-[#6015d8]" />
        </div>

        {/* Center Title: "Jane's Home" style -> "{firstName}'s Modules" */}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white text-center tracking-tight mt-3">
          {isHindi ? `${firstName} के मॉड्यूल्स` : `${firstName}’s Modules`}
        </h1>

        {/* Subtitle: "Connected Divices" style -> "Connected Modules" */}
        <p className="text-xs sm:text-sm text-purple-200/90 font-medium text-center mt-0.5">
          {isHindi ? "संबद्ध ट्रेनिंग मॉड्यूल्स" : "Connected Modules"}
        </p>

        {/* 4 Small Circular Icon Buttons in a Row (💡, 📺, 🔊, 📹) */}
        <div className="flex items-center justify-center gap-3.5 pt-3.5 pb-1">
          {/* 1. Bulb: Knowledge Tips */}
          <button
            type="button"
            onClick={() => setQuickToolModal("tips")}
            className="w-9 h-9 rounded-full border border-white/35 bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center text-white cursor-pointer transition-all shadow-xs"
            title="Knowledge & SOP Tips"
          >
            <Lightbulb className="w-4 h-4 text-white stroke-[2]" />
          </button>

          {/* 2. TV / Screen: Video Lessons */}
          <button
            type="button"
            onClick={() => setQuickToolModal("video_guide")}
            className="w-9 h-9 rounded-full border border-white/35 bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center text-white cursor-pointer transition-all shadow-xs"
            title="Video Lessons"
          >
            <Tv className="w-4 h-4 text-white stroke-[2]" />
          </button>

          {/* 3. Speaker / Megaphone: Audio Flashcards */}
          <button
            type="button"
            onClick={() => setQuickToolModal("audio_brief")}
            className="w-9 h-9 rounded-full border border-white/35 bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center text-white cursor-pointer transition-all shadow-xs"
            title="Audio Briefs"
          >
            <Volume2 className="w-4 h-4 text-white stroke-[2]" />
          </button>

          {/* 4. Video Camera: Simulation */}
          <button
            type="button"
            onClick={() => {
              const simAct = nextModuleToStudy.activities.find((a) => a.type === "simulation") || nextModuleToStudy.activities[0];
              setActiveActivityModal({ module: nextModuleToStudy, activity: simAct });
            }}
            className="w-9 h-9 rounded-full border border-white/35 bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center text-white cursor-pointer transition-all shadow-xs"
            title="Floor Simulation"
          >
            <Video className="w-4 h-4 text-white stroke-[2]" />
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. BODY CONTENT (LIGHT CANVAS WITH OVERVIEW, ROOMS, SECURITY)*/}
      {/* ========================================================= */}
      <div className="px-4 pt-4 space-y-4">
        {/* --------------------------------------------------------- */}
        {/* SECTION 1: OVERVIEW (3-COLUMN WHITE CARD WITH LINE ICONS)  */}
        {/* --------------------------------------------------------- */}
        <div className="space-y-2">
          <h3 className="text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-wider px-1">
            {isHindi ? "अवलोकन (Overview)" : "Overview"}
          </h3>

          <div
            id="modules-overview-card"
            className="bg-white rounded-[24px] p-4 sm:p-5 shadow-sm border border-slate-150/80 grid grid-cols-3 gap-2 text-center"
          >
            {/* Column 1: Thermometer / Pace Gauge Icon */}
            <div className="flex flex-col items-center justify-center px-1">
              <div className="p-1 text-purple-600 mb-1">
                <Thermometer className="w-6 h-6 stroke-[1.8]" />
              </div>
              <div className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                {Math.round((modulesCompletedCount / 10) * 100)}%
              </div>
              <div className="text-[10px] sm:text-[11px] text-slate-400 font-semibold leading-tight mt-1 line-clamp-2">
                {isHindi ? "कोर्स प्रगति" : "Course Progress"}
              </div>
            </div>

            {/* Column 2: Droplet with Plus Line Icon */}
            <div className="flex flex-col items-center justify-center px-1 border-x border-slate-100">
              <div className="p-1 text-purple-600 mb-1">
                <svg
                  className="w-6 h-6 stroke-[1.8]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
                  <path d="M12 9v6" />
                  <path d="M9 12h6" />
                </svg>
              </div>
              <div className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                {quizAvg}%
              </div>
              <div className="text-[10px] sm:text-[11px] text-slate-400 font-semibold leading-tight mt-1 line-clamp-2">
                {isHindi ? "क्विज सटीकता" : "Quiz Accuracy"}
              </div>
            </div>

            {/* Column 3: Wi-Fi / Beacon Signal Line Icon */}
            <div className="flex flex-col items-center justify-center px-1">
              <div className="p-1 text-purple-600 mb-1">
                <Wifi className="w-6 h-6 stroke-[1.8]" />
              </div>
              <div className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                {Math.max(1, 10 - modulesCompletedCount)}
              </div>
              <div className="text-[10px] sm:text-[11px] text-slate-400 font-semibold leading-tight mt-1 line-clamp-2">
                {isHindi ? "सक्रिय ड्रिल" : "Active Drills"}
              </div>
            </div>
          </div>
        </div>

        {/* --------------------------------------------------------- */}
        {/* SECTION 2: 10-DAY MODULE LIST IN 3-GRID PLACEMENT         */}
        {/* --------------------------------------------------------- */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-wider">
                {isHindi ? "दैनिक मॉड्यूल ग्रिड" : "Daily Modules"}
              </h3>
              <span className="text-[10px] font-black text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full border border-purple-200">
                {modulesCompletedCount}/10 {isHindi ? "पूर्ण" : "Done"}
              </span>
            </div>
            {pillarFilter !== "all" && (
              <button
                type="button"
                onClick={() => setPillarFilter("all")}
                className="text-xs font-bold text-purple-600 hover:text-purple-700 cursor-pointer"
              >
                {isHindi ? "सभी 10 देखें" : "Show All 10"}
              </button>
            )}
          </div>

          {/* Quick Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            <button
              type="button"
              onClick={() => setPillarFilter("all")}
              className={`px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer whitespace-nowrap transition-all ${
                pillarFilter === "all"
                  ? "bg-purple-600 text-white shadow-xs"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
              }`}
            >
              {isHindi ? "सभी (10)" : "All (10)"}
            </button>
            <button
              type="button"
              onClick={() => setPillarFilter(pillarFilter === "foundation" ? "all" : "foundation")}
              className={`px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer whitespace-nowrap transition-all ${
                pillarFilter === "foundation"
                  ? "bg-pink-600 text-white shadow-xs"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
              }`}
            >
              {isHindi ? "फाउंडेशन (D1-3)" : "Foundation (D1-3)"}
            </button>
            <button
              type="button"
              onClick={() => setPillarFilter(pillarFilter === "floor" ? "all" : "floor")}
              className={`px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer whitespace-nowrap transition-all ${
                pillarFilter === "floor"
                  ? "bg-purple-700 text-white shadow-xs"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
              }`}
            >
              {isHindi ? "फ्लोर पिक (D4-7)" : "Floor Pick (D4-7)"}
            </button>
            <button
              type="button"
              onClick={() => setPillarFilter(pillarFilter === "cert" ? "all" : "cert")}
              className={`px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer whitespace-nowrap transition-all ${
                pillarFilter === "cert"
                  ? "bg-indigo-900 text-white shadow-xs"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
              }`}
            >
              {isHindi ? "सर्टिफिकेशन (D8-10)" : "Cert (D8-10)"}
            </button>
          </div>

          {/* 3-GRID OF DAILY MODULE SQUIRCLE CARDS (SAME SIZE AS ROOM CARDS) */}
          <div className="grid grid-cols-3 gap-3">
            {displayedModules.map((mod) => {
              const isCompleted = completedIds.includes(mod.id);
              const isCurrent = !isCompleted && mod.dayNumber === modulesCompletedCount + 1;
              const IconComp = getModuleIcon(mod.dayNumber);
              const cardStyle = getModuleCardStyle(isCurrent, isCompleted);

              return (
                <button
                  key={mod.id}
                  id={`daily-module-card-${mod.dayNumber}`}
                  type="button"
                  onClick={() => {
                    setSelectedModuleId(mod.id);
                    setActiveDetailModule(mod);
                  }}
                  className={`rounded-[22px] p-3 aspect-square flex flex-col items-center justify-center gap-2.5 transition-all cursor-pointer active:scale-95 relative overflow-hidden text-center ${cardStyle}`}
                >
                  {/* Center: Module Topic Icon */}
                  <div className={`flex items-center justify-center ${
                    isCompleted || isCurrent ? "text-white" : "text-slate-400"
                  }`}>
                    <IconComp className="w-7 h-7 sm:w-8 sm:h-8 stroke-[2] drop-shadow-xs" />
                  </div>

                  {/* Module Title */}
                  <span className={`block text-[11px] sm:text-xs font-bold leading-tight px-1 line-clamp-2 ${
                    isCompleted || isCurrent ? "text-white" : "text-slate-700"
                  }`}>
                    {getModuleShortTitle(mod.dayNumber)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* --------------------------------------------------------- */}
        {/* SECTION 3: SECURITY / RESOURCES (3 WHITE CARDS IN ROW)    */}
        {/* --------------------------------------------------------- */}
        <div className="space-y-2">
          <h3 className="text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-wider px-1">
            {isHindi ? "सुरक्षा व संसाधन" : "Security"}
          </h3>

          <div
            id="modules-security-card"
            className="bg-white rounded-[24px] p-4 sm:p-5 shadow-sm border border-slate-150/80 grid grid-cols-3 gap-2 text-center"
          >
            {/* Item 1: CCTV Overview */}
            <button
              type="button"
              onClick={() => setQuickToolModal("video_guide")}
              className="flex flex-col items-center justify-center p-2 rounded-2xl hover:bg-purple-50/60 active:scale-95 transition-all cursor-pointer"
            >
              {/* CCTV Camera Line Icon matching reference image */}
              <div className="text-purple-700 mb-1">
                <svg
                  className="w-7 h-7 stroke-[1.8]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <rect x="2" y="7" width="13" height="10" rx="2" />
                  <path d="M15 10l5-3v10l-5-3" />
                  <circle cx="8.5" cy="12" r="1.5" />
                </svg>
              </div>
              <span className="text-xs font-bold text-slate-800 leading-tight">
                {isHindi ? "सीसीटीवी वॉक" : "CCTV"}
              </span>
              <span className="text-[10px] text-slate-400 font-semibold">Overview</span>
            </button>

            {/* Item 2: Alarm / Audio Lessons */}
            <button
              type="button"
              onClick={() => setQuickToolModal("audio_brief")}
              className="flex flex-col items-center justify-center p-2 rounded-2xl hover:bg-purple-50/60 active:scale-95 transition-all cursor-pointer border-x border-slate-100"
            >
              {/* Horn / Alarm Line Icon matching reference image */}
              <div className="text-purple-700 mb-1">
                <svg
                  className="w-7 h-7 stroke-[1.8]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                </svg>
              </div>
              <span className="text-xs font-bold text-slate-800 leading-tight">
                {isHindi ? "अलार्म गाइड" : "Alarm"}
              </span>
              <span className="text-[10px] text-slate-400 font-semibold">Voice Drill</span>
            </button>

            {/* Item 3: Records / Video Reel */}
            <button
              type="button"
              onClick={() => setQuickToolModal("records")}
              className="flex flex-col items-center justify-center p-2 rounded-2xl hover:bg-purple-50/60 active:scale-95 transition-all cursor-pointer"
            >
              {/* Video Tape / Records Line Icon matching reference image */}
              <div className="text-purple-700 mb-1">
                <svg
                  className="w-7 h-7 stroke-[1.8]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <rect x="2" y="6" width="20" height="12" rx="2" />
                  <polygon points="10 9 15 12 10 15 10 9" />
                  <line x1="6" y1="6" x2="6" y2="18" />
                  <line x1="18" y1="6" x2="18" y2="18" />
                </svg>
              </div>
              <span className="text-xs font-bold text-slate-800 leading-tight">
                {isHindi ? "रिकॉर्ड्स" : "Records"}
              </span>
              <span className="text-[10px] text-slate-400 font-semibold">History</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. FLOATING PURPLE CIRCLE WITH "+" (MATCHING SCREENSHOT)   */}
      {/* ========================================================= */}
      <div className="fixed bottom-20 left-0 right-0 z-30 flex justify-center pointer-events-none">
        <button
          id="modules-floating-add-btn"
          type="button"
          onClick={() => setIsQuickActionOpen(true)}
          className="w-14 h-14 rounded-full bg-[#6015d8] text-white shadow-xl shadow-purple-900/35 flex items-center justify-center font-bold text-2xl border-4 border-white cursor-pointer active:scale-95 transition-all pointer-events-auto hover:bg-[#520ec0]"
          title="Quick Action"
        >
          <Plus className="w-7 h-7 stroke-[2.5]" />
        </button>
      </div>

      {/* ========================================================= */}
      {/* MODAL 1: QUICK ACTION SHEET (OPENED BY FLOATING "+")       */}
      {/* ========================================================= */}
      {isQuickActionOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-t-[32px] sm:rounded-3xl max-w-md w-full p-5 space-y-4 shadow-2xl border border-slate-100 animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-black">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-slate-900">
                    {isHindi ? "त्वरित एक्शन मेन्यू" : "Quick Learning Actions"}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {isHindi ? "आज के मुख्य अभ्यास" : "Direct shortcut to today's floor practice"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsQuickActionOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 pt-1">
              {/* Action 1: Continue Current Module */}
              <button
                type="button"
                onClick={() => {
                  setIsQuickActionOpen(false);
                  setActiveDetailModule(nextModuleToStudy);
                }}
                className="w-full p-3 rounded-2xl bg-purple-50/80 hover:bg-purple-100/80 border border-purple-200/80 flex items-center justify-between text-left cursor-pointer transition-all active:scale-98"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-purple-900 block">
                      {isHindi ? `दिन ${nextModuleToStudy.dayNumber} मॉड्यूल शुरू करें` : `Continue Day ${nextModuleToStudy.dayNumber} Module`}
                    </span>
                    <span className="text-[11px] text-purple-700/80 truncate block max-w-[220px]">
                      {isHindi && nextModuleToStudy.titleHi ? nextModuleToStudy.titleHi : nextModuleToStudy.title}
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-purple-600 shrink-0" />
              </button>

              {/* Action 2: 60-Second Quiz */}
              <button
                type="button"
                onClick={() => {
                  setIsQuickActionOpen(false);
                  const quizAct = nextModuleToStudy.activities.find((a) => a.type === "quiz") || nextModuleToStudy.activities[1];
                  setQuizAnswerSelected(null);
                  setQuizSubmitted(false);
                  setActiveActivityModal({ module: nextModuleToStudy, activity: quizAct });
                }}
                className="w-full p-3 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 flex items-center justify-between text-left cursor-pointer transition-all active:scale-98"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center shrink-0">
                    <HelpCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-slate-900 block">
                      {isHindi ? "60-सेकंड नॉलेज क्विज" : "60-Second Knowledge Quiz"}
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      {isHindi ? "सटीक पिकिंग और बारकोड नियम" : "Aisle coordinates & barcode scanning"}
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
              </button>

              {/* Action 3: Watch SOP Video */}
              <button
                type="button"
                onClick={() => {
                  setIsQuickActionOpen(false);
                  setQuickToolModal("video_guide");
                }}
                className="w-full p-3 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 flex items-center justify-between text-left cursor-pointer transition-all active:scale-98"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center shrink-0">
                    <PlayCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-slate-900 block">
                      {isHindi ? "फ्लोर सेफ्टी वीडियो देखें" : "Watch Floor Safety Video"}
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      {isHindi ? "सुरक्षित पिकिंग और टोट पैकिंग" : "Safe rack navigation & tote handling"}
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
              </button>

              {/* Action 4: Ask Buddy for Practice */}
              {onOpenBuddy && (
                <button
                  type="button"
                  onClick={() => {
                    setIsQuickActionOpen(false);
                    onOpenBuddy();
                  }}
                  className="w-full p-3 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 flex items-center justify-between text-left cursor-pointer transition-all active:scale-98"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-black text-slate-900 block">
                        {isHindi ? "सीनियर बडी विक्रम से पूछें" : "Ask Senior Buddy Vikram"}
                      </span>
                      <span className="text-[11px] text-slate-500 block">
                        {isHindi ? "फ्लोर पर लाइव सहायता व अभ्यास" : "Live guidance & aisle escort on floor"}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: QUICK TOOL (VIDEO, AUDIO, RECORDS, TIPS)          */}
      {/* ========================================================= */}
      {quickToolModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-black text-slate-900">
                {quickToolModal === "video_guide" && (isHindi ? "सीसीटीवी वॉक व वीडियो" : "CCTV Walk & Video")}
                {quickToolModal === "audio_brief" && (isHindi ? "ऑडियो ब्रीफ व अलार्म" : "Audio Briefs & Alarms")}
                {quickToolModal === "records" && (isHindi ? "क्विज रिकॉर्ड्स व सर्टिफिकेशन" : "Training Records")}
                {quickToolModal === "tips" && (isHindi ? "फ्लोर टिप्स व SOP" : "Floor SOP & Quick Tips")}
              </h3>
              <button
                type="button"
                onClick={() => setQuickToolModal(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {quickToolModal === "video_guide" && (
              <div className="space-y-3">
                <div className="aspect-video bg-slate-950 rounded-2xl flex flex-col items-center justify-center text-white p-4 text-center relative overflow-hidden">
                  <PlayCircle className="w-12 h-12 text-purple-400 mb-2 animate-pulse" />
                  <span className="font-bold text-xs">{nextModuleToStudy.title}</span>
                  <span className="text-[10px] text-slate-400">Duration: 4.5 minutes</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {isHindi
                    ? "यह वीडियो डार्क स्टोर के प्रमुख गलियारों, कोल्ड रूम सुरक्षा और बारकोड स्कैनर के सही उपयोग को समझाता है।"
                    : "This standard SOP walkthrough covers dark store aisle coordinates, shelf height safety, and ring scanner orientation."}
                </p>
                <button
                  type="button"
                  onClick={() => setQuickToolModal(null)}
                  className="w-full py-2.5 bg-purple-600 text-white rounded-xl text-xs font-bold"
                >
                  {isHindi ? "वीडियो देखा गया 👍" : "Mark Watched 👍"}
                </button>
              </div>
            )}

            {quickToolModal === "audio_brief" && (
              <div className="space-y-3">
                <div className="p-4 bg-purple-50 rounded-2xl border border-purple-200 flex items-center gap-3">
                  <Volume2 className="w-8 h-8 text-purple-600 shrink-0" />
                  <div>
                    <h4 className="text-xs font-black text-purple-900">
                      {isHindi ? "ऑडियो फ्लैशकार्ड 04: कोल्ड चेन अलार्म" : "Audio Flashcard 04: Cold Chain"}
                    </h4>
                    <p className="text-[11px] text-purple-700">
                      {isHindi ? "डेयरी और फ्रोजन आइटम्स का 90-सेकंड नियम" : "The 90-second cold room retrieval protocol"}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {isHindi
                    ? "अलार्म बजने पर तुरंत टोट बंद करें और आइसल 8 के डीप फ्रीजर शेल्फ पर वापस जाएं।"
                    : "Always latch freezer doors immediately after picking ice cream tubs to avoid condensation alarms."}
                </p>
                <button
                  type="button"
                  onClick={() => setQuickToolModal(null)}
                  className="w-full py-2.5 bg-purple-600 text-white rounded-xl text-xs font-bold"
                >
                  {isHindi ? "सुना गया ✓" : "Heard ✓"}
                </button>
              </div>
            )}

            {quickToolModal === "records" && (
              <div className="space-y-3">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5 text-xs">
                  <div className="flex justify-between font-bold text-slate-800">
                    <span>Average Quiz Score:</span>
                    <span className="text-purple-600 font-black">{quizAvg}%</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-800">
                    <span>Modules Finished:</span>
                    <span className="text-emerald-600 font-black">{modulesCompletedCount} / 10</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-800">
                    <span>Capabilities Exposed:</span>
                    <span className="text-blue-600 font-black">
                      {Object.keys(newHire.capabilities || {}).length} / 12
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setQuickToolModal(null)}
                  className="w-full py-2.5 bg-purple-600 text-white rounded-xl text-xs font-bold"
                >
                  {isHindi ? "बंद करें" : "Close"}
                </button>
              </div>
            )}

            {quickToolModal === "tips" && (
              <div className="space-y-3">
                <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 space-y-1 text-xs">
                  <span className="font-bold text-amber-900 block">
                    {isHindi ? "💡 आज की प्रो टिप (Pro Tip):" : "💡 Picker Pro Tip:"}
                  </span>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    {isHindi
                      ? "रैक से सामान निकालते समय रिंग स्कैनर को अपनी तर्जनी उंगली पर सही कोण पर रखें। इससे 1.5 सेकंड प्रति पिक की बचत होती है।"
                      : "Angle your finger-ring scanner 45 degrees towards the tote barcode while walking to shave 1.5 seconds off every scan."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setQuickToolModal(null)}
                  className="w-full py-2.5 bg-purple-600 text-white rounded-xl text-xs font-bold"
                >
                  {isHindi ? "समझ गया" : "Got it!"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: MODULE DETAIL MODAL                               */}
      {/* ========================================================= */}
      {activeDetailModule && (
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-4 sm:p-5 shadow-2xl border border-slate-100 max-h-[88vh] overflow-y-auto space-y-4 animate-in fade-in zoom-in duration-150">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-purple-100 text-purple-800">
                    Day {activeDetailModule.dayNumber} • {activeDetailModule.code}
                  </span>
                  <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {activeDetailModule.durationMinutes} min
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 mt-1">
                  {isHindi && activeDetailModule.titleHi ? activeDetailModule.titleHi : activeDetailModule.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveDetailModule(null)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {isHindi && activeDetailModule.descriptionHi
                ? activeDetailModule.descriptionHi
                : activeDetailModule.description}
            </p>

            {/* Capability mapping tag */}
            <div className="flex items-center gap-1.5 text-xs text-purple-800 bg-purple-50 px-3 py-2 rounded-xl border border-purple-100">
              <Zap className="w-3.5 h-3.5 shrink-0 text-purple-600" />
              <span>
                <strong className="font-bold">{isHindi ? "हुनर संबंध:" : "Maps to:"}</strong>{" "}
                {activeDetailModule.mappedCapabilityIds
                  .map((cid) => {
                    const cap = DARK_STORE_CAPABILITIES.find((c) => c.id === cid);
                    return cap ? cap.name : `Cap ${cid}`;
                  })
                  .join(", ")}
              </span>
            </div>

            {/* 5 Activities */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400 px-0.5">
                <span>{isHindi ? "मॉड्यूल गतिविधियां:" : "Module Activities:"}</span>
                <span>{activeDetailModule.activities.length} tasks</span>
              </div>

              {activeDetailModule.activities.map((act) => {
                const isModCompleted = completedIds.includes(activeDetailModule.id);
                const isActCompleted = isModCompleted || act.completed;
                const isModLocked =
                  !isModCompleted &&
                  activeDetailModule.dayNumber > modulesCompletedCount + 1;

                return (
                  <div
                    key={act.id}
                    onClick={() => {
                      if (!isModLocked) {
                        setQuizAnswerSelected(null);
                        setQuizSubmitted(false);
                        setPracticeChecked(false);
                        setActiveActivityModal({ module: activeDetailModule, activity: act });
                      }
                    }}
                    className={`p-3 rounded-2xl flex items-center justify-between transition-all cursor-pointer ${
                      isModLocked
                        ? "bg-slate-100/50 opacity-60 cursor-not-allowed"
                        : isActCompleted
                        ? "bg-white border border-slate-200 hover:border-purple-300 shadow-2xs"
                        : "bg-white border border-purple-200 hover:border-purple-400 shadow-xs"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 shrink-0">
                        {getActivityIcon(act.type)}
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold text-slate-400 block uppercase">
                          {getActivityTypeName(act.type)}
                        </span>
                        <span className="text-xs sm:text-sm font-bold text-slate-900 leading-tight block truncate">
                          {isHindi && act.titleHi ? act.titleHi : act.title}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      {act.score !== undefined && (
                        <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                          {act.score}%
                        </span>
                      )}
                      {isActCompleted ? (
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                          ✓ {isHindi ? "पूर्ण" : "Done"}
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-purple-700 bg-purple-50 px-3 py-1 rounded-full hover:bg-purple-100">
                          {isHindi ? "शुरू करें →" : "Start →"}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Complete Module Button if Current */}
            {activeDetailModule.dayNumber === modulesCompletedCount + 1 && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    handleCompleteActivity(activeDetailModule.id, activeDetailModule.activities[4].id);
                    setActiveDetailModule(null);
                  }}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 text-white rounded-2xl text-xs font-bold shadow-md hover:opacity-95 cursor-pointer active:scale-98 transition-all flex items-center justify-center gap-2"
                >
                  <Award className="w-4 h-4" />
                  <span>
                    {isHindi
                      ? `डे ${activeDetailModule.dayNumber} मॉड्यूल पूरा मार्क करें`
                      : `Complete Day ${activeDetailModule.dayNumber} Module`}
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 4: INTERACTIVE ACTIVITY MODAL (QUIZ, VIDEO, ETC.)   */}
      {/* ========================================================= */}
      {activeActivityModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-4 sm:p-5 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-purple-600 text-white flex items-center justify-center">
                  {getActivityIcon(activeActivityModal.activity.type)}
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">
                    {activeActivityModal.module.code} • {getActivityTypeName(activeActivityModal.activity.type)}
                  </span>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-1">
                    {isHindi && activeActivityModal.activity.titleHi
                      ? activeActivityModal.activity.titleHi
                      : activeActivityModal.activity.title}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setActiveActivityModal(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* VIDEO ACTIVITY CONTENT */}
            {activeActivityModal.activity.type === "video" && (
              <div className="space-y-3 text-xs text-slate-700">
                <div className="aspect-video bg-slate-900 rounded-2xl flex flex-col items-center justify-center text-white p-4 text-center relative overflow-hidden">
                  <PlayCircle className="w-10 h-10 text-purple-400 mb-1 animate-pulse" />
                  <span className="font-bold text-xs">{activeActivityModal.activity.title}</span>
                  <span className="text-[10px] text-slate-400">
                    Duration: {activeActivityModal.activity.durationMinutes} mins
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  <span className="font-bold text-slate-900 block">
                    {isHindi ? "वीडियो सारांश व मुख्य नियम:" : "Key Takeaways:"}
                  </span>
                  <p className="text-[11px] text-slate-600 leading-snug">
                    {isHindi
                      ? "1. हमेशा सेफ्टी शूज व ग्लव्स पहनें। 2. रैक से सामान उठाते समय नंबर क्रॉस-वेरिफाई करें।"
                      : "1. Follow standard aisle traffic rules. 2. Verify shelf rack-bay coordinates before picking."}
                  </p>
                </div>
                <button
                  onClick={() => setActiveActivityModal(null)}
                  className="w-full py-2.5 bg-slate-900 text-white rounded-2xl text-xs font-bold cursor-pointer"
                >
                  {isHindi ? "पाठ पूरा हुआ 👍" : "Mark Video Watched 👍"}
                </button>
              </div>
            )}

            {/* QUIZ ACTIVITY CONTENT */}
            {activeActivityModal.activity.type === "quiz" && (
              <div className="space-y-3 text-xs text-slate-700">
                <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-2xl space-y-1">
                  <span className="font-bold text-purple-950 block">
                    {isHindi ? "प्रश्न 1:" : "Question 1 of 1:"}
                  </span>
                  <p className="text-xs font-medium text-purple-900">
                    {isHindi
                      ? "टोट पैक करते समय भारी सामान (जैसे आटा, तेल) कहां रखना चाहिए?"
                      : "When packing a tote, where should heavy items (flour, oil cans) always be placed?"}
                  </p>
                </div>

                <div className="space-y-1.5">
                  {[
                    { en: "At the very bottom of the tote", hi: "टोट के सबसे नीचे तली में" },
                    { en: "On top of bread and eggs", hi: "ब्रेड और अंडों के ऊपर" },
                    { en: "In any random order", hi: "बिना किसी क्रम के कहीं भी" },
                  ].map((opt, idx) => (
                    <button
                      key={idx}
                      onClick={() => setQuizAnswerSelected(idx)}
                      className={`w-full p-2.5 rounded-2xl border text-left text-xs font-medium transition-all cursor-pointer ${
                        quizAnswerSelected === idx
                          ? "bg-purple-600 text-white border-purple-600 shadow-xs"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {idx === 0 ? "A" : idx === 1 ? "B" : "C"}. {isHindi ? opt.hi : opt.en}
                    </button>
                  ))}
                </div>

                {quizAnswerSelected !== null && !quizSubmitted && (
                  <button
                    onClick={() => setQuizSubmitted(true)}
                    className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl text-xs font-bold cursor-pointer"
                  >
                    {isHindi ? "उत्तर जमा करें" : "Submit Answer"}
                  </button>
                )}

                {quizSubmitted && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-1 text-center">
                    <span className="text-xs font-bold text-emerald-800 block">
                      {quizAnswerSelected === 0
                        ? isHindi
                          ? "✅ सही उत्तर! 100% स्कोर"
                          : "✅ Correct! 100% Score"
                        : isHindi
                        ? "❌ गलत उत्तर। भारी सामान हमेशा नीचे रहता है।"
                        : "❌ Incorrect. Heavy items always go at the bottom."}
                    </span>
                    <button
                      onClick={() => setActiveActivityModal(null)}
                      className="mt-1 px-4 py-1.5 bg-emerald-600 text-white rounded-full text-xs font-bold cursor-pointer"
                    >
                      {isHindi ? "जारी रखें" : "Continue"}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* SIMULATION ACTIVITY CONTENT */}
            {activeActivityModal.activity.type === "simulation" && (
              <div className="space-y-3 text-xs text-slate-700">
                <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-1">
                  <span className="font-bold text-emerald-950 block">
                    {isHindi ? "3D वर्चुअल सिमुलेशन टास्क:" : "Virtual Simulation Task:"}
                  </span>
                  <p className="text-[11px] text-emerald-900 leading-snug">
                    {isHindi
                      ? "आइसल 5, बे 2, शेल्फ B पर जाएं और 1 किलो चीनी का बारकोड स्कैन करें।"
                      : "Navigate to Aisle 5, Bay 2, Shelf B and aim scanner at 1kg Sugar pouch."}
                  </p>
                </div>
                <div className="p-4 bg-slate-900 text-emerald-400 rounded-2xl font-mono text-[11px] space-y-1">
                  <div>&gt; Locating bin: A05-B02-S02... OK</div>
                  <div>&gt; Aiming ring laser at SKU: 890123456... OK</div>
                  <div>&gt; Barcode verified: MATCH (1000g)</div>
                </div>
                <button
                  onClick={() => setActiveActivityModal(null)}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold cursor-pointer"
                >
                  {isHindi ? "सिमुलेशन पास हुआ ✅" : "Pass Simulation Step ✅"}
                </button>
              </div>
            )}

            {/* PRACTICE / ASSESSMENT CONTENT */}
            {(activeActivityModal.activity.type === "practice" ||
              activeActivityModal.activity.type === "assessment") && (
              <div className="space-y-3 text-xs text-slate-700">
                <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-2xl space-y-1">
                  <span className="font-bold text-purple-950 block">
                    {isHindi ? "फ्लोर प्रैक्टिकल चेकलिस्ट:" : "Floor Practice Verification:"}
                  </span>
                  <p className="text-[11px] text-purple-900 leading-snug">
                    {isHindi
                      ? "सीनियर बडी के साथ 10-मिनट का अभ्यास पूरा करें और चेकलिस्ट टिक करें।"
                      : "Perform practical drill with senior floor buddy and confirm completion."}
                  </p>
                </div>

                <label className="flex items-center gap-2.5 p-3 bg-white border border-slate-200 rounded-2xl cursor-pointer">
                  <input
                    type="checkbox"
                    checked={practiceChecked}
                    onChange={(e) => setPracticeChecked(e.target.checked)}
                    className="w-4 h-4 text-purple-600 rounded-md focus:ring-purple-500"
                  />
                  <span className="text-xs font-medium text-slate-800">
                    {isHindi
                      ? "मैंने सभी स्टेप्स बडी के साथ अभ्यास कर लिए हैं"
                      : "I have completed all drill steps with my buddy"}
                  </span>
                </label>

                <button
                  disabled={!practiceChecked}
                  onClick={() =>
                    handleCompleteActivity(
                      activeActivityModal.module.id,
                      activeActivityModal.activity.id
                    )
                  }
                  className="w-full py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-2xl text-xs font-bold disabled:opacity-40 cursor-pointer shadow-xs"
                >
                  {isHindi ? "ड्रिल पूर्ण मार्क करें ✅" : "Mark Activity Complete ✅"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
