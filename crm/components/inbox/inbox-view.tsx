"use client";

import * as React from "react";
import {
  Archive,
  ArrowLeft,
  Inbox as InboxIcon,
  MailOpen,
  Reply,
  Send,
  UserPlus,
} from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { useCollection } from "@/components/admin/use-collection";
import { StatusBadge, Pill } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/field";
import { EMAIL_STATUS_LABEL, cn, formatDateTime, initials } from "@/lib/utils";
import type { EmailMessage } from "@/lib/demo-data";

const TABS = [
  { key: "", label: "Tous" },
  { key: "UNREAD", label: "Non lus" },
  { key: "READ", label: "Lus" },
  { key: "ARCHIVED", label: "Archivés" },
  { key: "CONVERTED", label: "Convertis" },
];

export function InboxView({ initial }: { initial: EmailMessage[] }) {
  const emails = useCollection<EmailMessage>("/api/emails", initial);
  const [tab, setTab] = React.useState("");
  const [query, setQuery] = React.useState("");
  const [selectedId, setSelectedId] = React.useState<string | null>(initial[0]?.id ?? null);
  const [reply, setReply] = React.useState("");
  const [sending, setSending] = React.useState(false);

  const sorted = React.useMemo(
    () =>
      [...emails.items].sort((a, b) => String(b.receivedAt).localeCompare(String(a.receivedAt))),
    [emails.items]
  );

  const filtered = React.useMemo(() => {
    const term = query.trim().toLowerCase();
    return sorted.filter((email) => {
      if (tab && email.status !== tab) return false;
      if (!term) return true;
      return [email.subject, email.fromName, email.fromEmail, email.snippet]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(term);
    });
  }, [sorted, tab, query]);

  const selected = emails.items.find((email) => email.id === selectedId) ?? null;

  const openMessage = async (email: EmailMessage) => {
    setSelectedId(email.id);
    if (email.status === "UNREAD") {
      await emails.update(email.id, { status: "READ", readAt: new Date().toISOString() });
    }
  };

  const setStatus = async (email: EmailMessage, status: string) => {
    await emails.update(email.id, { status });
  };

  const convert = async (email: EmailMessage) => {
    const response = await fetch(`/api/emails/${email.id}/convert`, { method: "POST" });
    if (response.ok) {
      await emails.update(email.id, { status: "CONVERTED" });
    }
  };

  const sendReply = async () => {
    if (!selected || !reply.trim()) return;
    setSending(true);
    const created = await emails.create({
      fromName: "Maison Ben Ali",
      fromEmail: "contact@maisonbenali.com",
      toEmail: selected.fromEmail,
      subject: selected.subject.startsWith("Re:")
        ? selected.subject
        : `Re: ${selected.subject}`,
      snippet: reply.slice(0, 90),
      body: reply,
      status: "READ",
      provider: "resend",
      threadKey: selected.threadKey ?? selected.id,
      isOutbound: true,
      receivedAt: new Date().toISOString(),
      leadId: selected.leadId,
    });
    if (created) {
      setReply("");
      setSelectedId(created.id);
    }
    setSending(false);
  };

  const thread = selected
    ? sorted.filter(
        (email) =>
          email.threadKey && selected.threadKey && email.threadKey === selected.threadKey
      )
    : [];

  return (
    <div className="animate-in">
      <PageHeader
        eyebrow="Communication"
        title="Boîte de réception"
        description="Emails entrants (IMAP / Resend / SendGrid) centralisés et convertibles en lead."
        actions={
          <Pill className="bg-white px-3 py-1.5 text-[11px] text-ink/60 ring-1 ring-ink/10">
            {emails.items.filter((email) => email.status === "UNREAD").length} non lus
          </Pill>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[360px_minmax(0,1fr)]">
        <div className="flex flex-col rounded-3xl border border-ink/8 bg-white shadow-[0_2px_10px_rgba(18,43,67,0.04)]">
          <div className="border-b border-ink/8 p-3">
            <div className="relative">
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Rechercher un email…"
                className="h-9 pl-3 text-[12.5px]"
                aria-label="Rechercher un email"
              />
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {TABS.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setTab(item.key)}
                  className={cn(
                    "rounded-full px-2.5 py-1 text-[11px] font-medium transition",
                    tab === item.key
                      ? "bg-ink text-white"
                      : "bg-ink/4 text-ink/60 hover:bg-ink/8"
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <ul className="max-h-[620px] divide-y divide-ink/5 overflow-y-auto">
            {filtered.length === 0 ? (
              <li className="px-4 py-10 text-center text-[12.5px] text-muted">
                Aucun message dans cette vue.
              </li>
            ) : (
              filtered.map((email) => (
                <li key={email.id}>
                  <button
                    type="button"
                    onClick={() => openMessage(email)}
                    className={cn(
                      "w-full px-3.5 py-3 text-left transition hover:bg-cream/70",
                      selectedId === email.id && "bg-cream"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "grid size-8 shrink-0 place-items-center rounded-full text-[10.5px] font-semibold",
                          email.isOutbound
                            ? "bg-ink text-white"
                            : "bg-ink/8 text-ink/70"
                        )}
                      >
                        {initials(email.fromName ?? email.fromEmail)}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[12.5px] font-semibold text-ink">
                          {email.isOutbound ? `À : ${email.toEmail}` : email.fromName ?? email.fromEmail}
                        </span>
                        <span className="block truncate text-[11px] text-muted">
                          {email.subject}
                        </span>
                      </span>
                      {email.status === "UNREAD" ? (
                        <span className="size-2 shrink-0 rounded-full bg-coral" />
                      ) : null}
                    </div>
                    <div className="mt-1.5 flex items-center gap-2 pl-10">
                      <span className="truncate text-[11px] text-ink/45">{email.snippet}</span>
                    </div>
                    <div className="mt-1.5 flex items-center gap-2 pl-10">
                      <span className="text-[10px] text-ink/35">
                        {formatDateTime(email.receivedAt)}
                      </span>
                      <StatusBadge
                        status={email.status}
                        label={EMAIL_STATUS_LABEL[email.status]}
                        className="ml-auto"
                      />
                    </div>
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>

        <div className="rounded-3xl border border-ink/8 bg-white shadow-[0_2px_10px_rgba(18,43,67,0.04)]">
          {selected ? (
            <div className="flex h-full flex-col">
              <div className="border-b border-ink/8 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="truncate text-[15px] font-semibold text-ink">
                      {selected.subject}
                    </h2>
                    <p className="mt-1 text-[11.5px] text-muted">
                      {selected.isOutbound ? "Envoyé à" : "De"} {selected.fromName ?? selected.fromEmail}{" "}
                      &lt;{selected.isOutbound ? selected.toEmail : selected.fromEmail}&gt; ·{" "}
                      {formatDateTime(selected.receivedAt)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      title="Marquer comme lu"
                      onClick={() => setStatus(selected, "READ")}
                      className="grid size-8 place-items-center rounded-lg text-ink/50 transition hover:bg-ink/5 hover:text-ink"
                    >
                      <MailOpen className="size-4" />
                    </button>
                    <button
                      type="button"
                      title="Archiver"
                      onClick={() => setStatus(selected, "ARCHIVED")}
                      className="grid size-8 place-items-center rounded-lg text-ink/50 transition hover:bg-ink/5 hover:text-ink"
                    >
                      <Archive className="size-4" />
                    </button>
                    <button
                      type="button"
                      title="Convertir en lead"
                      onClick={() => convert(selected)}
                      className="grid size-8 place-items-center rounded-lg text-emerald-600 transition hover:bg-emerald-50"
                    >
                      <UserPlus className="size-4" />
                    </button>
                  </div>
                </div>
                <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                  <StatusBadge
                    status={selected.status}
                    label={EMAIL_STATUS_LABEL[selected.status]}
                  />
                  <Pill className="bg-ink/5 text-ink/55">{selected.provider}</Pill>
                  {selected.leadId ? (
                    <Pill className="bg-coral/10 text-coral">Lead lié</Pill>
                  ) : null}
                </div>
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto p-4">
                {(thread.length > 1 ? thread : [selected]).map((message) => (
                  <article
                    key={message.id}
                    className={cn(
                      "rounded-2xl border p-4",
                      message.isOutbound
                        ? "border-ink/8 bg-cream/70"
                        : "border-ink/8 bg-white"
                    )}
                  >
                    <div className="mb-2 flex items-center gap-2 text-[11px] text-ink/45">
                      <span className="font-semibold text-ink/70">
                        {message.isOutbound ? "Maison Ben Ali" : message.fromName ?? message.fromEmail}
                      </span>
                      <span>·</span>
                      <span>{formatDateTime(message.receivedAt)}</span>
                      {message.isOutbound ? <Pill>Réponse</Pill> : null}
                    </div>
                    <p className="whitespace-pre-line text-[13px] leading-relaxed text-ink/80">
                      {message.body}
                    </p>
                  </article>
                ))}
              </div>

              <div className="border-t border-ink/8 p-4">
                <div className="mb-2 flex items-center gap-2 text-[11.5px] text-ink/50">
                  <Reply className="size-3.5" />
                  Répondre à {selected.fromEmail}
                </div>
                <Textarea
                  value={reply}
                  onChange={(event) => setReply(event.target.value)}
                  placeholder="Votre réponse…"
                  className="min-h-[92px]"
                />
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-[10.5px] text-ink/40">
                    Enregistré dans le fil ; l&apos;envoi SMTP/Resend s&apos;active via les variables
                    d&apos;environnement.
                  </p>
                  <Button
                    variant="coral"
                    size="sm"
                    onClick={sendReply}
                    disabled={!reply.trim() || sending}
                  >
                    <Send className="size-3.5" /> Envoyer
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid h-full min-h-[320px] place-items-center p-8 text-center">
              <div>
                <InboxIcon className="mx-auto mb-3 size-8 text-ink/20" />
                <p className="text-[13px] font-medium text-ink/60">Sélectionnez un message</p>
                <p className="mt-1 text-[11.5px] text-muted">
                  Le fil complet, les actions et la réponse s&apos;affichent ici.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <p className="mt-3 flex items-center gap-1.5 text-[11px] text-ink/40 lg:hidden">
        <ArrowLeft className="size-3" /> Faites défiler pour changer de message.
      </p>
    </div>
  );
}
