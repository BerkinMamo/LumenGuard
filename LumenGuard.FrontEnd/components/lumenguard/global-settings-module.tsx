"use client"

import { useState } from "react"
import {
  Shield,
  Key,
  Settings,
  Plus,
  Trash2,
  Save,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Lock,
  ToggleLeft,
  ToggleRight,
  ChevronDown,
  ChevronUp,
} from "lucide-react"

// ─── OIDC Scopes ──────────────────────────────────────────────────────────────

interface OidcScope {
  id: string
  name: string
  description: string
  enabled: boolean
  requiredRole: string
  includesOfflineAccess: boolean
}

const INITIAL_SCOPES: OidcScope[] = [
  { id: "s1", name: "openid", description: "OpenID Connect base scope", enabled: true, requiredRole: "any", includesOfflineAccess: false },
  { id: "s2", name: "profile", description: "User profile information", enabled: true, requiredRole: "any", includesOfflineAccess: false },
  { id: "s3", name: "email", description: "User email address", enabled: true, requiredRole: "any", includesOfflineAccess: false },
  { id: "s4", name: "vault.read", description: "Read access to Contract Vault documents", enabled: true, requiredRole: "vault_user", includesOfflineAccess: false },
  { id: "s5", name: "vault.write", description: "Write and upload documents to Contract Vault", enabled: true, requiredRole: "vault_admin", includesOfflineAccess: false },
  { id: "s6", name: "kyc.read", description: "Read KYC applicant data", enabled: true, requiredRole: "compliance_officer", includesOfflineAccess: false },
  { id: "s7", name: "kyc.write", description: "Approve, reject, and modify KYC records", enabled: true, requiredRole: "compliance_officer", includesOfflineAccess: false },
  { id: "s8", name: "hsm.sign", description: "Trigger HSM document signing operations", enabled: false, requiredRole: "super_admin", includesOfflineAccess: false },
  { id: "s9", name: "policy.manage", description: "Manage IdentityServer policy and OIDC clients", enabled: true, requiredRole: "policy_admin", includesOfflineAccess: false },
  { id: "s10", name: "offline_access", description: "Issue refresh tokens for long-lived sessions", enabled: false, requiredRole: "super_admin", includesOfflineAccess: true },
]

// ─── HSM Settings ─────────────────────────────────────────────────────────────

interface HsmSlotConfig {
  slotId: string
  label: string
  algorithm: string
  pinRotationDays: number
  lastRotated: string
  status: "active" | "standby" | "locked"
}

const INITIAL_HSM_SLOTS: HsmSlotConfig[] = [
  { slotId: "SLOT-0", label: "Primary Signing Key (RSA-4096)", algorithm: "RSA-4096", pinRotationDays: 30, lastRotated: "2026-02-01", status: "active" },
  { slotId: "SLOT-1", label: "Secondary Signing Key (RSA-4096)", algorithm: "RSA-4096", pinRotationDays: 30, lastRotated: "2026-02-01", status: "standby" },
  { slotId: "SLOT-2", label: "Token Encryption (AES-256)", algorithm: "AES-256-GCM", pinRotationDays: 90, lastRotated: "2025-12-01", status: "active" },
  { slotId: "SLOT-3", label: "Document Signing (EC P-256)", algorithm: "EC P-256", pinRotationDays: 60, lastRotated: "2026-01-15", status: "active" },
  { slotId: "SLOT-4", label: "Vault Key Provisioning (AES-256)", algorithm: "AES-256-GCM", pinRotationDays: 30, lastRotated: "2026-02-15", status: "active" },
]

// ─── KYC Risk Thresholds ──────────────────────────────────────────────────────

interface KycThreshold {
  id: string
  label: string
  description: string
  value: number
  min: number
  max: number
  color: string
  action: string
}

const INITIAL_THRESHOLDS: KycThreshold[] = [
  { id: "th1", label: "Auto-Approve Threshold", description: "Applications scoring below this are auto-approved", value: 25, min: 0, max: 50, color: "#22C55E", action: "AUTO_APPROVE" },
  { id: "th2", label: "Manual Review Threshold", description: "Applications above this score require manual compliance officer review", value: 50, min: 25, max: 75, color: "#F6C90E", action: "MANUAL_REVIEW" },
  { id: "th3", label: "High-Risk Threshold", description: "Applications above this are flagged high-risk and require dual approval", value: 75, min: 50, max: 95, color: "#F97316", action: "DUAL_APPROVAL" },
  { id: "th4", label: "Critical Threshold (Alert)", description: "Applications above this trigger a Critical security alert", value: 90, min: 75, max: 100, color: "#EF4444", action: "CRITICAL_ALERT" },
]

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({ title, subtitle, icon, children }: {
  title: string
  subtitle: string
  icon: React.ReactNode
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(true)
  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ backgroundColor: "rgba(7,21,37,0.6)", border: "1px solid rgba(0,210,255,0.12)" }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-white/[0.02] transition-colors"
      >
        <div
          className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0"
          style={{ backgroundColor: "rgba(0,210,255,0.1)", border: "1px solid rgba(0,210,255,0.2)" }}
        >
          <span style={{ color: "#00D2FF" }}>{icon}</span>
        </div>
        <div className="flex-1">
          <div className="text-sm font-bold" style={{ color: "#EDF2F7" }}>{title}</div>
          <div className="text-[11px] mt-0.5" style={{ color: "#A0AEC0" }}>{subtitle}</div>
        </div>
        {open ? (
          <ChevronUp className="w-4 h-4 shrink-0" style={{ color: "#A0AEC0" }} />
        ) : (
          <ChevronDown className="w-4 h-4 shrink-0" style={{ color: "#A0AEC0" }} />
        )}
      </button>
      {open && (
        <div style={{ borderTop: "1px solid rgba(0,210,255,0.08)" }}>
          {children}
        </div>
      )}
    </div>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export function GlobalSettingsModule() {
  const [scopes, setScopes] = useState<OidcScope[]>(INITIAL_SCOPES)
  const [hsmSlots, setHsmSlots] = useState<HsmSlotConfig[]>(INITIAL_HSM_SLOTS)
  const [thresholds, setThresholds] = useState<KycThreshold[]>(INITIAL_THRESHOLDS)
  const [savedScopes, setSavedScopes] = useState(false)
  const [savedHsm, setSavedHsm] = useState(false)
  const [savedKyc, setSavedKyc] = useState(false)
  const [newScopeName, setNewScopeName] = useState("")
  const [newScopeDesc, setNewScopeDesc] = useState("")
  const [newScopeRole, setNewScopeRole] = useState("any")

  function toggleScope(id: string) {
    setScopes((prev) => (prev || []).map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s)))
  }

  function deleteScope(id: string) {
    setScopes((prev) => (prev || []).filter((s) => s.id !== id))
  }

  function addScope() {
    if (!newScopeName.trim()) return
    setScopes((prev) => [
      ...(prev || []),
      {
        id: `s${Date.now()}`,
        name: newScopeName.trim(),
        description: newScopeDesc.trim() || "Custom scope",
        enabled: true,
        requiredRole: newScopeRole,
        includesOfflineAccess: false,
      },
    ])
    setNewScopeName("")
    setNewScopeDesc("")
    setNewScopeRole("any")
  }

  function saveScopes() {
    setSavedScopes(true)
    setTimeout(() => setSavedScopes(false), 2000)
  }

  function updatePinRotation(slotId: string, days: number) {
    setHsmSlots((prev) => (prev || []).map((s) => (s.slotId === slotId ? { ...s, pinRotationDays: days } : s)))
  }

  function saveHsm() {
    setSavedHsm(true)
    setTimeout(() => setSavedHsm(false), 2000)
  }

  function updateThreshold(id: string, value: number) {
    setThresholds((prev) => (prev || []).map((t) => (t.id === id ? { ...t, value } : t)))
  }

  function saveKyc() {
    setSavedKyc(true)
    setTimeout(() => setSavedKyc(false), 2000)
  }

  const SLOT_STATUS_COLORS = {
    active: "#22C55E",
    standby: "#F6C90E",
    locked: "#EF4444",
  }

  return (
    <div className="space-y-5">
      {/* ── OIDC Scopes ─────────────────────────────────── */}
      <Section
        title="Duende IdentityServer — OIDC Scopes"
        subtitle="Manage all registered scopes and their access control rules"
        icon={<Shield className="w-4 h-4" />}
      >
        <div className="p-5 space-y-3">
          {/* Scope list */}
          <div className="space-y-2">
            {(scopes || []).map((scope) => (
              <div
                key={scope.id}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all"
                style={{
                  backgroundColor: scope.enabled ? "rgba(0,210,255,0.04)" : "rgba(255,255,255,0.02)",
                  border: `1px solid ${scope.enabled ? "rgba(0,210,255,0.12)" : "rgba(255,255,255,0.05)"}`,
                }}
              >
                {/* Toggle */}
                <button
                  onClick={() => toggleScope(scope.id)}
                  className="shrink-0 transition-colors"
                  style={{ color: scope.enabled ? "#00D2FF" : "#A0AEC0" }}
                  aria-label={scope.enabled ? "Disable scope" : "Enable scope"}
                >
                  {scope.enabled ? (
                    <ToggleRight className="w-5 h-5" />
                  ) : (
                    <ToggleLeft className="w-5 h-5" />
                  )}
                </button>

                {/* Name */}
                <code
                  className="text-xs font-mono font-bold w-36 shrink-0"
                  style={{ color: scope.enabled ? "#EDF2F7" : "#A0AEC0" }}
                >
                  {scope.name}
                </code>

                {/* Description */}
                <span className="flex-1 text-xs" style={{ color: "#A0AEC0" }}>
                  {scope.description}
                </span>

                {/* Role badge */}
                <span
                  className="text-[10px] font-mono px-2 py-0.5 rounded shrink-0"
                  style={{
                    backgroundColor: "rgba(0,210,255,0.08)",
                    color: "#00D2FF",
                  }}
                >
                  {scope.requiredRole}
                </span>

                {/* Offline badge */}
                {scope.includesOfflineAccess && (
                  <span
                    className="text-[9px] font-mono px-1.5 py-0.5 rounded uppercase shrink-0"
                    style={{
                      backgroundColor: "rgba(246,201,14,0.1)",
                      color: "#F6C90E",
                      border: "1px solid rgba(246,201,14,0.2)",
                    }}
                  >
                    Offline
                  </span>
                )}

                {/* Delete (protect system scopes) */}
                {!["openid", "profile", "email"].includes(scope.name) && (
                  <button
                    onClick={() => deleteScope(scope.id)}
                    className="p-1 rounded hover:bg-red-500/10 transition-colors shrink-0"
                    style={{ color: "rgba(239,68,68,0.5)" }}
                    aria-label={`Delete scope ${scope.name}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Add new scope */}
          <div
            className="p-3 rounded-lg border-2 border-dashed space-y-2"
            style={{ borderColor: "rgba(0,210,255,0.2)", backgroundColor: "rgba(0,210,255,0.02)" }}
          >
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Scope name"
                value={newScopeName}
                onChange={(e) => setNewScopeName(e.target.value)}
                className="flex-1 text-xs px-2 py-1 rounded outline-none"
                style={{ backgroundColor: "rgba(0,0,0,0.3)", color: "#EDF2F7", border: "1px solid rgba(0,210,255,0.15)" }}
              />
              <select
                value={newScopeRole}
                onChange={(e) => setNewScopeRole(e.target.value)}
                className="text-xs px-2 py-1 rounded outline-none"
                style={{ backgroundColor: "rgba(0,0,0,0.3)", color: "#EDF2F7", border: "1px solid rgba(0,210,255,0.15)" }}
              >
                <option>any</option>
                <option>vault_user</option>
                <option>vault_admin</option>
                <option>compliance_officer</option>
                <option>policy_admin</option>
                <option>super_admin</option>
              </select>
            </div>
            <input
              type="text"
              placeholder="Description"
              value={newScopeDesc}
              onChange={(e) => setNewScopeDesc(e.target.value)}
              className="w-full text-xs px-2 py-1 rounded outline-none"
              style={{ backgroundColor: "rgba(0,0,0,0.3)", color: "#EDF2F7", border: "1px solid rgba(0,210,255,0.15)" }}
            />
            <button
              onClick={addScope}
              className="flex items-center gap-2 px-3 py-1.5 rounded text-xs font-semibold transition-all w-full"
              style={{
                backgroundColor: "rgba(0,210,255,0.12)",
                border: "1px solid rgba(0,210,255,0.3)",
                color: "#00D2FF",
              }}
            >
              <Plus className="w-3.5 h-3.5" />
              Add Scope
            </button>
          </div>

          <div className="flex justify-end">
            <button
              onClick={saveScopes}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all"
              style={{
                backgroundColor: savedScopes ? "rgba(34,197,94,0.12)" : "rgba(0,210,255,0.1)",
                border: `1px solid ${savedScopes ? "rgba(34,197,94,0.3)" : "rgba(0,210,255,0.25)"}`,
                color: savedScopes ? "#22C55E" : "#00D2FF",
              }}
            >
              {savedScopes ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
              {savedScopes ? "Saved!" : "Save OIDC Configuration"}
            </button>
          </div>
        </div>
      </Section>

      {/* ── HSM Settings ────────────────────────────────── */}
      <Section
        title="Luvia HSM — PIN Rotation Intervals"
        subtitle="Configure automatic key rotation schedules per HSM slot"
        icon={<Key className="w-4 h-4" />}
      >
        <div className="p-5 space-y-3">
          {/* Slot list */}
          <div className="space-y-3">
            {(hsmSlots || []).map((slot) => (
              <div
                key={slot.slotId}
                className="flex items-center gap-4 px-4 py-3 rounded-lg flex-wrap"
                style={{
                  backgroundColor: "rgba(0,0,0,0.2)",
                  border: "1px solid rgba(0,210,255,0.1)",
                }}
              >
                {/* Slot ID */}
                <div
                  className="font-mono text-xs font-bold w-16 shrink-0"
                  style={{ color: "#00D2FF" }}
                >
                  {slot.slotId}
                </div>

                {/* Label + Algorithm */}
                <div className="flex-1 min-w-36">
                  <div className="text-xs font-medium" style={{ color: "#EDF2F7" }}>{slot.label}</div>
                  <div className="font-mono text-[10px] mt-0.5" style={{ color: "#A0AEC0" }}>{slot.algorithm}</div>
                </div>

                {/* Status */}
                <span
                  className="font-mono text-[9px] uppercase font-bold px-2 py-0.5 rounded-full shrink-0"
                  style={{
                    backgroundColor: `${SLOT_STATUS_COLORS[slot.status]}15`,
                    border: `1px solid ${SLOT_STATUS_COLORS[slot.status]}30`,
                    color: SLOT_STATUS_COLORS[slot.status],
                  }}
                >
                  {slot.status}
                </span>

                {/* Rotation interval */}
                <div className="flex items-center gap-2 shrink-0">
                  <label className="text-[10px] font-mono" style={{ color: "#A0AEC0" }}>
                    Rotate every
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={365}
                    value={slot.pinRotationDays}
                    onChange={(e) => updatePinRotation(slot.slotId, Number(e.target.value))}
                    className="w-16 text-center px-2 py-1 rounded-md text-xs font-mono font-bold outline-none"
                    style={{
                      backgroundColor: "rgba(0,210,255,0.08)",
                      border: "1px solid rgba(0,210,255,0.2)",
                      color: "#EDF2F7",
                    }}
                  />
                  <span className="text-[10px] font-mono" style={{ color: "#A0AEC0" }}>days</span>
                </div>

                {/* Last rotated */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <RefreshCw className="w-3 h-3" style={{ color: "#A0AEC0" }} />
                  <span className="font-mono text-[10px]" style={{ color: "#A0AEC0" }}>
                    Last: {slot.lastRotated}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Warning */}
          <div
            className="flex items-start gap-2.5 p-3 rounded-lg"
            style={{
              backgroundColor: "rgba(246,201,14,0.06)",
              border: "1px solid rgba(246,201,14,0.2)",
            }}
          >
            <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: "#F6C90E" }} />
            <p className="text-[11px] leading-relaxed" style={{ color: "#F6C90E" }}>
              Changes to PIN rotation intervals require dual-admin approval and will be applied at the next scheduled maintenance window. Modifying an active slot may cause transient signing unavailability.
            </p>
          </div>

          <div className="flex justify-end">
            <button
              onClick={saveHsm}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all"
              style={{
                backgroundColor: savedHsm ? "rgba(34,197,94,0.12)" : "rgba(0,210,255,0.1)",
                border: `1px solid ${savedHsm ? "rgba(34,197,94,0.3)" : "rgba(0,210,255,0.25)"}`,
                color: savedHsm ? "#22C55E" : "#00D2FF",
              }}
            >
              {savedHsm ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
              {savedHsm ? "Saved!" : "Save HSM Configuration"}
            </button>
          </div>
        </div>
      </Section>

      {/* ── KYC Risk Thresholds ───────────────────────────── */}
      <Section
        title="Global KYC Risk Thresholds"
        subtitle="Define risk score boundaries that control automated KYC decisions and alert triggers"
        icon={<Settings className="w-4 h-4" />}
      >
        <div className="p-5 space-y-5">
          {/* Risk spectrum visual */}
          <div className="relative h-3 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(0,0,0,0.3)" }}>
            {(thresholds || []).map((t, i) => {
              const prev = i === 0 ? 0 : (thresholds[i - 1]?.value || 0)
              const width = t.value - prev
              return (
                <div
                  key={t.id}
                  className="absolute top-0 h-full"
                  style={{
                    left: `${prev}%`,
                    width: `${width}%`,
                    backgroundColor: t.color,
                    opacity: 0.6,
                  }}
                />
              )
            })}
          </div>

          {/* Threshold sliders */}
          <div className="space-y-4">
            {(thresholds || []).map((t) => (
              <div key={t.id} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: t.color }}
                      />
                      <span className="text-xs font-semibold" style={{ color: "#EDF2F7" }}>{t.label}</span>
                      <span
                        className="font-mono text-[9px] uppercase px-1.5 py-0.5 rounded"
                        style={{ backgroundColor: `${t.color}15`, color: t.color }}
                      >
                        {t.action}
                      </span>
                    </div>
                    <div className="text-[11px] mt-0.5 ml-4" style={{ color: "#A0AEC0" }}>{t.description}</div>
                  </div>
                  <div
                    className="font-mono text-lg font-bold tabular-nums ml-4 shrink-0"
                    style={{ color: t.color }}
                  >
                    {t.value}
                  </div>
                </div>
                <input
                  type="range"
                  min={t.min}
                  max={t.max}
                  value={t.value}
                  onChange={(e) => updateThreshold(t.id, Number(e.target.value))}
                  className="w-full h-1.5 rounded-full outline-none appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, ${t.color} 0%, ${t.color} ${((t.value - t.min) / (t.max - t.min)) * 100}%, rgba(0,210,255,0.1) ${((t.value - t.min) / (t.max - t.min)) * 100}%, rgba(0,210,255,0.1) 100%)`,
                    accentColor: t.color,
                  }}
                />
                <div className="flex justify-between text-[9px] font-mono" style={{ color: "rgba(160,174,192,0.5)" }}>
                  <span>{t.min}</span>
                  <span>{t.max}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Threshold overlap warning */}
          {(thresholds || []).some((t, i) => i > 0 && t.value <= (thresholds[i - 1]?.value || 0)) && (
            <div
              className="flex items-center gap-2 p-3 rounded-lg"
              style={{ backgroundColor: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}
            >
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" style={{ color: "#EF4444" }} />
              <span className="text-xs" style={{ color: "#EF4444" }}>
                Threshold overlap detected — review values before saving.
              </span>
            </div>
          )}

          <div className="flex justify-end">
            <button
              onClick={saveKyc}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all"
              style={{
                backgroundColor: savedKyc ? "rgba(34,197,94,0.12)" : "rgba(0,210,255,0.1)",
                border: `1px solid ${savedKyc ? "rgba(34,197,94,0.3)" : "rgba(0,210,255,0.25)"}`,
                color: savedKyc ? "#22C55E" : "#00D2FF",
              }}
            >
              {savedKyc ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
              {savedKyc ? "Saved!" : "Save KYC Configuration"}
            </button>
          </div>
        </div>
      </Section>
    </div>
  )
}
