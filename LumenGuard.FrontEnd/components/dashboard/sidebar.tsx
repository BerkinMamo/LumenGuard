"use client";

import { useState } from "react";
import {
  FolderLock,
  KeyRound,
  ScrollText,
  ShieldCheck,
  ChevronRight,
  Settings,
  Bell,
  BarChart2,
  Globe,
  HelpCircle,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

type NavSection = {
  label: string;
  items: NavItem[];
};

type NavItem = {
  id: string;
  icon: React.ReactNode;
  label: string;
  badge?: string;
  badgeVariant?: "default" | "warning" | "danger";
};

const navSections: NavSection[] = [
  {
    label: "VAULT",
    items: [
      {
        id: "vault-explorer",
        icon: <FolderLock size={15} strokeWidth={1.5} />,
        label: "Vault Explorer",
      },
      {
        id: "encryption-keys",
        icon: <KeyRound size={15} strokeWidth={1.5} />,
        label: "Encryption Keys (HSM)",
        badge: "3",
      },
    ],
  },
  {
    label: "AUDIT & COMPLIANCE",
    items: [
      {
        id: "access-logs",
        icon: <ScrollText size={15} strokeWidth={1.5} />,
        label: "Access Logs",
        badge: "12",
        badgeVariant: "warning",
      },
      {
        id: "lumen-guard",
        icon: <ShieldCheck size={15} strokeWidth={1.5} />,
        label: "Lumen Guard Audit",
      },
    ],
  },
  {
    label: "INFRASTRUCTURE",
    items: [
      {
        id: "analytics",
        icon: <BarChart2 size={15} strokeWidth={1.5} />,
        label: "Analytics",
      },
      {
        id: "network",
        icon: <Globe size={15} strokeWidth={1.5} />,
        label: "Network Policies",
      },
    ],
  },
];

const bottomItems: NavItem[] = [
  {
    id: "notifications",
    icon: <Bell size={15} strokeWidth={1.5} />,
    label: "Notifications",
    badge: "2",
  },
  {
    id: "settings",
    icon: <Settings size={15} strokeWidth={1.5} />,
    label: "Settings",
  },
  {
    id: "help",
    icon: <HelpCircle size={15} strokeWidth={1.5} />,
    label: "Help & Docs",
  },
];

interface SidebarProps {
  activeSection: string;
  onSectionChange: (id: string) => void;
}

export function Sidebar({ activeSection, onSectionChange }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "flex flex-col h-screen transition-all duration-300 ease-in-out shrink-0",
        "border-r border-[rgba(160,174,192,0.08)]",
        collapsed ? "w-[60px]" : "w-[220px]"
      )}
      style={{ background: "#091728" }}
    >
      {/* Logo */}
      <div
        className={cn(
          "flex items-center gap-2.5 px-4 h-14 border-b border-[rgba(160,174,192,0.08)] shrink-0",
          collapsed && "justify-center px-0"
        )}
      >
        <div className="relative flex items-center justify-center w-7 h-7 rounded-md bg-[rgba(59,130,246,0.15)] border border-[rgba(59,130,246,0.3)] shrink-0">
          <Lock size={13} strokeWidth={1.8} className="text-blue-400" />
        </div>
        {!collapsed && (
          <span className="font-semibold text-[13px] tracking-wide text-[#E2E8F0]">
            Luvia<span className="text-blue-400">Vault</span>
          </span>
        )}
        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            className="ml-auto p-0.5 rounded text-[#718096] hover:text-[#A0AEC0] transition-colors"
            aria-label="Collapse sidebar"
          >
            <ChevronRight size={13} strokeWidth={1.5} className="rotate-180" />
          </button>
        )}
      </div>

      {collapsed && (
        <button
          onClick={() => setCollapsed(false)}
          className="mx-auto mt-2 p-1.5 rounded text-[#718096] hover:text-[#A0AEC0] transition-colors"
          aria-label="Expand sidebar"
        >
          <ChevronRight size={13} strokeWidth={1.5} />
        </button>
      )}

      {/* Nav sections */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
        {navSections.map((section) => (
          <div key={section.label}>
            {!collapsed && (
              <p className="px-2 mb-1 text-[9px] font-semibold tracking-[0.12em] text-[#4A5568] uppercase select-none">
                {section.label}
              </p>
            )}
            <ul className="space-y-0.5">
              {section.items.map((item) => (
                <NavItemRow
                  key={item.id}
                  item={item}
                  isActive={activeSection === item.id}
                  collapsed={collapsed}
                  onClick={() => onSectionChange(item.id)}
                />
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* Bottom items */}
      <div className="border-t border-[rgba(160,174,192,0.08)] py-3 px-2 space-y-0.5">
        {bottomItems.map((item) => (
          <NavItemRow
            key={item.id}
            item={item}
            isActive={activeSection === item.id}
            collapsed={collapsed}
            onClick={() => onSectionChange(item.id)}
          />
        ))}
      </div>

      {/* User section */}
      <div
        className={cn(
          "border-t border-[rgba(160,174,192,0.08)] p-3 flex items-center gap-2.5",
          collapsed && "justify-center"
        )}
      >
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shrink-0">
          <span className="text-[10px] font-bold text-white">AK</span>
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-[11px] font-medium text-[#E2E8F0] truncate leading-tight">
              Alex Kim
            </p>
            <p className="text-[9px] text-[#4A5568] truncate leading-tight">
              Super Admin
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}

function NavItemRow({
  item,
  isActive,
  collapsed,
  onClick,
}: {
  item: NavItem;
  isActive: boolean;
  collapsed: boolean;
  onClick: () => void;
}) {
  return (
    <li>
      <button
        onClick={onClick}
        title={collapsed ? item.label : undefined}
        className={cn(
          "w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md text-[12px] transition-all duration-150 group",
          collapsed && "justify-center px-0 py-2",
          isActive
            ? "bg-[rgba(59,130,246,0.12)] text-[#E2E8F0]"
            : "text-[#718096] hover:bg-[rgba(160,174,192,0.06)] hover:text-[#A0AEC0]"
        )}
      >
        <span
          className={cn(
            "shrink-0 transition-colors",
            isActive ? "text-blue-400" : "text-[#4A5568] group-hover:text-[#718096]"
          )}
        >
          {item.icon}
        </span>
        {!collapsed && (
          <>
            <span className="flex-1 text-left truncate leading-none">
              {item.label}
            </span>
            {item.badge && (
              <span
                className={cn(
                  "text-[9px] font-semibold px-1.5 py-0.5 rounded-full shrink-0",
                  item.badgeVariant === "warning"
                    ? "bg-amber-500/15 text-amber-400"
                    : "bg-blue-500/15 text-blue-400"
                )}
              >
                {item.badge}
              </span>
            )}
          </>
        )}
      </button>
    </li>
  );
}
