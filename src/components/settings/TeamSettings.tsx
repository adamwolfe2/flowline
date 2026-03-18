"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Users, Plus, Loader2, Mail } from "lucide-react";
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

interface Team {
  id: string;
  name: string;
  ownerId: string;
  role: string;
}

export function TeamSettings() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [invites, setInvites] = useState<TeamInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [teamName, setTeamName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
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
      .catch((err) => {
        console.error("Failed to load teams:", err);
        setLoading(false);
      });
  }, []);

  async function loadMembers(teamId: string) {
    try {
      const res = await fetch(`/api/teams/${teamId}/members`);
      const data = await res.json();
      setMembers(data.members || []);
      setInvites(data.invites || []);
    } catch (err) {
      console.error("Failed to load team members:", err);
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
        body: JSON.stringify({ email: inviteEmail, role: "member" }),
      });
      if (res.ok) {
        const invite = await res.json();
        setInvites(prev => [...prev, invite]);
        setInviteEmail("");
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
              <Button onClick={sendInvite} disabled={inviting || !inviteEmail.trim()} variant="outline" size="sm" className="gap-1.5">
                {inviting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Mail className="w-3.5 h-3.5" />}
                Invite
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
