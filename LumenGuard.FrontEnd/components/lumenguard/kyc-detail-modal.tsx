"use client"

import { X, CreditCard, Fingerprint, Shield, Key, CheckCircle2, User, Video, Flag } from "lucide-react"

interface KycDetailModalProps {
  applicant: {
    id: string
    name: string
    applicationId: string
    level?: string
    status: "pending" | "in_review" | "approved" | "rejected"
    documentType: string
    country: string
    riskScore: number
    riskLabel: "low" | "medium" | "high" | "critical"
    amlFlag: boolean
  }
  onClose: () => void
  onApprove: (id: string) => void
  onReject: (id: string) => void
}

export function KycDetailModal({ applicant, onClose, onApprove, onReject }: KycDetailModalProps) {
  const idNumber =
    applicant.id === "app_001"
      ? "12345678901"
      : applicant.id === "app_002"
        ? "DE-88234456"
        : applicant.id === "app_003"
          ? "US-99012334"
          : applicant.id === "app_004"
            ? "CN-44023312"
            : applicant.id === "app_005"
              ? "RU-55811020"
              : "SN-20110044"

  const dobMap: Record<string, string> = {
    app_001: "15 Mar 1988",
    app_002: "22 Jul 1993",
    app_003: "08 Nov 1975",
    app_004: "01 Feb 1990",
    app_005: "17 Sep 1982",
    app_006: "30 Apr 1997",
    app_007: "11 Dec 1985",
  }

  const faceScore = applicant.riskScore < 40 ? 98.4 : applicant.riskScore < 70 ? 91.2 : 74.8
  const faceColor = faceScore >= 90 ? "#22C55E" : faceScore >= 80 ? "#F59E0B" : "#EF4444"

  const hsmSlotMap: Record<string, string> = {
    app_001: "Slot-4 · Thales Luna PCIe",
    app_002: "Slot-2 · Thales Luna PCIe",
    app_003: "Slot-7 · Thales Luna Network",
    app_004: "Slot-1 · Thales Luna PCIe",
    app_005: "Slot-9 · Thales Luna Network",
    app_006: "Slot-3 · Thales Luna PCIe",
    app_007: "Slot-5 · Thales Luna PCIe",
  }

  const applicantIdNo = applicant.applicationId.split("-").pop() ?? "4471"

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl m-4"
        style={{
          backgroundColor: "#0B1D33",
          border: "1px solid rgba(0,210,255,0.2)",
          boxShadow: "0 0 60px rgba(0,210,255,0.1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 sticky top-0 z-10"
          style={{
            backgroundColor: "#0B1D33",
            borderBottom: "1px solid rgba(0,210,255,0.12)",
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "rgba(0,210,255,0.15)", border: "1px solid rgba(0,210,255,0.3)" }}
            >
              <User className="w-5 h-5" style={{ color: "#00D2FF" }} />
            </div>
            <div>
              <div className="font-bold text-base" style={{ color: "#EDF2F7" }}>
                {applicant.name}
              </div>
              <div className="text-xs font-mono" style={{ color: "#A0AEC0" }}>
                ID: #{applicantIdNo} · Level 2 — Video &amp; ID
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
              style={{
                backgroundColor: "rgba(245,158,11,0.15)",
                border: "1px solid rgba(245,158,11,0.3)",
                color: "#F59E0B",
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
              Pending Review
            </span>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10"
              style={{ color: "#A0AEC0" }}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 grid grid-cols-2 gap-4">
          {/* Document Check */}
          <div
            className="rounded-xl p-4 space-y-4"
            style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(0,210,255,0.1)" }}
          >
            <div className="flex items-center gap-2">
              <CreditCard className="w-3.5 h-3.5" style={{ color: "#00D2FF" }} />
              <span className="text-[10px] font-mono font-bold tracking-widest uppercase" style={{ color: "#00D2FF" }}>
                Document Check
              </span>
            </div>

            {/* Card visual */}
            <div
              className="rounded-xl p-4 flex flex-col items-center justify-center gap-2"
              style={{
                background: "repeating-linear-gradient(45deg, rgba(0,210,255,0.03) 0px, rgba(0,210,255,0.03) 2px, transparent 2px, transparent 10px)",
                backgroundColor: "rgba(0,0,0,0.3)",
                border: "1px solid rgba(0,210,255,0.15)",
                minHeight: 90,
              }}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "rgba(0,210,255,0.12)", border: "1px solid rgba(0,210,255,0.3)" }}
              >
                <CreditCard className="w-5 h-5" style={{ color: "#00D2FF" }} />
              </div>
              <div className="text-sm font-semibold" style={{ color: "#EDF2F7" }}>
                {applicant.documentType === "National ID" ? "National ID Card" : "Passport"}
              </div>
              <div className="text-[11px] font-mono" style={{ color: "#A0AEC0" }}>
                Encrypted · FIPS 140-2
              </div>
            </div>

            {/* OCR Results */}
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider mb-2" style={{ color: "#A0AEC0" }}>
                OCR Extraction Results
              </div>
              <div className="space-y-2">
                {[
                  { label: "Full Name", icon: <User className="w-3 h-3" />, value: applicant.name },
                  { label: "Date of Birth", icon: <span className="text-[10px]">🗓</span>, value: dobMap[applicant.id] ?? "01 Jan 1990" },
                  { label: "National ID No.", icon: <CreditCard className="w-3 h-3" />, value: idNumber },
                ].map((row) => (
                  <div
                    key={row.label}
                    className="flex items-center justify-between px-3 py-2 rounded-lg"
                    style={{ backgroundColor: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.05)" }}
                  >
                    <div>
                      <div className="text-[10px]" style={{ color: "#A0AEC0" }}>{row.label}</div>
                      <div className="text-xs font-mono font-semibold" style={{ color: "#EDF2F7" }}>
                        {row.value}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] font-semibold" style={{ color: "#22C55E" }}>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Matched
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Biometric Engine */}
          <div
            className="rounded-xl p-4 space-y-3"
            style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(0,210,255,0.1)" }}
          >
            <div className="flex items-center gap-2">
              <Fingerprint className="w-3.5 h-3.5" style={{ color: "#00D2FF" }} />
              <span className="text-[10px] font-mono font-bold tracking-widest uppercase" style={{ color: "#00D2FF" }}>
                Biometric Engine · C++ 3D Face Match
              </span>
            </div>

            {/* Photo comparison */}
            <div className="grid grid-cols-2 gap-2">
              <div
                className="rounded-xl p-3 flex flex-col items-center gap-2"
                style={{ backgroundColor: "rgba(0,0,0,0.3)", border: "1px solid rgba(0,210,255,0.15)" }}
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "rgba(0,210,255,0.12)", border: "1px solid rgba(0,210,255,0.3)" }}
                >
                  <User className="w-6 h-6" style={{ color: "#00D2FF" }} />
                </div>
                <div
                  className="w-full h-1 rounded-full"
                  style={{ backgroundColor: "#00D2FF" }}
                />
                <div className="text-[10px] text-center" style={{ color: "#A0AEC0" }}>
                  ID Card Photo
                </div>
              </div>
              <div
                className="rounded-xl p-3 flex flex-col items-center gap-2 relative"
                style={{ backgroundColor: "rgba(0,0,0,0.3)", border: "1px solid rgba(245,158,11,0.2)" }}
              >
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span
                    className="text-xs font-mono font-bold px-2 py-0.5 rounded"
                    style={{ backgroundColor: "rgba(0,0,0,0.8)", color: faceColor, border: `1px solid ${faceColor}` }}
                  >
                    {faceScore}%
                  </span>
                  <div className="text-[9px] text-center" style={{ color: "#A0AEC0" }}>Match</div>
                </div>
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center mt-2"
                  style={{ backgroundColor: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)" }}
                >
                  <User className="w-6 h-6" style={{ color: "#F59E0B" }} />
                </div>
                <div className="text-[10px] text-center" style={{ color: "#A0AEC0" }}>
                  Live Selfie Frame
                </div>
              </div>
            </div>

            {/* Score bar */}
            <div
              className="rounded-lg p-3 space-y-2"
              style={{ backgroundColor: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.05)" }}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs" style={{ color: "#A0AEC0" }}>3D Face Match Score</span>
                <span className="text-sm font-bold font-mono" style={{ color: faceColor }}>{faceScore}%</span>
              </div>
              <div className="h-2 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.08)" }}>
                <div
                  className="h-full rounded-full"
                  style={{ width: `${faceScore}%`, backgroundColor: faceColor }}
                />
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: "#22C55E" }}>
                <CheckCircle2 className="w-3.5 h-3.5" />
                Liveness Check: Passed
              </div>
            </div>
          </div>

          {/* AML / Sanctions */}
          <div
            className="rounded-xl p-4 space-y-3"
            style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(0,210,255,0.1)" }}
          >
            <div className="flex items-center gap-2">
              <Shield className="w-3.5 h-3.5" style={{ color: "#00D2FF" }} />
              <span className="text-[10px] font-mono font-bold tracking-widest uppercase" style={{ color: "#00D2FF" }}>
                AML / Sanctions Check
              </span>
            </div>
            <div
              className="rounded-xl p-4"
              style={
                applicant.amlFlag
                  ? { backgroundColor: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)" }
                  : { backgroundColor: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.3)" }
              }
            >
              {applicant.amlFlag ? (
                <>
                  <div className="flex items-start gap-2 mb-2">
                    <Flag className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "#EF4444" }} />
                    <span className="font-bold text-sm" style={{ color: "#EF4444" }}>
                      Sanctions Match Found
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: "#A0AEC0" }}>
                    Potential match detected. Manual review required before proceeding.
                  </p>
                </>
              ) : (
                <>
                  <div className="flex items-start gap-2 mb-2">
                    <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "#22C55E" }} />
                    <span className="font-bold text-sm leading-tight" style={{ color: "#22C55E" }}>
                      Clear — No Sanctions Found
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: "#A0AEC0" }}>
                    OFAC · EU Sanctions List · UN Consolidated
                  </p>
                </>
              )}
            </div>
          </div>

          {/* HSM Key Provisioning */}
          <div
            className="rounded-xl p-4 space-y-3"
            style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(0,210,255,0.1)" }}
          >
            <div className="flex items-center gap-2">
              <Key className="w-3.5 h-3.5" style={{ color: "#00D2FF" }} />
              <span className="text-[10px] font-mono font-bold tracking-widest uppercase" style={{ color: "#00D2FF" }}>
                HSM Key Provisioning
              </span>
            </div>
            <div
              className="rounded-xl p-4"
              style={{ backgroundColor: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)" }}
            >
              <div className="flex items-start gap-2 mb-1.5">
                <Key className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "#F59E0B" }} />
                <span className="font-bold text-sm" style={{ color: "#F59E0B" }}>
                  Awaiting Approval
                </span>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: "#A0AEC0" }}>
                Generate AES-256 key in {hsmSlotMap[applicant.id] ?? "Slot-4 · Thales Luna PCIe"}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div
          className="flex items-center gap-3 px-5 py-4 sticky bottom-0"
          style={{
            backgroundColor: "#0B1D33",
            borderTop: "1px solid rgba(0,210,255,0.12)",
          }}
        >
          <button
            onClick={() => onApprove(applicant.id)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold flex-1 justify-center transition-all hover:brightness-110"
            style={{
              backgroundColor: "rgba(0,210,255,0.15)",
              border: "1px solid rgba(0,210,255,0.4)",
              color: "#00D2FF",
            }}
          >
            <Key className="w-4 h-4" />
            Approve &amp; Issue Vault Key
          </button>
          <button
            onClick={() => onReject(applicant.id)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold flex-1 justify-center transition-all hover:brightness-110"
            style={{
              backgroundColor: "rgba(239,68,68,0.12)",
              border: "1px solid rgba(239,68,68,0.35)",
              color: "#EF4444",
            }}
          >
            <Flag className="w-4 h-4" />
            Reject &amp; Flag
          </button>
          <button
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:bg-white/10"
            style={{
              border: "1px solid rgba(255,255,255,0.12)",
              color: "#A0AEC0",
            }}
          >
            <Video className="w-4 h-4" />
            Request Video Call
          </button>
        </div>
      </div>
    </div>
  )
}
