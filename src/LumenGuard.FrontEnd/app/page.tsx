"use client";

import { useState } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";
import { VaultExplorer } from "@/components/dashboard/vault-explorer";
import { HsmWidget } from "@/components/dashboard/hsm-widget";
import { AccessLogs } from "@/components/dashboard/access-logs";
import { LumenGuardAudit } from "@/components/dashboard/lumen-guard";
import { EncryptionKeys } from "@/components/dashboard/encryption-keys";

const PAGE_META: Record<
  string,
  { title: string; subtitle: string; hasHsm: boolean }
> = {
  "vault-explorer": {
    title: "Vault Explorer",
    subtitle: "Manage and access your encrypted secrets",
    hasHsm: true,
  },
  "encryption-keys": {
    title: "Encryption Keys (HSM)",
    subtitle: "Hardware-backed cryptographic key management",
    hasHsm: true,
  },
  "access-logs": {
    title: "Access Logs",
    subtitle: "Audit trail of all vault operations",
    hasHsm: false,
  },
  "lumen-guard": {
    title: "Lumen Guard Audit",
    subtitle: "Automated security compliance checks",
    hasHsm: false,
  },
  analytics: {
    title: "Analytics",
    subtitle: "Usage metrics and insights",
    hasHsm: false,
  },
  network: {
    title: "Network Policies",
    subtitle: "Firewall rules and access policies",
    hasHsm: false,
  },
  notifications: {
    title: "Notifications",
    subtitle: "Alerts and notification preferences",
    hasHsm: false,
  },
  settings: {
    title: "Settings",
    subtitle: "Vault configuration and preferences",
    hasHsm: false,
  },
  help: {
    title: "Help & Documentation",
    subtitle: "Guides, API reference, and support",
    hasHsm: false,
  },
};

export default function Dashboard() {
  const [activeSection, setActiveSection] = useState("vault-explorer");

  const meta = PAGE_META[activeSection] ?? PAGE_META["vault-explorer"];

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#0B1D33" }}>
      <Sidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />

      {/* Main content area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header title={meta.title} subtitle={meta.subtitle} />

        {/* Scrollable content + optional side panel */}
        <div className="flex flex-1 overflow-hidden">
          {/* Primary content */}
          <main className="flex-1 overflow-y-auto p-5">
            <PageContent section={activeSection} />
          </main>

          {/* HSM side panel — shown on vault + keys pages on large screens */}
          {meta.hasHsm && (
            <aside className="hidden xl:block w-[280px] shrink-0 overflow-y-auto p-4 border-l border-[rgba(160,174,192,0.08)]">
              <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#4A5568] mb-3">
                Hardware Security Module
              </p>
              <HsmWidget />
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}

function PageContent({ section }: { section: string }) {
  switch (section) {
    case "vault-explorer":
      return <VaultExplorer />;
    case "encryption-keys":
      return <EncryptionKeys />;
    case "access-logs":
      return <AccessLogs />;
    case "lumen-guard":
      return <LumenGuardAudit />;
    default:
      return <ComingSoon section={section} />;
  }
}

function ComingSoon({ section }: { section: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <div className="w-12 h-12 rounded-xl bg-[rgba(59,130,246,0.08)] border border-[rgba(59,130,246,0.15)] flex items-center justify-center">
        <span className="text-blue-400 text-lg font-mono">—</span>
      </div>
      <div className="text-center">
        <p className="text-[13px] font-medium text-[#A0AEC0] capitalize">
          {section.replace(/-/g, " ")}
        </p>
        <p className="text-[11px] text-[#4A5568] mt-1">
          This section is under construction
        </p>
      </div>
    </div>
  );
}
