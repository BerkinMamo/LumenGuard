"use client"

import { useState } from "react"
import {
  FileText,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ChevronRight,
  TrendingUp,
  Search,
  History,
  ListFilter,
  ExternalLink,
  XCircle,
} from "lucide-react"
import { KycDetailModal } from "@/components/lumenguard/kyc-detail-modal"

interface ApplicantEntry {
  id: string
  name: string
  applicationId: string
  submittedAt: string
  riskScore: number
  riskLabel: "low" | "medium" | "high" | "critical"
  country: string
  documentType: string
  amlFlag: boolean
  status: "pending" | "in_review" | "approved" | "rejected"
  blindIndex?: string
  emailHash?: string
}

const pendingApplicants: ApplicantEntry[] = [
  {
    id: "app_001",
    name: "Mehmet Yılmaz",
    applicationId: "KYC-2024-4471",
    submittedAt: "10:32 UTC",
    riskScore: 18,
    riskLabel: "low",
    country: "TR",
    documentType: "Passport",
    amlFlag: false,
    status: "pending",
    blindIndex: "ExRef_7f3a9c",
    emailHash: "e3b0c4429...",
  },
  {
    id: "app_002",
    name: "Selin Koç",
    applicationId: "KYC-2024-4472",
    submittedAt: "10:28 UTC",
    riskScore: 62,
    riskLabel: "medium",
    country: "DE",
    documentType: "National ID",
    amlFlag: false,
    status: "in_review",
    blindIndex: "ExRef_2b1d4f",
    emailHash: "a3f1e9b2...",
  },
  {
    id: "app_003",
    name: "James P. Morgan",
    applicationId: "KYC-2024-4473",
    submittedAt: "09:55 UTC",
    riskScore: 87,
    riskLabel: "high",
    country: "US",
    documentType: "Passport",
    amlFlag: true,
    status: "in_review",
    blindIndex: "ExRef_9c0e11",
    emailHash: "d9c2a5e8...",
  },
  {
    id: "app_004",
    name: "Li Wei",
    applicationId: "KYC-2024-4474",
    submittedAt: "09:40 UTC",
    riskScore: 24,
    riskLabel: "low",
    country: "CN",
    documentType: "Passport",
    amlFlag: false,
    status: "pending",
    blindIndex: "ExRef_4d7a2c",
    emailHash: "7e2d0c41...",
  },
  {
    id: "app_005",
    name: "Igor Volkov",
    applicationId: "KYC-2024-4475",
    submittedAt: "09:12 UTC",
    riskScore: 96,
    riskLabel: "critical",
    country: "RU",
    documentType: "Passport",
    amlFlag: true,
    status: "in_review",
    blindIndex: "ExRef_5e8b3a",
    emailHash: "c1f8b3a0...",
  },
  {
    id: "app_006",
    name: "Amara Diallo",
    applicationId: "KYC-2024-4476",
    submittedAt: "08:58 UTC",
    riskScore: 41,
    riskLabel: "medium",
    country: "SN",
    documentType: "National ID",
    amlFlag: false,
    status: "pending",
    blindIndex: "ExRef_6f9c4b",
    emailHash: "55a0d7f3...",
  },
  {
    id: "app_007",
    name: "Carlos Mendez",
    applicationId: "KYC-2024-4477",
    submittedAt: "08:44 UTC",
    riskScore: 11,
    riskLabel: "low",
    country: "MX",
    documentType: "Passport",
    amlFlag: false,
    status: "pending",
    blindIndex: "ExRef_0a1b2c",
    emailHash: "b8e4c210...",
  },
]

const historyRecords: ApplicantEntry[] = [
  {
    id: "hist_001",
    name: "Anna Kovacs",
    applicationId: "KYC-2024-4460",
    submittedAt: "Feb 27, 2026",
    riskScore: 12,
    riskLabel: "low",
    country: "HU",
    documentType: "National ID",
    amlFlag: false,
    status: "approved",
    blindIndex: "ExRef_aa1100",
    emailHash: "f3c8b1d2...",
  },
  {
    id: "hist_002",
    name: "Nikolai Petrov",
    applicationId: "KYC-2024-4461",
    submittedAt: "Feb 26, 2026",
    riskScore: 91,
    riskLabel: "critical",
    country: "RU",
    documentType: "Passport",
    amlFlag: true,
    status: "rejected",
    blindIndex: "ExRef_bb2211",
    emailHash: "e9a7c4f0...",
  },
  {
    id: "hist_003",
    name: "Fatou Diop",
    applicationId: "KYC-2024-4462",
    submittedAt: "Feb 25, 2026",
    riskScore: 33,
    riskLabel: "low",
    country: "SN",
    documentType: "National ID",
    amlFlag: false,
    status: "approved",
    blindIndex: "ExRef_cc3322",
    emailHash: "2a4d7f91...",
  },
  {
    id: "hist_004",
    name: "Pedro Álvarez",
    applicationId: "KYC-2024-4463",
    submittedAt: "Feb 24, 2026",
    riskScore: 55,
    riskLabel: "medium",
    country: "ES",
    documentType: "Passport",
    amlFlag: false,
    status: "approved",
    blindIndex: "ExRef_dd4433",
    emailHash: "9b3e0c72...",
  },
  {
    id: "hist_005",
    name: "Yuki Tanaka",
    applicationId: "KYC-2024-4464",
    submittedAt: "Feb 23, 2026",
    riskScore: 8,
    riskLabel: "low",
    country: "JP",
    documentType: "Passport",
    amlFlag: false,
    status: "approved",
    blindIndex: "ExRef_ee5544",
    emailHash: "6c2a8d3b...",
  },
  {
    id: "hist_006",
    name: "Olena Marchuk",
    applicationId: "KYC-2024-4465",
    submittedAt: "Feb 22, 2026",
    riskScore: 77,
    riskLabel: "high",
    country: "UA",
    documentType: "National ID",
    amlFlag: true,
    status: "rejected",
    blindIndex: "ExRef_ff6655",
    emailHash: "1d5b9e47...",
  },
  {
    id: "hist_007",
    name: "Chen Jing",
    applicationId: "KYC-2024-4466",
    submittedAt: "Feb 21, 2026",
    riskScore: 29,
    riskLabel: "low",
    country: "CN",
    documentType: "Passport",
    amlFlag: false,
    status: "approved",
    blindIndex: "ExRef_gg7766",
    emailHash: "4e8f1a02...",
  },
  {
    id: "hist_008",
    name: "Brahim Ait Mhand",
    applicationId: "KYC-2024-4467",
    submittedAt: "Feb 20, 2026",
    riskScore: 68,
    riskLabel: "medium",
    country: "MA",
    documentType: "National ID",
    amlFlag: false,
    status: "approved",
    blindIndex: "ExRef_hh8877",
    emailHash: "7a3c6d10...",
  },
]

const riskConfig = {
  low: { label: "Low", color: "#22C55E", bg: "rgba(34,197,94,0.1)", bar: "#22C55E" },
  medium: { label: "Medium", color: "#F59E0B", bg: "rgba(245,158,11,0.1)", bar: "#F59E0B" },
  high: { label: "High", color: "#F97316", bg: "rgba(249,115,22,0.1)", bar: "#F97316" },
  critical: { label: "Critical", color: "#EF4444", bg: "rgba(239,68,68,0.1)", bar: "#EF4444" },
}

const statusConfig = {
  pending: { label: "Pending", color: "#A0AEC0", bg: "rgba(160,174,192,0.1)" },
  in_review: { label: "In Review", color: "#F59E0B", bg: "rgba(245,158,11,0.1)" },
  approved: { label: "Approved", color: "#22C55E", bg: "rgba(34,197,94,0.1)" },
  rejected: { label: "Rejected", color: "#EF4444", bg: "rgba(239,68,68,0.1)" },
}

function RiskBar({ score, label }: { score: number; label: ApplicantEntry["riskLabel"] }) {
  const c = riskConfig[label]
  return (
    <div className="flex items-center gap-2 min-w-[100px]">
      <div className="flex-1 h-1.5 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.08)" }}>
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${score}%`, backgroundColor: c.bar }}
        />
      </div>
      <span className="font-mono text-xs font-bold w-6 text-right" style={{ color: c.color }}>
        {score}
      </span>
    </div>
  )
}

export function KycModule() {
  const [activeTab, setActiveTab] = useState<"queue" | "history">("queue")
  const [queueStatusFilter, setQueueStatusFilter] = useState<"all" | ApplicantEntry["status"]>("all")
  const [globalSearch, setGlobalSearch] = useState("")
  const [reviewApplicant, setReviewApplicant] = useState<ApplicantEntry | null>(null)
  const [localApplicants, setLocalApplicants] = useState(pendingApplicants)

  function handleApprove(id: string) {
    setLocalApplicants((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "approved" as const } : a))
    )
    setReviewApplicant(null)
  }

  function handleReject(id: string) {
    setLocalApplicants((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "rejected" as const } : a))
    )
    setReviewApplicant(null)
  }

  const stats = {
    pending: localApplicants.filter((a) => a.status === "pending").length,
    inReview: localApplicants.filter((a) => a.status === "in_review").length,
    amlAlerts: localApplicants.filter((a) => a.amlFlag).length,
    critical: localApplicants.filter((a) => a.riskLabel === "critical").length,
  }

  const queueFiltered = (localApplicants || []).filter((a) => {
    const matchStatus = queueStatusFilter === "all" || a.status === queueStatusFilter
    return matchStatus
  })

  const historyFiltered = (historyRecords || []).filter((r) => {
    if (!globalSearch.trim()) return true
    const q = globalSearch.toLowerCase()
    return (
      r.blindIndex?.toLowerCase().includes(q) ||
      r.emailHash?.toLowerCase().includes(q) ||
      r.name.toLowerCase().includes(q) ||
      r.applicationId.toLowerCase().includes(q)
    )
  })

  return (
    <div className="space-y-5">
      {reviewApplicant && (
        <KycDetailModal
          applicant={reviewApplicant}
          onClose={() => setReviewApplicant(null)}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}

      {/* Header */}
      <div>
        <h2 className="text-lg font-bold" style={{ color: "#EDF2F7" }}>
          KYC &amp; Compliance Center
        </h2>
        <p className="text-sm" style={{ color: "#A0AEC0" }}>
          Full archive system — applicant verification queue, AML risk assessment, and compliance history
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card rounded-xl p-4 flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: "rgba(0,210,255,0.1)" }}>
            <Clock className="w-4 h-4" style={{ color: "#00D2FF" }} />
          </div>
          <div>
            <div className="text-2xl font-bold" style={{ color: "#00D2FF" }}>{stats.pending}</div>
            <div className="text-xs font-medium" style={{ color: "#EDF2F7" }}>Pending Verifications</div>
            <div className="text-[11px]" style={{ color: "#A0AEC0" }}>Awaiting review</div>
          </div>
        </div>
        <div className="glass-card rounded-xl p-4 flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: "rgba(245,158,11,0.1)" }}>
            <TrendingUp className="w-4 h-4" style={{ color: "#F59E0B" }} />
          </div>
          <div>
            <div className="text-2xl font-bold" style={{ color: "#F59E0B" }}>{stats.inReview}</div>
            <div className="text-xs font-medium" style={{ color: "#EDF2F7" }}>In Review</div>
            <div className="text-[11px]" style={{ color: "#A0AEC0" }}>Active cases</div>
          </div>
        </div>
        <div className="glass-card rounded-xl p-4 flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: "rgba(239,68,68,0.1)" }}>
            <AlertTriangle className="w-4 h-4" style={{ color: "#EF4444" }} />
          </div>
          <div>
            <div className="text-2xl font-bold" style={{ color: "#EF4444" }}>{stats.amlAlerts}</div>
            <div className="text-xs font-medium" style={{ color: "#EDF2F7" }}>AML Risk Alerts</div>
            <div className="text-[11px]" style={{ color: "#A0AEC0" }}>Flagged for review</div>
          </div>
        </div>
        <div className="glass-card rounded-xl p-4 flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: "rgba(239,68,68,0.08)" }}>
            <FileText className="w-4 h-4" style={{ color: "#EF4444" }} />
          </div>
          <div>
            <div className="text-2xl font-bold" style={{ color: "#EF4444" }}>{stats.critical}</div>
            <div className="text-xs font-medium" style={{ color: "#EDF2F7" }}>Critical Risk</div>
            <div className="text-[11px]" style={{ color: "#A0AEC0" }}>{'Score > 90'}</div>
          </div>
        </div>
      </div>

      {/* Tabs + Global search */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        {/* Tabs */}
        <div
          className="flex items-center gap-1 p-1 rounded-xl"
          style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(0,210,255,0.1)" }}
        >
          <button
            onClick={() => setActiveTab("queue")}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
            style={
              activeTab === "queue"
                ? {
                    backgroundColor: "rgba(0,210,255,0.15)",
                    border: "1px solid rgba(0,210,255,0.35)",
                    color: "#00D2FF",
                  }
                : { color: "#A0AEC0", border: "1px solid transparent" }
            }
          >
            <ListFilter className="w-4 h-4" />
            Pending Queue
            <span
              className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
              style={{ backgroundColor: "rgba(0,210,255,0.15)", color: "#00D2FF" }}
            >
              {stats.pending + stats.inReview}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
            style={
              activeTab === "history"
                ? {
                    backgroundColor: "rgba(0,210,255,0.15)",
                    border: "1px solid rgba(0,210,255,0.35)",
                    color: "#00D2FF",
                  }
                : { color: "#A0AEC0", border: "1px solid transparent" }
            }
          >
            <History className="w-4 h-4" />
            Verification History
            <span
              className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
              style={{ backgroundColor: "rgba(0,210,255,0.15)", color: "#00D2FF" }}
            >
              {historyRecords.length}
            </span>
          </button>
        </div>

        {/* Global search — only visible on history tab */}
        {activeTab === "history" && (
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-lg flex-1 max-w-sm"
            style={{
              backgroundColor: "rgba(0,210,255,0.05)",
              border: "1px solid rgba(0,210,255,0.15)",
            }}
          >
            <Search className="w-4 h-4 shrink-0" style={{ color: "#A0AEC0" }} />
            <input
              type="text"
              placeholder="Search by Blind Index, Email Hash, or App ID..."
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-[#4a5568]"
              style={{ color: "#EDF2F7" }}
            />
            {globalSearch && (
              <button onClick={() => setGlobalSearch("")} style={{ color: "#A0AEC0" }}>
                <XCircle className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── PENDING QUEUE TAB ─────────────────────────────── */}
      {activeTab === "queue" && (
        <>
          {/* Queue filter */}
          <div className="flex items-center gap-2">
            {(["all", "pending", "in_review"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setQueueStatusFilter(s)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all"
                style={
                  queueStatusFilter === s
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
                {s === "in_review" ? "In Review" : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>

          <div className="glass-card rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr
                    className="text-left text-[11px] uppercase tracking-wider"
                    style={{ borderBottom: "1px solid rgba(0,210,255,0.1)", color: "#A0AEC0" }}
                  >
                    <th className="px-5 py-3 font-semibold">Applicant</th>
                    <th className="px-4 py-3 font-semibold">App. ID</th>
                    <th className="px-4 py-3 font-semibold">Blind Index</th>
                    <th className="px-4 py-3 font-semibold">Country</th>
                    <th className="px-4 py-3 font-semibold">Risk Score</th>
                    <th className="px-4 py-3 font-semibold">AML Flag</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Submitted</th>
                    <th className="px-4 py-3 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {(queueFiltered || []).map((a, idx) => {
                    const sc = statusConfig[a.status]
                    return (
                      <tr
                        key={a.id}
                        className="hover:bg-white/[0.02] transition-colors"
                        style={{
                          borderBottom: idx < queueFiltered.length - 1 ? "1px solid rgba(0,210,255,0.06)" : "none",
                          backgroundColor: a.amlFlag ? "rgba(239,68,68,0.02)" : undefined,
                        }}
                      >
                        <td className="px-5 py-3.5">
                          <div>
                            <div className="font-semibold" style={{ color: "#EDF2F7" }}>{a.name}</div>
                            <div className="text-[11px]" style={{ color: "#A0AEC0" }}>{a.documentType}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="font-mono text-[11px]" style={{ color: "#A0AEC0" }}>{a.applicationId}</span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="font-mono text-[11px]" style={{ color: "#A0AEC0" }}>{a.blindIndex}</span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span
                            className="px-2 py-0.5 rounded font-mono text-xs font-bold"
                            style={{ backgroundColor: "rgba(0,210,255,0.08)", color: "#00D2FF" }}
                          >
                            {a.country}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <RiskBar score={a.riskScore} label={a.riskLabel} />
                        </td>
                        <td className="px-4 py-3.5">
                          {a.amlFlag ? (
                            <div className="flex items-center gap-1.5">
                              <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                              <span className="text-xs font-semibold text-red-400">Flagged</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5" style={{ color: "#22C55E" }} />
                              <span className="text-xs" style={{ color: "#A0AEC0" }}>Clear</span>
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3.5">
                          <span
                            className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold"
                            style={{ backgroundColor: sc.bg, color: sc.color }}
                          >
                            {sc.label}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="font-mono text-xs" style={{ color: "#A0AEC0" }}>{a.submittedAt}</span>
                        </td>
                        <td className="px-4 py-3.5">
                          <button
                            onClick={() => setReviewApplicant(a)}
                            className="flex items-center gap-1 text-xs font-semibold transition-all"
                            style={{ color: "#00D2FF" }}
                          >
                            Review
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ── VERIFICATION HISTORY TAB ─────────────────────── */}
      {activeTab === "history" && (
        <div className="glass-card rounded-xl overflow-hidden">
          <div
            className="px-5 py-3 flex items-center justify-between"
            style={{ borderBottom: "1px solid rgba(0,210,255,0.1)" }}
          >
            <div className="text-xs" style={{ color: "#A0AEC0" }}>
              {globalSearch ? (
                <>
                  <span style={{ color: "#EDF2F7" }}>{historyFiltered.length}</span> results for{" "}
                  <span className="font-mono" style={{ color: "#00D2FF" }}>
                    &quot;{globalSearch}&quot;
                  </span>
                </>
              ) : (
                <>
                  Showing all{" "}
                  <span style={{ color: "#EDF2F7" }}>{historyRecords.length}</span> completed verifications
                </>
              )}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr
                  className="text-left text-[11px] uppercase tracking-wider"
                  style={{ borderBottom: "1px solid rgba(0,210,255,0.1)", color: "#A0AEC0" }}
                >
                  <th className="px-5 py-3 font-semibold">Applicant</th>
                  <th className="px-4 py-3 font-semibold">Blind Index (ExternalRef_Hash)</th>
                  <th className="px-4 py-3 font-semibold">Email_Hash</th>
                  <th className="px-4 py-3 font-semibold">Country</th>
                  <th className="px-4 py-3 font-semibold">Risk Score</th>
                  <th className="px-4 py-3 font-semibold">Final Status</th>
                  <th className="px-4 py-3 font-semibold">Completed</th>
                  <th className="px-4 py-3 font-semibold">Audit Trail</th>
                </tr>
              </thead>
              <tbody>
                {historyFiltered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-12 text-center">
                      <Search className="w-6 h-6 mx-auto mb-2" style={{ color: "#A0AEC0" }} />
                      <div className="text-sm" style={{ color: "#A0AEC0" }}>
                        No records match your search
                      </div>
                    </td>
                  </tr>
                ) : (
                  (historyFiltered || []).map((r, idx) => {
                    const sc = statusConfig[r.status]
                    const rc = riskConfig[r.riskLabel]
                    return (
                      <tr
                        key={r.id}
                        className="hover:bg-white/[0.02] transition-colors"
                        style={{
                          borderBottom: idx < historyFiltered.length - 1 ? "1px solid rgba(0,210,255,0.06)" : "none",
                        }}
                      >
                        <td className="px-5 py-3.5">
                          <div>
                            <div className="font-semibold" style={{ color: "#EDF2F7" }}>{r.name}</div>
                            <div className="text-[11px]" style={{ color: "#A0AEC0" }}>{r.documentType} · {r.applicationId}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="font-mono text-[11px]" style={{ color: "#00D2FF" }}>
                            {r.blindIndex}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="font-mono text-[11px]" style={{ color: "#A0AEC0" }}>
                            {r.emailHash}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span
                            className="px-2 py-0.5 rounded font-mono text-xs font-bold"
                            style={{ backgroundColor: "rgba(0,210,255,0.08)", color: "#00D2FF" }}
                          >
                            {r.country}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2">
                            <span
                              className="font-mono text-xs font-bold px-2 py-0.5 rounded-full"
                              style={{ backgroundColor: rc.bg, color: rc.color }}
                            >
                              {r.riskScore}
                            </span>
                            <span className="text-[11px]" style={{ color: rc.color }}>{rc.label}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1.5">
                            {r.status === "approved" ? (
                              <CheckCircle2 className="w-3.5 h-3.5" style={{ color: "#22C55E" }} />
                            ) : (
                              <XCircle className="w-3.5 h-3.5" style={{ color: "#EF4444" }} />
                            )}
                            <span
                              className="text-xs font-semibold px-2 py-0.5 rounded-full"
                              style={{ backgroundColor: sc.bg, color: sc.color }}
                            >
                              {sc.label}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="font-mono text-xs" style={{ color: "#A0AEC0" }}>{r.submittedAt}</span>
                        </td>
                        <td className="px-4 py-3.5">
                          <button
                            className="flex items-center gap-1 text-xs font-semibold transition-all hover:underline"
                            style={{ color: "#00D2FF" }}
                          >
                            View Audit Trail
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
