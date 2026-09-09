import React, { useState } from "react";
import {
  Sparkles,
  Flame,
  CheckCircle2,
  Lock,
  ChevronRight,
  Volume2,
  Zap,
  BookOpen,
  Check,
  ShieldCheck,
  Target,
  Smile,
  ArrowRight,
  TrendingUp,
  Award,
} from "lucide-react";
import { NewHire } from "../types";
import {
  deriveLearnerRoadmap,
  determineAdaptiveCurrentPlan,
} from "../services/intelligence";
import { speakMessage, stopSpeaking } from "../utils/speech";

interface LearnerJourneyRoadmapProps {
  newHire: NewHire;
  currentDay: number;
  isHindi?: boolean;
  compact?: boolean;
  onNavigateToSection?: (section: "modules" | "buddy" | "dashboard") => void;
  onOpenWorkTools?: () => void;
  onSelectStage?: () => void;
}

export interface RoadmapLevelDef {
  levelNumber: number;
  targetDay: number;
  badge: string;
  badgeHi: string;
  title: string;
  titleHi: string;
  shortTitle: string;
  shortTitleHi: string;
  tagline: string;
  taglineHi: string;
  speedTarget: number;
  accuracyTarget: number;
  keySkills: string[];
  keySkillsHi: string[];
  unlockCriteria: string;
  unlockCriteriaHi: string;
}

export const RETAIL_CASHIER_ROADMAP_LEVELS: RoadmapLevelDef[] = [
  {
    levelNumber: 1,
    targetDay: 3,
    badge: "L1",
    badgeHi: "L1",
    title: "Level 1: Foundation Cashier",
    titleHi: "लेवल 1: बुनियादी कैशियर",
    shortTitle: "Foundation",
    shortTitleHi: "बुनियादी",
    tagline: "Mastering till safety, POS terminal login & fast optical scanning",
    taglineHi: "टिल सुरक्षा, पीओएस लॉगिन और तेज़ लेजर बारकोड स्कैनिंग",
    speedTarget: 10,
    accuracyTarget: 95,
    keySkills: [
      "Retail Counter Safety & POS Terminal Setup",
      "Fixed Scanner 45° Optical Sweep Alignment",
      "Cash Box Security & Key Lock Protocols",
    ],
    keySkillsHi: [
      "काउंटर सुरक्षा व पीओएस टर्मिनल सेटअप",
      "फिक्स्ड लेजर स्कैनर 45° अलाइनमेंट",
      "कैश बॉक्स सुरक्षा और चाबी लॉक नियम",
    ],
    unlockCriteria: "Complete Modules 1-2 with 95%+ scan accuracy",
    unlockCriteriaHi: "मॉड्यूल 1-2 पूरे करें और 95%+ स्कैन एक्यूरेसी दिखाएं",
  },
  {
    levelNumber: 2,
    targetDay: 5,
    badge: "L2",
    badgeHi: "L2",
    title: "Level 2: Core POS Cashier",
    titleHi: "लेवल 2: कोर पीओएस कैशियर",
    shortTitle: "Core Cashier",
    shortTitleHi: "कोर कैशियर",
    tagline: "Handling loose produce PLU lookup, digital scales & line voids",
    taglineHi: "सब्जी पीएलयू कोड, डिजिटल तराजू बिलिंग व वॉइड प्रक्रिया",
    speedTarget: 14,
    accuracyTarget: 98,
    keySkills: [
      "Manual Produce PLU Short-Key Lookup",
      "Digital Scale Tare Calibration & Weight Billing",
      "Line Item Accuracy & Price Void Overrides",
    ],
    keySkillsHi: [
      "फल व सब्जी पीएलयू शॉर्ट-की कोड",
      "डिजिटल तराजू वजन व सही पर्ची बिलिंग",
      "लाइन आइटम वॉइड व मूल्य जांच प्रक्रिया",
    ],
    unlockCriteria: "Maintain 14 items/min pace across 5 consecutive checkout queues",
    unlockCriteriaHi: "लगातार 5 बिलिंग कतारों में 14 आइटम/मिनट की गति प्राप्त करें",
  },
  {
    levelNumber: 3,
    targetDay: 7,
    badge: "L3",
    badgeHi: "L3",
    title: "Level 3: Multi-Tender Cashier",
    titleHi: "लेवल 3: मल्टी-टेंडर कैशियर",
    shortTitle: "Multi-Tender",
    shortTitleHi: "मल्टी-टेंडर",
    tagline: "Mastering cash tender, counterfeit verification & dynamic UPI QR",
    taglineHi: "कैश लेनदेन, नोट पहचान, कार्ड टर्मिनल व यूपीआई क्यूआर",
    speedTarget: 17,
    accuracyTarget: 98.5,
    keySkills: [
      "Counterfeit Cash Note Verification & Exact Change Return",
      "Dynamic UPI QR Code Generation & Terminal Approval",
      "Customer Bagging, Liquid Isolation & Security Tags",
    ],
    keySkillsHi: [
      "नकली नोट पहचान व सही बकाया कैश वापसी",
      "डायनामिक यूपीआई क्यूआर व कार्ड मशीन अप्रूवल",
      "कस्टमर बैगिंग, लिक्विड अलग रखना व टैग हटाना",
    ],
    unlockCriteria: "Complete multi-tender flow in sub-15s with 0 cash variance",
    unlockCriteriaHi: "15 सेकंड में मल्टी-टेंडर भुक्तान 0 कैश अंतर के साथ पूरा करें",
  },
  {
    levelNumber: 4,
    targetDay: 9,
    badge: "L4",
    badgeHi: "L4",
    title: "Level 4: Speed & Queue Master",
    titleHi: "लेवल 4: स्पीड व कतार मास्टर",
    shortTitle: "Queue Master",
    shortTitleHi: "कतार मास्टर",
    tagline: "Managing express lane peak queues, customer returns & safe drops",
    taglineHi: "एक्सप्रेस लेन कतार प्रबंधन, सामान वापसी व मिड-शिफ्ट कैश ड्रॉप",
    speedTarget: 19,
    accuracyTarget: 99,
    keySkills: [
      "Peak Hour Queue Pacing & Express Lane SLA",
      "Customer Returns & Exchange Receipt Matching",
      "Mid-Shift Safe Cash Drop Protocols",
    ],
    keySkillsHi: [
      "पीक ऑवर कतार प्रबंधन व एक्सप्रेस लेन स्पीड",
      "कस्टमर रिटर्न, एक्सचेंज व रसीद मिलान",
      "मिड-शिफ्ट सेफ कैश ड्रॉप सुरक्षा नियम",
    ],
    unlockCriteria: "Sustain 19 items/min during peak hour express lane queue",
    unlockCriteriaHi: "पीक ऑवर एक्सप्रेस लेन में 19 आइटम/मिनट की स्पीड बनाए रखें",
  },
  {
    levelNumber: 5,
    targetDay: 10,
    badge: "L5",
    badgeHi: "L5",
    title: "Level 5: Certified Autonomous Cashier",
    titleHi: "लेवल 5: प्रमाणित ऑटोनॉमस कैशियर",
    shortTitle: "Certified Pro",
    shortTitleHi: "प्रमाणित प्रो",
    tagline: "Full shift till autonomy, zero cash variance & shift handover",
    taglineHi: "पूर्ण स्वतंत्रता, 0 कैश अंतर, जी-रिपोर्ट व शिफ्ट हैंडओवर",
    speedTarget: 20,
    accuracyTarget: 99.5,
    keySkills: [
      "Autonomous Till Operation During Peak Rush",
      "End-of-Shift Cash Tallying & Z-Report Printout",
      "Zero Audit Variance & Supervisor Handover Mastery",
    ],
    keySkillsHi: [
      "पीक समय में 100% स्वतंत्र टिल संचालन",
      "शिफ्ट अंत कैश मिलान व जी-रिपोर्ट प्रिंट",
      "0 ऑडिट अंतर और सही शिफ्ट हैंडओवर",
    ],
    unlockCriteria: "Achieve 20 items/min scan rate with 99.5% accuracy on Day 10",
    unlockCriteriaHi: "डे 10 पर 99.5% सटीकता के साथ 20 आइटम/मिनट की स्पीड हासिल करें",
  },
];

export const DARK_STORE_ROADMAP_LEVELS: RoadmapLevelDef[] = [
  {
    levelNumber: 1,
    targetDay: 3,
    badge: "L1",
    badgeHi: "L1",
    title: "Level 1: Foundation Picker",
    titleHi: "लेवल 1: बुनियादी पिकर",
    shortTitle: "Foundation",
    shortTitleHi: "बुनियादी",
    tagline: "Mastering safety gear, barcode scanning & basic aisle navigation",
    taglineHi: "सुरक्षा गियर, बारकोड स्कैनिंग और शेल्फ लोकेशन पहचान",
    speedTarget: 25,
    accuracyTarget: 98,
    keySkills: [
      "Dark Store Safety, PPE & Terminal Pairing",
      "Fast Barcode Aim & Scan Verification",
      "Aisle Layout & Coordinate Recognition",
    ],
    keySkillsHi: [
      "स्टोर सुरक्षा, सेफ्टी शूज व स्कैनर पेयरिंग",
      "रिंग स्कैनर से तेज़ बारकोड स्कैनिंग",
      "आिसल लेआउट व शेल्फ लोकेशन पहचान",
    ],
    unlockCriteria: "Complete Modules 1-2 with 95%+ scan accuracy",
    unlockCriteriaHi: "मॉड्यूल 1-2 पूरे करें और 95%+ स्कैन एक्यूरेसी दिखाएं",
  },
  {
    levelNumber: 2,
    targetDay: 5,
    badge: "L2",
    badgeHi: "L2",
    title: "Level 2: Solo Picker",
    titleHi: "लेवल 2: सोलो पिकर",
    shortTitle: "Solo Picker",
    shortTitleHi: "सोलो पिकर",
    tagline: "Handling fragile items, standard SKU scans & solo routing",
    taglineHi: "नाज़ुक सामान की सुरक्षा, सिंगल ऑर्डर पिकिंग व तेज़ नेविगेशन",
    speedTarget: 35,
    accuracyTarget: 98,
    keySkills: [
      "Independent Single-Order Pick Waves",
      "Zero Backtracking Aisle Walking",
      "Live Item Weight & Quality Verification",
    ],
    keySkillsHi: [
      "अकेले सिंगल ऑर्डर पिक करना",
      "बिना भटके सीधे रैक तक पहुंचना",
      "सही संख्या व वजन की तुरंत जांच",
    ],
    unlockCriteria: "Achieve 35 UPH across 5 consecutive solo pick orders",
    unlockCriteriaHi: "लगातार 5 सोलो ऑर्डर में 35 UPH की गति प्राप्त करें",
  },
  {
    levelNumber: 3,
    targetDay: 7,
    badge: "L3",
    badgeHi: "L3",
    title: "Level 3: Multi-Task Speed",
    titleHi: "लेवल 3: मल्टी-टास्क स्पीड",
    shortTitle: "Multi-Task",
    shortTitleHi: "मल्टी-टास्क",
    tagline: "Mastering cold chain freshness, weight scales & tote balancing",
    taglineHi: "कोल्ड चेन, इलेक्ट्रॉनिक तराजू व संतुलित टोट पैकिंग",
    speedTarget: 42,
    accuracyTarget: 98.5,
    keySkills: [
      "Flavor & Grammage Variant Checks",
      "Sub-4 Minute Cold-Chain Handling",
      "Crush-Proof Heavy-at-Bottom Packing",
    ],
    keySkillsHi: [
      "फ्लेवर व वजन वेरिएंट की सही पहचान",
      "4 मिनट के भीतर कोल्ड चेन आइटम पैक करना",
      "भारी सामान नीचे रखकर टोट बैलेंस करना",
    ],
    unlockCriteria: "Maintain 98.5% accuracy with 0 mispicks across full wave",
    unlockCriteriaHi: "पूरी वेव में 0 मिस्पिक के साथ 98.5% सटीकता बनाए रखें",
  },
  {
    levelNumber: 4,
    targetDay: 9,
    badge: "L4",
    badgeHi: "L4",
    title: "Level 4: Speed & Route Master",
    titleHi: "लेवल 4: स्पीड व रूट मास्टर",
    shortTitle: "Route Master",
    shortTitleHi: "रूट मास्टर",
    tagline: "Optimizing your serpentine walking paths & fast exceptions",
    taglineHi: "सर्पेंटाइन वॉक पाथ अनुकूलन व त्वरित एक्सेप्शन हैंडलिंग",
    speedTarget: 48,
    accuracyTarget: 99,
    keySkills: [
      "Optimal Serpentine Walking Flow",
      "Fresh Produce Digital Scale Tare",
      "Fast Zero-Stock Exception Triage",
    ],
    keySkillsHi: [
      "न्यूनतम कदमों में सबसे तेज़ रूट नेविगेशन",
      "सब्जी व फल का सही वजन व बारकोड प्रिंट",
      "स्टॉक खत्म होने पर तुरंत एक्सेप्शन रिपोर्ट",
    ],
    unlockCriteria: "Sustain 48 UPH while handling cold chain & produce scales",
    unlockCriteriaHi: "कोल्ड चेन और स्केल के साथ 48 UPH की गति बनाए रखें",
  },
  {
    levelNumber: 5,
    targetDay: 10,
    badge: "L5",
    badgeHi: "L5",
    title: "Level 5: Certified Autonomous",
    titleHi: "लेवल 5: प्रमाणित ऑटोनॉमस प्रो",
    shortTitle: "Certified Pro",
    shortTitleHi: "प्रमाणित प्रो",
    tagline: "Full shift autonomy, zero safety defects & peak rush mastery",
    taglineHi: "पूर्ण स्वतंत्रता, शून्य त्रुटि और पीक ऑवर रश डिस्पैच",
    speedTarget: 50,
    accuracyTarget: 99,
    keySkills: [
      "100% Autonomous Peak SLA Delivery",
      "Zero Buddy Assistance Needed",
      "End-to-End Store Dispatch Mastery",
    ],
    keySkillsHi: [
      "पीक रश में 100% स्वतंत्र पिकिंग",
      "बिना किसी बडी की मदद के पूरा काम",
      "शुरुआत से डिस्पैच तक पूर्ण दक्षता",
    ],
    unlockCriteria: "Full certification across all Job-Readiness criteria",
    unlockCriteriaHi: "सभी कार्यकुशलता मानदंडों पर पूर्ण प्रमाणन",
  },
];

export function getRoadmapLevelsForRole(roleId?: string): RoadmapLevelDef[] {
  if (roleId === "dark_store_picker") {
    return DARK_STORE_ROADMAP_LEVELS;
  }
  return RETAIL_CASHIER_ROADMAP_LEVELS;
}

export const ROADMAP_LEVELS: RoadmapLevelDef[] = RETAIL_CASHIER_ROADMAP_LEVELS;

export const LearnerJourneyRoadmap: React.FC<LearnerJourneyRoadmapProps> = ({
  newHire,
  currentDay,
  isHindi = false,
  compact = false,
  onNavigateToSection,
  onOpenWorkTools,
  onSelectStage,
}) => {
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [playingAudio, setPlayingAudio] = useState<boolean>(false);

  // Derive dynamic roadmap & work stats
  const roadmapData = deriveLearnerRoadmap(newHire, currentDay);
  const currentWork =
    newHire.daysHistory[newHire.daysHistory.length - 1]?.workSignal || {
      dayNumber: currentDay,
      targetPickRate: 50,
      actualPickRate: 35,
      accuracyRate: 98,
      ordersCompleted: 30,
      targetOrders: 35,
    };

  const adaptivePlan = determineAdaptiveCurrentPlan(newHire, currentWork);
  const capabilities = newHire.capabilities || {};

  // Compute learner's active progress level (1 to 5)
  const demonstratedCount = (Object.values(capabilities) as any[]).filter(
    (c) => c && (c.evidence === "demonstrated" || c.mastery === "proficient" || c.mastery === "mastered")
  ).length;

  const currentPickRate = currentWork.actualPickRate || 35;
  const accuracy = currentWork.accuracyRate || 98;
  const modulesCompleted = newHire.modulesCompleted ?? Math.min(10, currentDay);

  let activeLevelIndex = 0;
  if (
    modulesCompleted >= 10 &&
    (roadmapData.readinessScore >= 85 || demonstratedCount >= 18 || (currentPickRate >= 50 && accuracy >= 98 && demonstratedCount >= 16))
  ) {
    activeLevelIndex = 4; // Level 5
  } else if ((currentPickRate >= 45 && accuracy >= 98 && demonstratedCount >= 12) || (roadmapData.readinessScore >= 70 && demonstratedCount >= 12)) {
    activeLevelIndex = 3; // Level 4
  } else if ((currentPickRate >= 38 && demonstratedCount >= 8) || (roadmapData.readinessScore >= 50 && demonstratedCount >= 8)) {
    activeLevelIndex = 2; // Level 3
  } else if ((modulesCompleted >= 3 && demonstratedCount >= 4) || roadmapData.readinessScore >= 35) {
    activeLevelIndex = 1; // Level 2
  } else {
    activeLevelIndex = 0; // Level 1
  }

  const activeLevels = getRoadmapLevelsForRole(newHire.roleId);
  const currentLevelDef = activeLevels[activeLevelIndex];
  const nextLevelDef = activeLevels[Math.min(4, activeLevelIndex + 1)];

  // Standing calculation
  const targetDayForCurrentLevel = currentLevelDef.targetDay;
  const isAhead = currentDay < targetDayForCurrentLevel && activeLevelIndex > 0;
  const isOnTrack =
    (currentDay <= 3 && activeLevelIndex >= 0) ||
    (currentDay <= 5 && activeLevelIndex >= 1) ||
    (currentDay <= 7 && activeLevelIndex >= 2) ||
    (currentDay <= 9 && activeLevelIndex >= 3) ||
    (currentDay <= 10 && activeLevelIndex >= 4);

  // Dean's short, punchy 1-sentence frontline voice coach
  const firstName = newHire.name.split(" ")[0];
  const coachShortSpeechEn = `Hey ${firstName}! You're at ${currentLevelDef.title}. Today let's hit ${currentLevelDef.speedTarget} UPH in ${adaptivePlan.productiveWork.zoneOrAisles}!`;
  const coachShortSpeechHi = `नमस्ते ${firstName}! आप ${currentLevelDef.titleHi} पर हैं। आज ${adaptivePlan.productiveWork.zoneOrAisles} में ${currentLevelDef.speedTarget} UPH का लक्ष्य हासिल करें!`;

  const handlePlayAudio = () => {
    if (playingAudio) {
      stopSpeaking();
      setPlayingAudio(false);
      return;
    }
    const text = isHindi ? coachShortSpeechHi : coachShortSpeechEn;
    setPlayingAudio(true);
    speakMessage(text, isHindi, () => {
      setPlayingAudio(false);
    });
  };

  // -------------------------------------------------------------
  // COMPACT MINI PREVIEW (For embedding into sidebars / cards)
  // -------------------------------------------------------------
  if (compact) {
    return (
      <div
        id="learner-pro-roadmap-compact"
        className="bg-white rounded-[24px] p-4 border border-slate-200/90 shadow-2xs space-y-3 select-none"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#7025fb] text-white flex items-center justify-center shrink-0 shadow-xs font-black text-xs">
              {currentLevelDef.badge}
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 block">
                {isHindi ? "प्रो पिकर रोडमैप" : "Pro Picker Roadmap"}
              </span>
              <h4 className="text-sm font-black text-slate-900 leading-tight">
                {isHindi ? currentLevelDef.titleHi : currentLevelDef.title}
              </h4>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              if (onNavigateToSection) onNavigateToSection("dashboard");
              else if (onSelectStage) onSelectStage();
            }}
            className="text-xs font-bold text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-full flex items-center gap-0.5 cursor-pointer transition-all"
          >
            <span>{isHindi ? "रोडमैप देखें" : "View"}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Level pills */}
        <div className="grid grid-cols-5 gap-1.5 pt-1">
          {ROADMAP_LEVELS.map((lvl, idx) => {
            const isCompleted = idx < activeLevelIndex;
            const isCurrent = idx === activeLevelIndex;
            return (
              <div
                key={lvl.levelNumber}
                className={`h-2 rounded-full transition-all ${
                  isCompleted
                    ? "bg-emerald-500"
                    : isCurrent
                    ? "bg-[#7025fb] ring-2 ring-purple-200"
                    : "bg-slate-200"
                }`}
                title={lvl.title}
              />
            );
          })}
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // FULL EXPANDED LEARNER JOURNEY (FLOOR HERO LAYOUT)
  // -------------------------------------------------------------
  return (
    <div
      id="pro-picker-roadmap-card"
      className="space-y-4 select-none animate-in fade-in duration-200"
    >
      {/* ========================================================= */}
      {/* 1. QUICK GLANCE HERO HEADER (Dark/Purple Glass)           */}
      {/* ========================================================= */}
      <div className="rounded-[28px] bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white p-5 border border-indigo-800/40 shadow-xl relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-44 h-44 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-44 h-44 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-[#7025fb] text-white flex items-center justify-center font-black text-sm shadow-md shadow-purple-600/30 shrink-0">
                {currentLevelDef.badge}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-purple-300 bg-purple-950/80 px-2 py-0.5 rounded-full border border-purple-700/50">
                    {isHindi ? "प्रो जर्नी" : "Pro Picker Trail"}
                  </span>
                  <span className="text-[10px] font-bold text-slate-300 bg-white/10 px-2 py-0.5 rounded-full">
                    {isHindi ? `डे ${currentDay}/10` : `Day ${currentDay} of 10`}
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-black text-white tracking-tight mt-0.5">
                  {isHindi ? currentLevelDef.titleHi : currentLevelDef.title}
                </h2>
              </div>
            </div>

            <button
              type="button"
              onClick={handlePlayAudio}
              className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-purple-300 transition-all cursor-pointer border border-white/10 active:scale-95 shrink-0"
              title="Listen Coach Brief"
            >
              <Volume2 className={`w-4 h-4 ${playingAudio ? "animate-bounce text-purple-400" : ""}`} />
            </button>
          </div>

          {/* Quick Voice Bubble */}
          <div className="p-3 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-xs flex items-center gap-2.5 text-xs text-purple-100 font-medium">
            <Smile className="w-4 h-4 text-purple-300 shrink-0" />
            <span className="truncate">
              {isHindi ? coachShortSpeechHi : coachShortSpeechEn}
            </span>
          </div>

          {/* Live Glance Stats */}
          <div className="grid grid-cols-3 gap-2 pt-0.5 text-center">
            <div className="p-2 rounded-2xl bg-white/5 border border-white/10">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                {isHindi ? "लाइव गति" : "Current Pace"}
              </span>
              <span className="text-sm font-black text-white mt-0.5 block">
                {currentPickRate} <span className="text-[10px] text-slate-400">UPH</span>
              </span>
            </div>

            <div className="p-2 rounded-2xl bg-white/5 border border-white/10">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                {isHindi ? "लक्ष्य गति" : "Target Pace"}
              </span>
              <span className="text-sm font-black text-purple-300 mt-0.5 block">
                {currentLevelDef.speedTarget} <span className="text-[10px] text-slate-400">UPH</span>
              </span>
            </div>

            <div className="p-2 rounded-2xl bg-emerald-500/10 border border-emerald-400/30 text-emerald-300">
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-80 block">
                {isHindi ? "सटीकता" : "Accuracy"}
              </span>
              <span className="text-sm font-black mt-0.5 block">
                {accuracy}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. TODAY'S RECOMMENDED DEAN ACTIVITIES (100% SYNCED)     */}
      {/* ========================================================= */}
      <div className="bg-white rounded-[28px] p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-3.5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900">
                {isHindi ? `आज के ${5} मुख्य काम (Shift #${currentDay})` : `Today's 5 Shift Activities (Shift #${currentDay})`}
              </h3>
              <p className="text-[10px] text-slate-500 font-medium">
                {isHindi ? "डीन द्वारा आपकी भूमिका की तैयारी के लिए अनुशंसित कार्य" : "Dean's recommended activities for progressive role readiness"}
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
            {isHindi ? "डीन का प्लान" : "Dean's Active Plan"}
          </span>
        </div>

        {/* 5 Clear Action Activity Cards */}
        <div className="space-y-2.5">
          {/* Activity 1: Dean's Recommended Focus Skill & LMS */}
          <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-center justify-between gap-3">
            <div className="space-y-0.5 min-w-0">
              <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-amber-900">
                <BookOpen className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>1. {isHindi ? "डीन की मुख्य प्राथमिकता" : "DEAN'S PRIORITY DRILL"}</span>
              </div>
              <h4 className="text-xs font-bold text-slate-900 truncate">
                {adaptivePlan.development.focusCapabilityName}
              </h4>
              <p className="text-[11px] text-slate-600 truncate">
                {adaptivePlan.development.durationMinutes || 12} min • {adaptivePlan.development.developmentType}
              </p>
            </div>
            {onNavigateToSection && (
              <button
                type="button"
                onClick={() => onNavigateToSection("modules")}
                className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shrink-0 cursor-pointer shadow-2xs active:scale-95 transition-all"
              >
                {isHindi ? "मॉड्यूल देखें 📚" : "Practice 📚"}
              </button>
            )}
          </div>

          {/* Activity 2: Buddy Practice Walkthrough */}
          <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-100 flex items-center justify-between gap-3">
            <div className="space-y-0.5 min-w-0">
              <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-purple-800">
                <Target className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                <span>2. {isHindi ? "साथी के साथ अभ्यास" : "BUDDY FLOOR WALKTHROUGH"}</span>
              </div>
              <h4 className="text-xs font-bold text-slate-900 truncate">
                {isHindi ? `सीनियर साथी ${(newHire.buddy || "Vikram").split(" ")[0]} के साथ फ्लोर प्रैक्टिस` : `Floor Coaching with Buddy ${(newHire.buddy || "Vikram").split(" ")[0]}`}
              </h4>
              <p className="text-[11px] text-slate-600 truncate">
                15 min • {adaptivePlan.productiveWork.zoneOrAisles}
              </p>
            </div>
            {onNavigateToSection && (
              <button
                type="button"
                onClick={() => onNavigateToSection("buddy")}
                className="px-3 py-1.5 rounded-xl bg-[#7025fb] hover:bg-purple-700 text-white text-xs font-bold shrink-0 cursor-pointer shadow-2xs active:scale-95 transition-all"
              >
                {isHindi ? "बडी ड्रिल 👥" : "Buddy Drill 👥"}
              </button>
            )}
          </div>

          {/* Activity 3: Productive Floor Work SLA */}
          <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-100 flex items-center justify-between gap-3">
            <div className="space-y-0.5 min-w-0">
              <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-emerald-800">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>3. {isHindi ? "टारगेट स्पीड व फ्लोर वर्क" : "FLOOR PRODUCTIVE WORK"}</span>
              </div>
              <h4 className="text-xs font-bold text-slate-900 truncate">
                {adaptivePlan.productiveWork.safeWorkTitle} ({adaptivePlan.productiveWork.zoneOrAisles})
              </h4>
              <p className="text-[11px] text-slate-600 truncate">
                Target: <strong>{adaptivePlan.productiveWork.targetPacing} UPH</strong> • Safe Zone
              </p>
            </div>
            {onOpenWorkTools && (
              <button
                type="button"
                onClick={onOpenWorkTools}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shrink-0 cursor-pointer shadow-2xs active:scale-95 transition-all"
              >
                {isHindi ? "शुरू करें 🛠️" : "Start Floor 🛠️"}
              </button>
            )}
          </div>

          {/* Activity 4: Progression Gate */}
          <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-100 flex items-center justify-between gap-3">
            <div className="space-y-0.5 min-w-0">
              <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-blue-800">
                <Zap className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>4. {isHindi ? "प्रगति गेट शर्त" : "PROGRESSION GATE"}</span>
              </div>
              <h4 className="text-xs font-bold text-slate-900 truncate">
                {adaptivePlan.progressionGate.unlockCriteria}
              </h4>
              <p className="text-[11px] text-slate-600 truncate">
                Shift #{currentDay} Gate • {adaptivePlan.progressionGate.verifyingActor}
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-blue-100 text-blue-800 text-[11px] font-bold shrink-0">
              {isHindi ? "गेट चेक" : "Gate Check"}
            </span>
          </div>

          {/* Activity 5: End-of-Shift Voice Reflection */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
            <div className="space-y-0.5 min-w-0">
              <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-slate-700">
                <CheckCircle2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>5. {isHindi ? "शिफ्ट चेक-आउट रिपोर्ट" : "SHIFT CHECK-OUT"}</span>
              </div>
              <h4 className="text-xs font-bold text-slate-900 truncate">
                {isHindi ? `डे ${currentDay} वॉयस रिपोर्ट रिकॉर्ड करें` : `Day ${currentDay} Voice Shift Report`}
              </h4>
              <p className="text-[11px] text-slate-500 truncate">
                5 min • {isHindi ? "सुपरवाइजर अपडेट" : "Supervisor Check-in"}
              </p>
            </div>
            {onNavigateToSection && (
              <button
                type="button"
                onClick={() => onNavigateToSection("dial")}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold shrink-0 cursor-pointer shadow-2xs active:scale-95 transition-all"
              >
                {isHindi ? "चेक-आउट 🎙️" : "Report 🎙️"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. THE 5-LEVEL PROGRESSION PATHWAY (EXACT MATCH TO REF)   */}
      {/* ========================================================= */}
      <div className="bg-white rounded-[28px] p-5 border border-slate-200/90 shadow-xs space-y-4">
        {/* Section Header matching uploaded screenshot */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-base font-black text-slate-900 tracking-wider uppercase">
              {isHindi ? "लेवल्स (LEVELS)" : "LEVELS"}
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {isHindi
                ? "हर लेवल की आवश्यकताएं देखने के लिए टैप करें"
                : "Tap any level to view complete expectations"}
            </p>
          </div>
          <span className="text-xs font-bold text-[#7025fb] bg-purple-100/70 px-3 py-1 rounded-full shrink-0">
            Day {currentDay} Active
          </span>
        </div>

        {/* The 5 Level Cards */}
        <div className="space-y-3">
          {activeLevels.map((level, idx) => {
            const isCompleted = idx < activeLevelIndex;
            const isCurrent = idx === activeLevelIndex;
            const isUpcoming = idx > activeLevelIndex;
            const isExpanded = selectedLevel === level.levelNumber;

            // -------------------------------------------------------------
            // VARIANT A: COMPLETED LEVEL (Mint Green Border / Unlocked)
            // -------------------------------------------------------------
            if (isCompleted) {
              return (
                <div
                  key={level.levelNumber}
                  id={`roadmap-level-${level.levelNumber}`}
                  className="rounded-[22px] border border-emerald-200 bg-emerald-50/30 overflow-hidden transition-all duration-200"
                >
                  <button
                    type="button"
                    onClick={() => setSelectedLevel(isExpanded ? null : level.levelNumber)}
                    className="w-full p-4 flex items-center justify-between gap-3 text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      {/* Green Solid Circle with White Checkmark */}
                      <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                        <Check className="w-5 h-5 stroke-[3]" />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-black text-slate-900 truncate">
                            {isHindi ? level.titleHi : level.title}
                          </h4>
                          <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full shrink-0">
                            Day {level.targetDay}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 truncate mt-0.5">
                          {isHindi ? level.taglineHi : level.tagline}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-xs shrink-0">
                      <span>{isHindi ? "अनलॉक" : "Unlocked"}</span>
                      <ChevronRight
                        className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-90" : ""}`}
                      />
                    </div>
                  </button>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="px-5 pb-4 pt-1 border-t border-emerald-100 bg-white/80 space-y-3 animate-in fade-in duration-150">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1.5">
                          {isHindi ? "सफलतापूर्वक सीखे गए कौशल:" : "Mastered Skills in this Level:"}
                        </span>
                        <div className="space-y-1.5">
                          {(isHindi ? level.keySkillsHi : level.keySkills).map((skill, sIdx) => (
                            <div key={sIdx} className="flex items-center gap-2 text-xs text-slate-700">
                              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 stroke-[2.5]" />
                              <span>{skill}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-between text-xs">
                        <span className="text-emerald-900 font-bold">
                          {level.speedTarget} UPH • {level.accuracyTarget}% Accuracy
                        </span>
                        <span className="text-emerald-700 font-bold text-[11px]">Completed ✓</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            }

            // -------------------------------------------------------------
            // VARIANT B: CURRENT ACTIVE LEVEL (Vibrant Purple Card)
            // -------------------------------------------------------------
            if (isCurrent) {
              return (
                <div
                  key={level.levelNumber}
                  id={`roadmap-level-${level.levelNumber}`}
                  className="rounded-[22px] bg-[#7025fb] text-white shadow-lg shadow-purple-600/25 overflow-hidden transition-all duration-200"
                >
                  <button
                    type="button"
                    onClick={() => setSelectedLevel(isExpanded ? null : level.levelNumber)}
                    className="w-full p-4 flex items-center justify-between gap-3 text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      {/* White Pill Icon with Purple Text L2 */}
                      <div className="w-10 h-10 rounded-2xl bg-white text-[#7025fb] flex items-center justify-center shrink-0 font-black text-sm shadow-xs">
                        {level.badge}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-black text-white truncate">
                            {isHindi ? level.titleHi : level.title}
                          </h4>
                          <span className="text-[11px] font-bold text-white bg-white/20 px-2 py-0.5 rounded-full shrink-0">
                            Day {level.targetDay}
                          </span>
                        </div>
                        <p className="text-xs text-purple-100 truncate mt-0.5">
                          {isHindi ? level.taglineHi : level.tagline}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[11px] font-black text-[#7025fb] bg-white px-2.5 py-1 rounded-full shadow-xs uppercase tracking-wider">
                        {isHindi ? "वर्तमान" : "CURRENT"}
                      </span>
                      <ChevronRight
                        className={`w-4 h-4 text-white transition-transform ${isExpanded ? "rotate-90" : ""}`}
                      />
                    </div>
                  </button>

                  {/* Expanded Content for Current Level */}
                  {isExpanded && (
                    <div className="px-5 pb-4 pt-1 border-t border-purple-500/40 bg-purple-900/40 space-y-3 animate-in fade-in duration-150">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-purple-200 block mb-1.5">
                          {isHindi ? "आज का मुख्य अभ्यास:" : "Key Floor Skills to Practice:"}
                        </span>
                        <div className="space-y-1.5">
                          {(isHindi ? level.keySkillsHi : level.keySkills).map((skill, sIdx) => (
                            <div key={sIdx} className="flex items-center gap-2 text-xs text-purple-50">
                              <Target className="w-3.5 h-3.5 text-purple-300 shrink-0" />
                              <span>{skill}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Criteria */}
                      <div className="p-3 rounded-xl bg-white/10 border border-white/10 flex items-start gap-2 text-xs">
                        <ShieldCheck className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-white font-bold block">
                            {isHindi ? "लेवल 3 अनलॉक करने का लक्ष्य:" : "Target to Unlock Next Level:"}
                          </strong>
                          <span className="text-purple-100">
                            {isHindi ? level.unlockCriteriaHi : level.unlockCriteria}
                          </span>
                        </div>
                      </div>

                      {/* Fast CTA */}
                      {onOpenWorkTools && (
                        <button
                          type="button"
                          onClick={onOpenWorkTools}
                          className="w-full py-2.5 rounded-xl bg-white text-[#7025fb] text-xs font-black shadow-md cursor-pointer active:scale-95 transition-transform"
                        >
                          {isHindi ? "फ्लोर अभ्यास शुरू करें 🚀" : "Start Floor Practice Drill 🚀"}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            }

            // -------------------------------------------------------------
            // VARIANT C: UPCOMING / LOCKED LEVELS (Clean Slate Card)
            // -------------------------------------------------------------
            return (
              <div
                key={level.levelNumber}
                id={`roadmap-level-${level.levelNumber}`}
                className="rounded-[22px] border border-slate-200/90 bg-white overflow-hidden transition-all duration-200 hover:border-slate-300"
              >
                <button
                  type="button"
                  onClick={() => setSelectedLevel(isExpanded ? null : level.levelNumber)}
                  className="w-full p-4 flex items-center justify-between gap-3 text-left cursor-pointer"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    {/* Slate Rounded Square [L3] */}
                    <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 font-black text-sm">
                      {level.badge}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-black text-slate-900 truncate">
                          {isHindi ? level.titleHi : level.title}
                        </h4>
                        <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full shrink-0">
                          Day {level.targetDay}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 truncate mt-0.5">
                        {isHindi ? level.taglineHi : level.tagline}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-slate-400 shrink-0">
                    <ChevronRight
                      className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-90" : ""}`}
                    />
                  </div>
                </button>

                {/* Expanded Content for Upcoming Level */}
                {isExpanded && (
                  <div className="px-5 pb-4 pt-1 border-t border-slate-100 bg-slate-50/60 space-y-3 animate-in fade-in duration-150">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1.5">
                        {isHindi ? "इस स्तर के आगामी कौशल:" : "Upcoming Skills in this Level:"}
                      </span>
                      <div className="space-y-1.5">
                        {(isHindi ? level.keySkillsHi : level.keySkills).map((skill, sIdx) => (
                          <div key={sIdx} className="flex items-center gap-2 text-xs text-slate-600">
                            <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{skill}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 flex items-start gap-2 text-xs">
                      <ShieldCheck className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-slate-900 font-bold block">
                          {isHindi ? "अनलॉक की आवश्यकता:" : "Unlock Requirement:"}
                        </strong>
                        <span className="text-slate-600">
                          {isHindi ? level.unlockCriteriaHi : level.unlockCriteria}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
