"use client";

import { useState } from "react";
import { BookOpen, Bot, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { SalesCopilotSidebar } from "@/components/modules/sales-copilot-sidebar";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Modal } from "@/components/ui/modal";
import {
  FieldGroup,
  FieldLabel,
  FormGrid,
  SelectInput,
  TextArea,
  TextInput,
} from "@/components/forms/form-primitives";
import { useAuth } from "@/hooks/use-auth";
import { useDisclosure } from "@/hooks/use-disclosure";
import { useEntityManager } from "@/hooks/use-entity-manager";
import type { KnowledgeBaseRecord } from "@/types";

export function KnowledgeBaseModule({
  initialArticles,
}: {
  initialArticles: KnowledgeBaseRecord[];
}) {
  const { user } = useAuth();
  const { items, isSubmitting, error, clearError, createItem, updateItem, deleteItem } =
    useEntityManager<KnowledgeBaseRecord, Omit<KnowledgeBaseRecord, "id" | "createdAt" | "updatedAt">>({
      endpoint: "/api/knowledge",
      initialItems: initialArticles,
    });

  const dialog = useDisclosure();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [editingArticle, setEditingArticle] = useState<KnowledgeBaseRecord | null>(null);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);

  const [formValues, setFormValues] = useState<Omit<KnowledgeBaseRecord, "id" | "createdAt" | "updatedAt">>({
    title: "",
    category: "objection",
    content: "",
    tags: [],
  });

  const canManage = user?.role === "admin" || user?.role === "manager";

  // Filter items
  const filteredArticles = items.filter((art) => {
    const matchesSearch =
      art.title.toLowerCase().includes(search.toLowerCase()) ||
      art.content.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "All" || art.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  function openCreateModal() {
    clearError();
    setEditingArticle(null);
    setFormValues({
      title: "",
      category: "objection",
      content: "",
      tags: [],
    });
    dialog.open();
  }

  function openEditModal(article: KnowledgeBaseRecord) {
    clearError();
    setEditingArticle(article);
    setFormValues({
      title: article.title,
      category: article.category,
      content: article.content,
      tags: article.tags || [],
    });
    dialog.open();
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      if (editingArticle) {
        await updateItem(editingArticle.id, formValues);
      } else {
        await createItem(formValues);
      }
      dialog.close();
    } catch {}
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Are you sure you want to delete this knowledge article?")) {
      return;
    }
    try {
      await deleteItem(id);
    } catch {}
  }

  const categoryTones = {
    objection: "bg-red-50 text-red-700 border-red-200",
    case_study: "bg-green-50 text-green-700 border-green-200",
    pricing: "bg-blue-50 text-blue-700 border-blue-200",
    usp: "bg-purple-50 text-purple-700 border-purple-200",
    brochure: "bg-amber-50 text-amber-700 border-amber-200",
    other: "bg-gray-50 text-gray-700 border-gray-200",
  };

  const categoryLabels = {
    objection: "Objection Handler",
    case_study: "Case Study",
    pricing: "Pricing Standard",
    usp: "Unique Selling Proposition",
    brochure: "Company Brochure / Doc",
    other: "General Playbook",
  };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Sales Enablement"
        title="Sales knowledge playbooks"
        description="Write and maintain case studies, objection playbooks, standard contract templates, and pricing calculators utilized by the Sales Co-Pilot."
        actions={
          <div className="flex items-center gap-3">
            <Button variant="secondary" onClick={() => setIsCopilotOpen(true)}>
              <Bot size={16} />
              Ask Sales Co-Pilot
            </Button>
            {canManage ? (
              <Button onClick={openCreateModal}>
                <Plus size={16} />
                Add Playbook Article
              </Button>
            ) : null}
          </div>
        }
      />

      {/* Filter Card */}
      <Card className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 items-center gap-3 rounded-[16px] border border-line bg-mist px-4 py-3">
          <Search size={16} className="text-fog" />
          <TextInput
            className="h-auto border-0 bg-transparent px-0"
            placeholder="Search playbooks by title or keywords"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <SelectInput
          className="w-full lg:w-[240px]"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="All">All Categories</option>
          <option value="objection">Objection Handlers</option>
          <option value="case_study">Case Studies</option>
          <option value="pricing">Pricing Standards</option>
          <option value="usp">Unique Selling Propositions</option>
          <option value="brochure">Company Brochures</option>
          <option value="other">Other Playbooks</option>
        </SelectInput>
      </Card>

      {error ? (
        <div className="rounded-[18px] border border-line bg-black px-4 py-3 text-sm text-white">
          {error}
        </div>
      ) : null}

      {/* Playbooks Grid */}
      {filteredArticles.length ? (
        <div className="grid gap-6 md:grid-cols-2">
          {filteredArticles.map((art) => (
            <Card key={art.id} className="flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-wider ${categoryTones[art.category]}`}>
                    {categoryLabels[art.category]}
                  </span>
                  {canManage && (
                    <div className="flex items-center gap-2">
                      <Button variant="secondary" className="h-8 w-8 p-0" onClick={() => openEditModal(art)}>
                        <Pencil size={12} />
                      </Button>
                      <Button variant="ghost" className="h-8 w-8 p-0 text-red-600 hover:bg-red-50" onClick={() => handleDelete(art.id)}>
                        <Trash2 size={12} />
                      </Button>
                    </div>
                  )}
                </div>
                <h3 className="mt-4 text-lg font-bold text-black">{art.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-gray-700 whitespace-pre-wrap">{art.content}</p>
              </div>

              {art.tags && art.tags.length > 0 && (
                <div className="mt-6 border-t border-line pt-3 flex flex-wrap gap-1.5">
                  {art.tags.map((tag, i) => (
                    <span key={i} className="rounded bg-mist border border-line px-2 py-0.5 text-[10px] text-fog font-medium">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No playbook articles found"
          description="Create playbooks to help your Sales Co-Pilot handle pricing, competitors, and client objections."
        />
      )}

      {/* Modal Dialog */}
      <Modal
        open={dialog.isOpen}
        onClose={dialog.close}
        title={editingArticle ? "Edit Playbook Article" : "Create Playbook Article"}
        description="Provide comprehensive context and guidelines. The Sales Co-Pilot queries this content dynamically."
      >
        <form className="space-y-5" onSubmit={handleSubmit}>
          <FieldGroup>
            <FieldLabel htmlFor="kb-title">Playbook Title</FieldLabel>
            <TextInput
              id="kb-title"
              value={formValues.title}
              onChange={(e) => setFormValues(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Objection: 'Your quote is double our local freelancer'"
              required
            />
          </FieldGroup>

          <FormGrid>
            <FieldGroup>
              <FieldLabel htmlFor="kb-category">Category</FieldLabel>
              <SelectInput
                id="kb-category"
                value={formValues.category}
                onChange={(e) => setFormValues(prev => ({ ...prev, category: e.target.value as any }))}
              >
                <option value="objection">Objection Handler</option>
                <option value="case_study">Case Study</option>
                <option value="pricing">Pricing Standard</option>
                <option value="usp">Unique Selling Proposition</option>
                <option value="brochure">Company Brochure / Doc</option>
                <option value="other">Other Playbook</option>
              </SelectInput>
            </FieldGroup>
            <FieldGroup>
              <FieldLabel htmlFor="kb-tags">Tags (comma separated)</FieldLabel>
              <TextInput
                id="kb-tags"
                value={(formValues.tags || []).join(", ")}
                onChange={(e) => setFormValues(prev => ({ ...prev, tags: e.target.value.split(",").map(t => t.trim()).filter(Boolean) }))}
                placeholder="pricing, objection, local"
              />
            </FieldGroup>
          </FormGrid>

          <FieldGroup>
            <FieldLabel htmlFor="kb-content">Playbook Content</FieldLabel>
            <TextArea
              id="kb-content"
              value={formValues.content}
              onChange={(e) => setFormValues(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Detail the advice, USPs, responses, or project timeline here..."
              required
            />
          </FieldGroup>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={dialog.close}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : editingArticle ? "Update Playbook" : "Create Playbook"}
            </Button>
          </div>
        </form>
      </Modal>
      <SalesCopilotSidebar
        lead={null}
        open={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
      />
    </div>
  );
}
