import React, { useState } from "react";
import { X, Sparkles, CheckCircle2, User, Globe, ArrowRight, ShieldCheck, LogIn, ChevronRight } from "lucide-react";

interface OnboardingViewProps {
  onStartDay: () => void;
  learnerName?: string;
  isHindi?: boolean;
  onToggleLanguage?: () => void;
  onSelectRole?: (role: "new_hire" | "manager") => void;
}

export const OnboardingView: React.FC<OnboardingViewProps> = ({
  onStartDay,
  learnerName = "Associate",
  isHindi = false,
  onToggleLanguage,
  onSelectRole,
}) => {
  const [showMenu, setShowMenu] = useState<boolean>(false);
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [imgError, setImgError] = useState<boolean>(false);

  // Relevant photo of young colleagues/learners smiling and pointing at a digital tablet together
  const primaryImg =
    "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1200&auto=format&fit=crop";
  const fallbackImg =
    "https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=1200&auto=format&fit=crop";

  const handleQuickLogin = (role: "new_hire" | "manager") => {
    setShowLoginModal(false);
    if (onSelectRole) {
      onSelectRole(role);
    } else {
      onStartDay();
    }
  };

  return (
    <div
      id="login-landing-container"
      className="relative w-full h-full min-h-screen md:min-h-[812px] flex flex-col justify-between overflow-hidden select-none font-sans bg-[#F4F1FA] text-slate-900"
    >
      {/* ========================================================================= */}
      {/* 1. TOP PHOTO HERO SECTION WITH PURPLE THEME GRAVITY OVERLAY               */}
      {/* ========================================================================= */}
      <div className="relative w-full flex-1 min-h-[460px] sm:min-h-[500px] overflow-hidden flex flex-col justify-between">
        {/* Photographic Background */}
        <div className="absolute inset-0">
          <img
            src={imgError ? fallbackImg : primaryImg}
            alt="Learners working on digital tablet"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover object-center transform scale-105 transition-transform duration-1000"
            referrerPolicy="no-referrer"
          />

          {/* Color Theme Gravity Overlay: Signature Deep Purple / Violet Duotone */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(180deg, rgba(112, 37, 251, 0.45) 0%, rgba(90, 24, 184, 0.40) 40%, rgba(46, 12, 94, 0.85) 100%)",
              mixBlendMode: "multiply",
            }}
          />

          {/* Secondary ambient warmth gradient to maintain photographic realism */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(circle at 75% 20%, rgba(255, 140, 160, 0.35) 0%, rgba(112, 37, 251, 0.3) 50%, rgba(30, 8, 60, 0.8) 100%)",
            }}
          />

          {/* Soft dark vignette gradient at the bottom for crisp white typography legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-purple-950/80 via-transparent to-black/20 pointer-events-none" />
        </div>

        {/* --------------------------------------------------------------------- */}
        {/* TOP NAVIGATION BAR: 2-LINE HAMBURGER ON LEFT & WHITE CIRCLE ON RIGHT */}
        {/* --------------------------------------------------------------------- */}
        <div className="relative z-20 px-6 pt-7 sm:pt-8 flex items-center justify-between">
          {/* Hamburger Icon: 2 horizontal lines matching the attached screenshot */}
          <button
            type="button"
            onClick={() => setShowMenu(true)}
            className="p-2 -ml-2 rounded-xl hover:bg-white/15 active:scale-95 transition-all cursor-pointer group flex flex-col gap-1.5 justify-center"
            aria-label="Navigation Menu"
          >
            {/* Top longer line */}
            <span className="w-6 h-[2.5px] bg-white rounded-full group-hover:bg-purple-200 transition-colors shadow-xs" />
            {/* Bottom shorter line */}
            <span className="w-4 h-[2.5px] bg-white rounded-full group-hover:bg-purple-200 transition-colors shadow-xs" />
          </button>

          {/* White Solid Circle on Right */}
          <button
            type="button"
            onClick={() => setShowLoginModal(true)}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center justify-center"
            aria-label="Account profile"
          >
            <span className="w-2 h-2 rounded-full bg-[#7025fb]" />
          </button>
        </div>

        {/* --------------------------------------------------------------------- */}
        {/* OVERLAID DISPLAY TYPOGRAPHY (MATCHING SCREENSHOT STACKED FORMAT)      */}
        {/* --------------------------------------------------------------------- */}
        <div className="relative z-20 px-6 sm:px-7 pb-8 pt-4">
          <h1 className="text-[34px] sm:text-[38px] font-black text-white leading-[1.08] tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.35)]">
            {isHindi ? (
              <>
                <span className="block">आसान और</span>
                <span className="block">तेज़</span>
                <span className="block">ऑनलाइन</span>
                <span className="block">सीखें!</span>
              </>
            ) : (
              <>
                <span className="block">Easy and</span>
                <span className="block">quick</span>
                <span className="block">Learn</span>
                <span className="block">Operations</span>
                <span className="block">online!</span>
              </>
            )}
          </h1>

          <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/25 text-white text-[11px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>{isHindi ? "डार्क स्टोर व वेयरहाउस ट्रेनिंग" : "Warehouse & Dark Store Ops"}</span>
          </div>
        </div>

        {/* Organic Curved Wave Accent at bottom of photo, framing the white bottom card */}
        <div className="absolute -bottom-1 left-0 right-0 w-full pointer-events-none overflow-hidden leading-none z-10">
          <svg
            viewBox="0 0 400 36"
            className="w-full h-9 text-[#F4F1FA] fill-current"
            preserveAspectRatio="none"
          >
            <path d="M 0,36 C 80,10 180,36 400,12 L 400,36 L 0,36 Z" />
          </svg>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. WHITE CARD BOTTOM SECTION WITH "START" AND "SIGN UP" PILL BUTTONS       */}
      {/* ========================================================================= */}
      <div
        id="login-bottom-card"
        className="relative z-20 bg-white rounded-b-[44px] px-6 pt-5 pb-8 sm:pb-9 shadow-[0_-10px_25px_rgba(112,37,251,0.06)] flex flex-col justify-center space-y-3"
      >
        {/* TOP PILL BUTTON: "START" (SOFT TINTED PASTEL PILL) */}
        <button
          id="btn-login-start"
          type="button"
          onClick={onStartDay}
          className="w-full py-3.5 sm:py-4 px-6 rounded-2xl sm:rounded-full bg-[#f3e8ff] hover:bg-[#ede9fe] active:scale-[0.985] text-[#7025fb] font-black text-sm sm:text-[15px] uppercase tracking-wider text-center transition-all cursor-pointer border border-purple-200/80 shadow-xs flex items-center justify-center gap-2"
        >
          <span>{isHindi ? "शुरू करें (START)" : "START"}</span>
          <ArrowRight className="w-4 h-4 text-[#7025fb] stroke-[2.5]" />
        </button>

        {/* BOTTOM PILL BUTTON: "SIGN UP" / "LOG IN" (VIBRANT PURPLE THEME PILL) */}
        <button
          id="btn-login-signup"
          type="button"
          onClick={() => setShowLoginModal(true)}
          className="w-full py-3.5 sm:py-4 px-6 rounded-2xl sm:rounded-full bg-[#7025fb] hover:bg-[#601ee0] active:scale-[0.985] text-white font-black text-sm sm:text-[15px] uppercase tracking-wider text-center transition-all cursor-pointer shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2"
        >
          <span>{isHindi ? "साइन अप / लॉग इन (SIGN UP)" : "SIGN UP"}</span>
        </button>

        {/* Subtle trust / language toggle caption */}
        <div className="pt-1 flex items-center justify-between text-[11px] text-slate-400 font-medium px-2">
          <span>{isHindi ? "चेक-इन चेकआउट v2.4" : "Checkin Checkout v2.4"}</span>
          {onToggleLanguage && (
            <button
              type="button"
              onClick={onToggleLanguage}
              className="text-[#7025fb] font-bold hover:underline cursor-pointer flex items-center gap-1"
            >
              <Globe className="w-3 h-3" />
              <span>{isHindi ? "English में बदलें" : "हिंदी में देखें"}</span>
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. SLIDE-OVER / MODAL MENU (TRIGGERED BY TOP-LEFT 2-LINE HAMBURGER)       */}
      {/* ========================================================================= */}
      {showMenu && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-[32px] max-w-xs w-full p-5 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#7025fb] text-white flex items-center justify-center font-bold text-xs">
                  ✓
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">Checkin Checkout</h3>
                  <p className="text-[10px] text-slate-500">Dark Store Learning OS</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowMenu(false)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  setShowMenu(false);
                  onStartDay();
                }}
                className="w-full p-3 rounded-2xl bg-purple-50 hover:bg-purple-100 text-[#7025fb] font-bold flex items-center justify-between cursor-pointer transition-colors"
              >
                <span className="flex items-center gap-2">
                  <LogIn className="w-4 h-4" />
                  <span>{isHindi ? "दैनिक शिफ्ट शुरू करें" : "Enter Shift Dashboard"}</span>
                </span>
                <ChevronRight className="w-4 h-4" />
              </button>

              {onToggleLanguage && (
                <button
                  type="button"
                  onClick={() => {
                    onToggleLanguage();
                    setShowMenu(false);
                  }}
                  className="w-full p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold flex items-center justify-between cursor-pointer transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-purple-600" />
                    <span>{isHindi ? "Switch to English" : "हिंदी भाषा चुनें"}</span>
                  </span>
                  <span className="text-[11px] text-slate-400 font-normal">
                    {isHindi ? "EN" : "HI"}
                  </span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setShowMenu(false);
                  setShowLoginModal(true);
                }}
                className="w-full p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold flex items-center justify-between cursor-pointer transition-colors"
              >
                <span className="flex items-center gap-2">
                  <User className="w-4 h-4 text-purple-600" />
                  <span>{isHindi ? "रोल या खाता चुनें" : "Select Role / Persona"}</span>
                </span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowMenu(false)}
              className="w-full py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 cursor-pointer transition-colors"
            >
              {isHindi ? "बंद करें" : "Close"}
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. LOGIN / SIGN UP MODAL (QUICK PERSONA & CREDENTIALS SELECTOR)           */}
      {/* ========================================================================= */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-[32px] max-w-sm w-full p-5 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  {isHindi ? "लॉग इन / साइन अप" : "Log In / Sign Up"}
                </h3>
                <p className="text-xs text-slate-500">
                  {isHindi ? "आगे बढ़ने के लिए अपनी भूमिका चुनें" : "Choose your role to continue"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowLoginModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5">
              {/* Persona 1: Learner / Associate */}
              <button
                type="button"
                onClick={() => handleQuickLogin("new_hire")}
                className="w-full p-3.5 rounded-2xl bg-purple-50/80 hover:bg-purple-100 border border-purple-200/80 text-left flex items-center justify-between cursor-pointer transition-all active:scale-[0.99]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#7025fb] text-white flex items-center justify-center font-black text-sm">
                    A
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">
                      {isHindi ? "वेयरहाउस एसोसिएट (लर्नर)" : "Warehouse Associate (Learner)"}
                    </div>
                    <div className="text-[11px] text-purple-700 font-medium">
                      {isHindi ? "डे 3/14 • पिकिंग व ट्रेनिंग" : "Day 3/14 • Shift Ops & LMS"}
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#7025fb]" />
              </button>

              {/* Persona 2: Manager / Shift Lead */}
              <button
                type="button"
                onClick={() => handleQuickLogin("manager")}
                className="w-full p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-left flex items-center justify-between cursor-pointer transition-all active:scale-[0.99]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-sm">
                    M
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">
                      {isHindi ? "शिफ्ट सुपरवाइज़र / मैनेजर" : "Shift Supervisor / Manager"}
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium">
                      {isHindi ? "कोहोर्ट सिग्नल व हस्तक्षेप" : "Cohort Signals & Interventions"}
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-600" />
              </button>
            </div>

            {/* Direct One-click Start */}
            <button
              type="button"
              onClick={() => {
                setShowLoginModal(false);
                onStartDay();
              }}
              className="w-full py-3 rounded-2xl bg-[#7025fb] text-white text-xs font-bold shadow-md shadow-purple-500/20 active:scale-95 transition-transform cursor-pointer"
            >
              {isHindi ? "तुरंत शुरू करें (Instant Start)" : "Instant Start"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
