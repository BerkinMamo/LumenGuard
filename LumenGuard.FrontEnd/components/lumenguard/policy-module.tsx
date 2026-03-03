"use client"

import { useState } from "react"
import { CheckCircle2, XCircle, AlertCircle, Globe, Smartphone, Server, Plus } from "lucide-react"

interface RegisteredClient {
  id: string
  name: string
  clientId: string
  type: "web" | "mobile" | "server"
  status: "active" | "degraded" | "inactive"
  scopes: string[]
  lastActivity: string
  requests: number
}

interface PermissionRow {
  permission: string
  superAdmin: boolean
  vaultOperator: boolean
  kycAnalyst: boolean
  auditor: boolean
  developer: boolean
}

const clients: RegisteredClient[] = [
  {
    id: "c1",
    name: "Lumora ERP",
    clientId: "lumora-erp-prod-001",
    type: "web",
    status: "active",
    scopes: ["openid", "profile", "vault.read", "kyc.approve"],
    lastActivity: "2 min ago",
    requests: 4821,
  },
  {
    id: "c2",
    name: "Luvia Mobile App",
    clientId: "luvia-mobile-ios-002",
    type: "mobile",
    status: "active",
    scopes: ["openid", "profile", "vault.read"],
    lastActivity: "8 min ago",
    requests: 1204,
  },
  {
    id: "c3",
    name: "Compliance Portal",
    clientId: "compliance-web-003",
    type: "web",
    status: "degraded",
    scopes: ["openid", "profile", "kyc.read", "aml.flag"],
    lastActivity: "1 hr ago",
    requests: 342,
  },
  {
    id: "c4",
    name: "HSM Key Service",
    clientId: "hsm-svc-internal-004",
    type: "server",
    status: "active",
    scopes: ["openid", "vault.decrypt", "vault.sign"],
    lastActivity: "14 sec ago",
    requests: 29473,
  },
  {
    id: "c5",
    name: "Audit Logger",
    clientId: "audit-svc-005",
    type: "server",
    status: "active",
    scopes: ["openid", "audit.write"],
    lastActivity: "1 min ago",
    requests: 8902,
  },
]

const permissionMatrix: PermissionRow[] = [
  {
    permission: "Vault Decryption",
    superAdmin: true,
    vaultOperator: true,
    kycAnalyst: false,
    auditor: false,
    developer: false,
  },
  {
    permission: "KYC Approval",
    superAdmin: true,
    vaultOperator: false,
    kycAnalyst: true,
    auditor: false,
    developer: false,
  },
  {
    permission: "AML Flag",
    superAdmin: true,
    vaultOperator: false,
    kycAnalyst: true,
    auditor: true,
    developer: false,
  },
  {
    permission: "Token Signing",
    superAdmin: true,
    vaultOperator: true,
    kycAnalyst: false,
    auditor: false,
    developer: false,
  },
  {
    permission: "User Management",
    superAdmin: true,
    vaultOperator: false,
    kycAnalyst: false,
    auditor: false,
    developer: false,
  },
  {
    permission: "Policy Edit",
    superAdmin: true,
    vaultOperator: false,
    kycAnalyst: false,
    auditor: false,
    developer: false,
  },
  {
    permission: "Audit Log Read",
    superAdmin: true,
    vaultOperator: false,
    kycAnalyst: false,
    auditor: true,
    developer: true,
  },
  {
    permission: "Vault Read",
    superAdmin: true,
    vaultOperator: true,
    kycAnalyst: false,
    auditor: true,
    developer: false,
  },
]

const roles = ["superAdmin", "vaultOperator", "kycAnalyst", "auditor", "developer"] as const
const roleLabels: Record<(typeof roles)[number], string> = {
  superAdmin: "Super Admin",
  vaultOperator: "Vault Op.",
  kycAnalyst: "KYC Analyst",
  auditor: "Auditor",
  developer: "Developer",
}

function ClientTypeIcon({ type }: { type: RegisteredClient["type"] }) {
  if (type === "web") return <Globe className="w-3.5 h-3.5" />
  if (type === "mobile") return <Smartphone className="w-3.5 h-3.5" />
  return <Server className="w-3.5 h-3.5" />
}

function ClientStatusBadge({ status }: { status: RegisteredClient["status"] }) {
  const config = {
    active: { label: "Active", color: "#00D2FF", bg: "rgba(0,210,255,0.1)" },
    degraded: { label: "Degraded", color: "#F59E0B", bg: "rgba(245,158,11,0.1)" },
    inactive: { label: "Inactive", color: "#EF4444", bg: "rgba(239,68,68,0.1)" },
  }
  const c = config[status]
  return (
    <span
      className="px-2 py-0.5 rounded-full text-[11px] font-semibold"
      style={{ backgroundColor: c.bg, color: c.color }}
    >
      {c.label}
    </span>
  )
}

function PermCell({ allowed }: { allowed: boolean }) {
  return (
    <td className="px-4 py-3 text-center">
      {allowed ? (
        <CheckCircle2 className="w-4 h-4 mx-auto" style={{ color: "#00D2FF" }} />
      ) : (
        <XCircle className="w-4 h-4 mx-auto opacity-20" style={{ color: "#A0AEC0" }} />
      )}
    </td>
  )
}

export function PolicyModule() {
  const [activeTab, setActiveTab] = useState<"clients" | "matrix">("clients")

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold" style={{ color: "#EDF2F7" }}>
            Policy &amp; Access Management
          </h2>
          <p className="text-sm" style={{ color: "#A0AEC0" }}>
            OAuth 2.0 / OpenID Connect scopes, clients, and permission matrix
          </p>
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold"
          style={{
            backgroundColor: "rgba(0, 210, 255, 0.15)",
            border: "1px solid rgba(0, 210, 255, 0.4)",
            color: "#00D2FF",
          }}
        >
          <Plus className="w-4 h-4" />
          New Policy
        </button>
      </div>

      {/* Tab switcher */}
      <div
        className="flex gap-1 p-1 rounded-xl w-fit"
        style={{ backgroundColor: "rgba(0, 210, 255, 0.05)", border: "1px solid rgba(0,210,255,0.1)" }}
      >
        {([["clients", "Registered Clients"], ["matrix", "Permission Matrix"]] as const).map(
          ([id, label]) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className="px-4 py-1.5 rounded-lg text-sm font-medium transition-all"
              style={
                activeTab === id
                  ? {
                      backgroundColor: "rgba(0, 210, 255, 0.15)",
                      border: "1px solid rgba(0, 210, 255, 0.3)",
                      color: "#00D2FF",
                    }
                  : { color: "#A0AEC0", border: "1px solid transparent" }
              }
            >
              {label}
            </button>
          )
        )}
      </div>

      {activeTab === "clients" && (
        <div className="glass-card rounded-xl overflow-hidden">
          <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(0,210,255,0.1)" }}>
            <span className="text-sm font-semibold" style={{ color: "#EDF2F7" }}>
              OIDC Registered Clients
            </span>
            <span className="font-mono text-xs" style={{ color: "#A0AEC0" }}>
              {clients.length} clients registered
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr
                  className="text-left text-[11px] uppercase tracking-wider"
                  style={{ borderBottom: "1px solid rgba(0,210,255,0.08)", color: "#A0AEC0" }}
                >
                  <th className="px-5 py-3 font-semibold">Application</th>
                  <th className="px-4 py-3 font-semibold">Client ID</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Scopes</th>
                  <th className="px-4 py-3 font-semibold text-right">Requests</th>
                  <th className="px-4 py-3 font-semibold">Last Activity</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((c, idx) => (
                  <tr
                    key={c.id}
                    className="hover:bg-white/[0.02] transition-colors"
                    style={{ borderBottom: idx < clients.length - 1 ? "1px solid rgba(0,210,255,0.06)" : "none" }}
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: "rgba(0,210,255,0.1)", color: "#00D2FF" }}
                        >
                          <ClientTypeIcon type={c.type} />
                        </div>
                        <span className="font-semibold" style={{ color: "#EDF2F7" }}>{c.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="font-mono text-[11px]" style={{ color: "#A0AEC0" }}>
                        {c.clientId}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <ClientStatusBadge status={c.status} />
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex flex-wrap gap-1">
                        {c.scopes.slice(0, 3).map((s) => (
                          <span
                            key={s}
                            className="px-1.5 py-0.5 rounded text-[10px] font-mono"
                            style={{ backgroundColor: "rgba(0,210,255,0.06)", color: "#A0AEC0", border: "1px solid rgba(0,210,255,0.12)" }}
                          >
                            {s}
                          </span>
                        ))}
                        {c.scopes.length > 3 && (
                          <span className="text-[11px]" style={{ color: "#A0AEC0" }}>
                            +{c.scopes.length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <span className="font-mono text-sm font-semibold" style={{ color: "#EDF2F7" }}>
                        {c.requests.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="font-mono text-xs" style={{ color: "#A0AEC0" }}>
                        {c.lastActivity}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "matrix" && (
        <div className="glass-card rounded-xl overflow-hidden">
          <div className="px-5 py-4" style={{ borderBottom: "1px solid rgba(0,210,255,0.1)" }}>
            <span className="text-sm font-semibold" style={{ color: "#EDF2F7" }}>
              Permission Matrix
            </span>
            <p className="text-xs mt-0.5" style={{ color: "#A0AEC0" }}>
              Role-based access control for sensitive operations
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr
                  className="text-[11px] uppercase tracking-wider"
                  style={{ borderBottom: "1px solid rgba(0,210,255,0.08)", color: "#A0AEC0" }}
                >
                  <th className="px-5 py-3 font-semibold text-left">Permission</th>
                  {roles.map((r) => (
                    <th key={r} className="px-4 py-3 font-semibold text-center">
                      {roleLabels[r]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {permissionMatrix.map((row, idx) => (
                  <tr
                    key={row.permission}
                    className="hover:bg-white/[0.02] transition-colors"
                    style={{ borderBottom: idx < permissionMatrix.length - 1 ? "1px solid rgba(0,210,255,0.06)" : "none" }}
                  >
                    <td className="px-5 py-3 font-medium" style={{ color: "#EDF2F7" }}>
                      {row.permission}
                    </td>
                    <PermCell allowed={row.superAdmin} />
                    <PermCell allowed={row.vaultOperator} />
                    <PermCell allowed={row.kycAnalyst} />
                    <PermCell allowed={row.auditor} />
                    <PermCell allowed={row.developer} />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
