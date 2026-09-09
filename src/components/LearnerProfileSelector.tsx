import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, CheckCircle2, AlertTriangle } from "lucide-react";
import { NewHire } from "../types";
import { assessReadiness } from "../services/intelligence";

interface LearnerProfileSelectorProps {
  newHires: NewHire[];
  activeHireId: string;
  onSelectHire: (hireId: string) => void;
  variant?: "light" | "dark" | "hero";
  isHindi?: boolean;
}

export const LearnerProfileSelector: React.FC<LearnerProfileSelectorProps> = ({
  newHires,
  activeHireId,
  onSelectHire,
  variant = "light",
  isHindi = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeHire = newHires.find((h) => h.id === activeHireId) || newHires[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  if (!activeHire || !newHires || newHires.length === 0) return null;

  const getStatusBadge = (status: string) => {
    if (status === "Doing well") {
      return {
        dotBg: "bg-emerald-500",
        badgeBg: "bg-emerald-50 text-emerald-700 border-emerald-200",
        label: isHindi ? "बढ़िया" : "Doing well",
        icon: <CheckCircle2 className="w-3 h-3 text-emerald-600" />,
      };
    }
    if (status === "Needs attention") {
      return {
        dotBg: "bg-amber-500",
        badgeBg: "bg-amber-50 text-amber-700 border-amber-200",
        label: isHindi ? "ध्यान दें" : "Needs attention",
        icon: <AlertTriangle className="w-3 h-3 text-amber-600" />,
      };
    }
    return {
      dotBg: "bg-fuchsia-500",
      badgeBg: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200",
      label: isHindi ? "रिस्क में" : "At risk",
      icon: <AlertTriangle className="w-3 h-3 text-fuchsia-600" />,
    };
  };

  const currentStatus = getStatusBadge(activeHire.status);
  const currentReadiness = typeof activeHire.overallReadinessScore === "number"
    ? (activeHire.overallReadinessScore <= 1 ? Math.round(activeHire.overallReadinessScore * 100) : Math.round(activeHire.overallReadinessScore))
    : assessReadiness(activeHire.capabilities || {}, activeHire);

  // Variant styling for the trigger button
  const triggerStyle =
    variant === "hero"
      ? "bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-md shadow-xs"
      : variant === "dark"
      ? "bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 shadow-2xs"
      : "bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-200/80 shadow-2xs";

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Selector Trigger Button */}
      <button
        id="global-learner-selector-btn"
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`px-2.5 py-1.5 rounded-2xl transition-all cursor-pointer flex items-center gap-2 active:scale-95 ${triggerStyle}`}
        title={isHindi ? "शिक्षार्थी प्रोफाइल बदलें" : "Switch Learner Profile"}
        aria-expanded={isOpen}
      >
        {/* Avatar + Status Indicator Dot */}
        <div className="relative w-6 h-6 rounded-full overflow-hidden bg-violet-600 text-white font-black text-[11px] flex items-center justify-center shrink-0 border border-white/40">
          {activeHire.avatar ? (
            <img src={activeHire.avatar} alt={activeHire.name} className="w-full h-full object-cover" />
          ) : (
            <span>{activeHire.name.charAt(0)}</span>
          )}
          <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ring-1 ring-white ${currentStatus.dotBg}`} />
        </div>

        {/* Learner Name & Readiness */}
        <div className="text-left min-w-0">
          <div className="text-xs font-black tracking-tight leading-none truncate max-w-[90px] sm:max-w-[130px]">
            {activeHire.name}
          </div>
          <div className="text-[10px] opacity-80 font-medium leading-none mt-0.5 flex items-center gap-1">
            <span>{currentReadiness}% ready</span>
          </div>
        </div>

        <ChevronDown className={`w-3.5 h-3.5 opacity-70 transition-transform duration-200 shrink-0 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div
          id="global-learner-selector-dropdown"
          className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-72 rounded-2xl bg-white text-slate-900 border border-slate-200 shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="px-3.5 py-2 border-b border-slate-100 flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              {isHindi ? "शिक्षार्थी प्रोफाइल चुनें" : "Active Cohort Learner"}
            </span>
            <span className="text-[10px] font-bold text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full">
              {newHires.length} {isHindi ? "सदस्य" : "Members"}
            </span>
          </div>

          <div className="p-1.5 space-y-1 max-h-72 overflow-y-auto">
            {newHires.map((hire) => {
              const isSelected = hire.id === activeHire.id;
              const readiness = typeof hire.overallReadinessScore === "number"
                ? (hire.overallReadinessScore <= 1 ? Math.round(hire.overallReadinessScore * 100) : Math.round(hire.overallReadinessScore))
                : assessReadiness(hire.capabilities || {}, hire);
              const statusInfo = getStatusBadge(hire.status);

              return (
                <button
                  key={hire.id}
                  id={`select-learner-${hire.id}`}
                  type="button"
                  onClick={() => {
                    onSelectHire(hire.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-all cursor-pointer text-left ${
                    isSelected
                      ? "bg-violet-50/80 border border-violet-200 text-violet-950 shadow-2xs"
                      : "hover:bg-slate-100 text-slate-800"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="relative w-8 h-8 rounded-full overflow-hidden bg-violet-600 text-white font-black text-xs flex items-center justify-center shrink-0 border border-slate-200">
                      {hire.avatar ? (
                        <img src={hire.avatar} alt={hire.name} className="w-full h-full object-cover" />
                      ) : (
                        <span>{hire.name.charAt(0)}</span>
                      )}
                      <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ring-2 ring-white ${statusInfo.dotBg}`} />
                    </div>

                    <div className="min-w-0">
                      <div className="text-xs font-black tracking-tight text-slate-900 truncate">
                        {hire.name}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate flex items-center gap-1.5 mt-0.5">
                        <span className="font-semibold text-violet-700">{readiness}% Readiness</span>
                        <span>•</span>
                        <span className="truncate">{hire.roleTitle || hire.role || "Retail Cashier"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 ${statusInfo.badgeBg}`}>
                      {statusInfo.icon}
                      <span>{statusInfo.label}</span>
                    </span>
                    {isSelected && <Check className="w-4 h-4 text-violet-600 stroke-[2.5]" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
