"use client";

import { useState } from "react";
import { KeyRound, Plus, RefreshCw, Copy, CheckCircle, Info, Lock, Unlock, Cpu } from "lucide-react";
import { cn } from "@/lib/utils";

type KeyEntry = {
  id: string;
  name: string;
  algorithm: string;
  keySize: number;
  hsmBacked: boolean;
  created: string;
  expires: string;
  status: "active" | "rotating" | "archived";
  usage: number;
  fingerprint: string;
};

const KEYS: KeyEntry[] = [
  { id: "1", name: "Luvia-Key-Test", algorithm: "RSA", keySize: 2048, hsmBacked: true, created: "2024-08-01", expires: "2025-08-01", status: "active", usage: 4827, fingerprint: "SHA256:xK9mN2pQ7rS1tU3vW5yZ8aC0bD4eF6gH" },
  { id: "2", name: "Luvia-Signing-Key", algorithm: "EC", keySize: 256, hsmBacked: true, created: "2024-10-15", expires: "2025-10-15", status: "active", usage: 1241, fingerprint: "SHA256:jL1nM3oP5qR7sT9uV0wX2yZ4aB6cD8eF" },
  { id: "3", name: "Luvia-Backup-Key", algorithm: "AES", keySize: 256, hsmBacked: true, created: "2025-01-01", expires: "2026-01-01", status: "active", usage: 98, fingerprint: "SHA256:kM2nO4pQ6rS8tU0vW1xY3zA5bC7dE9fG" },
];

const statusConfig = {
  active: { color: "text-emerald-400", bg: "bg-emerald-400/10" },
  rotating: { color: "text-amber-400", bg: "bg-amber-400/10" },
  archived: { color: "text-[#718096]", bg: "bg-[rgba(160,174,192,0.1)]" },
};

const algoColor: Record<string, string> = {
  RSA: "text-blue-400 bg-blue-400/10",
  EC: "text-emerald-400 bg-emerald-400/10",
  AES: "text-purple-400 bg-purple-400/10",
  Ed25519: "text-cyan-400 bg-cyan-400/10",
};

export function EncryptionKeys() {
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="space-y-4">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[rgba(59,130,246,0.1)] border border-[rgba(59,130,246,0.2)] flex items-center justify-center">
            <Cpu size={13} strokeWidth={1.5} className="text-blue-400" />
          </div>
          <div>
            <p className="text-[12px] font-semibold text-[#E2E8F0] leading-tight">SoftHSM Slot 290060222</p>
            <p className="text-[9px] text-[#4A5568] leading-tight font-mono">Label: Luvia-Key-Test · PKCS#11 v2.40</p>
          </div>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-medium text-white bg-blue-600 hover:bg-blue-500 transition-colors">
          <Plus size={11} strokeWidth={2} />
          Generate Key
        </button>
      </div>

      {/* Key cards */}
      <div className="space-y-3">
        {KEYS.map((key) => (
          <div key={key.id} className="glass-card rounded-lg p-4 hover:glass-card-hover transition-all">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[rgba(59,130,246,0.08)] border border-[rgba(59,130,246,0.15)] flex items-center justify-center shrink-0">
                  <KeyRound size={14} strokeWidth={1.5} className="text-blue-400" />
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-[#E2E8F0] leading-tight">{key.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={cn("text-[9px] px-1.5 py-0.5 rounded font-mono", algoColor[key.algorithm] || "text-[#718096] bg-[rgba(160,174,192,0.1)]")}>
                      {key.algorithm}-{key.keySize}
                    </span>
                    {key.hsmBacked && (
                      <span className="flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded bg-[rgba(16,185,129,0.08)] text-emerald-400">
                        <Cpu size={8} strokeWidth={1.5} />
                        HSM
                      </span>
                    )}
                    <span className={cn("text-[9px] px-1.5 py-0.5 rounded capitalize", statusConfig[key.status].bg, statusConfig[key.status].color)}>
                      {key.status}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => handleCopy(key.id, key.fingerprint)}
                  className="p-1.5 rounded text-[#4A5568] hover:text-[#A0AEC0] hover:bg-[rgba(160,174,192,0.06)] transition-colors"
                  title="Copy fingerprint"
                >
                  {copied === key.id ? <CheckCircle size={12} strokeWidth={1.5} className="text-emerald-400" /> : <Copy size={12} strokeWidth={1.5} />}
                </button>
                <button className="p-1.5 rounded text-[#4A5568] hover:text-amber-400 hover:bg-[rgba(245,158,11,0.06)] transition-colors" title="Rotate key">
                  <RefreshCw size={12} strokeWidth={1.5} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
              <KeyStat label="Key Usage" value={key.usage.toLocaleString()} suffix="ops" />
              <KeyStat label="Created" value={key.created} mono />
              <KeyStat label="Expires" value={key.expires} mono highlight={key.expires < "2025-09-01"} />
              <KeyStat label="Fingerprint" value={key.fingerprint.slice(0, 16) + "..."} mono />
            </div>

            {/* Usage bar */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[9px] text-[#4A5568]">Key utilization</span>
                <span className="text-[9px] font-mono text-[#4A5568]">{Math.min(key.usage / 60, 100).toFixed(0)}%</span>
              </div>
              <div className="h-1 rounded-full bg-[rgba(160,174,192,0.08)] overflow-hidden">
                <div
                  className="h-full rounded-full bg-blue-500/60"
                  style={{ width: `${Math.min(key.usage / 60, 100)}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function KeyStat({ label, value, mono, suffix, highlight }: { label: string; value: string; mono?: boolean; suffix?: string; highlight?: boolean }) {
  return (
    <div>
      <p className="text-[8px] uppercase tracking-wider text-[#4A5568] mb-0.5">{label}</p>
      <p className={cn("text-[10px]", mono && "font-mono", highlight ? "text-amber-400" : "text-[#A0AEC0]")}>
        {value}{suffix && <span className="text-[#4A5568] ml-0.5">{suffix}</span>}
      </p>
    </div>
  );
}
