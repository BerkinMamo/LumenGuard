"use client"

import { useState, useEffect } from "react"
import { Shield, Cpu, Key, Wifi, CheckCircle2, AlertCircle } from "lucide-react"

interface StatusItem {
  id: string
  label: string
  value: string
  status: "online" | "degraded" | "offline"
  icon: React.ReactNode
}

const initialStatuses: StatusItem[] = [
  {
    id: "hsm",
    label: "HSM Slot 0",
    value: "Thales Luna",
    status: "online",
    icon: <Cpu className="w-3.5 h-3.5" />,
  },
  {
    id: "auth",
    label: "Auth Engine",
    value: "Duende IdentityServer",
    status: "online",
    icon: <Shield className="w-3.5 h-3.5" />,
  },
  {
    id: "token",
    label: "Token Signing",
    value: "RSA-256",
    status: "online",
    icon: <Key className="w-3.5 h-3.5" />,
  },
  {
    id: "network",
    label: "Secure Network",
    value: "TLS 1.3 Active",
    status: "online",
    icon: <Wifi className="w-3.5 h-3.5" />,
  },
]

export function SystemHealthBar() {
  const [statuses] = useState<StatusItem[]>(initialStatuses)
  const [currentTime, setCurrentTime] = useState<Date | null>(null)

  useEffect(() => {
    setCurrentTime(new Date())
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const allOnline = statuses.every((s) => s.status === "online")

  return (
    <div
      className="w-full border-b flex items-center justify-between px-4 py-2 text-xs"
      style={{
        backgroundColor: "rgba(7, 21, 37, 0.95)",
        borderColor: "rgba(0, 210, 255, 0.2)",
        backdropFilter: "blur(10px)",
      }}
    >
      {/* Left: Brand indicator */}
      <div className="flex items-center gap-2">
        <div
          className="flex items-center gap-1.5 font-semibold"
          style={{ color: "#00D2FF" }}
        >
          <div
            className="w-1.5 h-1.5 rounded-full animate-pulse"
            style={{ backgroundColor: allOnline ? "#00D2FF" : "#EF4444" }}
          />
          <span className="font-mono text-[10px] tracking-widest uppercase">
            {allOnline ? "All Systems Operational" : "Degraded Mode"}
          </span>
        </div>
      </div>

      {/* Center: Status items */}
      <div className="flex items-center gap-6">
        {statuses.map((item) => (
          <div key={item.id} className="flex items-center gap-1.5">
            <span style={{ color: "#A0AEC0" }}>{item.icon}</span>
            <span style={{ color: "#A0AEC0" }} className="hidden sm:inline">
              {item.label}:
            </span>
            <span
              className="font-mono font-medium"
              style={{ color: "#EDF2F7" }}
            >
              {item.value}
            </span>
            {item.status === "online" ? (
              <CheckCircle2 className="w-3 h-3" style={{ color: "#00D2FF" }} />
            ) : (
              <AlertCircle className="w-3 h-3 text-red-400" />
            )}
          </div>
        ))}
      </div>

      {/* Right: Clock */}
      <div
        className="font-mono text-[11px] tabular-nums"
        style={{ color: "#A0AEC0" }}
      >
        {currentTime ? currentTime.toLocaleTimeString("en-GB", { hour12: false }) : "--:--:--"} UTC
      </div>
    </div>
  )
}
