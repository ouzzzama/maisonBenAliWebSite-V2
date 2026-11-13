"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodForm } from "@/lib/form";
import { CalendarRange, CheckCircle2, Circle, Pencil, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { FilterBar } from "@/components/admin/filter-bar";
import { useCollection } from "@/components/admin/use-collection";
import { Pill, StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { FieldError, Input, Label, Select, Textarea } from "@/components/ui/field";
import { projectSchema, type ProjectInput } from "@/lib/validators";
import type { Milestone, Project } from "@/lib/demo-data";
import { PROJECT_STATUS_LABEL, formatDate, formatMAD, toInputDate } from "@/lib/utils";

const STATUS_OPTIONS = Object.entries(PROJECT_STATUS_LABEL).map(([value, label]) => ({
  value,
  label,
}));

const emptyProject: ProjectInput = {
  title: "",
  description: "",
  status: "PLANNED",
  budget: undefined,
  startsAt: toInputDate(),
  endsAt: "",
  tags: "",
  milestones: "",
  coverUrl: "",
};

const milestonesToText = (milestones: Milestone[]) =>
  milestones.map((milestone) => `${milestone.title} | ${toInputDate(milestone.dueAt)}`).join("\n");

export function ProjectsView({ initial }: { initial: Project[] }) {
  const projects = useCollection<Project>("/api/projects", initial);
  const [query, setQuery] = React.useState("");
  const [filters, setFilters] = React.useState({ status: "" });
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Project | null>(null);

  const form = useForm<ProjectInput>({
    resolver: zodForm(projectSchema),
    defaultValues: emptyProject,
  });

  const openCreate = () => {
    setEditing(null);
    form.reset(emptyProject);
    setOpen(true);
  };

  const openEdit = (project: Project) => {
    setEditing(project);
    form.reset({
      title: project.title,
      description: project.description ?? "",
      status: project.status,
      budget: project.budget ?? undefined,
      startsAt: project.startsAt ? toInputDate(project.startsAt) : "",
      endsAt: project.endsAt ? toInputDate(project.endsAt) : "",
      tags: (project.tags ?? []).join(", "),
      milestones: milestonesToText(project.milestones ?? []),
      coverUrl: project.coverUrl ?? "",
    });
    setOpen(true);
  };

  const onSubmit = async (values: ProjectInput) => {
    const milestones = (values.milestones ?? "")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [title, due] = line.split("|").map((part) => part.trim());
        return { title, dueAt: due || toInputDate(), done: false };
      });
    const payload = {
      ...values,
      tags: values.tags
        ? values.tags.split(",").map((tag) => tag.trim()).filter(Boolean)
        : [],
      milestones,
      startsAt: values.startsAt ? new Date(values.startsAt).toISOString() : null,
      endsAt: values.endsAt ? new Date(values.endsAt).toISOString() : null,
    };
    const result = editing
      ? await projects.update(editing.id, payload)
      : await projects.create(payload);
    if (result) {
      setOpen(false);
      form.reset(emptyProject);
    }
  };

  const toggleMilestone = async (project: Project, index: number) => {
    const milestones = (project.milestones ?? []).map((milestone, position) =>
      position === index ? { ...milestone, done: !milestone.done } : milestone
    );
    await projects.update(project.id, { milestones });
  };

  const filtered = React.useMemo(() => {
    const term = query.trim().toLowerCase();
    return projects.items.filter((project) => {
      if (filters.status && project.status !== filters.status) return false;
      if (!term) return true;
      return [project.title, project.description, ...(project.tags ?? [])]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(term);
    });
  }, [projects.items, query, filters]);

  return (
    <div className="animate-in">
      <PageHeader
        eyebrow="Portefeuille"
        title="Projets"
        description="Promotions, rénovations et études : jalons, budgets et avancement."
        actions={
          <Button variant="coral" onClick={openCreate}>
            <Plus className="size-4" /> Nouveau projet
          </Button>
        }
      />

      <FilterBar
        query={query}
        onQueryChange={setQuery}
        placeholder="Titre, description, tag…"
        values={filters}
        onFilterChange={(key, value) => setFilters((current) => ({ ...current, [key]: value }))}
        onReset={() => {
          setQuery("");
          setFilters({ status: "" });
        }}
        filters={[{ key: "status", label: "Statut", options: STATUS_OPTIONS }]}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((project) => {
          const milestones = project.milestones ?? [];
          const done = milestones.filter((milestone) => milestone.done).length;
          const progress = milestones.length ? Math.round((done / milestones.length) * 100) : 0;
          return (
            <article
              key={project.id}
              className="flex flex-col rounded-3xl border border-ink/8 bg-white p-4 shadow-[0_2px_10px_rgba(18,43,67,0.04)]"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <StatusBadge status={project.status} label={PROJECT_STATUS_LABEL[project.status]} />
                  <h2 className="mt-2 text-[15px] font-semibold leading-snug text-ink">
                    {project.title}
                  </h2>
                </div>
                <div className="flex shrink-0 items-center gap-0.5">
                  <button
                    type="button"
                    onClick={() => openEdit(project)}
                    title="Modifier"
                    className="grid size-8 place-items-center rounded-lg text-ink/45 transition hover:bg-ink/5 hover:text-ink"
                  >
                    <Pencil className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(`Supprimer le projet « ${project.title} » ?`))
                        projects.remove(project.id);
                    }}
                    title="Supprimer"
                    className="grid size-8 place-items-center rounded-lg text-rose-500 transition hover:bg-rose-50"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>

              {project.description ? (
                <p className="mt-2 line-clamp-2 text-[12px] leading-relaxed text-muted">
                  {project.description}
                </p>
              ) : null}

              <div className="mt-3 flex flex-wrap gap-1">
                {(project.tags ?? []).map((tag) => (
                  <Pill key={tag} className="bg-ink/5 text-ink/60">
                    {tag}
                  </Pill>
                ))}
              </div>

              <div className="mt-3">
                <div className="mb-1 flex items-center justify-between text-[11px]">
                  <span className="text-ink/50">Avancement</span>
                  <span className="font-semibold text-ink">{progress}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-ink/6">
                  <div
                    className="h-full rounded-full bg-coral transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <ul className="mt-3 space-y-1.5">
                {milestones.slice(0, 3).map((milestone, index) => (
                  <li key={`${milestone.title}-${index}`}>
                    <button
                      type="button"
                      onClick={() => toggleMilestone(project, index)}
                      className="flex w-full items-center gap-2 text-left text-[11.5px] text-ink/70 transition hover:text-ink"
                    >
                      {milestone.done ? (
                        <CheckCircle2 className="size-3.5 shrink-0 text-emerald-600" />
                      ) : (
                        <Circle className="size-3.5 shrink-0 text-ink/25" />
                      )}
                      <span className={milestone.done ? "line-through opacity-60" : ""}>
                        {milestone.title}
                      </span>
                      <span className="ml-auto shrink-0 text-[10px] text-ink/35">
                        {formatDate(milestone.dueAt)}
                      </span>
                    </button>
                  </li>
                ))}
                {milestones.length === 0 ? (
                  <li className="text-[11.5px] text-ink/35">Aucun jalon défini.</li>
                ) : null}
              </ul>

              <div className="mt-3 flex items-center justify-between border-t border-ink/6 pt-2.5 text-[11.5px]">
                <span className="inline-flex items-center gap-1 text-ink/50">
                  <CalendarRange className="size-3.5" />
                  {formatDate(project.startsAt)} → {formatDate(project.endsAt)}
                </span>
                <span className="font-semibold text-ink">{formatMAD(project.budget)}</span>
              </div>
            </article>
          );
        })}

        {filtered.length === 0 ? (
          <div className="col-span-full rounded-3xl border border-dashed border-ink/12 bg-white/60 p-12 text-center text-[13px] text-muted">
            Aucun projet pour ces critères.
          </div>
        ) : null}
      </div>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Modifier le projet" : "Nouveau projet"}
        description="Les jalons s'écrivent une ligne par étape : Titre | AAAA-MM-JJ"
        size="lg"
      >
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label>Titre</Label>
              <Input {...form.register("title")} placeholder="Résidence Al Manar — Founty" />
              <FieldError>{form.formState.errors.title?.message}</FieldError>
            </div>
            <div>
              <Label>Statut</Label>
              <Select {...form.register("status")}>
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Budget (MAD)</Label>
              <Input type="number" step="10000" {...form.register("budget")} />
              <FieldError>{form.formState.errors.budget?.message}</FieldError>
            </div>
            <div>
              <Label>Début</Label>
              <Input type="date" {...form.register("startsAt")} />
            </div>
            <div>
              <Label>Livraison</Label>
              <Input type="date" {...form.register("endsAt")} />
            </div>
          </div>
          <div>
            <Label>Description</Label>
            <Textarea {...form.register("description")} />
          </div>
          <div>
            <Label>Tags</Label>
            <Input {...form.register("tags")} placeholder="VEFA, Founty, 12 lots" />
          </div>
          <div>
            <Label>Jalons</Label>
            <Textarea
              {...form.register("milestones")}
              placeholder={"Permis de construire | 2026-05-01\nGros œuvre | 2026-11-15"}
              className="min-h-24 font-mono text-[12px]"
            />
          </div>
          <div className="flex items-center justify-end gap-2 pt-1">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" variant="coral" disabled={projects.pending}>
              {editing ? "Enregistrer" : "Créer le projet"}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
