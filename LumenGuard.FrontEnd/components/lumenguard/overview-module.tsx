"use client"

import { Users, ShieldCheck, FileCheck, AlertTriangle, TrendingUp, Activity, Key, Lock } from "lucide-react"
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

const authTrafficData = [
  { time: "00:00", tokens: 120, failures: 3 },
  { time: "02:00", tokens: 80, failures: 1 },
  { time: "04:00", tokens: 60, failures: 0 },
  { time: "06:00", tokens: 210, failures: 5 },
  { time: "08:00", tokens: 540, failures: 12 },
  { time: "10:00", tokens: 890, failures: 8 },
  { time: "12:00", tokens: 1120, failures: 14 },
  { time: "14:00", tokens: 980, failures: 6 },
  { time: "16:00", tokens: 1340, failures: 19 },
  { time: "18:00", tokens: 1080, failures: 11 },
  { time: "20:00", tokens: 760, failures: 7 },
  { time: "22:00", tokens: 420, failures: 4 },
]

const recentEvents = [
  {
    id: 1,
    type: "auth",
    msg: "Token issued for lumora-erp-prod-001",
    time: "10:44:12",
    severity: "info",
  },
  {
    id: 2,
    type: "kyc",
    msg: "AML flag triggered: KYC-2024-4475 (Igor Volkov)",
    time: "10:43:58",
    severity: "critical",
  },
  {
    id: 3,
    type: "vault",
    msg: "Vault decryption: HSM Slot 0 — usr_002",
    time: "10:43:30",
    severity: "info",
  },
  {
    id: 4,
    type: "auth",
    msg: "Failed login attempt — e.sahin@lumora.corp (suspended)",
    time: "10:42:07",
    severity: "warning",
  },
  {
    id: 5,
    type: "policy",
    msg: "Policy updated: vault.decrypt scope — Policy Manager",
    time: "10:40:55",
    severity: "info",
  },
  {
    id: 6,
    type: "kyc",
    msg: "New KYC application submitted: KYC-2024-4477",
    time: "10:39:44",
    severity: "info",
  },
  {
    id: 7,
    type: "auth",
    msg: "RSA-256 key rotation completed",
    time: "10:35:00",
    severity: "success",
  },
]

const severityConfig = {
  info: { color: "#00D2FF", bg: "rgba(0,210,255,0.1)", dot: "#00D2FF" },
  warning: { color: "#F59E0B", bg: "rgba(245,158,11,0.1)", dot: "#F59E0B" },
  critical: { color: "#EF4444", bg: "rgba(239,68,68,0.1)", dot: "#EF4444" },
  success: { color: "#22C55E", bg: "rgba(34,197,94,0.1)", dot: "#22C55E" },
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string }>; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div
        className="rounded-lg px-3 py-2 text-xs font-mono"
        style={{
          backgroundColor: "#071525",
          border: "1px solid rgba(0,210,255,0.3)",
          color: "#EDF2F7",
        }}
      >
        <div style={{ color: "#A0AEC0" }}>{label}</div>
        {payload.map((p) => (
          <div key={p.name}>
            <span style={{ color: p.name === "tokens" ? "#00D2FF" : "#EF4444" }}>
              {p.name === "tokens" ? "Tokens" : "Failures"}: {p.value}
            </span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

export function OverviewModule() {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold" style={{ color: "#EDF2F7" }}>
          Security Overview
        </h2>
        <p className="text-sm" style={{ color: "#A0AEC0" }}>
          Real-time status of your LumenGuard security infrastructure
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          {
            label: "Active Users",
            value: "7",
            sub: "+2 today",
            icon: <Users className="w-4 h-4" />,
            color: "#00D2FF",
          },
          {
            label: "Policies Active",
            value: "24",
            sub: "5 clients registered",
            icon: <ShieldCheck className="w-4 h-4" />,
            color: "#00D2FF",
          },
          {
            label: "KYC Pending",
            value: "7",
            sub: "2 AML flagged",
            icon: <FileCheck className="w-4 h-4" />,
            color: "#F59E0B",
          },
          {
            label: "AML Alerts",
            value: "2",
            sub: "Requires immediate action",
            icon: <AlertTriangle className="w-4 h-4" />,
            color: "#EF4444",
          },
        ].map((kpi) => (
          <div key={kpi.label} className="glass-card glass-card-hover rounded-xl p-4 flex items-center gap-4">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: kpi.color + "18", color: kpi.color }}
            >
              {kpi.icon}
            </div>
            <div>
              <div className="text-2xl font-bold" style={{ color: kpi.color }}>
                {kpi.value}
              </div>
              <div className="text-xs font-semibold" style={{ color: "#EDF2F7" }}>
                {kpi.label}
              </div>
              <div className="text-[11px]" style={{ color: "#A0AEC0" }}>
                {kpi.sub}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Chart + Activity split */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Auth Traffic Chart */}
        <div className="xl:col-span-2 glass-card rounded-xl p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="font-semibold text-sm" style={{ color: "#EDF2F7" }}>
                Authentication Traffic
              </div>
              <div className="text-xs" style={{ color: "#A0AEC0" }}>
                Token issuance &amp; failure rate — last 24h
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#00D2FF" }} />
                <span style={{ color: "#A0AEC0" }}>Tokens</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <span style={{ color: "#A0AEC0" }}>Failures</span>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={authTrafficData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="tokenGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00D2FF" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#00D2FF" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="failGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="time"
                tick={{ fill: "#A0AEC0", fontSize: 10 }}
                axisLine={{ stroke: "rgba(0,210,255,0.1)" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#A0AEC0", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="tokens"
                stroke="#00D2FF"
                strokeWidth={2}
                fill="url(#tokenGrad)"
              />
              <Area
                type="monotone"
                dataKey="failures"
                stroke="#EF4444"
                strokeWidth={1.5}
                fill="url(#failGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Events */}
        <div className="glass-card rounded-xl overflow-hidden flex flex-col">
          <div
            className="px-5 py-4 flex items-center justify-between"
            style={{ borderBottom: "1px solid rgba(0,210,255,0.1)" }}
          >
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4" style={{ color: "#00D2FF" }} />
              <span className="font-semibold text-sm" style={{ color: "#EDF2F7" }}>
                Live Events
              </span>
            </div>
            <div
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: "#00D2FF" }}
            />
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-thin">
            {recentEvents.map((e, idx) => {
              const sc = severityConfig[e.severity as keyof typeof severityConfig]
              return (
                <div
                  key={e.id}
                  className="px-5 py-3 hover:bg-white/[0.02] transition-colors"
                  style={{
                    borderBottom: idx < recentEvents.length - 1 ? "1px solid rgba(0,210,255,0.06)" : "none",
                  }}
                >
                  <div className="flex items-start gap-2">
                    <div
                      className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
                      style={{ backgroundColor: sc.dot }}
                    />
                    <div className="flex-1 min-w-0">
                      <div
                        className="text-xs leading-snug"
                        style={{ color: "#EDF2F7" }}
                      >
                        {e.msg}
                      </div>
                      <div className="font-mono text-[10px] mt-0.5" style={{ color: "#A0AEC0" }}>
                        {e.time} UTC
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            label: "HSM Operations Today",
            value: "2,847",
            icon: <Key className="w-4 h-4" />,
            note: "Slot 0 / Thales Luna — 100% uptime",
            color: "#00D2FF",
          },
          {
            label: "Total Token Issuances",
            value: "8,201",
            icon: <TrendingUp className="w-4 h-4" />,
            note: "Peak: 1,340 at 16:00",
            color: "#00D2FF",
          },
          {
            label: "Active Vault Sessions",
            value: "6",
            icon: <Lock className="w-4 h-4" />,
            note: "4 operators, 2 services",
            color: "#22C55E",
          },
        ].map((item) => (
          <div key={item.label} className="glass-card rounded-xl p-4 flex items-center gap-4">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: item.color + "18", color: item.color }}
            >
              {item.icon}
            </div>
            <div>
              <div className="text-xl font-bold font-mono" style={{ color: item.color }}>
                {item.value}
              </div>
              <div className="text-xs font-semibold" style={{ color: "#EDF2F7" }}>
                {item.label}
              </div>
              <div className="text-[11px] mt-0.5" style={{ color: "#A0AEC0" }}>
                {item.note}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
