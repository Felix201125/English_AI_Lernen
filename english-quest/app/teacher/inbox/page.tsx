"use client";

import { useApp } from "@/components/providers/app-provider";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";

export default function TeacherInboxPage() {
  const {
    messages,
    notifications,
    decideStudentRequest,
    markNotificationRead,
    settings,
  } = useApp();

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold text-white">
        Request Inbox
      </h1>
      <p className="text-sm text-slate-400">
        Reply policy:{" "}
        <strong className="text-white">
          {settings.teacherReplyPolicy === "ai-may-reply"
            ? "AI may answer simple next-step questions"
            : "Always ask me first"}
        </strong>
      </p>

      <section className="space-y-4">
        {messages.map((m) => (
          <div key={m.id} className="eq-card space-y-3 p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-display text-lg text-white">
                PENDING STUDENT REQUEST · {m.studentName}
              </h2>
              <span className="text-xs text-slate-500">
                {new Date(m.createdAt).toLocaleTimeString("de-DE")}
              </span>
            </div>
            {m.kind === "voice" ? (
              <div className="rounded-xl bg-black/30 p-4">
                <p className="text-xs text-cyan-300">🎙️ Voice</p>
                <div className="my-2 flex h-8 items-end gap-1">
                  {Array.from({ length: 16 }).map((_, i) => (
                    <span
                      key={i}
                      className="w-1.5 rounded-full bg-cyan-400/80"
                      style={{ height: `${8 + ((i * 7) % 24)}px` }}
                    />
                  ))}
                </div>
                <p className="text-sm">
                  DE: “{m.transcriptDe}”
                </p>
                <p className="text-sm text-emerald-300">
                  EN for teacher: “{m.translationEn}”
                </p>
              </div>
            ) : (
              <p className="text-lg text-white">“{m.text}”</p>
            )}
            <p className="text-sm">
              <span className="text-slate-400">Interpretation:</span>{" "}
              {m.aiInterpretation}
            </p>
            <p className="text-sm">
              <span className="text-sky-300">Unterrichtshinweis:</span> {m.teacherAiReview}
            </p>
            {m.mainProposal && (
              <div className="rounded-xl border border-white/10 bg-black/20 p-3 text-sm">
                <span className="text-emerald-300">Vorschlag:</span>{" "}
                {m.mainProposal.title} · {m.mainProposal.level} ·{" "}
                {m.mainProposal.durationMinutes} min
                <div className="mt-1">
                  <StatusBadge status={m.mainProposal.status} />
                </div>
              </div>
            )}
            {m.aiReply && (
              <p className="text-sm text-indigo-200">AI reply: {m.aiReply}</p>
            )}
            {m.status === "pending" ? (
              <div className="flex flex-wrap gap-2">
                <Button size="sm" onClick={() => decideStudentRequest(m.id, true)}>
                  Approve and release
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => decideStudentRequest(m.id, false)}
                >
                  Deny
                </Button>
              </div>
            ) : (
              <p className="text-xs text-slate-500">Status: {m.status}</p>
            )}
          </div>
        ))}
      </section>

      <section className="eq-card p-5">
        <h2 className="font-display text-lg">Notifications (Solo completions)</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {notifications.map((n) => (
            <li
              key={n.id}
              className={`flex items-center justify-between rounded-xl px-3 py-2 ${
                n.read ? "bg-white/5" : "bg-amber-500/10"
              }`}
            >
              <span>
                {n.message}
                <span className="ml-2 text-xs text-slate-500">{n.type}</span>
              </span>
              {!n.read && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => markNotificationRead(n.id)}
                >
                  Gelesen
                </Button>
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
