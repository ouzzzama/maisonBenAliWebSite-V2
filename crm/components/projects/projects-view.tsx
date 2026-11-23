"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import { zodForm } from "@/lib/form";
import {
  Building2,
  CalendarRange,
  CheckCircle2,
  Circle,
  GripVertical,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { FilterBar } from "@/components/admin/filter-bar";
import { useCollection } from "@/components/admin/use-collection";
import { useSmoothReorder } from "@/components/admin/use-smooth-reorder";
import { Pill, StatusBadge } from "@/components/ui/badge";
import { resolveImage } from "@/lib/images";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { FieldError, Input, Label, Select, Textarea } from "@/components/ui/field";
import { ImageUploadButton } from "@/components/ui/image-upload";
import { projectSchema, type ProjectInput } from "@/lib/validators";
import type { Milestone, Project } from "@/lib/demo-data";
import {
  PROJECT_STATUS_LABEL,
  byPosition,
  cn,
  formatDate,
  formatMAD,
  toInputDate,
} from "@/lib/utils";

const STATUS_OPTIONS = Object.entries(PROJECT_STATUS_LABEL).map(([value, label]) => ({
  value,
  label,
}));

/** Carte en cours de déplacement : ancrage au pointeur + inclinaison. */
type DragState = {
  id: string;
  from: string;
  width: number;
  height: number;
  left: number;
  top: number;
  startX: number;
  startY: number;
  offsetX: number;
  offsetY: number;
};

/** Colonne survolée et rang auquel la carte serait insérée. */
type DropTarget = { status: string; index: number };

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
  /* glisser-déposer au pointeur : la carte suit la souris, opaque, inclinée */
  const [drag, setDrag] = React.useState<DragState | null>(null);
  const [dropTarget, setDropTarget] = React.useState<DropTarget | null>(null);
  const dragRef = React.useRef<DragState | null>(null);
  const dragNodeRef = React.useRef<HTMLElement | null>(null);
  const dragTiltRef = React.useRef(0);
  const dropRef = React.useRef<DropTarget | null>(null);
  const columnRefs = React.useRef<Record<string, HTMLElement | null>>({});
  const dragPointRef = React.useRef<{ x: number; y: number } | null>(null);
  const placeRef = React.useRef<(() => void) | null>(null);

  /* les cartes glissent à leur nouvelle place ; pendant le glisser, l'emplacement
     s'ouvre par les marges, donc pas d'animation FLIP concurrente */
  useSmoothReorder(drag === null);

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

  /* pose la carte au rang exact prévisualisé, puis enregistre l'ordre de la colonne */
  const moveProject = React.useCallback(
    (projectId: string, status: string, index: number) => {
      const project = projects.items.find((item) => item.id === projectId);
      if (!project) return;

      const others = byPosition(
        projects.items.filter((item) => item.status === status && item.id !== projectId)
      );
      const at = Math.max(0, Math.min(index, others.length));
      const ordered = [...others.slice(0, at), project, ...others.slice(at)];
      const positions = new Map(ordered.map((item, rank) => [item.id, rank * 10]));

      /* la carte atterrit tout de suite au bon rang, sans repasser par son ancienne colonne */
      projects.setItems((current) =>
        current.map((item) => {
          const position = positions.get(item.id);
          if (position === undefined) return item;
          return item.id === projectId
            ? { ...item, status: status as Project["status"], position }
            : { ...item, position };
        })
      );

      for (const item of ordered) {
        const position = positions.get(item.id) ?? 0;
        const patch: Record<string, unknown> = {};
        if (Number(item.position ?? 0) !== position) patch.position = position;
        if (item.id === projectId) patch.status = status;
        if (Object.keys(patch).length) {
          void projects.update(item.id, patch).then((row) => {
            if (!row) projects.refresh();
          });
        }
      }
    },
    [projects]
  );

  /* garde le callback à jour sans relancer les écouteurs du glisser-déposer */
  const moveProjectRef = React.useRef(moveProject);
  React.useEffect(() => {
    moveProjectRef.current = moveProject;
  }, [moveProject]);

  const startDrag = (event: React.PointerEvent<HTMLElement>, project: Project) => {
    if (event.pointerType !== "mouse" || event.button !== 0) return;
    if ((event.target as HTMLElement).closest("button, a")) return;
    const node = event.currentTarget as HTMLElement;
    const rect = node.getBoundingClientRect();
    const next: DragState = {
      id: project.id,
      from: project.status,
      width: rect.width,
      height: rect.height,
      left: rect.left,
      top: rect.top,
      startX: event.clientX,
      startY: event.clientY,
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top,
    };
    dragRef.current = next;
    dragNodeRef.current = node;
    dragTiltRef.current = 0;
    dragPointRef.current = { x: event.clientX, y: event.clientY };
    setDrag(next);
    event.preventDefault();
  };

  React.useLayoutEffect(() => {
    if (!drag) return;
    const node = dragNodeRef.current;
    if (!node) return;

    /* la carte suit le pointeur au pixel près, en dehors du cycle de rendu React */
    const place = () => {
      const state = dragRef.current;
      const point = dragPointRef.current;
      const target = dragNodeRef.current;
      /* la carte rendue dans un portail est un nouveau nœud : on réapplique
         toujours la position sur le nœud courant */
      if (!state || !point || !target) return;
      const { x, y } = point;
      const tiltTarget = Math.max(-10, Math.min(10, (x - state.startX) * 0.55));
      dragTiltRef.current += (tiltTarget - dragTiltRef.current) * 0.22;
      /* déplacement exprimé en écart depuis le point d'attrape : le curseur reste
         collé au même endroit de la carte, quel que soit le conteneur */
      target.style.transform = `translate3d(${x - state.startX}px, ${
        y - state.startY
      }px, 0) rotate(${dragTiltRef.current.toFixed(2)}deg)`;
    };
    placeRef.current = place;

    /* première pose avant repeint : la carte ne saute pas au départ */
    place();

    const statusAt = (x: number, y: number) => {
      const hit = Object.entries(columnRefs.current).find(([, element]) => {
        if (!element) return false;
        const rect = element.getBoundingClientRect();
        return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
      });
      return hit ? hit[0] : "";
    };

    /* rang d'atterrissage : nombre de cartes dont le milieu est au-dessus du pointeur */
    const indexAt = (element: HTMLElement, y: number) => {
      let index = 0;
      for (const card of Array.from(element.querySelectorAll<HTMLElement>("[data-card-id]"))) {
        const rect = card.getBoundingClientRect();
        if (y > rect.top + rect.height / 2) index += 1;
      }
      return index;
    };

    const handleMove = (event: PointerEvent) => {
      if (!dragRef.current) return;
      dragPointRef.current = { x: event.clientX, y: event.clientY };
      place();
      const over = statusAt(event.clientX, event.clientY);
      const element = over ? columnRefs.current[over] : null;
      const next: DropTarget | null =
        over && element ? { status: over, index: indexAt(element, event.clientY) } : null;
      const previous = dropRef.current;
      if (
        (next?.status ?? "") !== (previous?.status ?? "") ||
        (next?.index ?? -1) !== (previous?.index ?? -1)
      ) {
        dropRef.current = next;
        setDropTarget(next);
      }
    };

    const finish = () => {
      const current = dragRef.current;
      const target = dropRef.current;
      dragRef.current = null;
      dropRef.current = null;
      if (dragNodeRef.current) dragNodeRef.current.style.transform = "";
      dragNodeRef.current = null;
      dragPointRef.current = null;
      placeRef.current = null;
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
      setDrag(null);
      setDropTarget(null);
      /* hors de toute colonne : la carte revient simplement à sa place */
      if (current && target) {
        moveProjectRef.current(current.id, target.status, target.index);
      }
    };

    document.body.style.userSelect = "none";
    document.body.style.cursor = "grabbing";
    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", finish);
    window.addEventListener("pointercancel", finish);
    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", finish);
      window.removeEventListener("pointercancel", finish);
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    };
  }, [drag !== null]);

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

      {filters.status ? null : (
        <p className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-ink/5 px-2.5 py-1 text-[11px] font-medium text-ink/55">
          <GripVertical className="size-3.5" />
          Glissez un projet d&apos;une colonne à l&apos;autre pour changer son statut.
        </p>
      )}

      {/* Un kanban par statut, en colonnes. */}
      <div className={cn("grid gap-3", filters.status ? "grid-cols-1" : "sm:grid-cols-2 xl:grid-cols-4")}>
        {(filters.status
          ? STATUS_OPTIONS.filter((option) => option.value === filters.status)
          : STATUS_OPTIONS
        ).map((column) => {
          const rows = byPosition(
            filtered.filter((project) => project.status === column.value)
          );
          const hovering = drag !== null && dropTarget?.status === column.value;
          const sourceIndex = drag ? rows.findIndex((row) => row.id === drag.id) : -1;
          const flowCount = rows.length - (sourceIndex >= 0 ? 1 : 0);
          /* emplacement d'atterrissage : dans la colonne survolée, sinon à la place d'origine */
          const insertAt = drag
            ? hovering
              ? Math.min(dropTarget?.index ?? 0, flowCount)
              : drag.from === column.value && sourceIndex >= 0
                ? sourceIndex
                : null
            : null;
          /* ouverture de l'emplacement : hauteur de la carte + l'espace entre cartes */
          const slotSize = drag && insertAt !== null ? drag.height + 8 : 0;
          let flowIndex = 0;
          return (
            <section
              key={column.value}
              ref={(element) => {
                columnRefs.current[column.value] = element;
              }}
              className={cn(
                "flex flex-col gap-2 rounded-3xl border border-dashed bg-white/55 p-2.5 transition",
                hovering
                  ? "border-coral/60 border-solid bg-coral/[0.06] ring-2 ring-coral/25"
                  : "border-ink/15"
              )}
            >
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] font-semibold uppercase tracking-[0.09em] text-ink/40">
                  {column.label}
                </span>
                <span className="rounded-full bg-white px-1.5 text-[10px] font-bold text-ink/50 ring-1 ring-inset ring-ink/10">
                  {rows.length}
                </span>
              </div>

              {rows.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-ink/12 bg-white/70 px-3 py-8 text-center text-[11px] leading-snug text-ink/40">
                  {query.trim() ? "Aucun projet pour cette recherche." : "Aucun projet à ce stade."}
                </p>
              ) : null}

              {rows.map((project) => {
          const milestones = project.milestones ?? [];
          const activeDrag = drag && drag.id === project.id ? drag : null;
          const done = milestones.filter((milestone) => milestone.done).length;
          const progress = milestones.length ? Math.round((done / milestones.length) * 100) : 0;
          const cardIndex = activeDrag ? -1 : flowIndex;
          if (!activeDrag) flowIndex += 1;
          /* les cartes du dessous glissent pour laisser la place, aucune n'est retirée */
          const slotBefore =
            slotSize > 0 && insertAt !== null && cardIndex === insertAt ? slotSize : 0;
          const slotAfter =
            slotSize > 0 &&
            insertAt !== null &&
            cardIndex === flowCount - 1 &&
            insertAt >= flowCount
              ? slotSize
              : 0;
          const card = (
            <article
              key={project.id}
              data-card-id={project.id}
              data-flip-id={project.id}
              ref={(node) => {
                if (!node || !activeDrag) return;
                dragNodeRef.current = node;
                /* le portail crée un nouveau nœud : on lui redonne tout de suite
                   la position du pointeur, sinon la carte reste figée au départ */
                placeRef.current?.();
              }}
              onPointerDown={(event) => startDrag(event, project)}
              style={
                activeDrag
                  ? {
                      position: "fixed",
                      left: activeDrag.left,
                      top: activeDrag.top,
                      width: activeDrag.width,
                      transformOrigin: `${activeDrag.offsetX}px ${activeDrag.offsetY}px`,
                      margin: 0,
                      zIndex: 60,
                      opacity: 1,
                      pointerEvents: "none",
                      willChange: "transform",
                    }
                  : drag
                    ? {
                        marginTop: slotBefore || undefined,
                        marginBottom: slotAfter || undefined,
                        transition:
                          "margin-top 200ms cubic-bezier(0.22, 1, 0.36, 1), margin-bottom 200ms cubic-bezier(0.22, 1, 0.36, 1)",
                      }
                    : undefined
              }
              className={cn(
                "flex select-none flex-col rounded-2xl border bg-white p-3.5",
                activeDrag
                  ? "cursor-grabbing border-coral/50 shadow-2xl ring-2 ring-coral/40"
                  : "cursor-grab border-ink/8 shadow-[0_2px_10px_rgba(18,43,67,0.04)]"
              )}
            >
              {
                /* photo rectangulaire du projet (VEFA, rénovation…), au-dessus des informations */
              }
              <div className="relative mb-3 aspect-[16/10] w-full overflow-hidden rounded-xl bg-gradient-to-br from-ink/[0.10] via-ink/[0.05] to-coral/15">
                <span className="absolute inset-0 grid place-items-center text-ink/25">
                  <Building2 className="size-7" />
                </span>
                {project.coverUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={resolveImage(project.coverUrl)}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="relative size-full object-cover"
                    onError={(event) => {
                      event.currentTarget.style.visibility = "hidden";
                    }}
                  />
                ) : null}
              </div>

              <div className="flex items-start justify-between gap-2">
                <div>
                  <StatusBadge status={project.status} label={PROJECT_STATUS_LABEL[project.status]} />
                  <h2 className="mt-2 text-[15px] font-semibold leading-snug text-ink">
                    {project.title}
                  </h2>
                </div>
                <div className="flex shrink-0 items-center gap-0.5">
                  {/* poignée visible : la carte se glisse vers une autre colonne */}
                  <span
                    aria-hidden="true"
                    title="Glisser vers une autre colonne"
                    className="grid size-6 place-items-center rounded-md bg-ink/5 text-ink/45"
                  >
                    <GripVertical className="size-3.5" />
                  </span>
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
          return activeDrag && typeof document !== "undefined"
            ? createPortal(card, document.body)
            : card;
              })}
              {/* colonne vide : l'emplacement s'ouvre pour accueillir la carte */}
              {drag && insertAt !== null && flowCount === 0 ? (
                <div
                  aria-hidden="true"
                  className="rounded-2xl border border-dashed border-coral/50 bg-coral/[0.07]"
                  style={{ height: drag.height }}
                />
              ) : null}
            </section>
          );
        })}
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
            <Label>Image de couverture</Label>
            <Input {...form.register("coverUrl")} placeholder="assets/images/… ou https://…" />
            <ImageUploadButton
              className="mt-1.5"
              onUploaded={(url) =>
                form.setValue("coverUrl", url, { shouldDirty: true, shouldValidate: true })
              }
            />
            <p className="mt-1 text-[11px] text-muted">
              Photo rectangulaire affichée en haut de la carte du projet.
            </p>
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
