"use client"

import { useState } from "react"
import { ShieldOff, AlertTriangle, X, Lock, Key, Zap } from "lucide-react"

interface EmergencyLockdownModalProps {
  onClose: () => void
}

export function EmergencyLockdownModal({ onClose }: EmergencyLockdownModalProps) {
  const [step, setStep] = useState<"confirm" | "verify" | "executing" | "done">("confirm")
  const [confirmText, setConfirmText] = useState("")
  const [progress, setProgress] = useState(0)

  const CONFIRM_PHRASE = "LOCKDOWN"

  function handleExecute() {
    setStep("executing")
    let p = 0
    const interval = setInterval(() => {
      p += Math.random() * 18 + 4
      if (p >= 100) {
        p = 100
        clearInterval(interval)
        setProgress(100)
        setTimeout(() => setStep("done"), 400)
      }
      setProgress(Math.min(p, 100))
    }, 180)
  }

  const LOCKDOWN_ACTIONS = [
    { icon: <Zap className="w-3.5 h-3.5" />, label: "Freeze all active IdentityServer tokens", color: "#EF4444" },
    { icon: <Key className="w-3.5 h-3.5" />, label: "Suspend all HSM signing operations", color: "#EF4444" },
    { icon: <Lock className="w-3.5 h-3.5" />, label: "Lock Contract Vault (read & write)", color: "#EF4444" },
    { icon: <ShieldOff className="w-3.5 h-3.5" />, label: "Halt KYC processing pipeline", color: "#EF4444" },
    { icon: <AlertTriangle className="w-3.5 h-3.5" />, label: "Broadcast Critical alert to all admins", color: "#F97316" },
  ]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(7,0,0,0.88)", backdropFilter: "blur(10px)" }}
    >
      <div
        className="w-full max-w-lg rounded-2xl overflow-hidden"
        style={{
          backgroundColor: "#0A0A0A",
          border: "1.5px solid rgba(239,68,68,0.5)",
          boxShadow: "0 0 60px rgba(239,68,68,0.15), 0 0 120px rgba(239,68,68,0.06)",
        }}
      >
        {/* ── Step: Confirm ──────────────────────────────── */}
        {step === "confirm" && (
          <>
            {/* Header */}
            <div
              className="flex items-center justify-between px-6 py-4 border-b"
              style={{ borderColor: "rgba(239,68,68,0.2)", backgroundColor: "rgba(239,68,68,0.06)" }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex items-center justify-center w-9 h-9 rounded-xl animate-pulse"
                  style={{ backgroundColor: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.4)" }}
                >
                  <ShieldOff className="w-4 h-4" style={{ color: "#EF4444" }} />
                </div>
                <div>
                  <div className="font-bold text-sm" style={{ color: "#EF4444" }}>
                    EMERGENCY LOCKDOWN
                  </div>
                  <div className="font-mono text-[10px] mt-0.5" style={{ color: "rgba(239,68,68,0.7)" }}>
                    PROTOCOL ALPHA-1 · IRREVERSIBLE
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-md transition-colors hover:bg-white/5"
                style={{ color: "#A0AEC0" }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-5">
              <p className="text-sm leading-relaxed" style={{ color: "#EDF2F7" }}>
                You are about to initiate a <span className="font-bold" style={{ color: "#EF4444" }}>full system emergency lockdown</span>. The following operations will execute immediately and simultaneously:
              </p>

              <div className="space-y-2">
                {LOCKDOWN_ACTIONS.map((action, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg"
                    style={{
                      backgroundColor: "rgba(239,68,68,0.05)",
                      border: "1px solid rgba(239,68,68,0.12)",
                    }}
                  >
                    <span style={{ color: action.color }}>{action.icon}</span>
                    <span className="text-xs font-mono" style={{ color: "#EDF2F7" }}>{action.label}</span>
                  </div>
                ))}
              </div>

              {/* Warning callout */}
              <div
                className="flex items-start gap-3 p-3.5 rounded-lg"
                style={{
                  backgroundColor: "rgba(246,201,14,0.06)",
                  border: "1px solid rgba(246,201,14,0.2)",
                }}
              >
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "#F6C90E" }} />
                <p className="text-[11px] leading-relaxed" style={{ color: "#F6C90E" }}>
                  This action cannot be undone remotely. Re-enabling operations requires physical HSM access and dual-admin approval at the data center. Estimated recovery time: 2–4 hours.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div
              className="flex items-center gap-3 px-6 py-4 border-t"
              style={{ borderColor: "rgba(239,68,68,0.15)" }}
            >
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={{
                  backgroundColor: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "#A0AEC0",
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => setStep("verify")}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all"
                style={{
                  backgroundColor: "rgba(239,68,68,0.12)",
                  border: "1px solid rgba(239,68,68,0.4)",
                  color: "#EF4444",
                }}
              >
                Continue to Verify
              </button>
            </div>
          </>
        )}

        {/* ── Step: Verify ───────────────────────────────── */}
        {step === "verify" && (
          <>
            <div
              className="flex items-center justify-between px-6 py-4 border-b"
              style={{ borderColor: "rgba(239,68,68,0.2)", backgroundColor: "rgba(239,68,68,0.06)" }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex items-center justify-center w-9 h-9 rounded-xl"
                  style={{ backgroundColor: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.4)" }}
                >
                  <Lock className="w-4 h-4" style={{ color: "#EF4444" }} />
                </div>
                <div>
                  <div className="font-bold text-sm" style={{ color: "#EF4444" }}>Identity Verification</div>
                  <div className="font-mono text-[10px] mt-0.5" style={{ color: "rgba(239,68,68,0.7)" }}>
                    Type confirmation phrase to proceed
                  </div>
                </div>
              </div>
              <button onClick={onClose} className="p-1 rounded-md hover:bg-white/5" style={{ color: "#A0AEC0" }}>
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-6 py-6 space-y-5">
              <p className="text-sm" style={{ color: "#EDF2F7" }}>
                Type{" "}
                <code
                  className="px-1.5 py-0.5 rounded font-mono text-xs font-bold"
                  style={{ backgroundColor: "rgba(239,68,68,0.12)", color: "#EF4444", border: "1px solid rgba(239,68,68,0.25)" }}
                >
                  {CONFIRM_PHRASE}
                </code>{" "}
                in the field below to authorize the emergency lockdown.
              </p>

              <input
                autoFocus
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
                placeholder="Type LOCKDOWN to confirm"
                className="w-full px-4 py-3 rounded-xl text-sm font-mono font-bold outline-none transition-all text-center tracking-widest"
                style={{
                  backgroundColor: "rgba(0,0,0,0.4)",
                  border: `2px solid ${confirmText === CONFIRM_PHRASE ? "rgba(239,68,68,0.6)" : "rgba(239,68,68,0.2)"}`,
                  color: confirmText === CONFIRM_PHRASE ? "#EF4444" : "#EDF2F7",
                }}
                onKeyDown={(e) => e.key === "Enter" && confirmText === CONFIRM_PHRASE && handleExecute()}
              />

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setStep("confirm")}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "#A0AEC0",
                  }}
                >
                  Back
                </button>
                <button
                  onClick={handleExecute}
                  disabled={confirmText !== CONFIRM_PHRASE}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: "rgba(239,68,68,0.2)",
                    border: "1px solid rgba(239,68,68,0.5)",
                    color: "#EF4444",
                  }}
                >
                  Execute Lockdown
                </button>
              </div>
            </div>
          </>
        )}

        {/* ── Step: Executing ────────────────────────────── */}
        {step === "executing" && (
          <div className="px-6 py-10 flex flex-col items-center gap-6">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center animate-pulse"
              style={{ backgroundColor: "rgba(239,68,68,0.12)", border: "2px solid rgba(239,68,68,0.4)" }}
            >
              <ShieldOff className="w-7 h-7" style={{ color: "#EF4444" }} />
            </div>
            <div className="text-center">
              <div className="font-bold text-base" style={{ color: "#EF4444" }}>Executing Lockdown…</div>
              <div className="font-mono text-[11px] mt-1" style={{ color: "#A0AEC0" }}>
                Freezing tokens · Suspending HSM · Locking vault
              </div>
            </div>
            {/* Progress bar */}
            <div className="w-full">
              <div
                className="w-full h-2 rounded-full overflow-hidden"
                style={{ backgroundColor: "rgba(239,68,68,0.1)" }}
              >
                <div
                  className="h-full rounded-full transition-all duration-200"
                  style={{ width: `${progress}%`, backgroundColor: "#EF4444" }}
                />
              </div>
              <div className="text-right mt-1 font-mono text-[10px]" style={{ color: "#A0AEC0" }}>
                {Math.round(progress)}%
              </div>
            </div>
          </div>
        )}

        {/* ── Step: Done ─────────────────────────────────── */}
        {step === "done" && (
          <>
            <div className="px-6 py-8 flex flex-col items-center gap-5">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "rgba(239,68,68,0.15)", border: "2px solid rgba(239,68,68,0.5)" }}
              >
                <Lock className="w-7 h-7" style={{ color: "#EF4444" }} />
              </div>
              <div className="text-center">
                <div className="font-bold text-lg" style={{ color: "#EF4444" }}>
                  System Locked Down
                </div>
                <div className="font-mono text-[11px] mt-1 max-w-xs leading-relaxed" style={{ color: "#A0AEC0" }}>
                  All tokens frozen, HSM signing suspended, Vault locked. Emergency alert broadcast to all registered administrators.
                </div>
              </div>
              <div
                className="w-full p-3 rounded-lg font-mono text-[10px] space-y-0.5"
                style={{ backgroundColor: "rgba(0,0,0,0.4)", border: "1px solid rgba(239,68,68,0.15)" }}
              >
                {[
                  "[✓] IdentityServer: All 24 active tokens revoked",
                  "[✓] HSM Slot-0: Signing suspended",
                  "[✓] HSM Slot-1-4: Operations halted",
                  "[✓] Contract Vault: Read/Write locked",
                  "[✓] KYC Pipeline: Halted",
                  "[✓] Critical alert dispatched to 3 admins",
                ].map((line, i) => (
                  <div key={i} style={{ color: i < 5 ? "#22C55E" : "#F6C90E" }}>{line}</div>
                ))}
              </div>
            </div>
            <div
              className="px-6 py-4 border-t"
              style={{ borderColor: "rgba(239,68,68,0.15)" }}
            >
              <button
                onClick={onClose}
                className="w-full py-2.5 rounded-xl text-sm font-bold"
                style={{
                  backgroundColor: "rgba(239,68,68,0.1)",
                  border: "1px solid rgba(239,68,68,0.3)",
                  color: "#EF4444",
                }}
              >
                Close
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
