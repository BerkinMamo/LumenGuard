"use client"

import { useState } from "react"
import {
  Activity,
  Key,
  ShieldCheck,
  Lock,
  Eye,
  X,
  Search,
  Filter,
  Download,
  ChevronDown,
} from "lucide-react"

type ActionType = "Vault Access" | "Key Rotation" | "Policy Change" | "Login" | "Token Issue" | "KYC Approval"

interface AuditEntry {
  id: string
  user: string
  userRole: string
  actionType: ActionType
  detail: string
  timestamp: string
  hsmSlotId: string
  ipAddress: string
  sessionId: string
  severity: "info" | "warning" | "critical"
  signature: string
  rawJson: object
}

const ACTION_ICONS: Record<ActionType, React.ReactNode> = {
  "Vault Access": <Lock className="w-3.5 h-3.5" />,
  "Key Rotation": <Key className="w-3.5 h-3.5" />,
  "Policy Change": <ShieldCheck className="w-3.5 h-3.5" />,
  "Login": <Activity className="w-3.5 h-3.5" />,
  "Token Issue": <Key className="w-3.5 h-3.5" />,
  "KYC Approval": <ShieldCheck className="w-3.5 h-3.5" />,
}

const ACTION_COLORS: Record<ActionType, string> = {
  "Vault Access": "#00D2FF",
  "Key Rotation": "#F6C90E",
  "Policy Change": "#F97316",
  "Login": "#A0AEC0",
  "Token Issue": "#00D2FF",
  "KYC Approval": "#22C55E",
}

const auditEntries: AuditEntry[] = [
  {
    id: "EVT-9821",
    user: "Mert Yılmaz",
    userRole: "super_admin",
    actionType: "Key Rotation",
    detail: "AES-256 key rotated in HSM Slot 0",
    timestamp: "2026-03-03T13:41:02Z",
    hsmSlotId: "SLOT-0",
    ipAddress: "10.0.1.42",
    sessionId: "sess_8f4a3c91d7b4",
    severity: "warning",
    signature: "3046022100e8f...a3d",
    rawJson: {
      event_id: "EVT-9821",
      event_type: "KEY_ROTATION",
      actor: { id: "usr_001", name: "Mert Yılmaz", role: "super_admin" },
      target: { hsm_slot: "SLOT-0", algorithm: "AES-256", key_id: "key_7f3a1b9c" },
      timestamp: "2026-03-03T13:41:02Z",
      ip_address: "10.0.1.42",
      session_id: "sess_8f4a3c91d7b4",
      signature: "3046022100e8fa3d...",
      status: "SUCCESS",
      audit_trail_hash: "sha256:8f4a3c91...d7b4",
    },
  },
  {
    id: "EVT-9820",
    user: "Ayşe Kaya",
    userRole: "compliance_officer",
    actionType: "KYC Approval",
    detail: "KYC Level-2 approved for applicant #8821",
    timestamp: "2026-03-03T13:38:55Z",
    hsmSlotId: "SLOT-4",
    ipAddress: "10.0.1.87",
    sessionId: "sess_a3f1e9b2e3f6",
    severity: "info",
    signature: "304502210...b9c1",
    rawJson: {
      event_id: "EVT-9820",
      event_type: "KYC_APPROVAL",
      actor: { id: "usr_002", name: "Ayşe Kaya", role: "compliance_officer" },
      target: { applicant_id: "APP-8821", kyc_level: 2, face_match_score: 98.4 },
      timestamp: "2026-03-03T13:38:55Z",
      ip_address: "10.0.1.87",
      session_id: "sess_a3f1e9b2e3f6",
      signature: "304502210...b9c1",
      status: "APPROVED",
      vault_key_issued: "AES-256/SLOT-4",
      audit_trail_hash: "sha256:a3f1e9b2...e3f6",
    },
  },
  {
    id: "EVT-9819",
    user: "System",
    userRole: "daemon",
    actionType: "Vault Access",
    detail: "Portfolio_Management_Agreement_2026.pdf accessed",
    timestamp: "2026-03-03T13:35:10Z",
    hsmSlotId: "SLOT-0",
    ipAddress: "127.0.0.1",
    sessionId: "sess_d9c2a5e8e3b6",
    severity: "info",
    signature: "30440220...2af7",
    rawJson: {
      event_id: "EVT-9819",
      event_type: "VAULT_ACCESS",
      actor: { id: "sys_daemon", name: "System", role: "daemon" },
      target: { document_id: "DOC-0042", name: "Portfolio_Management_Agreement_2026.pdf", size_mb: 5.1 },
      timestamp: "2026-03-03T13:35:10Z",
      ip_address: "127.0.0.1",
      session_id: "sess_d9c2a5e8e3b6",
      signature: "30440220...2af7",
      status: "SUCCESS",
      encryption: "AES-256-GCM",
      audit_trail_hash: "sha256:d9c2a5e8...e3b6",
    },
  },
  {
    id: "EVT-9818",
    user: "Emre Demir",
    userRole: "policy_admin",
    actionType: "Policy Change",
    detail: "OIDC scope 'vault.read' added to client app_003",
    timestamp: "2026-03-03T13:20:44Z",
    hsmSlotId: "N/A",
    ipAddress: "10.0.1.55",
    sessionId: "sess_b7e4f1d2c8a5",
    severity: "warning",
    signature: "N/A",
    rawJson: {
      event_id: "EVT-9818",
      event_type: "POLICY_CHANGE",
      actor: { id: "usr_003", name: "Emre Demir", role: "policy_admin" },
      target: { client_id: "app_003", scope_added: "vault.read", previous_scopes: ["openid", "profile"] },
      timestamp: "2026-03-03T13:20:44Z",
      ip_address: "10.0.1.55",
      session_id: "sess_b7e4f1d2c8a5",
      status: "SUCCESS",
      approval_required: true,
      approved_by: "usr_001",
    },
  },
  {
    id: "EVT-9817",
    user: "Mert Yılmaz",
    userRole: "super_admin",
    actionType: "Login",
    detail: "Successful MFA login via TOTP",
    timestamp: "2026-03-03T13:00:01Z",
    hsmSlotId: "N/A",
    ipAddress: "10.0.1.42",
    sessionId: "sess_8f4a3c91d7b4",
    severity: "info",
    signature: "N/A",
    rawJson: {
      event_id: "EVT-9817",
      event_type: "LOGIN",
      actor: { id: "usr_001", name: "Mert Yılmaz", role: "super_admin" },
      mfa_method: "TOTP",
      timestamp: "2026-03-03T13:00:01Z",
      ip_address: "10.0.1.42",
      user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      session_id: "sess_8f4a3c91d7b4",
      status: "SUCCESS",
      geo: { country: "TR", city: "Istanbul" },
    },
  },
  {
    id: "EVT-9816",
    user: "Unknown",
    userRole: "—",
    actionType: "Login",
    detail: "FAILED: 3 consecutive invalid password attempts",
    timestamp: "2026-03-03T12:58:33Z",
    hsmSlotId: "N/A",
    ipAddress: "185.220.101.9",
    sessionId: "N/A",
    severity: "critical",
    signature: "N/A",
    rawJson: {
      event_id: "EVT-9816",
      event_type: "LOGIN_FAILED",
      actor: { id: null, attempted_username: "admin", role: null },
      attempts: 3,
      timestamp: "2026-03-03T12:58:33Z",
      ip_address: "185.220.101.9",
      user_agent: "python-requests/2.31.0",
      status: "FAILED",
      geo: { country: "NL", city: "Amsterdam" },
      threat_indicator: "BRUTE_FORCE",
      auto_blocked: true,
    },
  },
  {
    id: "EVT-9815",
    user: "Ayşe Kaya",
    userRole: "compliance_officer",
    actionType: "Token Issue",
    detail: "JWT access token issued for scope: kyc.write",
    timestamp: "2026-03-03T12:45:17Z",
    hsmSlotId: "SLOT-0",
    ipAddress: "10.0.1.87",
    sessionId: "sess_c1f9e7a3b2d4",
    severity: "info",
    signature: "3045022100f...d9b2",
    rawJson: {
      event_id: "EVT-9815",
      event_type: "TOKEN_ISSUE",
      actor: { id: "usr_002", name: "Ayşe Kaya", role: "compliance_officer" },
      token: { type: "access_token", algorithm: "RS256", scope: "kyc.write openid", expires_in: 3600 },
      timestamp: "2026-03-03T12:45:17Z",
      session_id: "sess_c1f9e7a3b2d4",
      hsm_slot: "SLOT-0",
      signing_key_id: "key_rsa_001",
      signature: "3045022100f...d9b2",
    },
  },
  {
    id: "EVT-9814",
    user: "System",
    userRole: "daemon",
    actionType: "Key Rotation",
    detail: "Scheduled RSA-4096 signing key rotation",
    timestamp: "2026-03-03T12:00:00Z",
    hsmSlotId: "SLOT-1",
    ipAddress: "127.0.0.1",
    sessionId: "sched_cron_001",
    severity: "info",
    signature: "304402203...e5f1",
    rawJson: {
      event_id: "EVT-9814",
      event_type: "KEY_ROTATION",
      actor: { id: "sys_scheduler", name: "System", role: "daemon" },
      target: { hsm_slot: "SLOT-1", algorithm: "RSA-4096", old_key_id: "key_rsa_000", new_key_id: "key_rsa_001" },
      timestamp: "2026-03-03T12:00:00Z",
      session_id: "sched_cron_001",
      rotation_policy: "30d",
      status: "SUCCESS",
      backup_created: true,
    },
  },
]

const ALL_ACTION_TYPES: ActionType[] = ["Vault Access", "Key Rotation", "Policy Change", "Login", "Token Issue", "KYC Approval"]

const SEVERITY_COLORS = {
  info: "#00D2FF",
  warning: "#F6C90E",
  critical: "#EF4444",
}

function JsonInspectorModal({ entry, onClose }: { entry: AuditEntry; onClose: () => void }) {
  const json = JSON.stringify(entry.rawJson, null, 2)
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(json)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(7,21,37,0.85)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-xl overflow-hidden"
        style={{
          backgroundColor: "#071525",
          border: "1px solid rgba(0,210,255,0.25)",
          boxShadow: "0 0 40px rgba(0,210,255,0.1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-3.5 border-b"
          style={{ borderColor: "rgba(0,210,255,0.15)" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center w-7 h-7 rounded-md"
              style={{ backgroundColor: "rgba(0,210,255,0.1)", border: "1px solid rgba(0,210,255,0.2)" }}
            >
              <Activity className="w-3.5 h-3.5" style={{ color: "#00D2FF" }} />
            </div>
            <div>
              <div className="text-sm font-bold" style={{ color: "#EDF2F7" }}>
                Audit Entry — <span className="font-mono" style={{ color: "#00D2FF" }}>{entry.id}</span>
              </div>
              <div className="text-[10px] font-mono mt-0.5" style={{ color: "#A0AEC0" }}>
                {entry.actionType} · {entry.timestamp}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="text-[11px] font-mono px-2.5 py-1 rounded-md transition-all"
              style={{
                backgroundColor: copied ? "rgba(34,197,94,0.15)" : "rgba(0,210,255,0.08)",
                border: `1px solid ${copied ? "rgba(34,197,94,0.3)" : "rgba(0,210,255,0.2)"}`,
                color: copied ? "#22C55E" : "#00D2FF",
              }}
            >
              {copied ? "Copied!" : "Copy JSON"}
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-md hover:bg-white/5 transition-colors"
              style={{ color: "#A0AEC0" }}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Metadata strip */}
        <div
          className="flex items-center gap-4 px-5 py-2.5 text-[10px] font-mono border-b"
          style={{ backgroundColor: "rgba(0,0,0,0.2)", borderColor: "rgba(0,210,255,0.08)" }}
        >
          <span style={{ color: "#A0AEC0" }}>
            HSM: <span style={{ color: "#EDF2F7" }}>{entry.hsmSlotId}</span>
          </span>
          <span style={{ color: "#A0AEC0" }}>
            IP: <span style={{ color: "#EDF2F7" }}>{entry.ipAddress}</span>
          </span>
          <span style={{ color: "#A0AEC0" }}>
            Session: <span style={{ color: "#EDF2F7" }}>{entry.sessionId}</span>
          </span>
          <span
            className="ml-auto px-2 py-0.5 rounded-full uppercase font-bold text-[9px]"
            style={{
              backgroundColor: `${SEVERITY_COLORS[entry.severity]}18`,
              border: `1px solid ${SEVERITY_COLORS[entry.severity]}40`,
              color: SEVERITY_COLORS[entry.severity],
            }}
          >
            {entry.severity}
          </span>
        </div>

        {/* JSON body */}
        <div className="p-5 overflow-y-auto max-h-96">
          <pre
            className="text-[11px] leading-relaxed whitespace-pre-wrap break-words font-mono"
            style={{ color: "#A0AEC0" }}
          >
            {json.split("\n").map((line, i) => {
              // color keys cyan, strings green, numbers/booleans amber
              const colonIdx = line.indexOf(":")
              if (colonIdx > -1) {
                const key = line.slice(0, colonIdx + 1)
                const val = line.slice(colonIdx + 1)
                const valColor = val.includes('"')
                  ? "#22C55E"
                  : val.match(/true|false|null/)
                  ? "#F97316"
                  : val.match(/[0-9]/)
                  ? "#F6C90E"
                  : "#EDF2F7"
                return (
                  <span key={i}>
                    <span style={{ color: "#00D2FF" }}>{key}</span>
                    <span style={{ color: valColor }}>{val}</span>
                    {"\n"}
                  </span>
                )
              }
              return (
                <span key={i} style={{ color: "#A0AEC0" }}>
                  {line}
                  {"\n"}
                </span>
              )
            })}
          </pre>
        </div>

        {/* Footer */}
        <div
          className="flex items-center gap-3 px-5 py-3 border-t"
          style={{ borderColor: "rgba(0,210,255,0.1)" }}
        >
          <Download className="w-3.5 h-3.5" style={{ color: "#A0AEC0" }} />
          <span className="text-[10px] font-mono" style={{ color: "#A0AEC0" }}>
            Sig: <span style={{ color: "#EDF2F7" }}>{entry.signature}</span>
          </span>
        </div>
      </div>
    </div>
  )
}

export function AuditLogModule() {
  const [search, setSearch] = useState("")
  const [filterAction, setFilterAction] = useState<ActionType | "All">("All")
  const [filterSeverity, setFilterSeverity] = useState<"all" | "info" | "warning" | "critical">("all")
  const [inspectEntry, setInspectEntry] = useState<AuditEntry | null>(null)
  const [showActionFilter, setShowActionFilter] = useState(false)

  const filtered = auditEntries.filter((e) => {
    const matchSearch =
      search === "" ||
      e.user.toLowerCase().includes(search.toLowerCase()) ||
      e.id.toLowerCase().includes(search.toLowerCase()) ||
      e.detail.toLowerCase().includes(search.toLowerCase()) ||
      e.hsmSlotId.toLowerCase().includes(search.toLowerCase())
    const matchAction = filterAction === "All" || e.actionType === filterAction
    const matchSeverity = filterSeverity === "all" || e.severity === filterSeverity
    return matchSearch && matchAction && matchSeverity
  })

  const stats = {
    total: auditEntries.length,
    critical: auditEntries.filter((e) => e.severity === "critical").length,
    warning: auditEntries.filter((e) => e.severity === "warning").length,
    keyEvents: auditEntries.filter((e) => e.actionType === "Key Rotation").length,
  }

  return (
    <div className="space-y-5">
      {inspectEntry && (
        <JsonInspectorModal entry={inspectEntry} onClose={() => setInspectEntry(null)} />
      )}

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Total Events", value: stats.total, color: "#00D2FF" },
          { label: "Critical", value: stats.critical, color: "#EF4444" },
          { label: "Warnings", value: stats.warning, color: "#F6C90E" },
          { label: "Key Events", value: stats.keyEvents, color: "#F97316" },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-xl p-4"
            style={{
              backgroundColor: "rgba(7,21,37,0.6)",
              border: `1px solid ${s.color}22`,
            }}
          >
            <div className="text-[10px] font-mono tracking-widest uppercase mb-1" style={{ color: "#A0AEC0" }}>
              {s.label}
            </div>
            <div className="text-2xl font-bold tabular-nums" style={{ color: s.color }}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* Table header controls */}
      <div
        className="rounded-xl overflow-hidden"
        style={{
          backgroundColor: "rgba(7,21,37,0.6)",
          border: "1px solid rgba(0,210,255,0.12)",
        }}
      >
        {/* Toolbar */}
        <div
          className="flex items-center gap-3 px-4 py-3 border-b flex-wrap"
          style={{ borderColor: "rgba(0,210,255,0.1)" }}
        >
          {/* Search */}
          <div
            className="flex items-center gap-2 flex-1 min-w-48 px-3 py-1.5 rounded-lg"
            style={{
              backgroundColor: "rgba(0,0,0,0.25)",
              border: "1px solid rgba(0,210,255,0.12)",
            }}
          >
            <Search className="w-3.5 h-3.5 shrink-0" style={{ color: "#A0AEC0" }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search user, event ID, detail..."
              className="flex-1 bg-transparent text-xs outline-none font-mono"
              style={{ color: "#EDF2F7" }}
            />
          </div>

          {/* Action type filter */}
          <div className="relative">
            <button
              onClick={() => setShowActionFilter(!showActionFilter)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all"
              style={{
                backgroundColor: filterAction !== "All" ? "rgba(0,210,255,0.1)" : "rgba(0,0,0,0.2)",
                border: `1px solid ${filterAction !== "All" ? "rgba(0,210,255,0.25)" : "rgba(0,210,255,0.1)"}`,
                color: filterAction !== "All" ? "#00D2FF" : "#A0AEC0",
              }}
            >
              <Filter className="w-3 h-3" />
              {filterAction === "All" ? "Action Type" : filterAction}
              <ChevronDown className="w-3 h-3" />
            </button>
            {showActionFilter && (
              <div
                className="absolute top-full mt-1 left-0 z-20 rounded-lg overflow-hidden w-44"
                style={{
                  backgroundColor: "#071525",
                  border: "1px solid rgba(0,210,255,0.2)",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
                }}
              >
                {(["All", ...ALL_ACTION_TYPES] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => { setFilterAction(t); setShowActionFilter(false) }}
                    className="w-full text-left px-3 py-2 text-xs font-mono hover:bg-white/5 transition-colors"
                    style={{ color: filterAction === t ? "#00D2FF" : "#A0AEC0" }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Severity pills */}
          <div className="flex items-center gap-1.5">
            {(["all", "info", "warning", "critical"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFilterSeverity(s)}
                className="px-2.5 py-1 rounded-full text-[10px] font-mono uppercase font-bold transition-all"
                style={
                  filterSeverity === s
                    ? {
                        backgroundColor: s === "all" ? "rgba(0,210,255,0.15)" : `${SEVERITY_COLORS[s as keyof typeof SEVERITY_COLORS]}20`,
                        border: `1px solid ${s === "all" ? "rgba(0,210,255,0.3)" : `${SEVERITY_COLORS[s as keyof typeof SEVERITY_COLORS]}50`}`,
                        color: s === "all" ? "#00D2FF" : SEVERITY_COLORS[s as keyof typeof SEVERITY_COLORS],
                      }
                    : { backgroundColor: "transparent", border: "1px solid rgba(255,255,255,0.06)", color: "#A0AEC0" }
                }
              >
                {s}
              </button>
            ))}
          </div>

          <div className="ml-auto text-[10px] font-mono" style={{ color: "#A0AEC0" }}>
            {filtered.length} / {auditEntries.length} events
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(0,210,255,0.08)" }}>
                {["Event ID", "User", "Action Type", "Detail", "Timestamp", "HSM Slot", "Severity", ""].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-2.5 font-mono text-[10px] tracking-widest uppercase whitespace-nowrap"
                    style={{ color: "#A0AEC0" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(filtered || []).map((entry, i) => (
                <tr
                  key={entry.id}
                  className="group transition-colors hover:bg-white/[0.03]"
                  style={{
                    borderBottom: i < filtered.length - 1 ? "1px solid rgba(0,210,255,0.05)" : "none",
                  }}
                >
                  {/* Event ID */}
                  <td className="px-4 py-3 font-mono text-[11px] whitespace-nowrap" style={{ color: "#00D2FF" }}>
                    {entry.id}
                  </td>
                  {/* User */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="font-medium" style={{ color: "#EDF2F7" }}>{entry.user}</div>
                    <div className="font-mono text-[9px] mt-0.5" style={{ color: "#A0AEC0" }}>{entry.userRole}</div>
                  </td>
                  {/* Action Type */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className="flex items-center gap-1.5 w-fit px-2 py-1 rounded-md text-[10px] font-mono font-medium"
                      style={{
                        backgroundColor: `${ACTION_COLORS[entry.actionType]}15`,
                        border: `1px solid ${ACTION_COLORS[entry.actionType]}30`,
                        color: ACTION_COLORS[entry.actionType],
                      }}
                    >
                      {ACTION_ICONS[entry.actionType]}
                      {entry.actionType}
                    </span>
                  </td>
                  {/* Detail */}
                  <td className="px-4 py-3 max-w-[220px]">
                    <span
                      className="text-[11px] line-clamp-2"
                      style={{ color: entry.severity === "critical" ? "#FCA5A5" : "#A0AEC0" }}
                    >
                      {entry.detail}
                    </span>
                  </td>
                  {/* Timestamp */}
                  <td className="px-4 py-3 whitespace-nowrap font-mono text-[10px]" style={{ color: "#A0AEC0" }}>
                    {entry.timestamp.replace("T", " ").replace("Z", "")}
                  </td>
                  {/* HSM Slot */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className="font-mono text-[10px] px-2 py-0.5 rounded"
                      style={{
                        backgroundColor: entry.hsmSlotId !== "N/A" ? "rgba(0,210,255,0.08)" : "transparent",
                        color: entry.hsmSlotId !== "N/A" ? "#00D2FF" : "#A0AEC0",
                      }}
                    >
                      {entry.hsmSlotId}
                    </span>
                  </td>
                  {/* Severity */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className="font-mono text-[9px] uppercase font-bold px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: `${SEVERITY_COLORS[entry.severity]}15`,
                        border: `1px solid ${SEVERITY_COLORS[entry.severity]}35`,
                        color: SEVERITY_COLORS[entry.severity],
                      }}
                    >
                      {entry.severity}
                    </span>
                  </td>
                  {/* View JSON */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <button
                      onClick={() => setInspectEntry(entry)}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono font-medium transition-all opacity-0 group-hover:opacity-100"
                      style={{
                        backgroundColor: "rgba(0,210,255,0.08)",
                        border: "1px solid rgba(0,210,255,0.2)",
                        color: "#00D2FF",
                      }}
                    >
                      <Eye className="w-3 h-3" />
                      View JSON
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <Activity className="w-8 h-8 mx-auto mb-3" style={{ color: "rgba(0,210,255,0.2)" }} />
                <div className="text-sm" style={{ color: "#A0AEC0" }}>No audit events match your filters</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
