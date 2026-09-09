import React, { useState } from "react";
import {
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Sparkles,
  CheckCircle2,
  Play,
  Pause,
  Clock,
  Languages,
  Check,
  Video,
  Volume2,
  Maximize2,
  Phone,
  Mic,
  ArrowRight,
  Info,
  Layers,
  Flame,
} from "lucide-react";
import { NewHire } from "../types";
import { LearnerSection } from "./FloatingGlassMenu";
import { assessReadiness, determineAdaptiveCurrentPlan } from "../services/intelligence";

interface TodaysGoalLandingViewProps {
  newHire: NewHire;
  currentDay: number;
  isHindi?: boolean;
  onToggleLanguage?: () => void;
  onBack: () => void;
  onSelectSection?: (section: LearnerSection) => void;
  onUpdateHire?: (updatedHire: NewHire) => void;
  onOpenBuddy?: () => void;
}

interface GoalCard {
  id: string;
  stepNumber: number;
  title: string;
  titleHi: string;
  tag: string;
  tagHi: string;
  duration: string;
  readinessPoints: number;
  whyText: string;
  whyTextHi: string;
  whatText: string;
  whatTextHi: string;
  actionBullets: { en: string; hi: string }[];
  videoTitle?: string;
  videoTitleHi?: string;
  videoDuration?: string;
  videoThumbnailUrl: string;
  videoTips: { en: string; hi: string }[];
  isSpecialAction?: "buddy_call" | "voice_checkin" | "standard";
}

export const TodaysGoalLandingView: React.FC<TodaysGoalLandingViewProps> = ({
  newHire,
  currentDay,
  isHindi = false,
  onToggleLanguage,
  onBack,
  onSelectSection,
  onOpenBuddy,
}) => {
  // Role selector dropdown state
  const [selectedRole, setSelectedRole] = useState<string>("Retail Cashier • Till 1");
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState<boolean>(false);

  // Expandable card state (Card 1 expanded by default for instant onboarding clarity)
  const [expandedCardId, setExpandedCardId] = useState<string | null>("card_1");

  // Completion state for the 5 cards
  const [completedCardIds, setCompletedCardIds] = useState<Record<string, boolean>>({
    card_1: false,
    card_2: false,
    card_3: false,
    card_4: false,
    card_5: false,
  });

  // Interactive video simulation state per card
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);
  const [voiceRecording, setVoiceRecording] = useState<boolean>(false);
  const [voiceSubmitted, setVoiceSubmitted] = useState<boolean>(false);

  // Authoritative live career readiness score calculation
  const baseReadiness =
    typeof newHire.overallReadinessScore === "number"
      ? (newHire.overallReadinessScore <= 1
          ? Math.round(newHire.overallReadinessScore * 100)
          : Math.round(newHire.overallReadinessScore))
      : assessReadiness(newHire.capabilities || {}, newHire);

  // Compute live readiness dynamically based on completed goal cards
  const bonusPoints = Object.entries(completedCardIds).reduce((sum, [id, done]) => {
    if (!done) return sum;
    if (id === "card_1") return sum + 3;
    if (id === "card_2") return sum + 3;
    if (id === "card_3") return sum + 3;
    if (id === "card_4") return sum + 4;
    if (id === "card_5") return sum + 2;
    return sum;
  }, 0);

  const liveReadinessPct = Math.min(100, baseReadiness + bonusPoints);
  const completedCount = Object.values(completedCardIds).filter(Boolean).length;

  // Authoritative 3D adaptive current plan from Dean & intelligence engine
  const adaptivePlan = determineAdaptiveCurrentPlan(newHire);
  const buddyFirstName = (newHire.buddy || "Vikram").split(" ")[0];
  const supervisorFirstName = (newHire.supervisor || "Suresh").split(" ")[0];

  // The 5 streamlined, sequential target cards — dynamically synced with Dean's active plan & recommendations
  const GOAL_CARDS: GoalCard[] = [
    {
      id: "card_1",
      stepNumber: 1,
      title: `${adaptivePlan.development.focusCapabilityName} (Dean's Priority)`,
      titleHi: `${adaptivePlan.development.focusCapabilityName} (डीन की मुख्य प्राथमिकता)`,
      tag: adaptivePlan.development.developmentType || "Dean Recommended Practice",
      tagHi: adaptivePlan.development.developmentType || "डीन द्वारा अनुशंसित अभ्यास",
      duration: `${adaptivePlan.development.durationMinutes || 12} min`,
      readinessPoints: 3,
      whyText: adaptivePlan.deanRationale,
      whyTextHi: `वर्क सिग्नल विश्लेषण: ${adaptivePlan.deanRationale}`,
      whatText: `Master ${adaptivePlan.development.focusCapabilityName} at ${adaptivePlan.productiveWork.zoneOrAisles} through ${adaptivePlan.development.actionDescription}.`,
      whatTextHi: `${adaptivePlan.productiveWork.zoneOrAisles} पर ${adaptivePlan.development.focusCapabilityName} में निपुणता हासिल करें।`,
      actionBullets: [
        {
          en: `Review SOP and walkthrough for ${adaptivePlan.development.focusCapabilityName}.`,
          hi: `${adaptivePlan.development.focusCapabilityName} की एसओपी गाइड देखें।`,
        },
        {
          en: `Calibrate setup and practice at ${adaptivePlan.productiveWork.zoneOrAisles}.`,
          hi: `${adaptivePlan.productiveWork.zoneOrAisles} पर सेटिंग्स और अलाइनमेंट जांचें।`,
        },
        {
          en: "Complete 10 test trials with instant green-light confirmation.",
          hi: "बिना किसी त्रुटि के 10 टेस्ट ट्रायल्स पूरे करें।",
        },
      ],
      videoTitle: `${adaptivePlan.development.focusCapabilityName} - Video SOP Guide`,
      videoTitleHi: `${adaptivePlan.development.focusCapabilityName} - वीडियो एसओपी मार्गदर्शिका`,
      videoDuration: "2:15 min",
      videoThumbnailUrl:
        "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=800&auto=format&fit=crop",
      videoTips: [
        {
          en: "Keep proper distance and steady laser alignment.",
          hi: "लेबल से सही दूरी और लेजर बीम का कोण बनाए रखें।",
        },
        {
          en: "Keep wrists level to prevent reflection delays.",
          hi: "रिफ्लेक्शन से बचने के लिए कलाई सीधी रखें।",
        },
      ],
    },
    {
      id: "card_2",
      stepNumber: 2,
      title: `Hands-On Floor Coaching with Senior Buddy ${buddyFirstName}`,
      titleHi: `सीनियर साथी ${buddyFirstName} के साथ फ्लोर प्रैक्टिस वॉकथ्रू`,
      tag: "Buddy Floor Drill",
      tagHi: "साथी के साथ अभ्यास",
      duration: "15 min",
      readinessPoints: 3,
      whyText: `Target floor pace of ${adaptivePlan.productiveWork.targetPacing} UPH requires hands-on mentoring at ${adaptivePlan.productiveWork.zoneOrAisles}.`,
      whyTextHi: `${adaptivePlan.productiveWork.zoneOrAisles} पर ${adaptivePlan.productiveWork.targetPacing} UPH की गति के लिए साथी मार्गदर्शन आवश्यक है।`,
      whatText: `Walk through ${adaptivePlan.productiveWork.zoneOrAisles} with Buddy ${buddyFirstName} to master item lookup and scale calibration.`,
      whatTextHi: `साथी ${buddyFirstName} के साथ मिलकर ${adaptivePlan.productiveWork.zoneOrAisles} पर तेजी से काम करना सीखें।`,
      actionBullets: [
        {
          en: `Meet Senior Buddy ${buddyFirstName} at ${adaptivePlan.productiveWork.zoneOrAisles}.`,
          hi: `${adaptivePlan.productiveWork.zoneOrAisles} पर साथी ${buddyFirstName} से मिलें।`,
        },
        {
          en: "Memorize short-key codes and digital scale calibration.",
          hi: "शॉर्ट-की कोड और डिजिटल तराजू सेटिंग्स याद करें।",
        },
        {
          en: "Run 5 live simulated transactions with buddy observation.",
          hi: "साथी की देखरेख में 5 लाइव ट्रायल्स पूरे करें।",
        },
      ],
      videoTitle: `Buddy ${buddyFirstName} Floor Practice Guide`,
      videoTitleHi: `साथी ${buddyFirstName} फ्लोर प्रैक्टिस वीडियो`,
      videoDuration: "3:10 min",
      videoThumbnailUrl:
        "https://images.unsplash.com/photo-1553413077-190dd305871c?q=80&w=800&auto=format&fit=crop",
      videoTips: [
        {
          en: "Use 4-digit short-keys for instant billing.",
          hi: "तुरंत काम के लिए 4-अंकीय शॉर्ट-की का उपयोग करें।",
        },
        {
          en: "Check digital scale zero tare before processing.",
          hi: "काम शुरू करने से पहले तराजू का शून्य रीसेट जांचें।",
        },
      ],
      isSpecialAction: "buddy_call",
    },
    {
      id: "card_3",
      stepNumber: 3,
      title: `SLA Target Pace (${adaptivePlan.productiveWork.targetPacing} UPH)`,
      titleHi: `टारगेट स्पीड (${adaptivePlan.productiveWork.targetPacing} UPH)`,
      tag: "SLA Pace & Accuracy",
      tagHi: "एसएलए गति व शुद्धता",
      duration: "10 min",
      readinessPoints: 3,
      whyText: `Milestone Day ${currentDay} requires sustained pace of ${adaptivePlan.productiveWork.targetPacing} UPH with zero mispicks.`,
      whyTextHi: `डे ${currentDay} के लिए ${adaptivePlan.productiveWork.targetPacing} UPH की स्पीड और उच्च शुद्धता आवश्यक है।`,
      whatText: `Execute orders at ${adaptivePlan.productiveWork.zoneOrAisles} maintaining target speed and zero mispicks.`,
      whatTextHi: `बिना गलती के ${adaptivePlan.productiveWork.targetPacing} UPH की स्पीड हासिल करें।`,
      actionBullets: [
        {
          en: "Verify item details before final scan confirmation.",
          hi: "अंतिम पुष्टि से पहले सामान के विवरण की जांच करें।",
        },
        {
          en: `Maintain steady rhythm at ${adaptivePlan.productiveWork.zoneOrAisles}.`,
          hi: `${adaptivePlan.productiveWork.zoneOrAisles} पर लयबद्ध गति बनाए रखें।`,
        },
        {
          en: "Confirm successful completion on customer display.",
          hi: "स्क्रीन पर सफल एंट्री की पुष्टि करें।",
        },
      ],
      videoTitle: "SLA Pace & Accuracy Optimization",
      videoTitleHi: "एसएलए गति और शुद्धता एसओपी",
      videoDuration: "2:40 min",
      videoThumbnailUrl:
        "https://images.unsplash.com/photo-1578575437130-527eed3abbec?q=80&w=800&auto=format&fit=crop",
      videoTips: [
        {
          en: "Keep workspace organized to prevent item confusion.",
          hi: "काउंटर को व्यवस्थित रखें ताकि कोई भ्रम न हो।",
        },
      ],
    },
    {
      id: "card_4",
      stepNumber: 4,
      title: `Progression Gate: ${adaptivePlan.progressionGate.unlockCriteria}`,
      titleHi: `प्रगति गेट: ${adaptivePlan.progressionGate.unlockCriteria}`,
      tag: `Day ${currentDay} Gate`,
      tagHi: `डे ${currentDay} गेट`,
      duration: "25 min",
      readinessPoints: 4,
      whyText: `Unlock condition for Day ${currentDay} milestone: ${adaptivePlan.progressionGate.unlockCriteria}`,
      whyTextHi: `डे ${currentDay} पास करने की शर्त: ${adaptivePlan.progressionGate.unlockCriteria}`,
      whatText: `Demonstrate compliance with ${adaptivePlan.progressionGate.unlockCriteria} during live shift operations.`,
      whatTextHi: `${adaptivePlan.progressionGate.unlockCriteria} का सफलतापूर्वक पालन करें।`,
      actionBullets: [
        {
          en: "Review safety and quality checklists.",
          hi: "सुरक्षा व गुणवत्ता नियमों की समीक्षा करें।",
        },
        {
          en: `Ensure zero active blockers on Day ${currentDay}.`,
          hi: `डे ${currentDay} पर कोई सक्रिय रुकावट न रहने दें।`,
        },
        {
          en: "Verify supervisor observation approval.",
          hi: "सुपरवाइजर अवलोकन स्वीकृति प्राप्त करें।",
        },
      ],
      videoTitle: "Progression Gate Compliance SOP",
      videoTitleHi: "प्रगति गेट नियम व अनुपालन",
      videoDuration: "3:30 min",
      videoThumbnailUrl:
        "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=800&auto=format&fit=crop",
      videoTips: [
        {
          en: "Double check item counts on multi-item orders.",
          hi: "मल्टी-आइटम ऑर्डर में संख्या दो बार जांचें।",
        },
      ],
    },
    {
      id: "card_5",
      stepNumber: 5,
      title: `Day ${currentDay} Shift Check-Out & Voice Report`,
      titleHi: `डे ${currentDay} शिफ्ट चेक-आउट और वॉयस रिपोर्ट`,
      tag: "Shift Wrap-up",
      tagHi: "शिफ्ट समापन",
      duration: "5 min",
      readinessPoints: 2,
      whyText: `Closes your Day ${currentDay} learning loop and signals Store Supervisor ${supervisorFirstName} that you met all milestone criteria.`,
      whyTextHi: `दिन ${currentDay} की प्रगति को सुरक्षित करता है और स्टोर सुपरवाइजर ${supervisorFirstName} को सूचित करता है।`,
      whatText: `Record a quick 30-second voice reflection on today's shift experience.`,
      whatTextHi: `30 सेकंड का ऑडियो संदेश रिकॉर्ड करें कि आज का दिन कैसा रहा।`,
      actionBullets: [
        {
          en: "Review your final items/min scan rate on the telemetry dial.",
          hi: "लाइव टेलीमेट्री पर अपनी स्पीड की समीक्षा करें।",
        },
        {
          en: `Record a 30-second voice update describing today's ${adaptivePlan.productiveWork.zoneOrAisles} experience.`,
          hi: `आज के ${adaptivePlan.productiveWork.zoneOrAisles} काम पर 30 सेकंड का ऑडियो संदेश रिकॉर्ड करें।`,
        },
        {
          en: `Lock in today's readiness boost for Day ${currentDay}.`,
          hi: `आज के दिन ${currentDay} की कुल प्रगति सुरक्षित करें।`,
        },
      ],
      videoTitle: "How End-of-Shift Check-Out Boosts Your Career Readiness",
      videoTitleHi: "चेक-आउट से करियर रेडीनेस स्कोर कैसे बढ़ता है",
      videoDuration: "1:45 min",
      videoThumbnailUrl:
        "https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=800&auto=format&fit=crop",
      videoTips: [
        {
          en: "Mention any produce PLU code confusion so supervisor reinforces it.",
          hi: "यदि किसी कोड में समस्या थी, तो वॉयस में ज़रूर बताएं।",
        },
        {
          en: `Confirm buddy ${buddyFirstName} assisted with floor walkthrough.`,
          hi: `पुष्टि करें कि साथी ${buddyFirstName} ने आपकी मदद की।`,
        },
      ],
      isSpecialAction: "voice_checkin",
    },
  ];

  const handleToggleCardExpansion = (cardId: string) => {
    setExpandedCardId((prev) => (prev === cardId ? null : cardId));
  };

  const handleToggleCardDone = (cardId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCompletedCardIds((prev) => ({
      ...prev,
      [cardId]: !prev[cardId],
    }));
  };

  // Math for circular progress arc matching reference design (Daily progress)
  const dailyProgressPct = Math.round((completedCount / 5) * 100);
  const radius = 96;
  const center = 130;
  const strokeWidth = 10;
  const progressRatio = Math.max(0.02, Math.min(1, dailyProgressPct / 100));
  const startAngle = -135;
  const totalSweep = 270;
  const currentAngle = startAngle + totalSweep * progressRatio;

  const polarToCartesian = (cx: number, cy: number, r: number, angleDegrees: number) => {
    const angleRadians = ((angleDegrees - 90) * Math.PI) / 180.0;
    return {
      x: cx + r * Math.cos(angleRadians),
      y: cy + r * Math.sin(angleRadians),
    };
  };

  const describeArc = (cx: number, cy: number, r: number, startA: number, endA: number) => {
    const start = polarToCartesian(cx, cy, r, endA);
    const end = polarToCartesian(cx, cy, r, startA);
    const largeArcFlag = endA - startA <= 180 ? "0" : "1";
    return ["M", start.x, start.y, "A", r, r, 0, largeArcFlag, 0, end.x, end.y].join(" ");
  };

  const backgroundTrackPath = describeArc(center, center, radius, startAngle, startAngle + totalSweep);
  const activeArcPath = describeArc(center, center, radius, startAngle, currentAngle);
  const startNode = polarToCartesian(center, center, radius, startAngle);
  const endNode = polarToCartesian(center, center, radius, currentAngle);

  const milestones = [
    { label: "0%", angle: -135 },
    { label: "25%", angle: -67.5 },
    { label: "50%", angle: 0 },
    { label: "75%", angle: 67.5 },
    { label: "100%", angle: 135 },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-32 select-none">
      {/* ========================================================= */}
      {/* 1. TOP PURPLE HERO APP BAR (COMPLETELY PRESERVED AS DIRECTED) */}
      {/* ========================================================= */}
      <div className="w-full bg-[#271549] text-white pt-3 pb-4 px-4 shadow-md relative z-20">
        {/* Status bar notch representation */}
        <div className="flex items-center justify-between text-[11px] text-purple-200/80 font-mono pb-2 border-b border-white/10">
          <span className="flex items-center gap-1 font-semibold">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>CHEIN LIVE</span>
          </span>
          <span className="font-bold tracking-wider">
            {isHindi ? `दिन ${currentDay} • रिटेल स्टोर #104` : `DAY ${currentDay} • RETAIL TILL #1`}
          </span>
          <span>9:41 AM</span>
        </div>

        <div className="flex items-center justify-between pt-3">
          {/* Back button '<' */}
          <button
            type="button"
            onClick={onBack}
            className="w-9 h-9 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-95 transition-all flex items-center justify-center text-white border border-white/15 cursor-pointer"
            title={isHindi ? "वापस जाएं" : "Back to Home"}
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
          </button>

          {/* Heading: TODAY'S GOAL */}
          <div className="text-center">
            <h1 className="text-sm font-black tracking-widest uppercase text-white font-mono">
              {isHindi ? "आज का लक्ष्य" : "TODAY'S GOAL"}
            </h1>
            <p className="text-[10px] text-purple-200 font-bold uppercase tracking-wider">
              {isHindi ? "दैनिक ऑनबोर्डिंग प्लान" : "Daily Learning & Floor Plan"}
            </p>
          </div>

          {/* Language toggle */}
          {onToggleLanguage ? (
            <button
              type="button"
              onClick={onToggleLanguage}
              className="px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-white text-[11px] font-black tracking-wide border border-white/15 transition-all cursor-pointer active:scale-95 flex items-center gap-1"
            >
              <Languages className="w-3 h-3 text-purple-200" />
              <span>{isHindi ? "हिंदी" : "EN"}</span>
            </button>
          ) : (
            <div className="w-9" />
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* MAIN CONTENT CONTAINER                                    */}
      {/* ========================================================= */}
      <div className="max-w-md mx-auto px-4 space-y-4 pt-3">
        {/* Role Selector Pill */}
        <div className="relative flex justify-center">
          <button
            type="button"
            onClick={() => setIsRoleDropdownOpen((prev) => !prev)}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white hover:bg-slate-50 border border-slate-200/90 shadow-2xs text-xs font-black text-slate-800 tracking-tight transition-all active:scale-98 cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-violet-600" />
            <span>{selectedRole}</span>
            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                isRoleDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Role selector dropdown */}
          {isRoleDropdownOpen && (
            <div className="absolute top-10 z-30 w-64 rounded-2xl bg-white border border-slate-200 shadow-xl py-1.5 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100">
                {isHindi ? "भूमिका व क्षेत्र चुनें" : "Select Role & Work Zone"}
              </div>
              {[
                "Retail Cashier • Till 1",
                "Express Counter • Fast Basket",
                "Produce & PLU Specialist",
                "POS & Digital Payment Pro",
              ].map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => {
                    setSelectedRole(role);
                    setIsRoleDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                    selectedRole === role ? "bg-purple-50 text-purple-800" : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span>{role}</span>
                  {selectedRole === role && <Check className="w-3.5 h-3.5 text-purple-700 stroke-[3]" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Circular Progress Gauge & Live Progress Bar */}
        <div className="bg-white rounded-[32px] p-4 border border-purple-100 shadow-xs flex flex-col items-center relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-200/20 rounded-full blur-3xl pointer-events-none" />

          {/* SVG Circular Gauge */}
          <div className="relative w-[240px] h-[195px] flex items-center justify-center">
            <svg width="240" height="205" viewBox="0 0 260 230" className="overflow-visible">
              <defs>
                <linearGradient id="landingOrangeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFA62B" />
                  <stop offset="50%" stopColor="#FF7A00" />
                  <stop offset="100%" stopColor="#FF5500" />
                </linearGradient>
                <filter id="orangeGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#FF7A00" floodOpacity="0.4" />
                </filter>
              </defs>

              {/* Background circular track (grey) */}
              <path
                d={backgroundTrackPath}
                fill="none"
                stroke="#E5E7EB"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
              />

              {/* Active orange progression arc */}
              <path
                d={activeArcPath}
                fill="none"
                stroke="url(#landingOrangeGrad)"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                filter="url(#orangeGlow)"
              />

              {/* Start circular terminal node */}
              <circle cx={startNode.x} cy={startNode.y} r={strokeWidth / 2 + 1} fill="#FFA62B" />

              {/* Active current circular terminal node */}
              <circle
                cx={endNode.x}
                cy={endNode.y}
                r={strokeWidth / 2 + 3}
                fill="#FF5500"
                stroke="#FFFFFF"
                strokeWidth="2.5"
                filter="url(#orangeGlow)"
              />

              {/* Cardinal scale markers */}
              {milestones.map((m, idx) => {
                const pt = polarToCartesian(center, center, radius + 18, m.angle);
                return (
                  <text
                    key={idx}
                    x={pt.x}
                    y={pt.y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    className="text-[11px] font-bold fill-slate-400 select-none"
                  >
                    {m.label}
                  </text>
                );
              })}
            </svg>

            {/* Central percentage readout (Daily Present Day Progress) */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pt-2 pointer-events-none">
              <div className="flex items-baseline gap-0.5">
                <span className="text-5xl font-black text-slate-900 tracking-tighter leading-none">
                  {dailyProgressPct}
                </span>
                <span className="text-2xl font-black text-amber-500">%</span>
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 mt-1">
                {isHindi ? `आज की प्रगति (शिफ्ट #${currentDay})` : `Day ${currentDay} Daily Progress`}
              </span>
              <div className="mt-1 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200/80 text-[10px] font-black text-amber-800 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                <span>{completedCount} / 5 {isHindi ? "कदम निष्पादित" : "Steps Completed"}</span>
              </div>
            </div>
          </div>

          {/* Flat Horizontal Line representing Career % Progress */}
          <div className="w-full mt-2 space-y-1.5 px-2 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
              <span className="flex items-center gap-1.5 font-bold">
                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                <span>{isHindi ? "करियर प्रगति (रेडीनेस)" : "Career Readiness %"}</span>
              </span>
              <span className="text-[#7025fb] font-mono font-black text-xs">
                {liveReadinessPct}% / 100%
              </span>
            </div>
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
              <div
                className="h-full bg-gradient-to-r from-amber-400 via-[#7025fb] to-emerald-500 rounded-full transition-all duration-500 shadow-2xs"
                style={{ width: `${Math.min(100, liveReadinessPct)}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-500 font-medium pt-0.5">
              <span>{isHindi ? `शिफ्ट #${currentDay} करियर स्कोर` : `Overall Career Readiness`}</span>
              <span className="font-bold text-emerald-600">+{bonusPoints}% {isHindi ? "आज अर्जित" : "Earned Today"}</span>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* SECTION TITLE: 5 THINGS TO REACH TARGET                   */}
        {/* ========================================================= */}
        <div className="pt-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#7025fb]" />
                <span>
                  {isHindi ? "लक्ष्य तक पहुंचने के 5 कार्य" : "5 Steps to Reach Your Target"}
                </span>
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {isHindi
                  ? "प्रत्येक कार्ड पर टैप करके कारण (Why), निर्देश (What) व वीडियो देखें"
                  : "Tap any card to view Why it was assigned, What to do & Video"}
              </p>
            </div>

            <span className="text-xs font-black text-[#7025fb] bg-purple-50 border border-purple-200/80 px-2.5 py-1 rounded-full">
              {completedCount} / 5
            </span>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 5 CLEAR, EXPANDABLE ACTION CARDS                         */}
        {/* ========================================================= */}
        <div className="space-y-3">
          {GOAL_CARDS.map((card) => {
            const isExpanded = expandedCardId === card.id;
            const isDone = completedCardIds[card.id];
            const isPlayingThisVideo = playingVideoId === card.id;

            return (
              <div
                key={card.id}
                className={`rounded-3xl border transition-all duration-200 overflow-hidden shadow-2xs ${
                  isDone
                    ? "bg-emerald-50/40 border-emerald-300"
                    : isExpanded
                    ? "bg-white border-[#7025fb]/40 ring-2 ring-[#7025fb]/10 shadow-md"
                    : "bg-white border-slate-200 hover:border-purple-300 hover:shadow-xs"
                }`}
              >
                {/* ---------------- CARD HEADER (ALWAYS VISIBLE) ---------------- */}
                <div
                  onClick={() => handleToggleCardExpansion(card.id)}
                  className="p-4 cursor-pointer flex items-start justify-between gap-3 select-none"
                >
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    {/* Completion Checkbox Button */}
                    <button
                      type="button"
                      onClick={(e) => handleToggleCardDone(card.id, e)}
                      className={`w-6 h-6 rounded-xl flex items-center justify-center shrink-0 mt-0.5 transition-all cursor-pointer ${
                        isDone
                          ? "bg-emerald-600 text-white shadow-xs"
                          : "border-2 border-slate-300 hover:border-[#7025fb] text-transparent hover:text-purple-300"
                      }`}
                      aria-label="Toggle Complete"
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </button>

                    {/* Title and High-level Summary */}
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-purple-100 text-[#7025fb] font-mono">
                          STEP {card.stepNumber}
                        </span>
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                          {isHindi ? card.tagHi : card.tag}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {card.duration}
                        </span>
                        <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                          +{card.readinessPoints}%
                        </span>
                      </div>

                      <h3
                        className={`text-sm font-black leading-snug tracking-tight ${
                          isDone ? "line-through text-slate-400" : "text-slate-900"
                        }`}
                      >
                        {isHindi ? card.titleHi : card.title}
                      </h3>

                      {/* Clean 1-line Why & What preview when collapsed */}
                      {!isExpanded && (
                        <p className="text-[11px] text-slate-500 line-clamp-1 pt-0.5">
                          <span className="font-bold text-purple-800">
                            {isHindi ? "कारण: " : "Why: "}
                          </span>
                          {isHindi ? card.whyTextHi : card.whyText}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Expand / Collapse Chevron */}
                  <div className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 shrink-0 transition-colors">
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-purple-700" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </div>

                {/* ---------------- EXPANDED DETAILS (WHY, WHAT, VIDEO) ---------------- */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-1 border-t border-slate-100 space-y-3.5 bg-gradient-to-b from-slate-50/50 to-white animate-in fade-in duration-200">
                    {/* BOX 1: WHY IS THIS TASK GIVEN TO ME? */}
                    <div className="p-3 rounded-2xl bg-purple-50/70 border border-purple-100 text-xs space-y-1">
                      <div className="flex items-center gap-1.5 font-black text-[#7025fb]">
                        <Info className="w-4 h-4 shrink-0" />
                        <span className="uppercase tracking-wide text-[11px]">
                          {isHindi ? "यह कार्य मुझे क्यों दिया गया है? (WHY)" : "WHY THIS IS ASSIGNED TO YOU"}
                        </span>
                      </div>
                      <p className="text-slate-700 leading-relaxed font-medium pl-5">
                        {isHindi ? card.whyTextHi : card.whyText}
                      </p>
                    </div>

                    {/* BOX 2: WHAT DO I HAVE TO DO? */}
                    <div className="p-3 rounded-2xl bg-amber-50/60 border border-amber-100 text-xs space-y-1.5">
                      <div className="flex items-center gap-1.5 font-black text-amber-900">
                        <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                        <span className="uppercase tracking-wide text-[11px]">
                          {isHindi ? "मुझे क्या करना है? (WHAT TO DO)" : "WHAT YOU NEED TO DO"}
                        </span>
                      </div>
                      <p className="text-slate-800 font-bold pl-5 leading-snug">
                        {isHindi ? card.whatTextHi : card.whatText}
                      </p>

                      {/* Action Steps Bullets */}
                      <div className="pl-5 pt-1 space-y-1.5">
                        {card.actionBullets.map((bullet, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-[11px] text-slate-700">
                            <span className="w-4 h-4 rounded-full bg-amber-200 text-amber-900 font-black flex items-center justify-center shrink-0 text-[10px] mt-0.5">
                              {idx + 1}
                            </span>
                            <span className="leading-snug">
                              {isHindi ? bullet.hi : bullet.en}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* BOX 3: VIDEO PLAYER & DEMO DEMONSTRATION */}
                    {card.videoTitle && (
                      <div className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-900 text-white">
                        {/* Video Screen / Simulation */}
                        <div className="relative aspect-video w-full overflow-hidden flex items-center justify-center bg-black">
                          <img
                            src={card.videoThumbnailUrl}
                            alt={card.videoTitle}
                            className={`w-full h-full object-cover transition-opacity duration-300 ${
                              isPlayingThisVideo ? "opacity-60" : "opacity-80"
                            }`}
                            referrerPolicy="no-referrer"
                          />

                          {/* Overlay Gradient */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none" />

                          {/* Top video bar */}
                          <div className="absolute top-2.5 left-3 right-3 flex items-center justify-between text-[10px] text-white/90 z-10">
                            <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-xs font-mono font-bold flex items-center gap-1">
                              <Video className="w-3 h-3 text-purple-400" />
                              <span>{card.videoDuration}</span>
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-[#7025fb] font-black text-[9px] uppercase tracking-wider">
                              DEMO VIDEO
                            </span>
                          </div>

                          {/* Play / Pause Interactive Button */}
                          <button
                            type="button"
                            onClick={() =>
                              setPlayingVideoId((prev) => (prev === card.id ? null : card.id))
                            }
                            className="w-13 h-13 rounded-full bg-white/90 hover:bg-white text-[#7025fb] shadow-xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer z-10"
                            aria-label="Play video"
                          >
                            {isPlayingThisVideo ? (
                              <Pause className="w-6 h-6 fill-current" />
                            ) : (
                              <Play className="w-6 h-6 fill-current translate-x-0.5" />
                            )}
                          </button>

                          {/* Video progress indicator simulation when playing */}
                          {isPlayingThisVideo && (
                            <div className="absolute bottom-2 left-3 right-3 flex items-center gap-2 text-[10px] text-white/80 z-10">
                              <span className="font-mono">1:12</span>
                              <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
                                <div className="h-full bg-amber-400 rounded-full w-[55%] animate-pulse" />
                              </div>
                              <span className="font-mono">{card.videoDuration}</span>
                              <Volume2 className="w-3.5 h-3.5" />
                              <Maximize2 className="w-3.5 h-3.5" />
                            </div>
                          )}
                        </div>

                        {/* Video Footer & Key Tips */}
                        <div className="p-3 bg-slate-900 border-t border-white/10 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-white">
                              {isHindi ? card.videoTitleHi : card.videoTitle}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                setPlayingVideoId((prev) => (prev === card.id ? null : card.id))
                              }
                              className="text-[11px] font-bold text-amber-400 hover:text-amber-300 underline cursor-pointer"
                            >
                              {isPlayingThisVideo
                                ? isHindi
                                  ? "रोकें"
                                  : "Pause"
                                : isHindi
                                ? "वीडियो चलाएं"
                                : "Play Video"}
                            </button>
                          </div>

                          {/* Key Takeaways */}
                          <div className="space-y-1 text-[11px] text-slate-300">
                            {card.videoTips.map((tip, idx) => (
                              <div key={idx} className="flex items-start gap-1.5">
                                <span className="text-amber-400">•</span>
                                <span>{isHindi ? tip.hi : tip.en}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* SPECIAL ACTION 1: CALL BUDDY VIKRAM */}
                    {card.isSpecialAction === "buddy_call" && (
                      <div className="p-3 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                            V
                          </div>
                          <div>
                            <div className="text-xs font-bold text-indigo-950">
                              {isHindi ? "सीनियर बडी विक्रम से संपर्क करें" : "Connect with Buddy Vikram"}
                            </div>
                            <p className="text-[10px] text-indigo-600 font-medium">
                              {isHindi ? "ज़ोन A बे #2 पर उपलब्ध" : "Available at Zone A Bay #2"}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            if (onOpenBuddy) onOpenBuddy();
                            else if (onSelectSection) onSelectSection("buddy");
                          }}
                          className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <Phone className="w-3 h-3" />
                          <span>{isHindi ? "कॉल / चैट" : "Call / Chat"}</span>
                        </button>
                      </div>
                    )}

                    {/* SPECIAL ACTION 2: 30-SECOND VOICE REFLECTION */}
                    {card.isSpecialAction === "voice_checkin" && (
                      <div className="p-3 rounded-2xl bg-purple-50 border border-purple-100 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-purple-950 flex items-center gap-1.5">
                            <Mic className="w-3.5 h-3.5 text-[#7025fb]" />
                            <span>{isHindi ? "30 सेकंड वॉयस रिकॉर्डिंग" : "30-Sec Voice Check-in"}</span>
                          </span>
                          <span className="text-[10px] text-slate-500 font-medium">
                            {voiceSubmitted
                              ? isHindi
                                ? "✓ सबमिट हुआ"
                                : "✓ Submitted"
                              : voiceRecording
                              ? "🔴 Recording..."
                              : "Tap to record"}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              if (!voiceRecording) {
                                setVoiceRecording(true);
                                setTimeout(() => {
                                  setVoiceRecording(false);
                                  setVoiceSubmitted(true);
                                  handleToggleCardDone(card.id);
                                }, 3000);
                              }
                            }}
                            className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                              voiceSubmitted
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                : voiceRecording
                                ? "bg-red-500 text-white animate-pulse"
                                : "bg-[#7025fb] hover:bg-[#601ee0] text-white shadow-xs"
                            }`}
                          >
                            <Mic className="w-3.5 h-3.5" />
                            <span>
                              {voiceSubmitted
                                ? isHindi
                                  ? "वॉयस नोट भेजा गया (+2% सुरक्षित)"
                                  : "Voice Note Recorded (+2% Locked)"
                                : voiceRecording
                                ? isHindi
                                  ? "रिकॉर्ड हो रहा है (3s)..."
                                  : "Recording 3s sample..."
                                : isHindi
                                ? "वॉयस संदेश बोलें"
                                : "Record 30s Reflection"}
                            </span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* COMPLETE & CLAIM POINTS BUTTON */}
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={(e) => handleToggleCardDone(card.id, e)}
                        className={`w-full py-3 px-4 rounded-2xl font-black text-xs uppercase tracking-wider transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer ${
                          isDone
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                            : "bg-[#7025fb] hover:bg-[#601ee0] text-white shadow-md shadow-purple-600/25"
                        }`}
                      >
                        {isDone ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                            <span>
                              {isHindi
                                ? `कार्य पूर्ण (+${card.readinessPoints}% रेडीनेस अर्जित)`
                                : `Step ${card.stepNumber} Done (+${card.readinessPoints}% Added)`}
                            </span>
                          </>
                        ) : (
                          <>
                            <span>
                              {isHindi
                                ? `कार्य पूरा करें व +${card.readinessPoints}% अंक लें`
                                : `Mark Step ${card.stepNumber} Complete & Claim +${card.readinessPoints}%`}
                            </span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* BOTTOM CELEBRATION SUMMARY */}
        {completedCount >= 5 && (
          <div className="p-4 rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-lg space-y-2 animate-in fade-in duration-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-200 shrink-0" />
              <h3 className="font-black text-sm uppercase tracking-wide">
                {isHindi ? "बधाई! आज के सभी 5 कार्य पूरे हुए" : "All 5 Target Steps Complete!"}
              </h3>
            </div>
            <p className="text-xs text-emerald-100 leading-relaxed font-medium">
              {isHindi
                ? "आपका करियर रेडीनेस स्कोर 85% के बेंचमार्क को छू चुका है। आप अगली शिफ्ट के लिए पूर्ण रूप से तैयार हैं।"
                : "You have completed all prescribed modules, routes, and drills for Day 3. Your Career Readiness score is at target!"}
            </p>
            <button
              type="button"
              onClick={onBack}
              className="w-full py-2.5 rounded-xl bg-white text-emerald-900 font-black text-xs hover:bg-emerald-50 active:scale-95 transition-all cursor-pointer shadow-sm"
            >
              {isHindi ? "होम डैशबोर्ड पर वापस जाएं" : "Return to Home Dashboard"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
