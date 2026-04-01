"use client";

import { useState, useEffect, useCallback } from "react";
import { Code, Plus, Trash2, Copy, Check, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface ApiKeyEntry {
  id: string;
  name: string;
  keyPrefix: string;
  scopes: string[];
  lastUsedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
}

const SCOPE_LABELS: Record<string, { label: string; color: string }> = {
  read: { label: "Read", color: "bg-blue-100 text-blue-700" },
  write: { label: "Write", color: "bg-green-100 text-green-700" },
  admin: { label: "Admin", color: "bg-amber-100 text-amber-700" },
};

export function ApiKeySettings() {
  const [keys, setKeys] = useState<ApiKeyEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyScopes, setNewKeyScopes] = useState<string[]>(["read", "write"]);
  const [creating, setCreating] = useState(false);
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchKeys = useCallback(async () => {
    try {
      const res = await fetch("/api/keys");
      if (res.ok) {
        const data = await res.json();
        setKeys(data.keys ?? []);
      }
    } catch {
      // Silent fail on load
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchKeys();
  }, [fetchKeys]);

  async function handleCreate() {
    if (!newKeyName.trim()) {
      toast.error("Name is required");
      return;
    }

    setCreating(true);
    try {
      const res = await fetch("/api/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newKeyName.trim(),
          scopes: newKeyScopes,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || "Failed to create API key");
        return;
      }

      const data = await res.json();
      setCreatedKey(data.key);
      setKeys((prev) => [
        {
          id: data.id,
          name: data.name,
          keyPrefix: data.keyPrefix,
          scopes: data.scopes,
          lastUsedAt: null,
          expiresAt: data.expiresAt,
          createdAt: data.createdAt,
        },
        ...prev,
      ]);
      toast.success("API key created");
    } catch {
      toast.error("Failed to create API key");
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(keyId: string) {
    setDeletingId(keyId);
    try {
      const res = await fetch(`/api/keys/${keyId}`, { method: "DELETE" });
      if (res.ok) {
        setKeys((prev) => prev.filter((k) => k.id !== keyId));
        toast.success("API key revoked");
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || "Failed to revoke key");
      }
    } catch {
      toast.error("Failed to revoke key");
    } finally {
      setDeletingId(null);
    }
  }

  function handleCopy(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function toggleScope(scope: string) {
    setNewKeyScopes((prev) =>
      prev.includes(scope)
        ? prev.filter((s) => s !== scope)
        : [...prev, scope]
    );
  }

  function resetCreateDialog() {
    setCreateOpen(false);
    setNewKeyName("");
    setNewKeyScopes(["read", "write"]);
    setCreatedKey(null);
    setCopied(false);
  }

  function formatDate(dateStr: string | null): string {
    if (!dateStr) return "Never";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  return (
    <section className="bg-white rounded-xl border border-[#EBEBEB] p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Code className="w-4 h-4 text-[#737373]" />
          <h2 className="text-sm font-semibold text-[#333333] uppercase tracking-wider">
            Developer API
          </h2>
        </div>
        <Button
          size="sm"
          onClick={() => setCreateOpen(true)}
          className="bg-[#2D6A4F] text-white hover:bg-[#245840] h-8 text-xs"
        >
          <Plus className="w-3.5 h-3.5 mr-1" />
          Create API Key
        </Button>
      </div>

      <p className="text-xs text-[#737373] mb-4">
        Use API keys to access the MyVSL public API programmatically. Keys are hashed and cannot be retrieved after creation.
      </p>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-[#737373]" />
        </div>
      ) : keys.length === 0 ? (
        <div className="text-center py-8 border border-dashed border-[#E5E7EB] rounded-lg">
          <Code className="w-8 h-8 text-[#CCCCCC] mx-auto mb-2" />
          <p className="text-sm text-[#737373]">No API keys yet</p>
          <p className="text-xs text-[#999999] mt-1">
            Create a key to start using the API
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {keys.map((key) => (
            <div
              key={key.id}
              className="flex items-center justify-between p-3 rounded-lg border border-[#E5E7EB] bg-[#FBFBFB]"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-[#333333] truncate">
                    {key.name}
                  </span>
                  <code className="text-xs text-[#737373] bg-gray-100 px-1.5 py-0.5 rounded font-mono">
                    {key.keyPrefix}...
                  </code>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-1">
                    {key.scopes.map((scope) => {
                      const info = SCOPE_LABELS[scope];
                      return (
                        <Badge
                          key={scope}
                          variant="secondary"
                          className={`text-[10px] px-1.5 py-0 ${info?.color ?? "bg-gray-100 text-gray-600"}`}
                        >
                          {info?.label ?? scope}
                        </Badge>
                      );
                    })}
                  </div>
                  <span className="text-[11px] text-[#999999]">
                    Created {formatDate(key.createdAt)}
                  </span>
                  <span className="text-[11px] text-[#999999]">
                    Last used: {formatDate(key.lastUsedAt)}
                  </span>
                  {key.expiresAt && (
                    <span className="text-[11px] text-amber-600">
                      Expires {formatDate(key.expiresAt)}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleDelete(key.id)}
                disabled={deletingId === key.id}
                className="ml-3 p-1.5 text-[#999999] hover:text-red-500 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                title="Revoke key"
              >
                {deletingId === key.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Create API Key Dialog */}
      <Dialog open={createOpen} onOpenChange={(open) => { if (!open) resetCreateDialog(); else setCreateOpen(true); }}>
        <DialogContent showCloseButton>
          {createdKey ? (
            <>
              <DialogHeader>
                <DialogTitle>API Key Created</DialogTitle>
                <DialogDescription>
                  Copy your API key now. It will not be shown again.
                </DialogDescription>
              </DialogHeader>

              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 mb-2">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                  <p className="text-sm text-amber-700 font-medium">
                    This key will only be shown once. Copy it now.
                  </p>
                </div>
              </div>

              <div className="relative">
                <code className="block w-full p-3 pr-12 bg-gray-50 border border-[#E5E7EB] rounded-lg text-xs font-mono break-all text-[#333333]">
                  {createdKey}
                </code>
                <button
                  onClick={() => handleCopy(createdKey)}
                  className="absolute top-2 right-2 p-1.5 rounded hover:bg-gray-200 transition-colors"
                  title="Copy to clipboard"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4 text-[#737373]" />
                  )}
                </button>
              </div>

              <div className="rounded-lg border border-[#E5E7EB] bg-[#FBFBFB] p-3 mt-2">
                <p className="text-xs font-medium text-[#333333] mb-1.5">Usage example:</p>
                <code className="text-[11px] text-[#737373] font-mono break-all leading-relaxed">
                  curl -H &quot;x-api-key: {createdKey.slice(0, 16)}...&quot; https://getmyvsl.com/api/v1/leads?funnelId=...
                </code>
              </div>

              <DialogFooter>
                <Button onClick={resetCreateDialog}>
                  Done
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Create API Key</DialogTitle>
                <DialogDescription>
                  Create a new key to access the MyVSL API programmatically.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-[#333333] block mb-1.5">
                    Name
                  </label>
                  <Input
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    placeholder="e.g. Production Integration"
                    maxLength={50}
                    autoFocus
                  />
                  <p className="text-[11px] text-[#999999] mt-1">
                    A label to help you identify this key
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-[#333333] block mb-1.5">
                    Scopes
                  </label>
                  <div className="flex items-center gap-3">
                    {Object.entries(SCOPE_LABELS).map(([scope, info]) => (
                      <label
                        key={scope}
                        className="flex items-center gap-1.5 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={newKeyScopes.includes(scope)}
                          onChange={() => toggleScope(scope)}
                          className="rounded border-gray-300 text-[#2D6A4F] focus:ring-[#2D6A4F]"
                        />
                        <span className="text-sm text-[#333333]">{info.label}</span>
                      </label>
                    ))}
                  </div>
                  <p className="text-[11px] text-[#999999] mt-1">
                    Read: GET requests. Write: POST/PATCH. Admin: DELETE + manage.
                  </p>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={resetCreateDialog} disabled={creating}>
                  Cancel
                </Button>
                <Button
                  onClick={handleCreate}
                  disabled={creating || !newKeyName.trim() || newKeyScopes.length === 0}
                  className="bg-[#2D6A4F] text-white hover:bg-[#245840]"
                >
                  {creating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Key"
                  )}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
