"use client";

import { useState, useEffect } from "react";
import { Funnel, FunnelConfig } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2, FlaskConical, Loader2, Trophy, Info } from "lucide-react";
import { toast } from "sonner";

export interface Variant {
  id: string;
  name: string;
  config: FunnelConfig;
  trafficWeight: number;
  isControl: boolean;
  active: boolean;
}

interface VariantStats {
  conversions: number;
  sessions: number;
}

interface ABTestEditorProps {
  funnel: Funnel;
  onVariantsChange?: (variants: Variant[]) => void;
  variantStats?: Record<string, VariantStats>;
}

interface WinnerConfirmState {
  variantId: string;
  variantName: string;
}

export function ABTestEditor({ funnel, onVariantsChange, variantStats }: ABTestEditorProps) {
  const [variants, setVariants] = useState<Variant[]>([]);
  const [loading, setLoading] = useState(true);
  const [winnerConfirm, setWinnerConfirm] = useState<WinnerConfirmState | null>(null);
  const [declaringWinner, setDeclaringWinner] = useState(false);

  useEffect(() => {
    fetch(`/api/funnels/${funnel.id}/variants`)
      .then(r => r.json())
      .then(data => {
        setVariants(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => { setLoading(false); toast.error("Failed to load variants"); });
  }, [funnel.id]);

  async function createVariant() {
    try {
      const res = await fetch(`/api/funnels/${funnel.id}/variants`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `Variant ${String.fromCharCode(65 + variants.length)}`,
          config: funnel.config,
          trafficWeight: 50,
        }),
      });
      if (res.ok) {
        const variant = await res.json();
        const newVariants = [...variants, variant];
        setVariants(newVariants);
        onVariantsChange?.(newVariants);
        toast.success("Variant created");
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to create variant");
      }
    } catch {
      toast.error("Failed to create variant");
    }
  }

  async function updateVariant(variantId: string, updates: Partial<Variant>) {
    try {
      const res = await fetch(`/api/funnels/${funnel.id}/variants/${variantId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const updated = await res.json();
        const newVariants = variants.map(v => v.id === variantId ? updated : v);
        setVariants(newVariants);
        onVariantsChange?.(newVariants);
      }
    } catch {
      toast.error("Failed to update variant");
    }
  }

  async function deleteVariant(variantId: string) {
    try {
      const res = await fetch(`/api/funnels/${funnel.id}/variants/${variantId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        const newVariants = variants.filter(v => v.id !== variantId);
        setVariants(newVariants);
        onVariantsChange?.(newVariants);
        toast.success("Variant deleted");
      }
    } catch {
      toast.error("Failed to delete variant");
    }
  }

  async function declareWinner(variantId: string) {
    setDeclaringWinner(true);
    try {
      // Pause all other non-control variants
      const otherVariants = variants.filter(v => v.id !== variantId && !v.isControl && v.active);
      await Promise.all(
        otherVariants.map(v =>
          fetch(`/api/funnels/${funnel.id}/variants/${v.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ active: false }),
          })
        )
      );

      // Update local state: pause all others except winner
      const newVariants = variants.map(v => {
        if (v.id === variantId || v.isControl) return v;
        return { ...v, active: false };
      });
      setVariants(newVariants);
      onVariantsChange?.(newVariants);

      setWinnerConfirm(null);
      toast.success("Winner declared! Apply this variant's config to your funnel in the Content editor.");
    } catch {
      toast.error("Failed to declare winner");
    } finally {
      setDeclaringWinner(false);
    }
  }

  const variantTotalWeight = variants.reduce((sum, v) => sum + v.trafficWeight, 0);
  const totalWeightIncludingControl = variantTotalWeight + 100;

  function trafficPercent(weight: number): number {
    return Math.round((weight / totalWeightIncludingControl) * 100);
  }

  const hasLowConversions = variants.some(v => {
    const stats = variantStats?.[v.id];
    return !stats || stats.conversions < 50;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Winner confirmation dialog */}
      {winnerConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full mx-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-yellow-50 flex items-center justify-center flex-shrink-0">
                <Trophy className="w-5 h-5 text-yellow-500" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900">Declare Winner?</h3>
            </div>
            <p className="text-xs text-gray-600 mb-4 leading-relaxed">
              Declare <span className="font-medium text-gray-900">{winnerConfirm.variantName}</span> as winner?
              This will pause all other variants. The winning config will be applied to your main funnel.
            </p>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => setWinnerConfirm(null)}
                disabled={declaringWinner}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="text-xs bg-yellow-500 hover:bg-yellow-600 text-white border-0"
                onClick={() => declareWinner(winnerConfirm.variantId)}
                disabled={declaringWinner}
              >
                {declaringWinner ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <>
                    <Trophy className="w-3.5 h-3.5 mr-1" />
                    Declare Winner
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
        <p className="text-xs text-blue-700 font-medium mb-1">A/B Testing</p>
        <p className="text-[11px] text-blue-600 leading-relaxed">
          Create variants of your funnel to test different headlines, questions, or layouts.
          Traffic is split based on weights you set.
        </p>
      </div>

      {variants.length === 0 ? (
        <div className="text-center py-6">
          <FlaskConical className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-500 mb-1">No variants yet</p>
          <p className="text-xs text-gray-400 mb-4">
            Your current funnel config serves as the control. Create a variant to start testing.
          </p>
          <Button onClick={createVariant} size="sm" className="gap-1.5">
            <Plus className="w-3.5 h-3.5" />
            Create First Variant
          </Button>
        </div>
      ) : (
        <>
          {/* Control (original) */}
          <div className="p-3 bg-green-50 border border-green-100 rounded-lg">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-green-800">Control (Original)</span>
                <Badge variant="secondary" className="text-[10px]">
                  {variants.length > 0 ? `${trafficPercent(100)}%` : "100%"}
                </Badge>
              </div>
            </div>
            <p className="text-[10px] text-green-600">
              Your current funnel configuration. Always active.
            </p>
          </div>

          <Separator />

          {/* Variants */}
          <div className="space-y-3">
            {variants.map((variant) => {
              const stats = variantStats?.[variant.id];
              const conversionRate = stats && stats.sessions > 0
                ? ((stats.conversions / stats.sessions) * 100).toFixed(1)
                : null;

              return (
                <div key={variant.id} className="p-3 border border-gray-100 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <Input
                      value={variant.name}
                      onChange={e => updateVariant(variant.id, { name: e.target.value })}
                      className="text-xs font-medium h-7 w-40"
                    />
                    <div className="flex items-center gap-2">
                      <Badge variant={variant.active ? "default" : "secondary"} className="text-[10px]">
                        {variant.active ? "Active" : "Paused"}
                      </Badge>
                      <button
                        onClick={() => deleteVariant(variant.id)}
                        className="p-1 text-gray-300 hover:text-red-400 transition-colors"
                        aria-label="Delete variant"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <Label className="text-[10px] text-gray-400">Traffic Weight</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Input
                          type="number"
                          value={variant.trafficWeight}
                          onChange={e => updateVariant(variant.id, { trafficWeight: parseInt(e.target.value) || 0 })}
                          className="text-xs w-16 h-7"
                          min={0}
                          max={100}
                        />
                        <span className="text-[10px] text-gray-400">
                          ~{trafficPercent(variant.trafficWeight)}% of traffic
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-[10px] h-7"
                        onClick={() => updateVariant(variant.id, { active: !variant.active })}
                      >
                        {variant.active ? "Pause" : "Activate"}
                      </Button>
                      {!variant.isControl && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-[10px] h-7 gap-1 border-yellow-200 text-yellow-700 hover:bg-yellow-50"
                          onClick={() => setWinnerConfirm({ variantId: variant.id, variantName: variant.name })}
                        >
                          <Trophy className="w-3 h-3" />
                          Winner
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Stats row */}
                  <div className="mt-2 pt-2 border-t border-gray-50">
                    {stats ? (
                      <div className="flex items-center gap-3 text-[10px] text-gray-500">
                        <span>{stats.sessions.toLocaleString()} sessions</span>
                        <span>{stats.conversions.toLocaleString()} conversions</span>
                        {conversionRate && (
                          <span className="text-green-600 font-medium">{conversionRate}% CVR</span>
                        )}
                      </div>
                    ) : (
                      <p className="text-[10px] text-gray-400">No data yet</p>
                    )}
                  </div>

                  <p className="text-[10px] text-gray-400 mt-2">
                    Select this variant from the dropdown above to edit its content, brand, and calendars.
                  </p>
                </div>
              );
            })}
          </div>

          {/* Statistical significance hint */}
          {hasLowConversions && (
            <div className="flex items-start gap-2 p-2.5 bg-gray-50 rounded-lg border border-gray-100">
              <Info className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
              <p className="text-[10px] text-gray-500 leading-relaxed">
                Need at least 50 conversions per variant for statistical significance.
              </p>
            </div>
          )}

          <Button
            onClick={createVariant}
            variant="outline"
            size="sm"
            className="w-full gap-1.5 text-xs"
            disabled={variants.length >= 5}
          >
            <Plus className="w-3 h-3" />
            Add Variant {variants.length >= 5 && "(max 5)"}
          </Button>
        </>
      )}
    </div>
  );
}
