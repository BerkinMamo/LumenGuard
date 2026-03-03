"use client";

import { useState } from "react";
import {
  Eye,
  EyeOff,
  Plus,
  Copy,
  Trash2,
  MoreHorizontal,
  KeyRound,
  Lock,
  Globe,
  Database,
  Server,
  CreditCard,
  CheckCircle,
  Filter,
  ArrowUpDown,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

type SecretCategory = "API Key" | "Certificate" | "Database" | "SSH Key" | "OAuth" | "Generic";

type Secret = {
  id: string;
  name: string;
  category: SecretCategory;
  environment: "production" | "staging" | "development";
  createdAt: string;
  lastAccessed: string;
  value: string;
  rotationDue?: string;
  tags: string[];
};

const INITIAL_SECRETS: Secret[] = [
  {
    id: "1",
    name: "AWS Root Key",
    category: "API Key",
    environment: "production",
    createdAt: "2024-11-03",
    lastAccessed: "2 hours ago",
    value: "AKIAIOSFODNN7EXAMPLE_secret_key_value_xxxxxxxx",
    rotationDue: "2025-11-03",
    tags: ["aws", "iam", "critical"],
  },
  {
    id: "2",
    name: "PostgreSQL Master Password",
    category: "Database",
    environment: "production",
    createdAt: "2024-10-15",
    lastAccessed: "1 day ago",
    value: "pg_master_P@ssw0rd_vault_secured_9f2a3b",
    tags: ["postgres", "db", "primary"],
  },
  {
    id: "3",
    name: "GitHub Actions Token",
    category: "API Key",
    environment: "staging",
    createdAt: "2025-01-20",
    lastAccessed: "3 hours ago",
    value: "ghp_r3allyLongTokenValueHereXXXXXXXXXXX",
    rotationDue: "2025-07-20",
    tags: ["github", "ci-cd"],
  },
  {
    id: "4",
    name: "TLS Root Certificate",
    category: "Certificate",
    environment: "production",
    createdAt: "2024-08-01",
    lastAccessed: "5 days ago",
    value: "-----BEGIN CERTIFICATE-----\nMIIDXTCCAxSgAwIBAgIJAMXXXXX",
    rotationDue: "2025-08-01",
    tags: ["tls", "ssl", "cert"],
  },
  {
    id: "5",
    name: "Stripe Live Secret Key",
    category: "API Key",
    environment: "production",
    createdAt: "2024-12-01",
    lastAccessed: "30 mins ago",
    value: "sk_live_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    tags: ["stripe", "payments", "critical"],
  },
  {
    id: "6",
    name: "SSH Deploy Key (Prod)",
    category: "SSH Key",
    environment: "production",
    createdAt: "2025-02-10",
    lastAccessed: "12 hours ago",
    value: "-----BEGIN OPENSSH PRIVATE KEY-----\nb3BlbnNzaC1rZXk",
    tags: ["ssh", "deploy", "linux"],
  },
  {
    id: "7",
    name: "Auth0 Client Secret",
    category: "OAuth",
    environment: "staging",
    createdAt: "2025-01-05",
    lastAccessed: "2 days ago",
    value: "auth0_client_secret_XXXXXXXXXXXXXXXXXXX",
    tags: ["auth0", "oauth2", "identity"],
  },
  {
    id: "8",
    name: "Redis Cache Password",
    category: "Database",
    environment: "development",
    createdAt: "2025-02-28",
    lastAccessed: "7 hours ago",
    value: "redis_cache_pass_dev_xxxxxxxxxxxxxxxxxxx",
    tags: ["redis", "cache", "dev"],
  },
];

const categoryIcon: Record<SecretCategory, React.ReactNode> = {
  "API Key": <KeyRound size={12} strokeWidth={1.5} />,
  Certificate: <Lock size={12} strokeWidth={1.5} />,
  Database: <Database size={12} strokeWidth={1.5} />,
  "SSH Key": <Server size={12} strokeWidth={1.5} />,
  OAuth: <Globe size={12} strokeWidth={1.5} />,
  Generic: <CreditCard size={12} strokeWidth={1.5} />,
};

const categoryColor: Record<SecretCategory, string> = {
  "API Key": "text-blue-400 bg-blue-400/10",
  Certificate: "text-purple-400 bg-purple-400/10",
  Database: "text-amber-400 bg-amber-400/10",
  "SSH Key": "text-emerald-400 bg-emerald-400/10",
  OAuth: "text-cyan-400 bg-cyan-400/10",
  Generic: "text-[#718096] bg-[rgba(160,174,192,0.1)]",
};

const envColor: Record<string, string> = {
  production: "text-red-400 bg-red-400/10",
  staging: "text-amber-400 bg-amber-400/10",
  development: "text-emerald-400 bg-emerald-400/10",
};

type NewSecretForm = {
  name: string;
  category: SecretCategory;
  environment: "production" | "staging" | "development";
  value: string;
  tags: string;
};

export function VaultExplorer() {
  const [secrets, setSecrets] = useState<Secret[]>(INITIAL_SECRETS);
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filterEnv, setFilterEnv] = useState<string>("all");
  const [form, setForm] = useState<NewSecretForm>({
    name: "",
    category: "API Key",
    environment: "production",
    value: "",
    tags: "",
  });

  const toggleReveal = (id: string) => {
    setRevealedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleCopy = (id: string, value: string) => {
    navigator.clipboard.writeText(value);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleDelete = (id: string) => {
    setSecrets((prev) => prev.filter((s) => s.id !== id));
  };

  const handleAddSecret = () => {
    if (!form.name || !form.value) return;
    const newSecret: Secret = {
      id: String(Date.now()),
      name: form.name,
      category: form.category,
      environment: form.environment,
      createdAt: new Date().toISOString().split("T")[0],
      lastAccessed: "Just now",
      value: form.value,
      tags: form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    };
    setSecrets((prev) => [newSecret, ...prev]);
    setForm({
      name: "",
      category: "API Key",
      environment: "production",
      value: "",
      tags: "",
    });
    setShowAddModal(false);
  };

  const filtered =
    filterEnv === "all"
      ? secrets
      : secrets.filter((s) => s.environment === filterEnv);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <p className="text-[11px] text-[#718096]">
            {filtered.length} secrets
          </p>
          <div className="flex items-center gap-1">
            {["all", "production", "staging", "development"].map((env) => (
              <button
                key={env}
                onClick={() => setFilterEnv(env)}
                className={cn(
                  "px-2 py-1 text-[10px] rounded-md transition-colors capitalize",
                  filterEnv === env
                    ? "bg-[rgba(59,130,246,0.15)] text-blue-400"
                    : "text-[#4A5568] hover:text-[#718096] hover:bg-[rgba(160,174,192,0.06)]"
                )}
              >
                {env}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[10px] text-[#718096] hover:text-[#A0AEC0] hover:bg-[rgba(160,174,192,0.06)] transition-colors border border-[rgba(160,174,192,0.1)]">
            <Filter size={10} strokeWidth={1.5} />
            Filter
          </button>
          <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[10px] text-[#718096] hover:text-[#A0AEC0] hover:bg-[rgba(160,174,192,0.06)] transition-colors border border-[rgba(160,174,192,0.1)]">
            <ArrowUpDown size={10} strokeWidth={1.5} />
            Sort
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-medium text-white bg-blue-600 hover:bg-blue-500 transition-colors"
          >
            <Plus size={11} strokeWidth={2} />
            Add Secret
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[rgba(160,174,192,0.08)]">
              <th className="text-left px-4 py-2.5 text-[9px] font-semibold tracking-[0.1em] uppercase text-[#4A5568]">
                Name
              </th>
              <th className="text-left px-4 py-2.5 text-[9px] font-semibold tracking-[0.1em] uppercase text-[#4A5568] hidden md:table-cell">
                Category
              </th>
              <th className="text-left px-4 py-2.5 text-[9px] font-semibold tracking-[0.1em] uppercase text-[#4A5568] hidden lg:table-cell">
                Environment
              </th>
              <th className="text-left px-4 py-2.5 text-[9px] font-semibold tracking-[0.1em] uppercase text-[#4A5568] hidden xl:table-cell">
                Created
              </th>
              <th className="text-left px-4 py-2.5 text-[9px] font-semibold tracking-[0.1em] uppercase text-[#4A5568]">
                Secret Value
              </th>
              <th className="text-right px-4 py-2.5 text-[9px] font-semibold tracking-[0.1em] uppercase text-[#4A5568]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((secret, idx) => (
              <SecretRow
                key={secret.id}
                secret={secret}
                isRevealed={revealedIds.has(secret.id)}
                isCopied={copiedId === secret.id}
                isLast={idx === filtered.length - 1}
                onToggleReveal={() => toggleReveal(secret.id)}
                onCopy={() => handleCopy(secret.id, secret.value)}
                onDelete={() => handleDelete(secret.id)}
              />
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-10 h-10 rounded-full bg-[rgba(160,174,192,0.06)] flex items-center justify-center">
              <Lock size={16} strokeWidth={1.2} className="text-[#4A5568]" />
            </div>
            <p className="text-[12px] text-[#4A5568]">No secrets found</p>
          </div>
        )}
      </div>

      {/* Add Secret Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent
          className="max-w-md border-[rgba(160,174,192,0.12)] text-[#E2E8F0]"
          style={{ background: "#0F2442" }}
        >
          <DialogHeader>
            <DialogTitle className="text-[14px] font-semibold text-[#E2E8F0] flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-[rgba(59,130,246,0.15)] border border-[rgba(59,130,246,0.3)] flex items-center justify-center">
                <Plus size={12} strokeWidth={2} className="text-blue-400" />
              </div>
              Add New Secret
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <FormField label="Secret Name" required>
              <input
                type="text"
                placeholder="e.g. AWS Root Key"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full px-3 py-2 text-[12px] rounded-md bg-[rgba(160,174,192,0.06)] border border-[rgba(160,174,192,0.12)] text-[#E2E8F0] placeholder:text-[#4A5568] focus:outline-none focus:border-[rgba(59,130,246,0.4)]"
              />
            </FormField>

            <div className="grid grid-cols-2 gap-3">
              <FormField label="Category">
                <select
                  value={form.category}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      category: e.target.value as SecretCategory,
                    }))
                  }
                  className="w-full px-3 py-2 text-[12px] rounded-md bg-[rgba(160,174,192,0.06)] border border-[rgba(160,174,192,0.12)] text-[#E2E8F0] focus:outline-none focus:border-[rgba(59,130,246,0.4)]"
                >
                  {Object.keys(categoryIcon).map((c) => (
                    <option key={c} value={c} style={{ background: "#0F2442" }}>
                      {c}
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField label="Environment">
                <select
                  value={form.environment}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      environment: e.target.value as typeof form.environment,
                    }))
                  }
                  className="w-full px-3 py-2 text-[12px] rounded-md bg-[rgba(160,174,192,0.06)] border border-[rgba(160,174,192,0.12)] text-[#E2E8F0] focus:outline-none focus:border-[rgba(59,130,246,0.4)]"
                >
                  <option value="production" style={{ background: "#0F2442" }}>Production</option>
                  <option value="staging" style={{ background: "#0F2442" }}>Staging</option>
                  <option value="development" style={{ background: "#0F2442" }}>Development</option>
                </select>
              </FormField>
            </div>

            <FormField label="Secret Value" required>
              <textarea
                placeholder="Paste your secret value here..."
                value={form.value}
                onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 text-[11px] font-mono rounded-md bg-[rgba(160,174,192,0.06)] border border-[rgba(160,174,192,0.12)] text-[#E2E8F0] placeholder:text-[#4A5568] focus:outline-none focus:border-[rgba(59,130,246,0.4)] resize-none"
              />
            </FormField>

            <FormField label="Tags (comma-separated)">
              <input
                type="text"
                placeholder="e.g. aws, iam, critical"
                value={form.tags}
                onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
                className="w-full px-3 py-2 text-[12px] rounded-md bg-[rgba(160,174,192,0.06)] border border-[rgba(160,174,192,0.12)] text-[#E2E8F0] placeholder:text-[#4A5568] focus:outline-none focus:border-[rgba(59,130,246,0.4)]"
              />
            </FormField>

            <div className="flex items-center gap-2 p-3 rounded-md bg-[rgba(16,185,129,0.05)] border border-[rgba(16,185,129,0.15)]">
              <Lock size={11} strokeWidth={1.5} className="text-emerald-400 shrink-0" />
              <p className="text-[10px] text-emerald-400/80 leading-relaxed">
                Encrypted with AES-256-GCM via SoftHSM before storage.
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2 pt-2">
            <button
              onClick={() => setShowAddModal(false)}
              className="px-4 py-2 text-[11px] rounded-md text-[#718096] hover:text-[#A0AEC0] hover:bg-[rgba(160,174,192,0.06)] transition-colors border border-[rgba(160,174,192,0.1)]"
            >
              Cancel
            </button>
            <button
              onClick={handleAddSecret}
              disabled={!form.name || !form.value}
              className="px-4 py-2 text-[11px] rounded-md font-medium text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Store Secret
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SecretRow({
  secret,
  isRevealed,
  isCopied,
  isLast,
  onToggleReveal,
  onCopy,
  onDelete,
}: {
  secret: Secret;
  isRevealed: boolean;
  isCopied: boolean;
  isLast: boolean;
  onToggleReveal: () => void;
  onCopy: () => void;
  onDelete: () => void;
}) {
  return (
    <tr
      className={cn(
        "group transition-colors hover:bg-[rgba(59,130,246,0.03)]",
        !isLast && "border-b border-[rgba(160,174,192,0.06)]"
      )}
    >
      {/* Name */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              "w-5 h-5 rounded flex items-center justify-center shrink-0",
              categoryColor[secret.category]
            )}
          >
            {categoryIcon[secret.category]}
          </div>
          <div className="min-w-0">
            <p className="text-[12px] font-medium text-[#E2E8F0] truncate leading-tight">
              {secret.name}
            </p>
            <div className="flex items-center gap-1 mt-0.5 flex-wrap">
              {secret.tags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="text-[8px] px-1 py-0.5 rounded bg-[rgba(160,174,192,0.06)] text-[#4A5568] font-mono"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </td>

      {/* Category */}
      <td className="px-4 py-3 hidden md:table-cell">
        <span
          className={cn(
            "inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded",
            categoryColor[secret.category]
          )}
        >
          {categoryIcon[secret.category]}
          {secret.category}
        </span>
      </td>

      {/* Environment */}
      <td className="px-4 py-3 hidden lg:table-cell">
        <span
          className={cn(
            "inline-block text-[10px] px-2 py-0.5 rounded capitalize",
            envColor[secret.environment]
          )}
        >
          {secret.environment}
        </span>
      </td>

      {/* Created */}
      <td className="px-4 py-3 hidden xl:table-cell">
        <div>
          <p className="text-[11px] text-[#718096] font-mono">{secret.createdAt}</p>
          <p className="text-[9px] text-[#4A5568] mt-0.5">
            Accessed {secret.lastAccessed}
          </p>
        </div>
      </td>

      {/* Secret value */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2 max-w-[240px]">
          <div className="flex-1 min-w-0">
            {isRevealed ? (
              <code className="text-[10px] font-mono text-[#A0AEC0] truncate block">
                {secret.value}
              </code>
            ) : (
              <div className="flex items-center gap-1">
                <div className="h-2 w-24 rounded bg-[rgba(160,174,192,0.12)] overflow-hidden">
                  <div className="h-full w-full bg-[repeating-linear-gradient(90deg,rgba(160,174,192,0.2)_0px,rgba(160,174,192,0.2)_4px,transparent_4px,transparent_8px)]" />
                </div>
                <span className="text-[9px] text-[#4A5568]">encrypted</span>
              </div>
            )}
          </div>
          <button
            onClick={onToggleReveal}
            className="p-1 rounded text-[#4A5568] hover:text-[#A0AEC0] hover:bg-[rgba(160,174,192,0.06)] transition-colors shrink-0"
            title={isRevealed ? "Hide value" : "Reveal value"}
          >
            {isRevealed ? (
              <EyeOff size={11} strokeWidth={1.5} />
            ) : (
              <Eye size={11} strokeWidth={1.5} />
            )}
          </button>
        </div>
      </td>

      {/* Actions */}
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={onCopy}
            className="p-1.5 rounded text-[#4A5568] hover:text-[#A0AEC0] hover:bg-[rgba(160,174,192,0.06)] transition-colors"
            title="Copy secret"
          >
            {isCopied ? (
              <CheckCircle size={12} strokeWidth={1.5} className="text-emerald-400" />
            ) : (
              <Copy size={12} strokeWidth={1.5} />
            )}
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-1.5 rounded text-[#4A5568] hover:text-[#A0AEC0] hover:bg-[rgba(160,174,192,0.06)] transition-colors">
                <MoreHorizontal size={12} strokeWidth={1.5} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-40 border-[rgba(160,174,192,0.12)]"
              style={{ background: "#0F2442" }}
            >
              <DropdownMenuItem className="text-[11px] text-[#A0AEC0] focus:text-[#E2E8F0] focus:bg-[rgba(59,130,246,0.1)] cursor-pointer gap-2">
                <RefreshCw size={11} strokeWidth={1.5} />
                Rotate Secret
              </DropdownMenuItem>
              <DropdownMenuItem className="text-[11px] text-[#A0AEC0] focus:text-[#E2E8F0] focus:bg-[rgba(59,130,246,0.1)] cursor-pointer gap-2">
                <KeyRound size={11} strokeWidth={1.5} />
                View Versions
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-[rgba(160,174,192,0.08)]" />
              <DropdownMenuItem
                onClick={onDelete}
                className="text-[11px] text-red-400 focus:text-red-300 focus:bg-[rgba(239,68,68,0.1)] cursor-pointer gap-2"
              >
                <Trash2 size={11} strokeWidth={1.5} />
                Delete Secret
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </td>
    </tr>
  );
}

function FormField({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[10px] font-medium text-[#718096] uppercase tracking-wider">
        {label}
        {required && <span className="text-blue-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}
