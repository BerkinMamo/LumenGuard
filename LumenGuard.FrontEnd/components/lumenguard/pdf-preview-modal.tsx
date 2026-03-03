"use client"

import { useState } from "react"
import {
  X,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  Download,
  Shield,
  Key,
  Hash,
  Lock,
  CheckCircle2,
  Clock,
  RotateCcw,
  Maximize2,
} from "lucide-react"

interface PdfPreviewModalProps {
  document: {
    id: string
    filename: string
    sha256: string
    size: string
    date: string
    category: string
    signedBy?: string
    awaitingFrom?: string
    signatureStatus: "signed" | "awaiting" | "unsigned"
    encrypted: boolean
    padesLta: boolean
  }
  onClose: () => void
}

// Simulated page-content blocks per doc to give the mock viewer some variety
const pageContentMap: Record<string, { lines: number[]; title: string }> = {
  doc_001: { title: "Investment Order — Q1 2026", lines: [80, 60, 100, 45, 70, 55, 90] },
  doc_002: { title: "Portfolio Management Agreement", lines: [100, 80, 65, 90, 50, 75, 60, 88] },
  doc_003: { title: "Risk Disclosure Statement (Final)", lines: [90, 70, 55, 100, 45, 80] },
  doc_004: { title: "Q4 2025 Performance Report", lines: [60, 100, 75, 50, 85, 40, 95, 65] },
  doc_005: { title: "Compliance Audit Trail 2026", lines: [70, 55, 80, 100, 60] },
  doc_006: { title: "Investment Order — Q4 2025", lines: [85, 65, 100, 45, 70] },
  doc_007: { title: "Custody Agreement (Final)", lines: [100, 80, 60, 90, 55, 75, 45, 95] },
}

const totalPagesMap: Record<string, number> = {
  doc_001: 3,
  doc_002: 8,
  doc_003: 5,
  doc_004: 12,
  doc_005: 4,
  doc_006: 3,
  doc_007: 7,
}

function MockPdfPage({
  docId,
  page,
  zoom,
}: {
  docId: string
  page: number
  zoom: number
}) {
  const content = pageContentMap[docId] ?? { title: "Document", lines: [80, 60, 100, 50] }
  const pageTitle = page === 1 ? content.title : `${content.title} (cont.)`

  return (
    <div
      className="mx-auto rounded-lg shadow-2xl overflow-hidden font-mono"
      style={{
        width: `${Math.round(520 * zoom)}px`,
        minHeight: `${Math.round(680 * zoom)}px`,
        backgroundColor: "#F8F9FA",
        border: "1px solid rgba(0,0,0,0.15)",
        transform: "translateZ(0)",
        transition: "width 0.2s ease, min-height 0.2s ease",
      }}
    >
      {/* Page header bar */}
      <div
        className="flex items-center justify-between px-8 py-4"
        style={{
          backgroundColor: "#1a1a2e",
          fontSize: `${Math.round(9 * zoom)}px`,
          color: "#7dd3fc",
        }}
      >
        <span>LUMORA CORP · CONFIDENTIAL</span>
        <span>Page {page}</span>
      </div>

      {/* Content area */}
      <div className="px-10 py-8 space-y-5">
        {/* Title block — only on page 1 */}
        {page === 1 && (
          <div className="space-y-2 mb-6">
            <div
              className="font-bold"
              style={{ fontSize: `${Math.round(14 * zoom)}px`, color: "#1a1a2e", lineHeight: 1.3 }}
            >
              {pageTitle}
            </div>
            <div
              className="font-mono"
              style={{ fontSize: `${Math.round(8 * zoom)}px`, color: "#6b7280" }}
            >
              AES-256 Encrypted · PAdES-LTA · FIPS 140-2 · HSM Secured
            </div>
            <div style={{ height: `${Math.round(1 * zoom)}px`, backgroundColor: "#d1d5db" }} />
          </div>
        )}

        {/* Simulated text lines */}
        {content.lines.map((w, i) => (
          <div
            key={i}
            className="rounded"
            style={{
              height: `${Math.round(9 * zoom)}px`,
              width: `${w}%`,
              backgroundColor: i % 5 === 0 ? "#d1d5db" : "#e5e7eb",
            }}
          />
        ))}

        {/* Signature block on last page */}
        {page === (totalPagesMap[docId] ?? 1) && (
          <div
            className="mt-8 pt-6 space-y-3"
            style={{
              borderTop: `${Math.round(1 * zoom)}px solid #d1d5db`,
            }}
          >
            <div
              className="font-bold"
              style={{ fontSize: `${Math.round(9 * zoom)}px`, color: "#374151" }}
            >
              AUTHORIZED SIGNATURES
            </div>
            <div className="flex justify-between items-end">
              <div
                className="space-y-1"
                style={{ fontSize: `${Math.round(8 * zoom)}px`, color: "#6b7280" }}
              >
                <div
                  className="font-mono italic"
                  style={{ fontSize: `${Math.round(13 * zoom)}px`, color: "#1a1a2e" }}
                >
                  Mert Yılmaz
                </div>
                <div>Chief Compliance Officer</div>
                <div style={{ color: "#0ea5e9" }}>PAdES-LTA · HSM Slot-0 · AES-256</div>
              </div>
              <div
                className="text-right space-y-1"
                style={{ fontSize: `${Math.round(8 * zoom)}px`, color: "#6b7280" }}
              >
                <div
                  className="px-2 py-1 rounded"
                  style={{
                    backgroundColor: "#dcfce7",
                    color: "#166534",
                    fontSize: `${Math.round(8 * zoom)}px`,
                  }}
                >
                  DIGITALLY SIGNED
                </div>
                <div>TS 13298 Compliant</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Page footer */}
      <div
        className="flex items-center justify-between px-10 py-3"
        style={{
          borderTop: "1px solid #e5e7eb",
          fontSize: `${Math.round(7 * zoom)}px`,
          color: "#9ca3af",
        }}
      >
        <span>STRICTLY CONFIDENTIAL — LUMORA CORP</span>
        <span>SHA-256 Verified</span>
      </div>
    </div>
  )
}

export function PdfPreviewModal({ document: doc, onClose }: PdfPreviewModalProps) {
  const totalPages = totalPagesMap[doc.id] ?? 3
  const [page, setPage] = useState(1)
  const [zoom, setZoom] = useState(1)

  const hsmSlot = doc.id === "doc_001" ? "Slot-4" : doc.id === "doc_002" ? "Slot-2" : "Slot-0"

  const encMeta = {
    algorithm: "AES-256-GCM",
    keySize: "256-bit",
    iv: `0x${doc.sha256.replace("...", "").substring(0, 12)}...`,
    authTag: "128-bit",
    hsmSlot,
    fips: "FIPS 140-2 Level 3",
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-stretch"
      style={{ backgroundColor: "rgba(0,0,0,0.85)", backdropFilter: "blur(6px)" }}
    >
      {/* === LEFT: PDF Viewer === */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div
          className="flex items-center justify-between px-5 py-3 shrink-0"
          style={{
            backgroundColor: "#071525",
            borderBottom: "1px solid rgba(0,210,255,0.15)",
          }}
        >
          <div className="flex items-center gap-4">
            <div className="font-mono text-sm font-semibold truncate max-w-xs" style={{ color: "#EDF2F7" }}>
              {doc.filename}
            </div>
            <div className="font-mono text-[11px]" style={{ color: "#A0AEC0" }}>
              {page} / {totalPages}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Zoom */}
            <div
              className="flex items-center rounded-lg overflow-hidden"
              style={{ border: "1px solid rgba(0,210,255,0.2)" }}
            >
              <button
                onClick={() => setZoom((z) => Math.max(0.5, +(z - 0.15).toFixed(2)))}
                className="flex items-center justify-center w-8 h-8 transition-colors hover:bg-white/10"
                style={{ color: "#A0AEC0" }}
                title="Zoom out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span
                className="px-2 text-xs font-mono tabular-nums"
                style={{ color: "#00D2FF", minWidth: 44, textAlign: "center" }}
              >
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={() => setZoom((z) => Math.min(2, +(z + 0.15).toFixed(2)))}
                className="flex items-center justify-center w-8 h-8 transition-colors hover:bg-white/10"
                style={{ color: "#A0AEC0" }}
                title="Zoom in"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => setZoom(1)}
                className="flex items-center justify-center w-8 h-8 transition-colors hover:bg-white/10"
                style={{ color: "#A0AEC0" }}
                title="Reset zoom"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setZoom(1.5)}
                className="flex items-center justify-center w-8 h-8 transition-colors hover:bg-white/10"
                style={{ color: "#A0AEC0" }}
                title="Fit width"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Page navigation */}
            <div
              className="flex items-center rounded-lg overflow-hidden"
              style={{ border: "1px solid rgba(0,210,255,0.2)" }}
            >
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex items-center justify-center w-8 h-8 transition-colors hover:bg-white/10 disabled:opacity-30"
                style={{ color: "#A0AEC0" }}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="flex items-center justify-center w-8 h-8 transition-colors hover:bg-white/10 disabled:opacity-30"
                style={{ color: "#A0AEC0" }}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <button
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:brightness-110"
              style={{
                backgroundColor: "rgba(0,210,255,0.1)",
                border: "1px solid rgba(0,210,255,0.25)",
                color: "#00D2FF",
              }}
            >
              <Download className="w-3.5 h-3.5" />
              Export
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10"
              style={{ color: "#A0AEC0" }}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Page area */}
        <div
          className="flex-1 overflow-auto flex items-start justify-center py-8"
          style={{ backgroundColor: "#1a1f2e" }}
        >
          <MockPdfPage docId={doc.id} page={page} zoom={zoom} />
        </div>

        {/* Bottom pagination strip */}
        <div
          className="flex items-center justify-center gap-2 py-3 shrink-0"
          style={{
            backgroundColor: "#071525",
            borderTop: "1px solid rgba(0,210,255,0.1)",
          }}
        >
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className="w-7 h-7 rounded text-xs font-mono transition-all"
              style={
                p === page
                  ? {
                      backgroundColor: "rgba(0,210,255,0.2)",
                      border: "1px solid rgba(0,210,255,0.5)",
                      color: "#00D2FF",
                    }
                  : {
                      backgroundColor: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      color: "#A0AEC0",
                    }
              }
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* === RIGHT: Metadata side panel === */}
      <div
        className="w-72 shrink-0 flex flex-col overflow-y-auto"
        style={{
          backgroundColor: "#0B1D33",
          borderLeft: "1px solid rgba(0,210,255,0.15)",
        }}
      >
        {/* Panel header */}
        <div
          className="px-5 py-4 shrink-0"
          style={{ borderBottom: "1px solid rgba(0,210,255,0.1)" }}
        >
          <div className="text-[10px] font-mono font-bold uppercase tracking-widest" style={{ color: "#00D2FF" }}>
            Cryptographic Metadata
          </div>
          <div className="text-xs mt-1" style={{ color: "#A0AEC0" }}>
            {doc.category} · {doc.size}
          </div>
        </div>

        <div className="p-5 space-y-5 flex-1">
          {/* SHA-256 */}
          <div
            className="rounded-xl p-4 space-y-2"
            style={{ backgroundColor: "rgba(0,210,255,0.05)", border: "1px solid rgba(0,210,255,0.15)" }}
          >
            <div className="flex items-center gap-2">
              <Hash className="w-3.5 h-3.5 shrink-0" style={{ color: "#00D2FF" }} />
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider" style={{ color: "#00D2FF" }}>
                SHA-256 Hash
              </span>
            </div>
            <div className="font-mono text-[11px] break-all leading-relaxed" style={{ color: "#EDF2F7" }}>
              {doc.sha256.replace("...", "d4e5f6a7b8c9")}
            </div>
            <div className="flex items-center gap-1.5 text-[11px]" style={{ color: "#22C55E" }}>
              <CheckCircle2 className="w-3 h-3" />
              Hash integrity verified
            </div>
          </div>

          {/* HSM Signature */}
          <div
            className="rounded-xl p-4 space-y-3"
            style={{
              backgroundColor:
                doc.signatureStatus === "signed"
                  ? "rgba(0,210,255,0.05)"
                  : doc.signatureStatus === "awaiting"
                    ? "rgba(245,158,11,0.05)"
                    : "rgba(255,255,255,0.03)",
              border:
                doc.signatureStatus === "signed"
                  ? "1px solid rgba(0,210,255,0.2)"
                  : doc.signatureStatus === "awaiting"
                    ? "1px solid rgba(245,158,11,0.2)"
                    : "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div className="flex items-center gap-2">
              <Key className="w-3.5 h-3.5 shrink-0" style={{ color: "#00D2FF" }} />
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider" style={{ color: "#00D2FF" }}>
                HSM Signature Status
              </span>
            </div>
            {doc.signatureStatus === "signed" ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" style={{ color: "#22C55E" }} />
                  <span className="text-sm font-bold" style={{ color: "#22C55E" }}>
                    {doc.padesLta ? "PAdES-LTA Signed" : "Digitally Signed"}
                  </span>
                </div>
                <div className="text-[11px] font-mono" style={{ color: "#A0AEC0" }}>
                  Signer: <span style={{ color: "#EDF2F7" }}>{doc.signedBy}</span>
                </div>
                <div className="text-[11px] font-mono" style={{ color: "#A0AEC0" }}>
                  HSM: <span style={{ color: "#EDF2F7" }}>{hsmSlot} · Thales Luna</span>
                </div>
                <div className="text-[11px] font-mono" style={{ color: "#A0AEC0" }}>
                  Standard: <span style={{ color: "#EDF2F7" }}>TS 13298 · ETSI</span>
                </div>
              </div>
            ) : doc.signatureStatus === "awaiting" ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" style={{ color: "#F59E0B" }} />
                  <span className="text-sm font-bold" style={{ color: "#F59E0B" }}>
                    Awaiting Signature
                  </span>
                </div>
                <div className="text-[11px] font-mono" style={{ color: "#A0AEC0" }}>
                  From: <span style={{ color: "#EDF2F7" }}>{doc.awaitingFrom}</span>
                </div>
              </div>
            ) : (
              <div className="text-xs" style={{ color: "#A0AEC0" }}>
                No signature required for this document type.
              </div>
            )}
          </div>

          {/* AES-256 Encryption Metadata */}
          <div
            className="rounded-xl p-4 space-y-3"
            style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(0,210,255,0.1)" }}
          >
            <div className="flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 shrink-0" style={{ color: "#00D2FF" }} />
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider" style={{ color: "#00D2FF" }}>
                AES-256 Encryption
              </span>
            </div>
            <div className="space-y-2">
              {[
                { k: "Algorithm", v: encMeta.algorithm },
                { k: "Key Size", v: encMeta.keySize },
                { k: "IV", v: encMeta.iv },
                { k: "Auth Tag", v: encMeta.authTag },
                { k: "HSM Slot", v: encMeta.hsmSlot },
                { k: "Standard", v: encMeta.fips },
              ].map(({ k, v }) => (
                <div key={k} className="flex justify-between items-center gap-2">
                  <span className="text-[11px]" style={{ color: "#A0AEC0" }}>
                    {k}
                  </span>
                  <span className="font-mono text-[11px] text-right" style={{ color: "#EDF2F7" }}>
                    {v}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Compliance badge */}
          <div
            className="rounded-xl p-4 flex items-center gap-3"
            style={{ backgroundColor: "rgba(0,210,255,0.06)", border: "1px solid rgba(0,210,255,0.15)" }}
          >
            <Shield className="w-5 h-5 shrink-0" style={{ color: "#00D2FF" }} />
            <div>
              <div className="text-xs font-bold" style={{ color: "#00D2FF" }}>
                TS 13298 Compliant
              </div>
              <div className="text-[11px]" style={{ color: "#A0AEC0" }}>
                Certified · Lumora Corp · Feb 2026
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
