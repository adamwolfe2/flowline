"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Users, Plus, Loader2, Mail, Palette, Upload, Eye } from "lucide-react";
import { toast } from "sonner";

interface TeamMember {
  id: string;
  userId: string;
  email: string;
  role: string;
  joinedAt: string;
}

interface TeamInvite {
  id: string;
  email: string;
  role: string;
  createdAt: string;
}

interface TeamBranding {
  logoUrl?: string;
  logoWidth?: number;
  primaryColor?: string;
  appName?: string;
  faviconUrl?: string;
}

interface Team {
  id: string;
  name: string;
  ownerId: string;
  role: string;
}

interface TeamDetail {
  id: string;
  name: string;
  ownerId: string;
  branding: TeamBranding | null;
  createdAt: string;
}

const HEX_COLOR_REGEX = /^#[0-9a-fA-F]{6}$/;

function BrandingSection({ teamId }: { teamId: string }) {
  const [branding, setBranding] = useState<TeamBranding>({});
  const [appName, setAppName] = useState("");
  const [primaryColor, setPrimaryColor] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    async function fetchTeam() {
      try {
        const res = await fetch(`/api/teams/${teamId}`);
        if (res.ok) {
          const data: TeamDetail = await res.json();
          const b = data.branding || {};
          setBranding(b);
          setAppName(b.appName || "");
          setPrimaryColor(b.primaryColor || "");
        }
      } catch {
        toast.error("Failed to load team branding");
      }
      setLoading(false);
    }
    fetchTeam();
  }, [teamId]);

  const saveBranding = useCallback(
    async (updated: TeamBranding) => {
      setSaving(true);
      try {
        const res = await fetch(`/api/teams/${teamId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ branding: updated }),
        });
        if (res.ok) {
          const data = await res.json();
          setBranding(data.branding || {});
          toast.success("Branding saved");
        } else {
          const err = await res.json();
          toast.error(err.error || "Failed to save branding");
        }
      } catch {
        toast.error("Failed to save branding");
      }
      setSaving(false);
    },
    [teamId]
  );

  const debouncedSave = useCallback(
    (updated: TeamBranding) => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      saveTimeoutRef.current = setTimeout(() => {
        saveBranding(updated);
      }, 800);
    },
    [saveBranding]
  );

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await fetch("/api/upload/logo", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) {
        const err = await uploadRes.json();
        toast.error(err.error || "Upload failed");
        setUploading(false);
        return;
      }

      const { url } = await uploadRes.json();
      const updated = { ...branding, logoUrl: url };
      setBranding(updated);
      await saveBranding(updated);
    } catch {
      toast.error("Upload failed");
    }
    setUploading(false);
    // Reset file input so the same file can be re-selected
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function handleAppNameBlur() {
    const trimmed = appName.trim();
    if (trimmed === (branding.appName || "")) return;
    const updated = { ...branding, appName: trimmed || undefined };
    setBranding(updated);
    saveBranding(updated);
  }

  function handleColorChange(value: string) {
    setPrimaryColor(value);
    if (HEX_COLOR_REGEX.test(value)) {
      const updated = { ...branding, primaryColor: value };
      setBranding(updated);
      debouncedSave(updated);
    }
  }

  function handleColorInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setPrimaryColor(value);
    if (HEX_COLOR_REGEX.test(value)) {
      const updated = { ...branding, primaryColor: value };
      setBranding(updated);
      debouncedSave(updated);
    }
  }

  const displayColor = branding.primaryColor || "#2D6A4F";
  const displayName = branding.appName || "MyVSL";

  if (loading) {
    return (
      <div className="flex items-center justify-center py-6">
        <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <section className="bg-white rounded-xl border border-[#EBEBEB] p-6 mb-6">
      <div className="flex items-center gap-2 mb-1">
        <Palette className="w-4 h-4 text-[#737373]" />
        <h2 className="text-sm font-semibold text-[#333333] uppercase tracking-wider">
          White-Label Branding
        </h2>
        {saving && <Loader2 className="w-3 h-3 animate-spin text-gray-400 ml-auto" />}
      </div>
      <p className="text-xs text-[#A3A3A3] mb-5">
        Customize how the platform looks for your team
      </p>

      <div className="space-y-5">
        {/* Logo Upload */}
        <div>
          <Label className="text-xs font-medium text-gray-700 mb-2 block">Logo</Label>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-lg border border-[#E5E7EB] bg-gray-50 flex items-center justify-center overflow-hidden flex-shrink-0">
              {branding.logoUrl ? (
                <img
                  src={branding.logoUrl}
                  alt="Team logo"
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <Upload className="w-5 h-5 text-gray-300" />
              )}
            </div>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/svg+xml,image/webp,image/gif"
                onChange={handleLogoUpload}
                className="hidden"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="gap-1.5"
              >
                {uploading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Upload className="w-3.5 h-3.5" />
                )}
                {branding.logoUrl ? "Change Logo" : "Upload Logo"}
              </Button>
              <p className="text-[10px] text-[#A3A3A3] mt-1">PNG, JPG, SVG, or WebP. Max 2MB.</p>
            </div>
          </div>
        </div>

        {/* App Name */}
        <div>
          <Label className="text-xs font-medium text-gray-700 mb-2 block">App Name</Label>
          <Input
            value={appName}
            onChange={(e) => setAppName(e.target.value)}
            onBlur={handleAppNameBlur}
            placeholder="Your Agency Name"
            className="text-sm max-w-xs"
            maxLength={50}
          />
        </div>

        {/* Primary Color */}
        <div>
          <Label className="text-xs font-medium text-gray-700 mb-2 block">Primary Color</Label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={HEX_COLOR_REGEX.test(primaryColor) ? primaryColor : "#2D6A4F"}
              onChange={handleColorInputChange}
              className="w-9 h-9 rounded border border-[#E5E7EB] cursor-pointer p-0.5"
            />
            <Input
              value={primaryColor}
              onChange={(e) => handleColorChange(e.target.value)}
              placeholder="#2D6A4F"
              className="text-sm w-32 font-mono"
              maxLength={7}
            />
            {primaryColor && !HEX_COLOR_REGEX.test(primaryColor) && (
              <span className="text-xs text-red-500">Invalid hex color</span>
            )}
          </div>
        </div>

        {/* Preview */}
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <Eye className="w-3.5 h-3.5 text-[#737373]" />
            <Label className="text-xs font-medium text-gray-700">Preview</Label>
          </div>
          <div
            className="rounded-lg border border-[#E5E7EB] overflow-hidden"
          >
            <div
              className="flex items-center gap-3 px-4 py-3"
              style={{ backgroundColor: displayColor }}
            >
              {branding.logoUrl ? (
                <img
                  src={branding.logoUrl}
                  alt="Logo preview"
                  className="h-7 w-auto object-contain"
                  style={{ maxWidth: branding.logoWidth || 120 }}
                />
              ) : (
                <div className="w-7 h-7 rounded bg-white/20 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">
                    {displayName.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <span className="text-sm font-semibold text-white">{displayName}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function TeamSettings() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [invites, setInvites] = useState<TeamInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [teamName, setTeamName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "member">("member");
  const [creating, setCreating] = useState(false);
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    fetch("/api/teams")
      .then(r => r.json())
      .then(data => {
        const teamList = Array.isArray(data) ? data : [];
        setTeams(teamList);
        if (teamList.length > 0) {
          loadMembers(teamList[0].id);
        } else {
          setLoading(false);
        }
      })
      .catch(() => {
        toast.error("Failed to load teams");
        setLoading(false);
      });
  }, []);

  async function loadMembers(teamId: string) {
    try {
      const res = await fetch(`/api/teams/${teamId}/members`);
      const data = await res.json();
      setMembers(data.members || []);
      setInvites(data.invites || []);
    } catch {
      toast.error("Failed to load team members");
    }
    setLoading(false);
  }

  async function createTeam() {
    if (!teamName.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: teamName }),
      });
      if (res.ok) {
        const team = await res.json();
        setTeams([{ ...team, role: "owner" }]);
        setTeamName("");
        loadMembers(team.id);
        toast.success("Team created");
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to create team");
      }
    } catch {
      toast.error("Failed to create team");
    }
    setCreating(false);
  }

  async function sendInvite() {
    if (!inviteEmail.trim() || teams.length === 0) return;
    setInviting(true);
    try {
      const res = await fetch(`/api/teams/${teams[0].id}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      });
      if (res.ok) {
        const invite = await res.json();
        setInvites(prev => [...prev, invite]);
        setInviteEmail("");
        setInviteRole("member");
        toast.success("Invite sent");
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to send invite");
      }
    } catch {
      toast.error("Failed to send invite");
    }
    setInviting(false);
  }

  const roleBadge = (role: string) => {
    const styles: Record<string, string> = {
      owner: "bg-purple-100 text-purple-700",
      admin: "bg-blue-100 text-blue-700",
      member: "bg-gray-100 text-gray-600",
    };
    return (
      <Badge className={`text-[10px] ${styles[role] || styles.member}`}>
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <>
      <section className="bg-white rounded-xl border border-[#EBEBEB] p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-4 h-4 text-[#737373]" />
          <h2 className="text-sm font-semibold text-[#333333] uppercase tracking-wider">
            Team
          </h2>
        </div>

        {teams.length === 0 ? (
          <div>
            <p className="text-sm text-[#737373] mb-3">
              Create a team to collaborate on funnels with your team members.
            </p>
            <div className="flex gap-2">
              <Input
                value={teamName}
                onChange={e => setTeamName(e.target.value)}
                placeholder="Team name"
                className="text-sm flex-1"
                maxLength={50}
              />
              <Button onClick={createTeam} disabled={creating || !teamName.trim()} size="sm" className="gap-1.5">
                {creating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                Create
              </Button>
            </div>
            <p className="text-xs text-[#A3A3A3] mt-2">
              Requires Agency plan.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <Label className="text-xs text-[#737373] mb-2 block">Team: {teams[0].name}</Label>

              {/* Members list */}
              <div className="space-y-2 mb-4">
                {members.map(m => (
                  <div key={m.id} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-[#333333]">{m.email}</span>
                      {roleBadge(m.role)}
                    </div>
                  </div>
                ))}
                {invites.map(inv => (
                  <div key={inv.id} className="flex items-center justify-between py-2 px-3 bg-amber-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Mail className="w-3 h-3 text-amber-500" />
                      <span className="text-sm text-amber-700">{inv.email}</span>
                      <Badge className="text-[10px] bg-amber-100 text-amber-600">Pending</Badge>
                      {roleBadge(inv.role)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Invite form */}
              <div className="flex gap-2">
                <Input
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  placeholder="colleague@company.com"
                  type="email"
                  className="text-sm flex-1"
                />
                <select
                  value={inviteRole}
                  onChange={e => setInviteRole(e.target.value as "admin" | "member")}
                  className="text-sm rounded-md border border-input bg-background px-2 py-1.5 text-[#333333] focus:outline-none focus:ring-1 focus:ring-[#2D6A4F]"
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
                <Button onClick={sendInvite} disabled={inviting || !inviteEmail.trim()} variant="outline" size="sm" className="gap-1.5">
                  {inviting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Mail className="w-3.5 h-3.5" />}
                  Invite
                </Button>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* White-Label Branding — only shown when a team exists */}
      {teams.length > 0 && <BrandingSection teamId={teams[0].id} />}
    </>
  );
}
