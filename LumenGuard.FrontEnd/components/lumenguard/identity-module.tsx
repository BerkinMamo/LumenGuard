"use client"

import { useState } from "react"
import {
  Search,
  Key,
  Shield,
  UserPlus,
  Filter,
  X,
  Lock,
  Unlock,
  User,
  Mail,
  ChevronDown,
} from "lucide-react"

interface UserEntry {
  id: string
  name: string
  email: string
  initials: string
  color: string
  identityStatus: "verified" | "pending" | "suspended"
  activeSessions: number
  hsmKeyAssigned: boolean
  role: string
  lastSeen: string
  locked: boolean
  identitySource: string
}

const initialUsers: UserEntry[] = [
  {
    id: "usr_001",
    name: "Ayşe Kaya",
    email: "a.kaya@lumora.corp",
    initials: "AK",
    color: "#00D2FF",
    identityStatus: "verified",
    activeSessions: 2,
    hsmKeyAssigned: true,
    role: "Security Admin",
    lastSeen: "2 min ago",
    locked: false,
    identitySource: "Duende OIDC",
  },
  {
    id: "usr_002",
    name: "Berkin Çelik",
    email: "b.celik@lumora.corp",
    initials: "BC",
    color: "#38BDF8",
    identityStatus: "verified",
    activeSessions: 1,
    hsmKeyAssigned: true,
    role: "Vault Operator",
    lastSeen: "14 min ago",
    locked: false,
    identitySource: "Duende OIDC",
  },
  {
    id: "usr_003",
    name: "Ceren Arslan",
    email: "c.arslan@lumora.corp",
    initials: "CA",
    color: "#22D3EE",
    identityStatus: "pending",
    activeSessions: 0,
    hsmKeyAssigned: false,
    role: "Compliance Officer",
    lastSeen: "1 hr ago",
    locked: false,
    identitySource: "LDAP",
  },
  {
    id: "usr_004",
    name: "Deniz Yıldız",
    email: "d.yildiz@lumora.corp",
    initials: "DY",
    color: "#0EA5E9",
    identityStatus: "verified",
    activeSessions: 3,
    hsmKeyAssigned: true,
    role: "KYC Analyst",
    lastSeen: "5 min ago",
    locked: false,
    identitySource: "Duende OIDC",
  },
  {
    id: "usr_005",
    name: "Emre Şahin",
    email: "e.sahin@lumora.corp",
    initials: "ES",
    color: "#06B6D4",
    identityStatus: "suspended",
    activeSessions: 0,
    hsmKeyAssigned: false,
    role: "Developer",
    lastSeen: "3 days ago",
    locked: true,
    identitySource: "LDAP",
  },
  {
    id: "usr_006",
    name: "Fatma Özkan",
    email: "f.ozkan@lumora.corp",
    initials: "FÖ",
    color: "#00D2FF",
    identityStatus: "verified",
    activeSessions: 1,
    hsmKeyAssigned: true,
    role: "Policy Manager",
    lastSeen: "32 min ago",
    locked: false,
    identitySource: "SAML 2.0",
  },
  {
    id: "usr_007",
    name: "Gökhan Demir",
    email: "g.demir@lumora.corp",
    initials: "GD",
    color: "#38BDF8",
    identityStatus: "pending",
    activeSessions: 0,
    hsmKeyAssigned: false,
    role: "Auditor",
    lastSeen: "2 hr ago",
    locked: false,
    identitySource: "Duende OIDC",
  },
]

const ROLES = [
  "Security Admin",
  "Vault Operator",
  "Compliance Officer",
  "KYC Analyst",
  "Developer",
  "Policy Manager",
  "Auditor",
  "Read-Only Viewer",
]

const IDENTITY_SOURCES = ["Duende OIDC", "LDAP", "SAML 2.0", "Local"]

function StatusBadge({ status }: { status: UserEntry["identityStatus"] }) {
  const config = {
    verified: { label: "Verified", color: "#00D2FF", bg: "rgba(0,210,255,0.1)", dot: "#00D2FF" },
    pending: { label: "Pending", color: "#F59E0B", bg: "rgba(245,158,11,0.1)", dot: "#F59E0B" },
    suspended: { label: "Suspended", color: "#EF4444", bg: "rgba(239,68,68,0.1)", dot: "#EF4444" },
  }
  const c = config[status]
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold"
      style={{ backgroundColor: c.bg, color: c.color }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: c.dot }} />
      {c.label}
    </span>
  )
}

// ─── Manage User Modal ─────────────────────────────────────────────────────────
function ManageUserModal({
  user,
  onClose,
  onSave,
}: {
  user: UserEntry
  onClose: () => void
  onSave: (updated: UserEntry) => void
}) {
  const [name, setName] = useState(user.name)
  const [role, setRole] = useState(user.role)
  const [locked, setLocked] = useState(user.locked)
  const [resetPw, setResetPw] = useState(false)

  function handleSave() {
    onSave({ ...user, name, role, locked })
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-2xl m-4"
        style={{
          backgroundColor: "#0B1D33",
          border: "1px solid rgba(0,210,255,0.25)",
          boxShadow: "0 0 50px rgba(0,210,255,0.1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: "1px solid rgba(0,210,255,0.12)" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ backgroundColor: user.color + "22", border: `1px solid ${user.color}44`, color: user.color }}
            >
              {user.initials}
            </div>
            <div>
              <div className="font-bold text-sm" style={{ color: "#EDF2F7" }}>
                Manage User
              </div>
              <div className="text-xs font-mono" style={{ color: "#A0AEC0" }}>
                {user.email}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/10"
            style={{ color: "#A0AEC0" }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono uppercase tracking-wider" style={{ color: "#A0AEC0" }}>
              Full Name
            </label>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(0,210,255,0.15)" }}>
              <User className="w-4 h-4 shrink-0" style={{ color: "#A0AEC0" }} />
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="flex-1 bg-transparent text-sm outline-none"
                style={{ color: "#EDF2F7" }}
              />
            </div>
          </div>

          {/* Role */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono uppercase tracking-wider" style={{ color: "#A0AEC0" }}>
              Role
            </label>
            <div
              className="relative flex items-center px-3 py-2 rounded-lg"
              style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(0,210,255,0.15)" }}
            >
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="flex-1 bg-transparent text-sm outline-none appearance-none"
                style={{ color: "#EDF2F7" }}
              >
                {ROLES.map((r) => (
                  <option key={r} value={r} style={{ backgroundColor: "#0B1D33" }}>
                    {r}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 shrink-0 pointer-events-none" style={{ color: "#A0AEC0" }} />
            </div>
          </div>

          {/* Reset Password */}
          <div
            className="flex items-center justify-between px-4 py-3 rounded-xl"
            style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <div>
              <div className="text-sm font-medium" style={{ color: "#EDF2F7" }}>
                Reset Password
              </div>
              <div className="text-[11px]" style={{ color: "#A0AEC0" }}>
                Send a secure password reset link
              </div>
            </div>
            <button
              onClick={() => setResetPw(!resetPw)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={
                resetPw
                  ? { backgroundColor: "rgba(0,210,255,0.15)", border: "1px solid rgba(0,210,255,0.4)", color: "#00D2FF" }
                  : { backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#A0AEC0" }
              }
            >
              {resetPw ? "Queued" : "Queue Reset"}
            </button>
          </div>

          {/* Account Lock toggle */}
          <div
            className="flex items-center justify-between px-4 py-3 rounded-xl"
            style={
              locked
                ? { backgroundColor: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)" }
                : { backgroundColor: "rgba(34,197,94,0.04)", border: "1px solid rgba(34,197,94,0.15)" }
            }
          >
            <div className="flex items-center gap-2">
              {locked ? (
                <Lock className="w-4 h-4" style={{ color: "#EF4444" }} />
              ) : (
                <Unlock className="w-4 h-4" style={{ color: "#22C55E" }} />
              )}
              <div>
                <div className="text-sm font-medium" style={{ color: locked ? "#EF4444" : "#22C55E" }}>
                  Account {locked ? "Locked" : "Active"}
                </div>
                <div className="text-[11px]" style={{ color: "#A0AEC0" }}>
                  {locked ? "User cannot authenticate" : "User can sign in normally"}
                </div>
              </div>
            </div>
            <button
              onClick={() => setLocked(!locked)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={
                locked
                  ? { backgroundColor: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.35)", color: "#22C55E" }
                  : { backgroundColor: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#EF4444" }
              }
            >
              {locked ? "Unlock" : "Lock Account"}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex items-center gap-3 px-5 py-4"
          style={{ borderTop: "1px solid rgba(0,210,255,0.1)" }}
        >
          <button
            onClick={handleSave}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all hover:brightness-110"
            style={{
              backgroundColor: "rgba(0,210,255,0.15)",
              border: "1px solid rgba(0,210,255,0.4)",
              color: "#00D2FF",
            }}
          >
            Save Changes
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-white/10 transition-all"
            style={{ border: "1px solid rgba(255,255,255,0.1)", color: "#A0AEC0" }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Create User Modal ─────────────────────────────────────────────────────────
function CreateUserModal({
  onClose,
  onCreate,
}: {
  onClose: () => void
  onCreate: (user: UserEntry) => void
}) {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [role, setRole] = useState(ROLES[0])
  const [source, setSource] = useState(IDENTITY_SOURCES[0])

  function handleCreate() {
    if (!fullName.trim() || !email.trim()) return
    const initials = fullName
      .split(" ")
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase()
    const colors = ["#00D2FF", "#38BDF8", "#22D3EE", "#0EA5E9", "#06B6D4"]
    const newUser: UserEntry = {
      id: `usr_${Date.now()}`,
      name: fullName.trim(),
      email: email.trim(),
      initials,
      color: colors[Math.floor(Math.random() * colors.length)],
      identityStatus: "pending",
      activeSessions: 0,
      hsmKeyAssigned: false,
      role,
      lastSeen: "just now",
      locked: false,
      identitySource: source,
    }
    onCreate(newUser)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-2xl m-4"
        style={{
          backgroundColor: "#0B1D33",
          border: "1px solid rgba(0,210,255,0.25)",
          boxShadow: "0 0 50px rgba(0,210,255,0.1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: "1px solid rgba(0,210,255,0.12)" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: "rgba(0,210,255,0.12)", border: "1px solid rgba(0,210,255,0.3)" }}
            >
              <UserPlus className="w-4 h-4" style={{ color: "#00D2FF" }} />
            </div>
            <div>
              <div className="font-bold text-sm" style={{ color: "#EDF2F7" }}>
                Create New User
              </div>
              <div className="text-xs" style={{ color: "#A0AEC0" }}>
                Register identity in Duende IdentityServer
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/10"
            style={{ color: "#A0AEC0" }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono uppercase tracking-wider" style={{ color: "#A0AEC0" }}>
              Full Name <span style={{ color: "#EF4444" }}>*</span>
            </label>
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-lg"
              style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(0,210,255,0.15)" }}
            >
              <User className="w-4 h-4 shrink-0" style={{ color: "#A0AEC0" }} />
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Selin Koç"
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-[#4a5568]"
                style={{ color: "#EDF2F7" }}
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono uppercase tracking-wider" style={{ color: "#A0AEC0" }}>
              Email <span style={{ color: "#EF4444" }}>*</span>
            </label>
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-lg"
              style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(0,210,255,0.15)" }}
            >
              <Mail className="w-4 h-4 shrink-0" style={{ color: "#A0AEC0" }} />
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@lumora.corp"
                type="email"
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-[#4a5568]"
                style={{ color: "#EDF2F7" }}
              />
            </div>
          </div>

          {/* Initial Role */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono uppercase tracking-wider" style={{ color: "#A0AEC0" }}>
              Initial Role
            </label>
            <div
              className="relative flex items-center px-3 py-2 rounded-lg"
              style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(0,210,255,0.15)" }}
            >
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="flex-1 bg-transparent text-sm outline-none appearance-none"
                style={{ color: "#EDF2F7" }}
              >
                {ROLES.map((r) => (
                  <option key={r} value={r} style={{ backgroundColor: "#0B1D33" }}>
                    {r}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 shrink-0 pointer-events-none" style={{ color: "#A0AEC0" }} />
            </div>
          </div>

          {/* Identity Source */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono uppercase tracking-wider" style={{ color: "#A0AEC0" }}>
              Identity Source
            </label>
            <div
              className="relative flex items-center px-3 py-2 rounded-lg"
              style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(0,210,255,0.15)" }}
            >
              <select
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="flex-1 bg-transparent text-sm outline-none appearance-none"
                style={{ color: "#EDF2F7" }}
              >
                {IDENTITY_SOURCES.map((s) => (
                  <option key={s} value={s} style={{ backgroundColor: "#0B1D33" }}>
                    {s}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 shrink-0 pointer-events-none" style={{ color: "#A0AEC0" }} />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex items-center gap-3 px-5 py-4"
          style={{ borderTop: "1px solid rgba(0,210,255,0.1)" }}
        >
          <button
            onClick={handleCreate}
            disabled={!fullName.trim() || !email.trim()}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              backgroundColor: "rgba(0,210,255,0.15)",
              border: "1px solid rgba(0,210,255,0.4)",
              color: "#00D2FF",
            }}
          >
            Create User
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-white/10 transition-all"
            style={{ border: "1px solid rgba(255,255,255,0.1)", color: "#A0AEC0" }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Module ───────────────────────────────────────────────────────────────
export function IdentityModule() {
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<"all" | "verified" | "pending" | "suspended">("all")
  const [users, setUsers] = useState<UserEntry[]>(initialUsers)
  const [managingUser, setManagingUser] = useState<UserEntry | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)

  const filtered = (users || []).filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === "all" || u.identityStatus === filter
    return matchSearch && matchFilter
  })

  const stats = {
    total: users.length,
    verified: users.filter((u) => u.identityStatus === "verified").length,
    pending: users.filter((u) => u.identityStatus === "pending").length,
    hsmAssigned: users.filter((u) => u.hsmKeyAssigned).length,
  }

  function handleSave(updated: UserEntry) {
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)))
  }

  function handleCreate(newUser: UserEntry) {
    setUsers((prev) => [...prev, newUser])
  }

  return (
    <div className="space-y-5">
      {managingUser && (
        <ManageUserModal
          user={managingUser}
          onClose={() => setManagingUser(null)}
          onSave={handleSave}
        />
      )}
      {showCreateModal && (
        <CreateUserModal onClose={() => setShowCreateModal(false)} onCreate={handleCreate} />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold" style={{ color: "#EDF2F7" }}>
            Identity &amp; User Management
          </h2>
          <p className="text-sm" style={{ color: "#A0AEC0" }}>
            Manage user identities, HSM key assignments, and account access
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:brightness-110"
          style={{
            backgroundColor: "rgba(0, 210, 255, 0.15)",
            border: "1px solid rgba(0, 210, 255, 0.4)",
            color: "#00D2FF",
          }}
        >
          <UserPlus className="w-4 h-4" />
          Create New User
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Users", value: stats.total, sub: "Registered identities" },
          { label: "Verified", value: stats.verified, sub: "Identity confirmed", accent: "#00D2FF" },
          { label: "Pending Review", value: stats.pending, sub: "Awaiting verification", accent: "#F59E0B" },
          { label: "HSM Keys Active", value: stats.hsmAssigned, sub: "Master HSM assigned", accent: "#00D2FF" },
        ].map((s) => (
          <div key={s.label} className="glass-card rounded-xl p-4">
            <div className="text-2xl font-bold mb-1" style={{ color: s.accent ?? "#EDF2F7" }}>
              {s.value}
            </div>
            <div className="text-sm font-medium" style={{ color: "#EDF2F7" }}>
              {s.label}
            </div>
            <div className="text-xs mt-0.5" style={{ color: "#A0AEC0" }}>
              {s.sub}
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div
          className="flex items-center gap-2 flex-1 min-w-48 px-3 py-2 rounded-lg"
          style={{
            backgroundColor: "rgba(0, 210, 255, 0.05)",
            border: "1px solid rgba(0, 210, 255, 0.15)",
          }}
        >
          <Search className="w-4 h-4 shrink-0" style={{ color: "#A0AEC0" }} />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-[#A0AEC0]"
            style={{ color: "#EDF2F7" }}
          />
        </div>
        <div className="flex items-center gap-1">
          <Filter className="w-3.5 h-3.5 mr-1" style={{ color: "#A0AEC0" }} />
          {(["all", "verified", "pending", "suspended"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all"
              style={
                filter === f
                  ? {
                      backgroundColor: "rgba(0, 210, 255, 0.15)",
                      border: "1px solid rgba(0, 210, 255, 0.4)",
                      color: "#00D2FF",
                    }
                  : {
                      backgroundColor: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      color: "#A0AEC0",
                    }
              }
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr
                className="text-left text-[11px] uppercase tracking-wider"
                style={{
                  borderBottom: "1px solid rgba(0, 210, 255, 0.1)",
                  color: "#A0AEC0",
                }}
              >
                <th className="px-5 py-3 font-semibold">User</th>
                <th className="px-4 py-3 font-semibold">Role</th>
                <th className="px-4 py-3 font-semibold">Identity Status</th>
                <th className="px-4 py-3 font-semibold text-center">Sessions</th>
                <th className="px-4 py-3 font-semibold">HSM Key</th>
                <th className="px-4 py-3 font-semibold">Source</th>
                <th className="px-4 py-3 font-semibold">Last Seen</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(filtered || []).map((user, idx) => (
                <tr
                  key={user.id}
                  className="transition-colors hover:bg-white/[0.02]"
                  style={{
                    borderBottom:
                      idx < filtered.length - 1
                        ? "1px solid rgba(0, 210, 255, 0.06)"
                        : "none",
                    backgroundColor: user.locked ? "rgba(239,68,68,0.02)" : undefined,
                  }}
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                          style={{
                            backgroundColor: user.color + "22",
                            border: `1px solid ${user.color}44`,
                            color: user.color,
                          }}
                        >
                          {user.initials}
                        </div>
                        {user.locked && (
                          <div
                            className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: "#EF4444", border: "1px solid #0B1D33" }}
                          >
                            <Lock className="w-2 h-2 text-white" />
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-semibold" style={{ color: "#EDF2F7" }}>
                          {user.name}
                        </div>
                        <div className="font-mono text-[11px]" style={{ color: "#A0AEC0" }}>
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-xs" style={{ color: "#A0AEC0" }}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <StatusBadge status={user.identityStatus} />
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <span
                      className="font-mono text-sm font-semibold"
                      style={{ color: user.activeSessions > 0 ? "#00D2FF" : "#A0AEC0" }}
                    >
                      {user.activeSessions}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    {user.hsmKeyAssigned ? (
                      <div className="flex items-center gap-1.5">
                        <Key className="w-3.5 h-3.5" style={{ color: "#00D2FF" }} />
                        <span className="text-xs font-mono" style={{ color: "#00D2FF" }}>
                          Assigned
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5" style={{ color: "#A0AEC0" }} />
                        <span className="text-xs font-mono" style={{ color: "#A0AEC0" }}>
                          None
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className="font-mono text-[11px] px-2 py-0.5 rounded"
                      style={{ backgroundColor: "rgba(0,210,255,0.06)", color: "#A0AEC0" }}
                    >
                      {user.identitySource}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-xs font-mono" style={{ color: "#A0AEC0" }}>
                      {user.lastSeen}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <button
                      onClick={() => setManagingUser(user)}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all hover:brightness-110"
                      style={{
                        backgroundColor: "rgba(0, 210, 255, 0.08)",
                        border: "1px solid rgba(0, 210, 255, 0.2)",
                        color: "#00D2FF",
                      }}
                    >
                      Manage User
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div
          className="px-5 py-3 flex items-center justify-between text-xs"
          style={{
            borderTop: "1px solid rgba(0, 210, 255, 0.1)",
            color: "#A0AEC0",
          }}
        >
          <span>
            Showing {filtered.length} of {users.length} users
          </span>
        </div>
      </div>
    </div>
  )
}
