"use client";

import { useState, useEffect } from "react";
import { Search, Bell, Cpu, ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const [searchValue, setSearchValue] = useState("");
  const [hsmPulse, setHsmPulse] = useState(true);

  return (
    <header
      className="flex items-center h-14 px-5 shrink-0 border-b border-[rgba(160,174,192,0.08)] gap-4"
      style={{ background: "rgba(9,23,40,0.8)", backdropFilter: "blur(8px)" }}
    >
      {/* Page title */}
      <div className="flex-1 min-w-0">
        <h1 className="text-[13px] font-semibold text-[#E2E8F0] truncate leading-none">
          {title}
        </h1>
        {subtitle && (
          <p className="text-[10px] text-[#4A5568] mt-0.5 truncate leading-none">
            {subtitle}
          </p>
        )}
      </div>

      {/* Search */}
      <div className="relative flex-1 max-w-xs hidden md:block">
        <Search
          size={12}
          strokeWidth={1.5}
          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#4A5568]"
        />
        <input
          type="text"
          placeholder="Search secrets, keys..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className={cn(
            "w-full pl-7 pr-7 py-1.5 text-[11px] rounded-md",
            "bg-[rgba(160,174,192,0.06)] border border-[rgba(160,174,192,0.1)]",
            "text-[#E2E8F0] placeholder:text-[#4A5568]",
            "focus:outline-none focus:border-[rgba(59,130,246,0.4)] focus:bg-[rgba(59,130,246,0.04)]",
            "transition-colors duration-150"
          )}
        />
        {searchValue && (
          <button
            onClick={() => setSearchValue("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-[#4A5568] hover:text-[#718096]"
          >
            <X size={10} />
          </button>
        )}
      </div>

      {/* HSM Status indicator */}
      <HsmStatusPill />

      {/* Notifications */}
      <button className="relative p-1.5 rounded-md text-[#718096] hover:text-[#A0AEC0] hover:bg-[rgba(160,174,192,0.06)] transition-colors">
        <Bell size={14} strokeWidth={1.5} />
        <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-amber-400 rounded-full" />
      </button>

      {/* User avatar */}
      <button className="flex items-center gap-1.5 py-1 px-1.5 rounded-md hover:bg-[rgba(160,174,192,0.06)] transition-colors group">
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shrink-0">
          <span className="text-[9px] font-bold text-white">AK</span>
        </div>
        <ChevronDown
          size={10}
          strokeWidth={1.5}
          className="text-[#4A5568] group-hover:text-[#718096] transition-colors"
        />
      </button>
    </header>
  );
}

function HsmStatusPill() {
  const [signatureCount, setSignatureCount] = useState<number | null>(null);

  useEffect(() => {
    // Initialize only on client to avoid hydration mismatch
    setSignatureCount(4827);
    const interval = setInterval(() => {
      setSignatureCount((c) => (c ?? 4827) + Math.floor(Math.random() * 3));
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-md border border-[rgba(16,185,129,0.2)] bg-[rgba(16,185,129,0.05)] shrink-0">
      <div className="relative flex items-center justify-center w-2 h-2">
        <span className="animate-pulse-ring absolute inset-0 rounded-full bg-emerald-400/30" />
        <span className="animate-pulse-dot relative w-1.5 h-1.5 rounded-full bg-emerald-400" />
      </div>
      <div className="flex items-center gap-1.5">
        <Cpu size={11} strokeWidth={1.5} className="text-emerald-400" />
        <span className="text-[10px] font-medium text-emerald-400 hidden lg:block">
          HSM Connected
        </span>
        {signatureCount !== null && (
          <span className="hidden xl:block text-[9px] text-[#4A5568] font-mono">
            ·{" "}
            <span className="tabular-nums">
              {signatureCount.toLocaleString()}
            </span>{" "}
            ops
          </span>
        )}
      </div>
    </div>
  );
}
