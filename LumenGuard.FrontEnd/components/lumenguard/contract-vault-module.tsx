"use client"

import { useState } from "react"
import { Search, FileText, CheckCircle2, Clock, Shield, TrendingUp, RefreshCw } from "lucide-react"
import { PdfPreviewModal } from "@/components/lumenguard/pdf-preview-modal"

type DocCategory = "All" | "Contracts" | "Investment Orders" | "Reports" | "Legal"
type SignatureStatus = "signed" | "awaiting" | "unsigned"

interface VaultDocument {
  id: string
  filename: string
  sha256: string
  size: string
  date: string
  category: Exclude<DocCategory, "All">
  signedBy?: string
  awaitingFrom?: string
  signatureStatus: SignatureStatus
  encrypted: boolean
  padesLta: boolean
}

const documents: VaultDocument[] = [
  {
    id: "doc_001",
    filename: "Inv_Order_Q1_2026.pdf",
    sha256: "8f4a3c91...d7b4",
    size: "2.4 MB",
    date: "Feb 28, 2026",
    category: "Investment Orders",
    awaitingFrom: "Mert Yılmaz",
    signatureStatus: "awaiting",
    encrypted: true,
    padesLta: false,
  },
  {
    id: "doc_002",
    filename: "Portfolio_Management_Agreement_2026.pdf",
    sha256: "a3f1e9b2...e3f6",
    size: "5.1 MB",
    date: "Feb 25, 2026",
    category: "Contracts",
    signedBy: "Mert Yılmaz",
    signatureStatus: "signed",
    encrypted: true,
    padesLta: true,
  },
  {
    id: "doc_003",
    filename: "Risk_Disclosure_Statement_Final.pdf",
    sha256: "d9c2a5e8...e3b6",
    size: "1.8 MB",
    date: "Feb 22, 2026",
    category: "Legal",
    signedBy: "Mert Yılmaz",
    signatureStatus: "signed",
    encrypted: true,
    padesLta: true,
  },
  {
    id: "doc_004",
    filename: "Q4_2025_Performance_Report.pdf",
    sha256: "7e2d0c41...f9a2",
    size: "3.7 MB",
    date: "Feb 18, 2026",
    category: "Reports",
    signedBy: "Admin Sys",
    signatureStatus: "signed",
    encrypted: true,
    padesLta: true,
  },
  {
    id: "doc_005",
    filename: "Compliance_Audit_Trail_2026.pdf",
    sha256: "c1f8b3a0...82d1",
    size: "0.9 MB",
    date: "Feb 14, 2026",
    category: "Legal",
    signatureStatus: "unsigned",
    encrypted: true,
    padesLta: false,
  },
  {
    id: "doc_006",
    filename: "Inv_Order_Q4_2025.pdf",
    sha256: "55a0d7f3...1c44",
    size: "2.1 MB",
    date: "Jan 30, 2026",
    category: "Investment Orders",
    signedBy: "Selin Koç",
    signatureStatus: "signed",
    encrypted: true,
    padesLta: true,
  },
  {
    id: "doc_007",
    filename: "Custody_Agreement_Final.pdf",
    sha256: "b8e4c210...7a9f",
    size: "4.3 MB",
    date: "Jan 22, 2026",
    category: "Contracts",
    awaitingFrom: "James P. Morgan",
    signatureStatus: "awaiting",
    encrypted: true,
    padesLta: false,
  },
]

const categories: DocCategory[] = ["All", "Contracts", "Investment Orders", "Reports", "Legal"]

function SignatureTag({ doc }: { doc: VaultDocument }) {
  if (doc.signatureStatus === "awaiting") {
    return (
      <span
        className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold"
        style={{ backgroundColor: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.3)", color: "#F59E0B" }}
      >
        Signature Required
      </span>
    )
  }
  if (doc.padesLta) {
    return (
      <span
        className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold"
        style={{ backgroundColor: "rgba(0,210,255,0.1)", border: "1px solid rgba(0,210,255,0.25)", color: "#00D2FF" }}
      >
        + PAdES-LTA Signed
      </span>
    )
  }
  return null
}

export function ContractVaultModule() {
  const [search, setSearch] = useState("")
  const [activeCategory, setActiveCategory] = useState<DocCategory>("All")
  const [previewDoc, setPreviewDoc] = useState<VaultDocument | null>(null)

  const totalValue = 14.5
  const pendingCount = documents.filter((d) => d.signatureStatus === "awaiting").length

  const filtered = documents.filter((d) => {
    const matchesCategory = activeCategory === "All" || d.category === activeCategory
    const q = search.toLowerCase()
    const matchesSearch =
      !q ||
      d.filename.toLowerCase().includes(q) ||
      d.sha256.toLowerCase().includes(q) ||
      d.date.toLowerCase().includes(q)
    return matchesCategory && matchesSearch
  })

  return (
    <div className="space-y-5">
      {previewDoc && (
        <PdfPreviewModal document={previewDoc} onClose={() => setPreviewDoc(null)} />
      )}
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-bold" style={{ color: "#EDF2F7" }}>
            Contract Vault
          </h2>
          <p className="text-sm mt-0.5" style={{ color: "#A0AEC0" }}>
            Managing{" "}
            <span className="font-semibold" style={{ color: "#00D2FF" }}>
              {documents.length * 20 + 5} encrypted assets
            </span>
            {" · AES-256 · PAdES-LTA · HSM Secured"}
          </p>
        </div>
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono"
          style={{
            backgroundColor: "rgba(0,210,255,0.08)",
            border: "1px solid rgba(0,210,255,0.2)",
            color: "#00D2FF",
          }}
        >
          <Shield className="w-3.5 h-3.5" />
          TS 13298 COMPLIANT
          <span className="text-[10px]" style={{ color: "#A0AEC0" }}>Certified · Feb 2026</span>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div
          className="glass-card rounded-xl p-4 flex items-start gap-3"
          style={{ border: "1px solid rgba(0,210,255,0.15)" }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: "rgba(0,210,255,0.1)" }}
          >
            <TrendingUp className="w-5 h-5" style={{ color: "#00D2FF" }} />
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider" style={{ color: "#A0AEC0" }}>
              Total Value Secured
            </div>
            <div className="text-2xl font-bold mt-0.5" style={{ color: "#EDF2F7" }}>
              ${totalValue}M
            </div>
            <div className="text-xs mt-0.5 flex items-center gap-1" style={{ color: "#22C55E" }}>
              <TrendingUp className="w-3 h-3" />
              +2.4% this quarter
            </div>
          </div>
        </div>

        <div
          className="glass-card rounded-xl p-4 flex items-start gap-3"
          style={{ border: "1px solid rgba(245,158,11,0.3)", backgroundColor: "rgba(245,158,11,0.04)" }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: "rgba(245,158,11,0.15)" }}
          >
            <FileText className="w-5 h-5" style={{ color: "#F59E0B" }} />
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider" style={{ color: "#A0AEC0" }}>
              Pending Actions
            </div>
            <div className="text-4xl font-bold mt-0.5" style={{ color: "#F59E0B" }}>
              {pendingCount}
            </div>
            <div className="text-xs mt-0.5" style={{ color: "#F59E0B" }}>
              Documents require PAdES Signature
            </div>
          </div>
        </div>

        <div
          className="glass-card rounded-xl p-4 flex items-start gap-3"
          style={{ border: "1px solid rgba(0,210,255,0.15)" }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: "rgba(0,210,255,0.1)" }}
          >
            <Shield className="w-5 h-5" style={{ color: "#00D2FF" }} />
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider" style={{ color: "#A0AEC0" }}>
              Last Security Audit
            </div>
            <div className="text-3xl font-bold mt-0.5" style={{ color: "#EDF2F7" }}>
              Passed
            </div>
            <div className="text-xs mt-0.5" style={{ color: "#A0AEC0" }}>
              Today, 09:41 AM · TS 13298
            </div>
          </div>
        </div>
      </div>

      {/* Document Vault */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold" style={{ color: "#EDF2F7" }}>Document Vault</h3>
          <div className="flex items-center gap-1.5 text-xs" style={{ color: "#A0AEC0" }}>
            <RefreshCw className="w-3 h-3" />
            Last refreshed:{" "}
            <span className="font-semibold" style={{ color: "#EDF2F7" }}>just now</span>
          </div>
        </div>

        {/* Search + Filters */}
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1 max-w-md">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
              style={{ color: "#A0AEC0" }}
            />
            <input
              type="text"
              placeholder="Search by name, hash, or date..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg text-sm outline-none transition-all"
              style={{
                backgroundColor: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(0,210,255,0.15)",
                color: "#EDF2F7",
              }}
            />
          </div>
          <div className="flex items-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={
                  activeCategory === cat
                    ? {
                        backgroundColor: "rgba(0,210,255,0.15)",
                        border: "1px solid rgba(0,210,255,0.4)",
                        color: "#00D2FF",
                      }
                    : {
                        backgroundColor: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        color: "#A0AEC0",
                      }
                }
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Document List */}
        <div
          className="glass-card rounded-xl overflow-hidden"
          style={{ border: "1px solid rgba(0,210,255,0.1)" }}
        >
          {(filtered || []).map((doc, idx) => (
            <div
              key={doc.id}
              onClick={() => setPreviewDoc(doc)}
              className="flex items-center gap-4 px-5 py-4 hover:bg-white/[0.03] transition-colors group cursor-pointer"
              style={{
                borderBottom: idx < filtered.length - 1 ? "1px solid rgba(0,210,255,0.07)" : "none",
              }}
            >
              {/* PDF Icon */}
              <div
                className="w-10 h-12 rounded-lg flex flex-col items-center justify-center shrink-0 text-[10px] font-bold font-mono"
                style={{
                  backgroundColor: "rgba(0,210,255,0.08)",
                  border: "1px solid rgba(0,210,255,0.2)",
                  color: "#00D2FF",
                }}
              >
                <FileText className="w-4 h-4 mb-0.5" />
                PDF
              </div>

              {/* Main info */}
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm font-mono" style={{ color: "#EDF2F7" }}>
                  {doc.filename}
                </div>
                <div className="text-[11px] font-mono mt-0.5" style={{ color: "#A0AEC0" }}>
                  SHA-256: {doc.sha256} · {doc.size}
                </div>
                <div className="mt-1 text-[11px]" style={{ color: "#A0AEC0" }}>
                  {doc.signatureStatus === "awaiting" && doc.awaitingFrom && (
                    <span style={{ color: "#F59E0B" }}>
                      Awaiting signature from:{" "}
                      <span className="font-semibold">{doc.awaitingFrom}</span>
                    </span>
                  )}
                  {doc.signatureStatus === "signed" && doc.signedBy && (
                    <span className="flex items-center gap-1">
                      <span>Signed by:</span>
                      <span className="font-semibold" style={{ color: "#EDF2F7" }}>{doc.signedBy}</span>
                      <CheckCircle2 className="w-3.5 h-3.5" style={{ color: "#22C55E" }} />
                    </span>
                  )}
                  {doc.signatureStatus === "unsigned" && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      No signature required
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  {doc.encrypted && (
                    <span
                      className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold"
                      style={{
                        backgroundColor: "rgba(0,210,255,0.08)",
                        border: "1px solid rgba(0,210,255,0.2)",
                        color: "#00D2FF",
                      }}
                    >
                      AES-256 Encrypted
                    </span>
                  )}
                  <SignatureTag doc={doc} />
                </div>
              </div>

              {/* Date + Category */}
              <div className="text-right shrink-0">
                <div className="text-sm font-medium" style={{ color: "#EDF2F7" }}>
                  {doc.date}
                </div>
                <div className="text-xs mt-0.5" style={{ color: "#A0AEC0" }}>
                  {doc.category}
                </div>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="py-16 text-center">
              <FileText className="w-8 h-8 mx-auto mb-2" style={{ color: "#A0AEC0" }} />
              <div className="text-sm" style={{ color: "#A0AEC0" }}>No documents match your search</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
