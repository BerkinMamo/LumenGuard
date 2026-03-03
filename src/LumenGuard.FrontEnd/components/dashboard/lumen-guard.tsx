"use client";

import { useState } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  CheckCircle2,
  Circle,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

type AuditStatus = "pass" | "warn" | "fail";

type AuditCheck = {
  id: string;
  category: string;
  name: string;
  description: string;
  status: AuditStatus;
  severity: "critical" | "high" | "medium" | "low";
  lastChecked: string;
  remediation?: string;
};

const AUDIT_CHECKS: AuditCheck[] = [
  { id: "1", category: "Key Management", name: "Key rotation policy active", description: "All production keys must have a rotation policy configured with max 365-day lifecycle.", status: "pass", severity: "critical", lastChecked: "2 min ago" },
  { id: "2", category: "Key Management", name: "No expired keys in production", description: "Check for keys past their rotation deadline.", status: "warn", severity: "high", lastChecked: "2 min ago", remediation: "TLS Root Certificate is 30 days past rotation due date. Rotate immediately." },
  { id: "3", category: "Key Management", name: "Key access principle of least privilege", description: "Verify service accounts only have access to required keys.", status: "pass", severity: "high", lastChecked: "2 min ago" },
  { id: "4", category: "Access Control", name: "MFA enforced for all admin users", description: "Multi-factor authentication must be enabled for administrative vault access.", status: "pass", severity: "critical", lastChecked: "5 min ago" },
  { id: "5", category: "Access Control", name: "No shared service accounts", description: "Each service must use unique, non-shared credentials.", status: "pass", severity: "high", lastChecked: "5 min ago" },
  { id: "6", category: "Access Control", name: "Failed auth attempts below threshold", description: "More than 5 failed authentication attempts in 1 hour triggers an alert.", status: "fail", severity: "critical", lastChecked: "1 min ago", remediation: "3 IPs (185.23.11.99, 212.56.78.144, 104.45.12.77) have exceeded the failed auth threshold. Block and investigate." },
  { id: "7", category: "Encryption", name: "AES-256 minimum for all secrets", description: "All stored secrets must use AES-256 encryption or stronger.", status: "pass", severity: "critical", lastChecked: "10 min ago" },
  { id: "8", category: "Encryption", name: "TLS 1.3 for vault API endpoints", description: "The vault API must not accept connections below TLS 1.3.", status: "pass", severity: "high", lastChecked: "10 min ago" },
  { id: "9", category: "Encryption", name: "HSM-backed key wrapping", description: "Root encryption keys must be wrapped by the hardware security module.", status: "pass", severity: "critical", lastChecked: "10 min ago" },
  { id: "10", category: "Audit & Logging", name: "Audit log retention configured", description: "Audit logs must be retained for minimum 90 days.", status: "pass", severity: "medium", lastChecked: "15 min ago" },
  { id: "11", category: "Audit & Logging", name: "Log integrity verification enabled", description: "HMAC signatures applied to audit log entries to prevent tampering.", status: "warn", severity: "medium", lastChecked: "15 min ago", remediation: "Log integrity HMAC verification is configured but not actively monitored. Set up automated verification alerts." },
  { id: "12", category: "Network", name: "Vault API not publicly accessible", description: "The vault management API must only be reachable from internal networks.", status: "pass", severity: "critical", lastChecked: "20 min ago" },
];

const statusConfig = {
  pass: { icon: <CheckCircle2 size={12} strokeWidth={1.5} />, color: "text-emerald-400", bg: "bg-emerald-400/10", label: "Pass" },
  warn: { icon: <AlertCircle size={12} strokeWidth={1.5} />, color: "text-amber-400", bg: "bg-amber-400/10", label: "Warn" },
  fail: { icon: <ShieldX size={12} strokeWidth={1.5} />, color: "text-red-400", bg: "bg-red-400/10", label: "Fail" },
};

const severityColor: Record<string, string> = {
  critical: "text-red-400",
  high: "text-amber-400",
  medium: "text-yellow-400",
  low: "text-[#718096]",
};

const categories = Array.from(new Set(AUDIT_CHECKS.map((c) => c.category)));

export function LumenGuardAudit() {
  const [expandedCategory, setExpandedCategory] = useState<string | null>("Access Control");
  const [expandedCheck, setExpandedCheck] = useState<string | null>("6");

  const pass = AUDIT_CHECKS.filter((c) => c.status === "pass").length;
  const warn = AUDIT_CHECKS.filter((c) => c.status === "warn").length;
  const fail = AUDIT_CHECKS.filter((c) => c.status === "fail").length;
  const score = Math.round((pass / AUDIT_CHECKS.length) * 100);

  return (
    <div className="space-y-4">
      {/* Score overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="glass-card rounded-lg p-4 md:col-span-1 flex flex-col items-center justify-center gap-1">
          <div className={cn("text-[36px] font-bold font-mono tabular-nums", score >= 90 ? "text-emerald-400" : score >= 70 ? "text-amber-400" : "text-red-400")}>
            {score}
          </div>
          <p className="text-[9px] text-[#4A5568] uppercase tracking-wider">Security Score</p>
          <div className="w-full h-1.5 rounded-full bg-[rgba(160,174,192,0.08)] mt-2 overflow-hidden">
            <div className={cn("h-full rounded-full transition-all", score >= 90 ? "bg-emerald-400" : score >= 70 ? "bg-amber-400" : "bg-red-400")} style={{ width: `${score}%` }} />
          </div>
        </div>
        <div className="glass-card rounded-lg p-4 flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-emerald-400 mb-1">
            <ShieldCheck size={11} strokeWidth={1.5} />
            <span className="text-[9px] uppercase tracking-wider font-semibold">Passing</span>
          </div>
          <p className="text-[28px] font-bold font-mono text-[#E2E8F0]">{pass}</p>
          <p className="text-[9px] text-[#4A5568]">checks passing</p>
        </div>
        <div className="glass-card rounded-lg p-4 flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-amber-400 mb-1">
            <ShieldAlert size={11} strokeWidth={1.5} />
            <span className="text-[9px] uppercase tracking-wider font-semibold">Warnings</span>
          </div>
          <p className="text-[28px] font-bold font-mono text-[#E2E8F0]">{warn}</p>
          <p className="text-[9px] text-[#4A5568]">require attention</p>
        </div>
        <div className="glass-card rounded-lg p-4 flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-red-400 mb-1">
            <ShieldX size={11} strokeWidth={1.5} />
            <span className="text-[9px] uppercase tracking-wider font-semibold">Critical</span>
          </div>
          <p className="text-[28px] font-bold font-mono text-[#E2E8F0]">{fail}</p>
          <p className="text-[9px] text-[#4A5568]">must remediate</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <p className="text-[11px] text-[#4A5568]">Last full scan: <span className="text-[#718096]">03 Mar 2025, 14:00:00 UTC</span></p>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] text-[#718096] hover:text-[#A0AEC0] hover:bg-[rgba(160,174,192,0.06)] transition-colors border border-[rgba(160,174,192,0.1)]">
          <RefreshCw size={10} strokeWidth={1.5} />
          Run Scan
        </button>
      </div>

      {/* Category groups */}
      <div className="space-y-2">
        {categories.map((cat) => {
          const checks = AUDIT_CHECKS.filter((c) => c.category === cat);
          const isExpanded = expandedCategory === cat;
          const catFail = checks.filter((c) => c.status === "fail").length;
          const catWarn = checks.filter((c) => c.status === "warn").length;

          return (
            <div key={cat} className="glass-card rounded-lg overflow-hidden">
              <button
                onClick={() => setExpandedCategory(isExpanded ? null : cat)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-[rgba(59,130,246,0.02)] transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  {isExpanded
                    ? <ChevronDown size={12} strokeWidth={1.5} className="text-[#4A5568]" />
                    : <ChevronRight size={12} strokeWidth={1.5} className="text-[#4A5568]" />}
                  <span className="text-[12px] font-medium text-[#E2E8F0]">{cat}</span>
                  <span className="text-[9px] text-[#4A5568]">{checks.length} checks</span>
                </div>
                <div className="flex items-center gap-2">
                  {catFail > 0 && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-400/10 text-red-400">{catFail} critical</span>
                  )}
                  {catWarn > 0 && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-400/10 text-amber-400">{catWarn} warn</span>
                  )}
                  {catFail === 0 && catWarn === 0 && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-400/10 text-emerald-400">All pass</span>
                  )}
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-[rgba(160,174,192,0.06)]">
                  {checks.map((check, idx) => (
                    <div key={check.id} className={cn(idx < checks.length - 1 && "border-b border-[rgba(160,174,192,0.04)]")}>
                      <button
                        onClick={() => setExpandedCheck(expandedCheck === check.id ? null : check.id)}
                        className={cn("w-full flex items-center gap-3 px-4 py-3 text-left transition-colors",
                          check.status === "fail" ? "hover:bg-[rgba(239,68,68,0.03)]" : "hover:bg-[rgba(59,130,246,0.02)]"
                        )}
                      >
                        <span className={cn("shrink-0", statusConfig[check.status].color)}>
                          {statusConfig[check.status].icon}
                        </span>
                        <span className="flex-1 text-[11px] text-[#A0AEC0]">{check.name}</span>
                        <span className={cn("text-[9px] font-medium uppercase tracking-wider shrink-0", severityColor[check.severity])}>
                          {check.severity}
                        </span>
                        <span className="text-[9px] text-[#4A5568] shrink-0">{check.lastChecked}</span>
                        {(check.remediation) && (
                          <ChevronDown
                            size={10}
                            strokeWidth={1.5}
                            className={cn("text-[#4A5568] transition-transform shrink-0", expandedCheck === check.id && "rotate-180")}
                          />
                        )}
                      </button>
                      {expandedCheck === check.id && (
                        <div className={cn("px-4 pb-3 ml-7 space-y-2")}>
                          <p className="text-[10px] text-[#718096] leading-relaxed">{check.description}</p>
                          {check.remediation && (
                            <div className={cn("p-2.5 rounded-md text-[10px] leading-relaxed",
                              check.status === "fail" ? "bg-red-400/5 border border-red-400/15 text-red-300" : "bg-amber-400/5 border border-amber-400/15 text-amber-300"
                            )}>
                              <span className="font-semibold mr-1">Remediation:</span>
                              {check.remediation}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
