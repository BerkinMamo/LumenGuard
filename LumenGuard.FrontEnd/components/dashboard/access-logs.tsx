"use client";

import { useState } from "react";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Search,
  Download,
  Eye,
  Globe,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

type LogLevel = "success" | "warning" | "error";

type LogEntry = {
  id: string;
  timestamp: string;
  user: string;
  ip: string;
  action: string;
  resource: string;
  level: LogLevel;
  duration: number;
  location: string;
};

const LOGS: LogEntry[] = [
  { id: "1", timestamp: "2025-03-03 14:02:31", user: "alex.kim@luvia.io", ip: "10.0.1.42", action: "SECRET_READ", resource: "AWS Root Key", level: "success", duration: 23, location: "US-East" },
  { id: "2", timestamp: "2025-03-03 14:01:18", user: "service-account-ci", ip: "10.0.2.15", action: "SECRET_READ", resource: "GitHub Actions Token", level: "success", duration: 11, location: "US-East" },
  { id: "3", timestamp: "2025-03-03 13:59:45", user: "unknown", ip: "185.23.11.99", action: "AUTH_FAILED", resource: "vault/login", level: "error", duration: 0, location: "DE-Frankfurt" },
  { id: "4", timestamp: "2025-03-03 13:58:22", user: "sara.chen@luvia.io", ip: "10.0.1.71", action: "SECRET_CREATE", resource: "Redis Cache Password", level: "success", duration: 47, location: "US-East" },
  { id: "5", timestamp: "2025-03-03 13:55:10", user: "carlos.v@luvia.io", ip: "10.0.3.88", action: "KEY_ROTATE", resource: "TLS Root Certificate", level: "warning", duration: 312, location: "US-West" },
  { id: "6", timestamp: "2025-03-03 13:50:03", user: "service-account-db", ip: "10.0.2.20", action: "SECRET_READ", resource: "PostgreSQL Master Password", level: "success", duration: 8, location: "US-East" },
  { id: "7", timestamp: "2025-03-03 13:48:55", user: "unknown", ip: "104.45.12.77", action: "SECRET_READ", resource: "Stripe Live Secret Key", level: "error", duration: 0, location: "GB-London" },
  { id: "8", timestamp: "2025-03-03 13:45:30", user: "alex.kim@luvia.io", ip: "10.0.1.42", action: "SECRET_DELETE", resource: "Old API Token", level: "warning", duration: 18, location: "US-East" },
  { id: "9", timestamp: "2025-03-03 13:40:12", user: "priya.n@luvia.io", ip: "10.0.1.55", action: "HSM_SIGN", resource: "EC-P256 Key", level: "success", duration: 7, location: "US-East" },
  { id: "10", timestamp: "2025-03-03 13:35:49", user: "service-account-ci", ip: "10.0.2.15", action: "SECRET_READ", resource: "Auth0 Client Secret", level: "success", duration: 14, location: "US-East" },
  { id: "11", timestamp: "2025-03-03 13:30:05", user: "carlos.v@luvia.io", ip: "10.0.3.88", action: "POLICY_UPDATE", resource: "vault/policy/admin", level: "warning", duration: 55, location: "US-West" },
  { id: "12", timestamp: "2025-03-03 13:22:18", user: "unknown", ip: "212.56.78.144", action: "AUTH_FAILED", resource: "vault/login", level: "error", duration: 0, location: "RU-Moscow" },
];

const levelConfig = {
  success: { icon: <CheckCircle size={10} strokeWidth={1.5} />, color: "text-emerald-400", bg: "bg-emerald-400/10" },
  warning: { icon: <AlertTriangle size={10} strokeWidth={1.5} />, color: "text-amber-400", bg: "bg-amber-400/10" },
  error: { icon: <XCircle size={10} strokeWidth={1.5} />, color: "text-red-400", bg: "bg-red-400/10" },
};

const actionColor: Record<string, string> = {
  SECRET_READ: "text-blue-400 bg-blue-400/10",
  SECRET_CREATE: "text-emerald-400 bg-emerald-400/10",
  SECRET_DELETE: "text-red-400 bg-red-400/10",
  KEY_ROTATE: "text-amber-400 bg-amber-400/10",
  AUTH_FAILED: "text-red-400 bg-red-400/10",
  HSM_SIGN: "text-purple-400 bg-purple-400/10",
  POLICY_UPDATE: "text-cyan-400 bg-cyan-400/10",
};

export function AccessLogs() {
  const [filter, setFilter] = useState<"all" | LogLevel>("all");
  const [search, setSearch] = useState("");

  const filtered = LOGS.filter((l) => {
    if (filter !== "all" && l.level !== filter) return false;
    if (search && !l.user.includes(search) && !l.resource.toLowerCase().includes(search.toLowerCase()) && !l.action.includes(search.toUpperCase())) return false;
    return true;
  });

  const counts = {
    success: LOGS.filter((l) => l.level === "success").length,
    warning: LOGS.filter((l) => l.level === "warning").length,
    error: LOGS.filter((l) => l.level === "error").length,
  };

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        {(["success", "warning", "error"] as const).map((level) => (
          <button
            key={level}
            onClick={() => setFilter(filter === level ? "all" : level)}
            className={cn(
              "glass-card rounded-lg p-3 text-left transition-all",
              filter === level && "ring-1",
              level === "success" && filter === level && "ring-emerald-500/30",
              level === "warning" && filter === level && "ring-amber-500/30",
              level === "error" && filter === level && "ring-red-500/30"
            )}
          >
            <div className={cn("flex items-center gap-1.5 mb-1", levelConfig[level].color)}>
              {levelConfig[level].icon}
              <span className="text-[9px] uppercase tracking-wider font-semibold">{level}</span>
            </div>
            <p className="text-[20px] font-bold text-[#E2E8F0] font-mono tabular-nums">{counts[level]}</p>
            <p className="text-[9px] text-[#4A5568] mt-0.5">events today</p>
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-xs">
          <Search size={11} strokeWidth={1.5} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#4A5568]" />
          <input
            type="text"
            placeholder="Filter by user, resource..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-7 pr-3 py-1.5 text-[11px] rounded-md bg-[rgba(160,174,192,0.06)] border border-[rgba(160,174,192,0.1)] text-[#E2E8F0] placeholder:text-[#4A5568] focus:outline-none focus:border-[rgba(59,130,246,0.4)]"
          />
        </div>
        <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[10px] text-[#718096] hover:text-[#A0AEC0] hover:bg-[rgba(160,174,192,0.06)] transition-colors border border-[rgba(160,174,192,0.1)]">
          <Download size={10} strokeWidth={1.5} />
          Export
        </button>
      </div>

      {/* Table */}
      <div className="glass-card rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[rgba(160,174,192,0.08)]">
              <th className="text-left px-4 py-2.5 text-[9px] font-semibold tracking-[0.1em] uppercase text-[#4A5568]">Status</th>
              <th className="text-left px-4 py-2.5 text-[9px] font-semibold tracking-[0.1em] uppercase text-[#4A5568] hidden sm:table-cell">Timestamp</th>
              <th className="text-left px-4 py-2.5 text-[9px] font-semibold tracking-[0.1em] uppercase text-[#4A5568]">User</th>
              <th className="text-left px-4 py-2.5 text-[9px] font-semibold tracking-[0.1em] uppercase text-[#4A5568] hidden md:table-cell">Action</th>
              <th className="text-left px-4 py-2.5 text-[9px] font-semibold tracking-[0.1em] uppercase text-[#4A5568] hidden lg:table-cell">Resource</th>
              <th className="text-left px-4 py-2.5 text-[9px] font-semibold tracking-[0.1em] uppercase text-[#4A5568] hidden xl:table-cell">Location</th>
              <th className="text-right px-4 py-2.5 text-[9px] font-semibold tracking-[0.1em] uppercase text-[#4A5568] hidden lg:table-cell">Duration</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((log, idx) => {
              const conf = levelConfig[log.level];
              return (
                <tr key={log.id} className={cn("group hover:bg-[rgba(59,130,246,0.02)] transition-colors", idx < filtered.length - 1 && "border-b border-[rgba(160,174,192,0.05)]")}>
                  <td className="px-4 py-2.5">
                    <span className={cn("inline-flex items-center justify-center w-5 h-5 rounded", conf.bg, conf.color)}>
                      {conf.icon}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 hidden sm:table-cell">
                    <span className="text-[10px] font-mono text-[#4A5568]">{log.timestamp}</span>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-1.5">
                      <User size={10} strokeWidth={1.5} className="text-[#4A5568] shrink-0" />
                      <span className="text-[10px] text-[#A0AEC0] truncate max-w-[120px]">{log.user}</span>
                    </div>
                    <p className="text-[9px] font-mono text-[#4A5568] mt-0.5">{log.ip}</p>
                  </td>
                  <td className="px-4 py-2.5 hidden md:table-cell">
                    <span className={cn("text-[9px] font-mono px-1.5 py-0.5 rounded", actionColor[log.action] || "text-[#718096] bg-[rgba(160,174,192,0.1)]")}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 hidden lg:table-cell">
                    <span className="text-[10px] text-[#718096] truncate max-w-[150px] block">{log.resource}</span>
                  </td>
                  <td className="px-4 py-2.5 hidden xl:table-cell">
                    <div className="flex items-center gap-1 text-[9px] text-[#4A5568]">
                      <Globe size={9} strokeWidth={1.5} />
                      {log.location}
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-right hidden lg:table-cell">
                    <span className="text-[9px] font-mono text-[#4A5568]">
                      {log.duration > 0 ? `${log.duration}ms` : "—"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-[11px] text-[#4A5568]">No log entries match your filter</p>
          </div>
        )}
      </div>
    </div>
  );
}
