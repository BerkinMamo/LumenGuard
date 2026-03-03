"use client";

import { useState, useEffect, useRef } from "react";
import {
  Cpu,
  Activity,
  ShieldCheck,
  Lock,
  TrendingUp,
  Zap,
  Hash,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

type SignatureEntry = {
  id: number;
  timestamp: string;
  algo: string;
  duration: number;
};

function useCounter(initial: number, interval = 3200) {
  // Start as null to avoid SSR/client locale mismatch with toLocaleString()
  const [count, setCount] = useState<number | null>(null);
  const [ticked, setTicked] = useState(false);
  useEffect(() => {
    setCount(initial);
    const t = setInterval(() => {
      setCount((c) => (c ?? initial) + Math.floor(Math.random() * 4) + 1);
      setTicked(true);
      setTimeout(() => setTicked(false), 350);
    }, interval);
    return () => clearInterval(t);
  }, [initial, interval]);
  return { count, ticked };
}

const ALGOS = ["RSA-2048", "EC-P256", "AES-256-GCM", "Ed25519", "RSA-4096"];

export function HsmWidget() {
  const { count: sigCount, ticked: sigTicked } = useCounter(4827, 3200);
  const { count: encCount, ticked: encTicked } = useCounter(1241, 4500);
  const { count: decCount } = useCounter(983, 5100);
  const [uptimeSecs, setUptimeSecs] = useState(3600 * 14 + 22 * 60 + 47);
  const [recentOps, setRecentOps] = useState<SignatureEntry[]>([
    { id: 1, timestamp: "14:02:31", algo: "RSA-2048", duration: 12 },
    { id: 2, timestamp: "14:02:28", algo: "AES-256-GCM", duration: 3 },
    { id: 3, timestamp: "14:02:25", algo: "EC-P256", duration: 7 },
    { id: 4, timestamp: "14:02:19", algo: "Ed25519", duration: 2 },
  ]);
  const nextId = useRef(5);

  useEffect(() => {
    const t = setInterval(() => setUptimeSecs((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      const now = new Date();
      const ts = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
      const algo = ALGOS[Math.floor(Math.random() * ALGOS.length)];
      const duration = algo.startsWith("RSA") ? Math.floor(Math.random() * 15) + 8 : Math.floor(Math.random() * 6) + 2;
      setRecentOps((prev) => [
        { id: nextId.current++, timestamp: ts, algo, duration },
        ...prev.slice(0, 4),
      ]);
    }, 3800);
    return () => clearInterval(t);
  }, []);

  const hours = Math.floor(uptimeSecs / 3600);
  const mins = Math.floor((uptimeSecs % 3600) / 60);
  const secs = uptimeSecs % 60;
  const uptime = `${String(hours).padStart(2, "0")}h ${String(mins).padStart(2, "0")}m ${String(secs).padStart(2, "0")}s`;

  return (
    <div className="space-y-3">
      {/* HSM Status Card */}
      <div className="glass-card rounded-lg p-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="relative w-8 h-8 rounded-lg bg-[rgba(16,185,129,0.1)] border border-[rgba(16,185,129,0.2)] flex items-center justify-center">
              <Cpu size={15} strokeWidth={1.5} className="text-emerald-400" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border-2 border-[#0B1D33]" />
            </div>
            <div>
              <h3 className="text-[12px] font-semibold text-[#E2E8F0] leading-tight">
                SoftHSM v2
              </h3>
              <p className="text-[9px] text-[#4A5568] leading-tight mt-0.5 font-mono">
                Slot 290060222
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-[rgba(16,185,129,0.08)] border border-[rgba(16,185,129,0.15)]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-dot" />
            <span className="text-[9px] font-medium text-emerald-400">ONLINE</span>
          </div>
        </div>

        {/* HSM Details */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <InfoRow label="Label" value="Luvia-Key-Test" mono />
          <InfoRow label="Token PIN" value="Protected" icon={<Lock size={9} strokeWidth={1.5} className="text-[#4A5568]" />} />
          <InfoRow label="PKCS#11" value="v2.40" mono />
          <InfoRow label="Uptime" value={uptime} mono live />
        </div>

        {/* Counter stats */}
        <div className="grid grid-cols-3 gap-2">
          <StatBox
            label="Signatures"
            value={sigCount}
            icon={<Hash size={11} strokeWidth={1.5} />}
            ticked={sigTicked}
            color="blue"
          />
          <StatBox
            label="Encryptions"
            value={encCount}
            icon={<Lock size={11} strokeWidth={1.5} />}
            ticked={encTicked}
            color="purple"
          />
          <StatBox
            label="Decryptions"
            value={decCount}
            icon={<Zap size={11} strokeWidth={1.5} />}
            color="cyan"
          />
        </div>
      </div>

      {/* Live Operations */}
      <div className="glass-card rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Activity size={12} strokeWidth={1.5} className="text-blue-400" />
            <h4 className="text-[11px] font-semibold text-[#E2E8F0]">
              Live Operations
            </h4>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse-dot" />
            <span className="text-[9px] text-[#4A5568]">streaming</span>
          </div>
        </div>
        <div className="space-y-1.5">
          {recentOps.map((op, idx) => (
            <div
              key={op.id}
              className={cn(
                "flex items-center justify-between py-1.5 px-2.5 rounded-md",
                "transition-all duration-300",
                idx === 0
                  ? "bg-[rgba(59,130,246,0.08)] border border-[rgba(59,130,246,0.1)]"
                  : "bg-[rgba(160,174,192,0.03)]"
              )}
            >
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-mono text-[#4A5568]">
                  {op.timestamp}
                </span>
                <span
                  className={cn(
                    "text-[9px] px-1.5 py-0.5 rounded font-mono",
                    op.algo.startsWith("RSA")
                      ? "text-blue-400 bg-blue-400/10"
                      : op.algo.startsWith("AES")
                      ? "text-amber-400 bg-amber-400/10"
                      : op.algo.startsWith("EC") || op.algo.startsWith("Ed")
                      ? "text-emerald-400 bg-emerald-400/10"
                      : "text-[#718096] bg-[rgba(160,174,192,0.1)]"
                  )}
                >
                  {op.algo}
                </span>
              </div>
              <span className="text-[9px] font-mono text-[#4A5568]">
                {op.duration}ms
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Key Inventory */}
      <div className="glass-card rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck size={12} strokeWidth={1.5} className="text-blue-400" />
            <h4 className="text-[11px] font-semibold text-[#E2E8F0]">
              Key Inventory
            </h4>
          </div>
          <span className="text-[9px] text-[#4A5568]">3 objects</span>
        </div>
        <div className="space-y-2">
          {[
            { label: "Luvia-Key-Test", type: "RSA-2048", id: "0x01", status: "active" },
            { label: "Luvia-Signing-Key", type: "EC-P256", id: "0x02", status: "active" },
            { label: "Luvia-Backup-Key", type: "AES-256", id: "0x03", status: "standby" },
          ].map((key) => (
            <div
              key={key.id}
              className="flex items-center justify-between py-2 px-2.5 rounded-md bg-[rgba(160,174,192,0.03)] border border-[rgba(160,174,192,0.06)] hover:border-[rgba(160,174,192,0.12)] transition-colors"
            >
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400/70 shrink-0" />
                <div>
                  <p className="text-[10px] font-medium text-[#E2E8F0] leading-tight">
                    {key.label}
                  </p>
                  <p className="text-[9px] font-mono text-[#4A5568] leading-tight mt-0.5">
                    {key.id} · {key.type}
                  </p>
                </div>
              </div>
              <span
                className={cn(
                  "text-[8px] px-1.5 py-0.5 rounded",
                  key.status === "active"
                    ? "text-emerald-400 bg-emerald-400/10"
                    : "text-[#718096] bg-[rgba(160,174,192,0.08)]"
                )}
              >
                {key.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
  mono,
  icon,
  live,
}: {
  label: string;
  value: string;
  mono?: boolean;
  icon?: React.ReactNode;
  live?: boolean;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[8px] uppercase tracking-wider text-[#4A5568]">
        {label}
      </span>
      <div className="flex items-center gap-1">
        {icon}
        <span
          className={cn(
            "text-[10px] text-[#A0AEC0] truncate",
            mono && "font-mono",
            live && "text-emerald-400"
          )}
        >
          {value}
        </span>
      </div>
    </div>
  );
}

function StatBox({
  label,
  value,
  icon,
  ticked,
  color,
}: {
  label: string;
  value: number | null;
  icon: React.ReactNode;
  ticked?: boolean;
  color: "blue" | "purple" | "cyan";
}) {
  const colorMap = {
    blue: "text-blue-400 bg-blue-400/10",
    purple: "text-purple-400 bg-purple-400/10",
    cyan: "text-cyan-400 bg-cyan-400/10",
  };
  const valColorMap = {
    blue: "text-blue-300",
    purple: "text-purple-300",
    cyan: "text-cyan-300",
  };

  return (
    <div className="flex flex-col gap-1.5 p-2.5 rounded-lg bg-[rgba(160,174,192,0.03)] border border-[rgba(160,174,192,0.06)]">
      <div
        className={cn(
          "w-5 h-5 rounded flex items-center justify-center",
          colorMap[color]
        )}
      >
        {icon}
      </div>
      <div
        className={cn(
          "text-[16px] font-bold font-mono tabular-nums leading-none transition-transform duration-200",
          valColorMap[color],
          ticked && "counter-tick"
        )}
      >
        {value !== null ? value.toLocaleString() : "—"}
      </div>
      <p className="text-[8px] text-[#4A5568] uppercase tracking-wider">
        {label}
      </p>
    </div>
  );
}
