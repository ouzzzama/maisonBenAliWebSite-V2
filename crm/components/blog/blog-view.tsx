"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodForm } from "@/lib/form";
import { ExternalLink, Eye, EyeOff, Pencil, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { FilterBar } from "@/components/admin/filter-bar";
import { useCollection } from "@/components/admin/use-collection";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { FieldError, Input, Label, Textarea } from "@/components/ui/field";
import { postSchema, type PostInput } from "@/lib/validators";
import type { Post } from "@/lib/demo-data";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3001";

const emptyPost: PostInput = {
  title: "",
  category: "Conseils",
  excerpt: "",
  content: "",
  coverUrl: "",
  readMinutes: 5,
  year: new Date().getFullYear(),
  published: true,
};

export function BlogView({ initial }: { initial: Post[] }) {
  const posts = useCollection<Post>("/api/posts", initial);
  const [query, setQuery] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Post | null>(null);

  const form = useForm<PostInput>({
    resolver: zodForm(postSchema),
    defaultValues: emptyPost,
  });

  const openCreate = () => {
    setEditing(null);
    form.reset(emptyPost);
    setOpen(true);
  };

  const openEdit = (post: Post) => {
    setEditing(post);
    form.reset({
      title: post.title,
      category: post.category,
      excerpt: post.excerpt ?? "",
      content: post.content ?? "",
      coverUrl: post.coverUrl ?? "",
      readMinutes: post.readMinutes ?? 5,
      year: post.year ?? new Date().getFullYear(),
      published: post.published !== false,
    });
    setOpen(true);
  };

  const onSubmit = async (values: PostInput) => {
    const payload = {
      title: values.title,
      category: values.category,
      excerpt: values.excerpt,
      content: values.content,
      coverUrl: values.coverUrl,
      readMinutes: values.readMinutes,
      year: values.year,
      published: Boolean(values.published),
    };
    const result = editing ? await posts.update(editing.id, payload) : await posts.create(payload);
    if (result) {
      setOpen(false);
      form.reset(emptyPost);
    }
  };

  const filtered = React.useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return posts.items;
    return posts.items.filter((post) =>
      [post.title, post.category, post.excerpt, post.content]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [posts.items, query]);

  const publishedCount = posts.items.filter((post) => post.published).length;

  return (
    <div className="animate-in">
      <PageHeader
        eyebrow="Contenus"
        title="Blog"
        description="Rédigez un article ici : publié, il apparaît sur « Blog » et sur sa page d'article."
        actions={
          <Button variant="coral" onClick={openCreate}>
            <Plus className="size-4" /> Nouvel article
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2 rounded-2xl border border-ink/8 bg-white px-4 py-3 text-[12px] text-muted">
        <span className="font-semibold text-ink">{posts.items.length}</span> article(s)
        <span className="text-ink/25">·</span>
        <span className="font-semibold text-emerald-600">{publishedCount}</span> publié(s) sur le site
        <a
          href={`${SITE_URL}/blog`}
          target="_blank"
          rel="noopener"
          className="ml-auto inline-flex items-center gap-1 font-semibold text-ink/60 transition hover:text-ink"
        >
          <ExternalLink className="size-3.5" /> Voir le blog public
        </a>
      </div>

      <FilterBar
        query={query}
        onQueryChange={setQuery}
        placeholder="Titre, catégorie, contenu…"
        values={{}}
        onFilterChange={() => {}}
        onReset={() => setQuery("")}
        filters={[]}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((post) => (
          <article
            key={post.id}
            className="flex flex-col overflow-hidden rounded-3xl border border-ink/8 bg-white shadow-[0_2px_10px_rgba(18,43,67,0.04)]"
          >
            <div className="relative h-40 w-full overflow-hidden bg-ink/5">
              {post.coverUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={post.coverUrl} alt={post.title} className="size-full object-cover" loading="lazy" />
              ) : (
                <div className="grid size-full place-items-center text-[11px] text-ink/30">Sans photo</div>
              )}
              <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[10.5px] font-semibold text-ink">
                {post.category}
              </span>
              <span
                className={`absolute right-3 top-3 rounded-full px-2.5 py-1 text-[10.5px] font-semibold ${
                  post.published ? "bg-emerald-600 text-white" : "bg-ink/70 text-white/85"
                }`}
              >
                {post.published ? "Publié" : "Brouillon"}
              </span>
            </div>

            <div className="flex flex-1 flex-col p-4">
              <h2 className="text-[15px] font-semibold leading-snug text-ink">{post.title}</h2>
              <p className="mt-2 line-clamp-3 text-[12px] leading-relaxed text-ink/55">{post.excerpt}</p>
              <p className="mt-3 text-[11px] text-ink/40">
                {post.readMinutes} min de lecture · {post.year}
              </p>

              <div className="mt-auto flex items-center gap-1 pt-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => posts.update(post.id, { published: !post.published })}
                  className="px-2 text-[11.5px]"
                >
                  {post.published ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                  {post.published ? "Dépublier" : "Publier"}
                </Button>
                <button
                  type="button"
                  onClick={() => openEdit(post)}
                  title="Modifier"
                  className="ml-auto grid size-8 place-items-center rounded-lg text-ink/45 transition hover:bg-ink/5 hover:text-ink"
                >
                  <Pencil className="size-3.5" />
                </button>
                <a
                  href={`${SITE_URL}/blog-details?post=${post.slug}`}
                  target="_blank"
                  rel="noopener"
                  title="Voir l'article public"
                  className="grid size-8 place-items-center rounded-lg text-ink/45 transition hover:bg-ink/5 hover:text-ink"
                >
                  <ExternalLink className="size-3.5" />
                </a>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`Supprimer « ${post.title} » ?`)) posts.remove(post.id);
                  }}
                  title="Supprimer"
                  className="grid size-8 place-items-center rounded-lg text-rose-500 transition hover:bg-rose-50"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </div>
          </article>
        ))}

        {filtered.length === 0 ? (
          <div className="col-span-full rounded-3xl border border-dashed border-ink/12 bg-white/60 p-12 text-center text-[13px] text-muted">
            Aucun article. Cliquez « Nouvel article » pour écrire le premier.
          </div>
        ) : null}
      </div>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Modifier l'article" : "Nouvel article"}
        description="Le titre, l’image, le résumé et le texte alimentent la page Blog et la page de l’article."
        size="lg"
      >
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label>Titre</Label>
            <Input {...form.register("title")} placeholder="Comment réussir son investissement à Agadir ?" />
            <FieldError>{form.formState.errors.title?.message}</FieldError>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <Label>Catégorie (badge sur la carte)</Label>
              <Input {...form.register("category")} placeholder="Guide MRE & Diaspora" />
              <FieldError>{form.formState.errors.category?.message}</FieldError>
            </div>
            <div>
              <Label>Temps de lecture (min)</Label>
              <Input type="number" {...form.register("readMinutes")} />
              <FieldError>{form.formState.errors.readMinutes?.message}</FieldError>
            </div>
            <div>
              <Label>Année</Label>
              <Input type="number" {...form.register("year")} />
              <FieldError>{form.formState.errors.year?.message}</FieldError>
            </div>
            <div className="sm:col-span-2">
              <Label>Image de couverture (URL ou chemin du site)</Label>
              <Input {...form.register("coverUrl")} placeholder="assets/images/stock/blog-guide-mre.jpg" />
              <FieldError>{form.formState.errors.coverUrl?.message}</FieldError>
            </div>
          </div>

          <div>
            <Label>Résumé (affiché sur la carte)</Label>
            <Textarea {...form.register("excerpt")} className="min-h-20" />
            <FieldError>{form.formState.errors.excerpt?.message}</FieldError>
          </div>

          <div>
            <Label>Contenu de l’article — une ligne vide sépare les paragraphes</Label>
            <Textarea {...form.register("content")} className="min-h-56" />
            <FieldError>{form.formState.errors.content?.message}</FieldError>
          </div>

          <label className="flex items-center gap-2 rounded-xl border border-ink/10 bg-cream px-3 py-2.5 text-[12.5px] text-ink">
            <input type="checkbox" {...form.register("published")} className="size-4 accent-coral" />
            Publier immédiatement sur le site
          </label>

          <div className="flex items-center justify-end gap-2 pt-1">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" variant="coral" disabled={posts.pending}>
              {editing ? "Enregistrer" : "Publier l'article"}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
