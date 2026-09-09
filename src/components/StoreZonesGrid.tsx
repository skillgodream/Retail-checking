import React, { useState } from "react";
import {
  Package,
  Layers,
  ThermometerSnowflake,
  ScanLine,
  Truck,
  UserCheck,
  CheckCircle2,
} from "lucide-react";

interface StoreZone {
  id: string;
  name: string;
  nameHindi: string;
  subtitle: string;
  subtitleHindi: string;
  icon: React.ReactNode;
  activeColor?: string;
  statusBadge?: string;
}

interface StoreZonesGridProps {
  onSelectZone?: (zoneId: string, zoneName: string) => void;
  onAisleSelect?: (zoneId?: string) => void;
  isHindi?: boolean;
  activeZoneId?: string;
  currentPickRate?: number;
  targetPickRate?: number;
  roleId?: string;
}

export const StoreZonesGrid: React.FC<StoreZonesGridProps> = ({
  onSelectZone,
  onAisleSelect,
  isHindi = false,
  activeZoneId = "express_till_1",
  roleId,
}) => {
  const [selectedId, setSelectedId] = useState<string>(activeZoneId);

  const isDarkStore = roleId === "dark_store_picker";

  const cashierZones: StoreZone[] = [
    {
      id: "express_till_1",
      name: "Till 1 — Express Checkout",
      nameHindi: "टिल 1 — एक्सप्रेस चेकआउट",
      subtitle: "Barcode Scanning & Rapid Checkout",
      subtitleHindi: "बारकोड स्कैनिंग व तेज़ बिलिंग",
      icon: <ScanLine className="w-7 h-7" />,
      statusBadge: isHindi ? "वर्तमान टिल" : "Active Till",
    },
    {
      id: "multi_tender_till_2",
      name: "Till 2 — Multi-Tender",
      nameHindi: "टिल 2 — मल्टी-टेंडर बिलिंग",
      subtitle: "Card, UPI QR, Digital Vouchers & Loyalty",
      subtitleHindi: "कार्ड, यूपीआई, वाउचर व लॉयल्टी",
      icon: <Truck className="w-7 h-7" />,
    },
    {
      id: "produce_weighing",
      name: "Produce Weighing Station",
      nameHindi: "सब्जी व फल तौल काउंटर",
      subtitle: "Manual Produce PLU Entry & Price Verification",
      subtitleHindi: "मैनुअल PLU एंट्री व मूल्य सत्यापन",
      icon: <Layers className="w-7 h-7" />,
    },
    {
      id: "service_desk",
      name: "Customer Service Desk",
      nameHindi: "कस्टमर सर्विस व रिटर्न डेस्क",
      subtitle: "Returns, Exchanges, Credit Notes & Exceptions",
      subtitleHindi: "रिटर्न, एक्सचेंज व क्रेडिट नोट",
      icon: <ThermometerSnowflake className="w-7 h-7" />,
    },
    {
      id: "scanner_dock",
      name: "Scanner Bay & Charging",
      nameHindi: "स्कैनर बे व चार्जिंग",
      subtitle: "Barcode Gun Connectivity & Paper Rolls",
      subtitleHindi: "बारकोड गन व प्रिंटर रोल",
      icon: <Package className="w-7 h-7" />,
    },
    {
      id: "buddy_desk",
      name: "Supervisor Desk",
      nameHindi: "विक्रम भैया डेस्क",
      subtitle: "Buddy Assistance & Price Overrides",
      subtitleHindi: "सुपरवाइजर सहायता केंद्र",
      icon: <UserCheck className="w-7 h-7" />,
    },
  ];

  const darkStoreZones: StoreZone[] = [
    {
      id: "aisles_1_3",
      name: "Aisles 1–3",
      nameHindi: "आइसल 1 से 3",
      subtitle: "Snacks & Instant Food",
      subtitleHindi: "चिप्स, बिस्कुट और मैगी",
      icon: <Package className="w-7 h-7" />,
    },
    {
      id: "aisles_4_8",
      name: "Aisles 4–8",
      nameHindi: "आइसल 4 से 8",
      subtitle: "Atta, Rice & Racks",
      subtitleHindi: "आटा, दाल और भारी रैक",
      icon: <Layers className="w-7 h-7" />,
      statusBadge: isHindi ? "वर्तमान फोकस" : "Current Focus",
    },
    {
      id: "cold_room",
      name: "Cold Room",
      nameHindi: "कोल्ड रूम",
      subtitle: "Dairy & Chilled Milk",
      subtitleHindi: "दूध, दही और पनीर (Aisle 8)",
      icon: <ThermometerSnowflake className="w-7 h-7" />,
    },
    {
      id: "scanner_dock",
      name: "Scanner Bay",
      nameHindi: "स्कैनर डेस्क",
      subtitle: "Zebra Terminal Hub",
      subtitleHindi: "स्कैनर चार्जिंग और बैटरी",
      icon: <ScanLine className="w-7 h-7" />,
    },
    {
      id: "dispatch_table",
      name: "Dispatch Bay",
      nameHindi: "डिस्पैच टेबल",
      subtitle: "Tote Sorting & Bags",
      subtitleHindi: "टोट चेकिंग और पॉलीबैग",
      icon: <Truck className="w-7 h-7" />,
    },
    {
      id: "buddy_desk",
      name: "Floor Buddy",
      nameHindi: "विक्रम भैया",
      subtitle: "Senior Floor Guide",
      subtitleHindi: "फ्लोर गाइडेंस स्टेशन",
      icon: <UserCheck className="w-7 h-7" />,
    },
  ];

  const zones = isDarkStore ? darkStoreZones : cashierZones;

  const handleCardClick = (zone: StoreZone) => {
    setSelectedId(zone.id);
    if (onSelectZone) {
      onSelectZone(zone.id, isHindi ? zone.nameHindi : zone.name);
    }
    if (onAisleSelect) {
      onAisleSelect(zone.id);
    }
  };

  return (
    <div className="space-y-3 select-none">
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
          {isHindi
            ? isDarkStore
              ? "डार्क स्टोर ज़ोन"
              : "रिटेल चेकआउट ज़ोन"
            : isDarkStore
            ? "Dark Store Zones"
            : "Retail Checkout Zones"}
        </span>
        <span className="text-xs text-purple-700 font-bold">
          {isHindi ? "टैप करके दिशा देखें" : "Tap for guidance"}
        </span>
      </div>

      {/* 2x3 Squircle Grid Matching Clean Consistent Palette */}
      <div className="grid grid-cols-2 gap-3">
        {zones.map((zone) => {
          const isActive = selectedId === zone.id;
          return (
            <button
              key={zone.id}
              onClick={() => handleCardClick(zone)}
              className={`flex flex-col items-center justify-center p-4 rounded-[26px] transition-all duration-200 cursor-pointer text-center relative active:scale-96 ${
                isActive
                  ? "bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-purple-950/15 ring-2 ring-purple-400/40"
                  : "bg-white text-slate-800 border border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/80 shadow-2xs"
              }`}
            >
              {/* Red blinking circle or active badge */}
              {zone.id === "aisles_4_8" ? (
                <span className="absolute top-3 right-3 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
                </span>
              ) : (
                zone.statusBadge && !isActive && (
                  <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-slate-400" />
                )
              )}

              {/* Icon */}
              <div
                className={`mb-2 transition-transform ${
                  isActive ? "text-white scale-105" : "text-slate-700"
                }`}
              >
                {zone.icon}
              </div>

              {/* Zone Name */}
              <span
                className={`text-sm font-black tracking-tight leading-tight block ${
                  isActive ? "text-white" : "text-slate-900"
                }`}
              >
                {isHindi ? zone.nameHindi : zone.name}
              </span>

              {/* Subtitle */}
              <span
                className={`text-xs mt-1 font-medium block truncate max-w-[140px] ${
                  isActive ? "text-purple-100 font-bold" : "text-slate-500"
                }`}
              >
                {isHindi ? zone.subtitleHindi : zone.subtitle}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
