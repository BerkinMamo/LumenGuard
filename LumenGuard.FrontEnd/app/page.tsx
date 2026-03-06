"use client"

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/lumenguard/sidebar"
import { SystemHealthBar } from "@/components/lumenguard/system-health-bar"
import { OverviewModule } from "@/components/lumenguard/overview-module"
import { IdentityModule } from "@/components/lumenguard/identity-module"
import { PolicyModule } from "@/components/lumenguard/policy-module"
import { KycModule } from "@/components/lumenguard/kyc-module"
import { ContractVaultModule } from "@/components/lumenguard/contract-vault-module"
import { AuditLogModule } from "@/components/lumenguard/audit-log-module"
import { SecurityAlertsModule } from "@/components/lumenguard/security-alerts-module"
import { GlobalSettingsModule } from "@/components/lumenguard/global-settings-module"

type Module = "overview" | "identity" | "policy" | "kyc" | "activity" | "vault" | "alerts" | "settings"

const moduleTitles: Record<Module, string> = {
  overview: "Overview",
  identity: "Identity & Users",
  policy: "Policy & Access",
  kyc: "KYC & Compliance",
  activity: "Audit Logs",
  vault: "Contract Vault",
  alerts: "Security Alerts",
  settings: "Global Settings & Policy Guard",
}

export default function DashboardPage() {
  const [activeModule, setActiveModule] = useState<Module>("overview")
  
  // ✅ DOĞRU YER: Hooklar fonksiyonun tam girişinde tanımlanmalı
  const [userIp, setUserIp] = useState<string>("Detecting...");

  useEffect(() => {
    fetch("https://api.ipify.org?format=json")
      .then((res) => res.json())
      .then((data) => setUserIp(data.ip))
      .catch(() => setUserIp("10.0.1.76"));
  }, []);

  function renderModule() {
    switch (activeModule) {
      case "overview": return <OverviewModule />
      case "identity": return <IdentityModule />
      case "policy": return <PolicyModule />
      case "kyc": return <KycModule />
      case "activity": return <AuditLogModule />
      case "vault": return <ContractVaultModule />
      case "alerts": return <SecurityAlertsModule />
      case "settings": return <GlobalSettingsModule />
      default: return <OverviewModule />
    }
  }

  return (
    <div
      className="flex flex-col h-screen overflow-hidden"
      style={{ backgroundColor: "#0B1D33" }}
    >
      <SystemHealthBar />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          activeModule={activeModule}
          onModuleChange={(id) => setActiveModule(id as Module)}
        />

        <main className="flex-1 flex flex-col overflow-hidden">
          <div
            className="flex items-center justify-between px-6 py-4 shrink-0"
            style={{
              borderBottom: "1px solid rgba(0, 210, 255, 0.1)",
              backgroundColor: "rgba(11, 29, 51, 0.4)",
            }}
          >
            <div>
              <div
                className="text-[10px] font-mono tracking-widest uppercase mb-0.5"
                style={{ color: "#A0AEC0" }}
              >
                LumenGuard / Security Suite
              </div>
              <h1 className="text-base font-bold" style={{ color: "#EDF2F7" }}>
                {moduleTitles[activeModule]}
              </h1>
            </div>
            
            <div className="flex items-center gap-3">
              <div
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono"
                style={{
                  backgroundColor: "rgba(0,210,255,0.08)",
                  border: "1px solid rgba(0,210,255,0.15)",
                  color: "#A0AEC0",
                }}
              >
                <div
                  className="w-1.5 h-1.5 rounded-full animate-pulse"
                  style={{ backgroundColor: "#00D2FF" }}
                />
                Session IP: <span style={{ color: "#00D2FF" }}>{userIp}</span>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-thin p-6">
            {renderModule()}
          </div>
        </main>
      </div>
    </div>
  )
}