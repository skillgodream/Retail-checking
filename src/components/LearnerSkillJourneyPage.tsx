import React from "react";
import { ArrowLeft, User } from "lucide-react";
import { NewHire } from "../types";
import { LearnerJourneyRoadmap } from "./LearnerJourneyRoadmap";

interface LearnerSkillJourneyPageProps {
  newHire: NewHire;
  currentDay: number;
  isHindi?: boolean;
  onBack: () => void;
  onNavigateToSection?: (section: "modules" | "buddy" | "dashboard" | "home") => void;
  onOpenWorkTools?: () => void;
}

/**
 * Dedicated, 100% Learner-Only Skill Journey Page.
 * Strictly displays the logged-in learner's own 5-level journey, daily floor missions,
 * and audio coach—completely free of other workers' data or manager diagnostic tables.
 */
export const LearnerSkillJourneyPage: React.FC<LearnerSkillJourneyPageProps> = ({
  newHire,
  currentDay,
  isHindi = false,
  onBack,
  onNavigateToSection,
  onOpenWorkTools,
}) => {
  return (
    <div className="max-w-md mx-auto px-4 py-3 space-y-4 pb-16 select-none animate-in fade-in duration-200">
      {/* Top Learner Bar: Back button + Personal Header */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2.5">
          <button
            id="learner-journey-back-btn"
            onClick={onBack}
            className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 active:scale-95 transition-all cursor-pointer shadow-2xs"
            title={isHindi ? "पीछे जाएं" : "Back to Dashboard"}
            aria-label="Back"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
          </button>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 block">
              {isHindi ? "मेरी स्किल जर्नी" : "My Skill Journey"}
            </span>
            <h1 className="text-lg sm:text-xl font-black text-slate-900 leading-tight">
              {newHire.name.split(" ")[0]}'s 10-Day Pathway
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-800 text-xs font-bold">
          <User className="w-3.5 h-3.5 text-purple-600" />
          <span>Day {currentDay}/10</span>
        </div>
      </div>

      {/* The Learner's Pure 5-Level Visual Roadmap & Floor Missions */}
      <LearnerJourneyRoadmap
        newHire={newHire}
        currentDay={currentDay}
        isHindi={isHindi}
        onNavigateToSection={onNavigateToSection}
        onOpenWorkTools={onOpenWorkTools}
      />
    </div>
  );
};
