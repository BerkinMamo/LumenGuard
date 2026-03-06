"use client"

import { useState } from "react"
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  FileCheck,
  Bell,
  Settings,
  LogOut,
  ChevronRight,
  Activity,
  Lock,
  AlertTriangle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { EmergencyLockdownModal } from "@/components/lumenguard/emergency-lockdown-modal"
import { authApi } from "@/lib/api"

interface NavItem {
  id: string
  label: string
  icon: React.ReactNode
  badge?: number
}

interface NavGroup {
  label: string
  items: NavItem[]
}

const navGroups: NavGroup[] = [
  {
    label: "Identity Portal",
    items: [
      { id: "overview", label: "Overview", icon: <LayoutDashboard className="w-4 h-4" /> },
      { id: "identity", label: "Identity & Users", icon: <Users className="w-4 h-4" /> },
      { id: "policy", label: "Policy & Access", icon: <ShieldCheck className="w-4 h-4" /> },
    ],
  },
  {
    label: "Compliance Center",
    items: [
      { id: "kyc", label: "KYC & Compliance", icon: <FileCheck className="w-4 h-4" />, badge: 7 },
      { id: "vault", label: "Contract Vault", icon: <Lock className="w-4 h-4" /> },
    ],
  },
  {
    label: "Audit Trail",
    items: [
      { id: "activity", label: "Audit Logs", icon: <Activity className="w-4 h-4" /> },
      { id: "alerts", label: "Security Alerts", icon: <Bell className="w-4 h-4" />, badge: 3 },
    ],
  },
  {
    label: "System Settings",
    items: [
      { id: "settings", label: "Policy Guard", icon: <Settings className="w-4 h-4" /> },
    ],
  },
]

interface SidebarProps {
  activeModule: string
  onModuleChange: (id: string) => void
}

export function Sidebar({ activeModule, onModuleChange }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [showLockdown, setShowLockdown] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleSecureLogout = async () => {
    if (isLoggingOut) return
    setIsLoggingOut(true)
    try {
      await authApi.logout()
    } catch (error) {
      console.error("Lumen Guard: Logout failed.", error)
      window.location.href = "/login"
    }
  }

  return (
    <>
      {showLockdown && (
        <EmergencyLockdownModal onClose={() => setShowLockdown(false)} />
      )}

      <aside
        className={cn(
          "flex flex-col h-full transition-all duration-300 border-r",
          collapsed ? "w-16" : "w-60"
        )}
        style={{
          backgroundColor: "#071525",
          borderColor: "rgba(0, 210, 255, 0.1)",
        }}
      >
      {/* Logo */}
      <div
        className="flex items-center gap-3 px-4 py-5 border-b"
        style={{ borderColor: "rgba(0, 210, 255, 0.1)" }}
      >
        <div
          className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0"
          style={{
            background: "rgba(0, 210, 255, 0.15)",
            border: "1px solid rgba(0, 210, 255, 0.4)",
          }}
        >
          <ShieldCheck className="w-4 h-4" style={{ color: "#00D2FF" }} />
        </div>
        {!collapsed && (
          <div>
            <div className="font-bold text-sm tracking-wide" style={{ color: "#EDF2F7" }}>
              Lumen<span style={{ color: "#00D2FF" }}>Guard</span>
            </div>
            <div
              className="font-mono text-[9px] tracking-widest uppercase"
              style={{ color: "#A0AEC0" }}
            >
              Security Suite v3.1
            </div>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "ml-auto p-1 rounded hover:bg-white/5 transition-colors",
            collapsed && "mx-auto ml-auto"
          )}
          style={{ color: "#A0AEC0" }}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronRight
            className={cn("w-3.5 h-3.5 transition-transform", !collapsed && "rotate-180")}
          />
        </button>
      </div>

        {/* Nav groups */}
        <nav className="flex-1 px-2 py-3 space-y-3 overflow-y-auto scrollbar-thin">
          {navGroups.map((group) => (
            <div key={group.label}>
              {!collapsed && (
                <div
                  className="px-2 pb-1 text-[9px] font-semibold tracking-widest uppercase"
                  style={{ color: "rgba(160, 174, 192, 0.45)" }}
                >
                  {group.label}
                </div>
              )}
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = activeModule === item.id
                  return (
                    <button
                      key={item.id}
                      onClick={() => onModuleChange(item.id)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                        collapsed && "justify-center px-2",
                        isActive
                          ? "text-[#00D2FF]"
                          : "hover:bg-white/5"
                      )}
                      style={
                        isActive
                          ? {
                              backgroundColor: "rgba(0, 210, 255, 0.1)",
                              border: "1px solid rgba(0, 210, 255, 0.2)",
                              color: "#00D2FF",
                            }
                          : { color: "#A0AEC0", border: "1px solid transparent" }
                      }
                      title={collapsed ? item.label : undefined}
                    >
                      <span className="shrink-0">{item.icon}</span>
                      {!collapsed && (
                        <>
                          <span className="flex-1 text-left">{item.label}</span>
                          {item.badge != null && (
                            <span
                              className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                              style={{
                                backgroundColor: "rgba(0, 210, 255, 0.15)",
                                color: "#00D2FF",
                              }}
                            >
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                    </button>
                  )
                })}
              </div>
              {!collapsed && (
                <div className="mt-2 mx-1 h-px" style={{ backgroundColor: "rgba(0,210,255,0.05)" }} />
              )}
            </div>
          ))}
        </nav>

        {/* Emergency Lockdown */}
        {!collapsed && (
          <button
            onClick={() => setShowLockdown(true)}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono font-bold transition-all mb-2"
            style={{
              backgroundColor: "rgba(239,68,68,0.06)",
              border: "1px solid rgba(239,68,68,0.18)",
              color: "rgba(239,68,68,0.8)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.12)"
              e.currentTarget.style.borderColor = "rgba(239,68,68,0.35)"
              e.currentTarget.style.color = "#EF4444"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.06)"
              e.currentTarget.style.borderColor = "rgba(239,68,68,0.18)"
              e.currentTarget.style.color = "rgba(239,68,68,0.8)"
            }}
          >
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span>Emergency Lockdown</span>
          </button>
        )}

      <div
        className="p-3 border-t"
        style={{ borderColor: "rgba(0, 210, 255, 0.1)" }}
      >
        {!collapsed && (
          <div
            className="flex items-center gap-2 px-3 py-2 mb-2 rounded-lg"
            style={{
              backgroundColor: "rgba(11, 29, 51, 0.6)",
              border: "1px solid rgba(0, 210, 255, 0.1)",
            }}
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0"
              style={{ backgroundColor: "rgba(0, 210, 255, 0.2)", color: "#00D2FF" }}
            >
              AK
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[12px] font-semibold truncate" style={{ color: "#EDF2F7" }}>
                Admin Kullanıcı
              </div>
              <div
                className="font-mono text-[9px] truncate"
                style={{ color: "#A0AEC0" }}
              >
                super_admin
              </div>
            </div>
          </div>
        )}
        <button
          onClick={handleSecureLogout}
          className={cn(
            "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all",
            collapsed && "justify-center"
          )}
          style={{
            backgroundColor: "rgba(239, 68, 68, 0.08)",
            border: "1px solid rgba(239, 68, 68, 0.2)",
            color: "#EF4444",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.15)"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.08)"
          }}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Secure Logout</span>}
        </button>
      </div>
      </aside>
    </>
  )
}
