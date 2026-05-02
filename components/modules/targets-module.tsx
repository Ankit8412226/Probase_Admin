"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";

import { TargetForm } from "@/components/forms/target-form";
import { useDisclosure } from "@/hooks/use-disclosure";
import { useEntityManager } from "@/hooks/use-entity-manager";
import { DataTable } from "@/components/tables/data-table";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, MetricCard } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ExportMenu } from "@/components/ui/export-menu";
import { Modal } from "@/components/ui/modal";
import { PageHeader } from "@/components/ui/page-header";
import { formatCurrency, formatMonth } from "@/lib/utils";
import type { AuthUser, TargetPerformancePoint, TargetRecord } from "@/types";

function getOwnerName(owners: AuthUser[], ownerId: string) {
  return owners.find((owner) => owner.id === ownerId)?.name ?? "Unknown owner";
}

export function TargetsModule({
  initialTargets,
  owners,
  performance,
}: {
  initialTargets: TargetRecord[];
  owners: AuthUser[];
  performance: TargetPerformancePoint[];
}) {
  const { items, isSubmitting, error, clearError, createItem, updateItem, deleteItem } =
    useEntityManager<TargetRecord, Omit<TargetRecord, "id" | "createdAt" | "updatedAt">>({
      endpoint: "/api/targets",
      initialItems: initialTargets,
    });
  const dialog = useDisclosure();
  const [editingTarget, setEditingTarget] = useState<TargetRecord | null>(null);
  const latestPerformance = performance[performance.length - 1];
  const exportRows = items.map((target) => ({
    month: target.month,
    owner: getOwnerName(owners, target.ownerId),
    targetRevenue: target.targetRevenue,
    targetConversions: target.targetConversions,
  }));

  async function handleSubmit(values: Omit<TargetRecord, "id" | "createdAt" | "updatedAt">) {
    try {
      if (editingTarget) {
        await updateItem(editingTarget.id, values);
      } else {
        await createItem(values);
      }

      setEditingTarget(null);
      dialog.close();
    } catch {}
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this target?")) {
      return;
    }

    try {
      await deleteItem(id);
    } catch {}
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Targets"
        title="Business targets"
        description="Set monthly revenue and conversion targets for the business team and compare them against actual outcomes."
        actions={
          <>
            <ExportMenu
              filename="business-targets"
              label="Export Targets"
              csvRows={exportRows}
              jsonData={{ targets: items, performance }}
            />
            <Button
              onClick={() => {
                clearError();
                setEditingTarget(null);
                dialog.open();
              }}
            >
              <Plus size={16} />
              Add Target
            </Button>
          </>
        }
      />

      {latestPerformance ? (
        <div className="grid gap-4 md:grid-cols-4">
          <MetricCard
            label="Latest Target Revenue"
            value={formatCurrency(latestPerformance.targetRevenue)}
            delta={formatMonth(latestPerformance.month)}
          />
          <MetricCard
            label="Latest Actual Revenue"
            value={formatCurrency(latestPerformance.actualRevenue)}
            delta={formatMonth(latestPerformance.month)}
          />
          <MetricCard
            label="Latest Target Conversions"
            value={String(latestPerformance.targetConversions)}
            delta={formatMonth(latestPerformance.month)}
          />
          <MetricCard
            label="Latest Actual Conversions"
            value={String(latestPerformance.actualConversions)}
            delta={formatMonth(latestPerformance.month)}
          />
        </div>
      ) : null}

      {error ? (
        <div className="rounded-[18px] border border-line bg-black px-4 py-3 text-sm text-white">
          {error}
        </div>
      ) : null}

      {items.length ? (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
          <DataTable
            data={items}
            emptyMessage="No targets configured."
            columns={[
              {
                key: "month",
                header: "Month",
                render: (target) => formatMonth(target.month),
              },
              {
                key: "owner",
                header: "Owner",
                render: (target) => getOwnerName(owners, target.ownerId),
              },
              {
                key: "targetRevenue",
                header: "Revenue target",
                render: (target) => formatCurrency(target.targetRevenue),
              },
              {
                key: "targetConversions",
                header: "Conversion target",
                render: (target) => target.targetConversions,
              },
              {
                key: "actions",
                header: "Actions",
                render: (target) => (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      className="h-9 px-3"
                      onClick={() => {
                        clearError();
                        setEditingTarget(target);
                        dialog.open();
                      }}
                    >
                      <Pencil size={14} />
                    </Button>
                    <Button
                      variant="ghost"
                      className="h-9 px-3"
                      onClick={() => handleDelete(target.id)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                ),
              },
            ]}
          />
          <Card>
            <CardHeader
              eyebrow="Attainment"
              title="Monthly progress"
              description="Aggregated target vs actual performance by month."
            />
            <div className="mt-6 space-y-4">
              {performance.map((point) => {
                const revenueProgress = point.targetRevenue
                  ? Math.round((point.actualRevenue / point.targetRevenue) * 100)
                  : 0;
                const conversionProgress = point.targetConversions
                  ? Math.round((point.actualConversions / point.targetConversions) * 100)
                  : 0;

                return (
                  <div key={point.month} className="rounded-[18px] border border-line bg-mist p-4">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold">{formatMonth(point.month)}</p>
                      <p className="text-sm text-fog">{revenueProgress}% revenue</p>
                    </div>
                    <div className="mt-4 space-y-3">
                      <div>
                        <div className="mb-1 flex items-center justify-between text-sm">
                          <span className="text-fog">Revenue</span>
                          <span>
                            {formatCurrency(point.actualRevenue)} / {formatCurrency(point.targetRevenue)}
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-white">
                          <div
                            className="h-full rounded-full bg-black"
                            style={{ width: `${Math.min(revenueProgress, 100)}%` }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="mb-1 flex items-center justify-between text-sm">
                          <span className="text-fog">Conversions</span>
                          <span>
                            {point.actualConversions} / {point.targetConversions}
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-white">
                          <div
                            className="h-full rounded-full bg-black/70"
                            style={{ width: `${Math.min(conversionProgress, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      ) : (
        <EmptyState
          title="No targets found"
          description="Add the first monthly target to start tracking revenue and conversions."
        />
      )}

      <Modal
        open={dialog.isOpen}
        onClose={() => {
          setEditingTarget(null);
          dialog.close();
        }}
        title={editingTarget ? "Edit target" : "Add target"}
        description="Set monthly goals for revenue and conversions by owner."
      >
        <TargetForm
          owners={owners}
          initialValues={editingTarget}
          isSubmitting={isSubmitting}
          onCancel={() => {
            setEditingTarget(null);
            dialog.close();
          }}
          onSubmit={handleSubmit}
        />
      </Modal>
    </div>
  );
}
