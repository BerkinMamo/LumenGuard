"use client"

import { useState, useEffect } from "react"
import { Shield, Cpu, Key, Wifi, CheckCircle2, AlertCircle, Loader2 } from "lucide-react"
import { systemApi } from "@/lib/api"

interface StatusItem {
  id: string
  label: string
  value: string
  status: "online" | "degraded" | "offline"
  icon: React.ReactNode
}

export function SystemHealthBar() {
  const [statuses, setStatuses] = useState<StatusItem[]>([])
  const [currentTime, setCurrentTime] = useState<Date | null>(null)
  const [isSyncing, setIsSyncing] = useState(false)

  const fetchHealth = async () => {
    const hasToken = typeof window !== "undefined" && 
      (document.cookie.includes("lumen_token") || localStorage.getItem("lumen_token"));
    
    if (!hasToken) return;

    setIsSyncing(true)
    try {
      const response = await systemApi.getHealthStatus()
      const { hsm, authEngine, tokenInfo, network } = response.data 

      setStatuses([
        {
          id: "hsm",
          label: hsm.label || "HSM Node",
          value: hsm.model || "Unknown",
          status: hsm.isReady ? "online" : "offline",
          icon: <Cpu className="w-3.5 h-3.5" />,
        },
        {
          id: "auth",
          label: authEngine.label || "Auth Engine",
          value: authEngine.version || "N/A",
          status: authEngine.isUp ? "online" : "degraded",
          icon: <Shield className="w-3.5 h-3.5" />,
        },
        {
          id: "token",
          label: tokenInfo.label || "Signing",
          value: tokenInfo.algorithm || "N/A",
          status: tokenInfo.isValid ? "online" : "offline",
          icon: <Key className="w-3.5 h-3.5" />,
        },
        {
          id: "network",
          label: network.label || "Network",
          value: network.protocol || "TLS 1.3",
          status: network.isSecure ? "online" : "degraded",
          icon: <Wifi className="w-3.5 h-3.5" />,
        },
      ])
    } catch (error) {
      console.error("Health sync failed:", error)
      setStatuses(prev => prev.map(s => ({ ...s, status: "offline", value: "ERR" })))
    } finally {
      setIsSyncing(false)
    }
  }

  useEffect(() => {
    setCurrentTime(new Date())
    fetchHealth()

    const clockTimer = setInterval(() => setCurrentTime(new Date()), 1000)
    const healthTimer = setInterval(fetchHealth, 30000) 

    return () => {
      clearInterval(clockTimer)
      clearInterval(healthTimer)
    }
  }, [])

  const allOnline = statuses.length > 0 && statuses.every((s) => s.status === "online")

  return (
    <div
      className="w-full border-b flex items-center justify-between px-4 py-2 text-xs"
      style={{
        backgroundColor: "rgba(7, 21, 37, 0.95)",
        borderColor: "rgba(0, 210, 255, 0.2)",
        backdropFilter: "blur(10px)",
      }}
    >
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 font-semibold" style={{ color: "#00D2FF" }}>
          <div
            className="w-1.5 h-1.5 rounded-full animate-pulse"
            style={{ backgroundColor: statuses.length === 0 ? "#A0AEC0" : allOnline ? "#00D2FF" : "#EF4444" }}
          />
          <span className="font-mono text-[10px] tracking-widest uppercase">
            {statuses.length === 0 ? "Initializing..." : allOnline ? "All Systems Operational" : "System Alert"}
          </span>
        </div>
        {isSyncing && <Loader2 className="w-3 h-3 animate-spin text-[#00D2FF]/50" />}
      </div>

      <div className="flex items-center gap-6">
        {statuses.map((item) => (
          <div key={item.id} className="flex items-center gap-1.5 opacity-90 hover:opacity-100 transition-opacity cursor-default">
            <span style={{ color: "#A0AEC0" }}>{item.icon}</span>
            <span style={{ color: "#A0AEC0" }} className="hidden lg:inline">{item.label}:</span>
            <span className="font-mono font-medium" style={{ color: "#EDF2F7" }}>{item.value}</span>
            {item.status === "online" ? (
              <CheckCircle2 className="w-3 h-3" style={{ color: "#00D2FF" }} />
            ) : (
              <AlertCircle className="w-3 h-3 text-red-500 animate-bounce" />
            )}
          </div>
        ))}
      </div>

      <div className="font-mono text-[11px] tabular-nums" style={{ color: "#A0AEC0" }}>
        {currentTime ? currentTime.toLocaleTimeString("en-GB", { hour12: false }) : "--:--:--"} UTC
      </div>
    </div>
  )
}