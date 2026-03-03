"use client"

import { useState, useEffect, useRef } from "react"
import {
  AlertTriangle,
  AlertCircle,
  Info,
  ShieldOff,
  UserX,
  Key,
  Zap,
  BellOff,
  CheckCheck,
  RefreshCw,
  X,
} from "lucide-react"

type Severity = "critical" | "warning" | "info"

interface AlertEvent {
  id: string
  severity: Severity
  title: string
  description: string
  timestamp: Date
  source: string
  isRead: boolean
  isPinned?: boolean
  actionRequired?: boolean
}

const SEVERITY_CONFIG = {
  critical: { color: "#EF4444", bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.25)", icon: <AlertCircle className="w-4 h-4" />, label: "Critical" },
  warning: { color: "#F6C90E", bg: "rgba(246,201,14,0.08)", border: "rgba(246,201,14,0.25)", icon: <AlertTriangle className="w-4 h-4" />, label: "Warning" },
  info: { color: "#00D2FF", bg: "rgba(0,210,255,0.06)", border: "rgba(0,210,255,0.18)", icon: <Info className="w-4 h-4" />, label: "Info" },
}

const INITIAL_ALERTS: AlertEvent[] = [
  {
    id: "ALT-0041",
    severity: "critical",
    title: "Failed HSM Sign Attempts — Threshold Exceeded",
    description: "5 consecutive failed signing attempts on HSM Slot-0 from session sess_9x21kq. Auto-lockout triggered. Manual review required.",
    timestamp: new Date(Date.now() - 65000),
    source: "HSM / Thales Luna",
    isRead: false,
    isPinned: true,
    actionRequired: true,
  },
  {
    id: "ALT-0040",
    severity: "critical",
    title: "Unauthorized Login Attempt Detected",
    description: "Credential stuffing attack from 185.220.101.9 (NL/Amsterdam). 3 failed attempts for username 'admin'. IP auto-blocked. Threat indicator: BRUTE_FORCE.",
    timestamp: new Date(Date.now() - 3 * 60000),
    source: "Duende IdentityServer",
    isRead: false,
    isPinned: true,
    actionRequired: true,
  },
  {
    id: "ALT-0039",
    severity: "critical",
    title: "KYC Risk Score Exceeded Threshold (Score: 94)",
    description: "Applicant APP-9043 (Ahmet Çelik) returned a composite risk score of 94 — exceeding the 90-point critical threshold. AML flag raised. Manual KYC review required.",
    timestamp: new Date(Date.now() - 8 * 60000),
    source: "KYC Engine / Risk Analyzer",
    isRead: false,
    actionRequired: true,
  },
  {
    id: "ALT-0038",
    severity: "warning",
    title: "HSM Key Rotation Due in 3 Days",
    description: "RSA-4096 signing key (key_rsa_001) in SLOT-1 is scheduled for rotation in 3 days per the 30-day policy. Prepare approval workflow.",
    timestamp: new Date(Date.now() - 22 * 60000),
    source: "HSM Scheduler",
    isRead: false,
    actionRequired: false,
  },
  {
    id: "ALT-0037",
    severity: "warning",
    title: "OIDC Scope Modification Without Dual Approval",
    description: "Policy change for client app_003 (scope 'vault.read' added) was approved by a single admin. Dual-control policy violation logged.",
    timestamp: new Date(Date.now() - 43 * 60000),
    source: "Policy Engine",
    isRead: true,
    actionRequired: false,
  },
  {
    id: "ALT-0036",
    severity: "warning",
    title: "Vault Document Accessed Outside Business Hours",
    description: "Investment_Order_Q1_2026.pdf accessed at 02:14 UTC by system daemon. Off-hours access flag raised per policy POL-007.",
    timestamp: new Date(Date.now() - 2 * 3600000),
    source: "Contract Vault",
    isRead: true,
    actionRequired: false,
  },
  {
    id: "ALT-0035",
    severity: "info",
    title: "Scheduled Key Rotation Completed Successfully",
    description: "RSA-4096 signing key rotation completed in HSM Slot-1. New key ID: key_rsa_001. Old key archived with backup confirmed.",
    timestamp: new Date(Date.now() - 3 * 3600000),
    source: "HSM / Thales Luna",
    isRead: true,
    actionRequired: false,
  },
  {
    id: "ALT-0034",
    severity: "info",
    title: "KYC Level-2 Approved — Applicant #8821",
    description: "Mert Yılmaz (APP-8821) successfully completed Level-2 KYC verification. Face match: 98.4%. AES-256 vault key issued to SLOT-4.",
    timestamp: new Date(Date.now() - 4 * 3600000),
    source: "KYC Engine",
    isRead: true,
    actionRequired: false,
  },
  {
    id: "ALT-0033",
    severity: "info",
    title: "PAdES-LTA Signature Verified — Portfolio Agreement",
    description: "Long-term archival signature on Portfolio_Management_Agreement_2026.pdf verified successfully. Certificate chain valid. TS 13298 compliant.",
    timestamp: new Date(Date.now() - 6 * 3600000),
    source: "Contract Vault / Signature Engine",
    isRead: true,
    actionRequired: false,
  },
  {
    id: "ALT-0032",
    severity: "info",
    title: "System Health Check Passed",
    description: "All monitored services — HSM Slot-0, Duende IdentityServer, TLS 1.3 endpoint, and KYC API — returned healthy status. Uptime: 99.97%.",
    timestamp: new Date(Date.now() - 12 * 3600000),
    source: "System Monitor",
    isRead: true,
    actionRequired: false,
  },
]

function formatRelative(date: Date): string {
  const diff = Math.floor((Date.now() - date.getTime()) / 1000)
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

const FEED_SOURCES = ["All Sources", "HSM / Thales Luna", "Duende IdentityServer", "KYC Engine", "Contract Vault", "Policy Engine"]

export function SecurityAlertsModule() {
  const [alerts, setAlerts] = useState<AlertEvent[]>(INITIAL_ALERTS || []);
  const [filterSeverity, setFilterSeverity] = useState<Severity | "all">("all")
  const [filterSource, setFilterSource] = useState("All Sources")
  const [showUnreadOnly, setShowUnreadOnly] = useState(false)
  const [now, setNow] = useState<Date | null>(null)
  const feedRef = useRef<HTMLDivElement>(null)

  // Hydration-safe clock
  useEffect(() => {
    setNow(new Date())
    const t = setInterval(() => setNow(new Date()), 30000)
    return () => clearInterval(t)
  }, [])

  // Simulate a new incoming alert after mount
  useEffect(() => {
    const t = setTimeout(() => {
      setAlerts((prev) => [
        {
          id: "ALT-0042",
          severity: "warning",
          title: "Token Expiry Rate Spike Detected",
          description: "Token expiry rate increased 340% in the last 5 minutes. Possible session hijacking or misconfigured client. Duende IS rate limiter engaged.",
          timestamp: new Date(),
          source: "Duende IdentityServer",
          isRead: false,
          actionRequired: false,
        },
        ...prev,
      ])
    }, 6000)
    return () => clearTimeout(t)
  }, [])

  function markAllRead() {
    setAlerts((prev) => prev.map((a) => ({ ...a, isRead: true })))
  }

  function dismissAlert(id: string) {
    setAlerts((prev) => prev.filter((a) => a.id !== id))
  }

  function markRead(id: string) {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, isRead: true } : a)))
  }

  const filtered = alerts.filter((a) => {
    const matchSev = filterSeverity === "all" || a.severity === filterSeverity
    const matchSrc = filterSource === "All Sources" || a.source.startsWith(filterSource.split(" / ")[0])
    const matchUnread = !showUnreadOnly || !a.isRead
    return matchSev && matchSrc && matchUnread
  })

  const unreadCount = alerts.filter((a) => !a.isRead).length
  const criticalCount = alerts.filter((a) => a.severity === "critical" && !a.isRead).length

  const SOURCE_ICONS: Record<string, React.ReactNode> = {
    "HSM": <Key className="w-3.5 h-3.5" />,
    "Duende": <Zap className="w-3.5 h-3.5" />,
    "KYC": <ShieldOff className="w-3.5 h-3.5" />,
    "Contract": <AlertTriangle className="w-3.5 h-3.5" />,
    "Policy": <AlertCircle className="w-3.5 h-3.5" />,
    "System": <RefreshCw className="w-3.5 h-3.5" />,
  }

  function sourceIcon(source: string) {
    const key = Object.keys(SOURCE_ICONS).find((k) => source.startsWith(k))
    return key ? SOURCE_ICONS[key] : <Info className="w-3.5 h-3.5" />
  }

  return (
    <div className="space-y-5">
      {/* Stats row */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Total Alerts", value: alerts.length, color: "#00D2FF", icon: <AlertCircle className="w-4 h-4" /> },
          { label: "Unread", value: unreadCount, color: unreadCount > 0 ? "#F6C90E" : "#22C55E", icon: <BellOff className="w-4 h-4" /> },
          { label: "Critical Active", value: criticalCount, color: criticalCount > 0 ? "#EF4444" : "#22C55E", icon: <ShieldOff className="w-4 h-4" /> },
          { label: "Action Required", value: alerts.filter((a) => a.actionRequired && !a.isRead).length, color: "#F97316", icon: <UserX className="w-4 h-4" /> },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-xl p-4 flex items-start gap-3"
            style={{ backgroundColor: "rgba(7,21,37,0.6)", border: `1px solid ${s.color}20` }}
          >
            <div
              className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0 mt-0.5"
              style={{ backgroundColor: `${s.color}12`, border: `1px solid ${s.color}25` }}
            >
              <span style={{ color: s.color }}>{s.icon}</span>
            </div>
            <div>
              <div className="text-[10px] font-mono tracking-widest uppercase" style={{ color: "#A0AEC0" }}>
                {s.label}
              </div>
              <div className="text-2xl font-bold tabular-nums mt-0.5" style={{ color: s.color }}>
                {s.value}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Live feed */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ backgroundColor: "rgba(7,21,37,0.6)", border: "1px solid rgba(0,210,255,0.12)" }}
      >
        {/* Toolbar */}
        <div
          className="flex items-center gap-3 px-4 py-3 border-b flex-wrap"
          style={{ borderColor: "rgba(0,210,255,0.1)" }}
        >
          <div className="flex items-center gap-1.5">
            <div
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: "#EF4444" }}
            />
            <span className="text-[10px] font-mono uppercase tracking-widest" style={{ color: "#A0AEC0" }}>
              Live Feed
            </span>
          </div>

          {/* Severity pills */}
          <div className="flex items-center gap-1.5">
            {(["all", "critical", "warning", "info"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFilterSeverity(s)}
                className="px-2.5 py-1 rounded-full text-[10px] font-mono uppercase font-bold transition-all"
                style={
                  filterSeverity === s
                    ? {
                      backgroundColor: s === "all" ? "rgba(0,210,255,0.15)" : `${SEVERITY_CONFIG[s as Severity]?.color}20`,
                      border: `1px solid ${s === "all" ? "rgba(0,210,255,0.3)" : `${SEVERITY_CONFIG[s as Severity]?.color}50`}`,
                      color: s === "all" ? "#00D2FF" : SEVERITY_CONFIG[s as Severity]?.color,
                    }
                    : { backgroundColor: "transparent", border: "1px solid rgba(255,255,255,0.06)", color: "#A0AEC0" }
                }
              >
                {s}
                {s !== "all" && (
                  <span className="ml-1 opacity-70">
                    {alerts.filter((a) => a.severity === s).length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Unread toggle */}
          <button
            onClick={() => setShowUnreadOnly(!showUnreadOnly)}
            className="px-2.5 py-1 rounded-full text-[10px] font-mono uppercase font-bold transition-all"
            style={
              showUnreadOnly
                ? { backgroundColor: "rgba(246,201,14,0.12)", border: "1px solid rgba(246,201,14,0.3)", color: "#F6C90E" }
                : { backgroundColor: "transparent", border: "1px solid rgba(255,255,255,0.06)", color: "#A0AEC0" }
            }
          >
            Unread only
          </button>

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={markAllRead}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono transition-all"
              style={{
                backgroundColor: "rgba(34,197,94,0.08)",
                border: "1px solid rgba(34,197,94,0.2)",
                color: "#22C55E",
              }}
            >
              <CheckCheck className="w-3 h-3" />
              Mark all read
            </button>
          </div>
        </div>

        {/* Alert feed */}
        <div ref={feedRef} className="divide-y divide-[rgba(0,210,255,0.05)]">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <CheckCheck className="w-8 h-8" style={{ color: "rgba(0,210,255,0.2)" }} />
              <div className="text-sm" style={{ color: "#A0AEC0" }}>No alerts match your filters</div>
            </div>
          ) : (
            (filtered || []).map((alert, i) => {
              const cfg = SEVERITY_CONFIG[alert.severity]
              return (
                <div
                  key={alert.id}
                  className="group relative flex gap-4 px-4 py-4 transition-all cursor-pointer"
                  style={{
                    backgroundColor: alert.isRead ? "transparent" : `${cfg.bg}`,
                    borderLeft: `3px solid ${alert.isRead ? "transparent" : cfg.color}`,
                    borderBottom: i < filtered.length - 1 ? "1px solid rgba(0,210,255,0.05)" : "none",
                  }}
                  onClick={() => markRead(alert.id)}
                >
                  {/* Severity icon */}
                  <div
                    className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0 mt-0.5"
                    style={{
                      backgroundColor: `${cfg.color}12`,
                      border: `1px solid ${cfg.color}30`,
                    }}
                  >
                    <span style={{ color: cfg.color }}>{cfg.icon}</span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className="text-xs font-mono uppercase font-bold px-1.5 py-0.5 rounded text-[9px]"
                          style={{
                            backgroundColor: `${cfg.color}15`,
                            color: cfg.color,
                          }}
                        >
                          {cfg.label}
                        </span>
                        {alert.actionRequired && !alert.isRead && (
                          <span
                            className="text-[9px] font-mono uppercase font-bold px-1.5 py-0.5 rounded"
                            style={{
                              backgroundColor: "rgba(249,115,22,0.12)",
                              color: "#F97316",
                              border: "1px solid rgba(249,115,22,0.25)",
                            }}
                          >
                            Action Required
                          </span>
                        )}
                        <span className="font-mono text-[9px]" style={{ color: "#A0AEC0" }}>
                          {alert.id}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-mono text-[10px] whitespace-nowrap" style={{ color: "#A0AEC0" }}>
                          {now ? formatRelative(alert.timestamp) : "—"}
                        </span>
                        {!alert.isRead && (
                          <div
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: cfg.color }}
                          />
                        )}
                        <button
                          onClick={(e) => { e.stopPropagation(); dismissAlert(alert.id) }}
                          className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-white/10 transition-all"
                          style={{ color: "#A0AEC0" }}
                          aria-label="Dismiss alert"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    <div
                      className="text-sm font-semibold mt-1"
                      style={{ color: alert.isRead ? "#A0AEC0" : "#EDF2F7" }}
                    >
                      {alert.title}
                    </div>
                    <div className="text-xs mt-1 leading-relaxed" style={{ color: "#A0AEC0" }}>
                      {alert.description}
                    </div>

                    {/* Source */}
                    <div className="flex items-center gap-1.5 mt-2">
                      <span style={{ color: "#A0AEC0" }}>{sourceIcon(alert.source)}</span>
                      <span className="font-mono text-[10px]" style={{ color: "#A0AEC0" }}>
                        {alert.source}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
