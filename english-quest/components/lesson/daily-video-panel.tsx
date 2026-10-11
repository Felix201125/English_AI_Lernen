"use client";

type Props = {
  roomUrl?: string | null;
  userName?: string;
  emptyTitle?: string;
  emptyHint?: string;
  onStart?: () => void;
  startLabel?: string;
  starting?: boolean;
  error?: string | null;
  canStart?: boolean;
};

export function DailyVideoPanel({
  roomUrl,
  userName,
  emptyTitle = "Daily.co Video",
  emptyHint = "Starte ein Meeting — Schüler können dann beitreten.",
  onStart,
  startLabel = "Meeting starten",
  starting,
  error,
  canStart = true,
}: Props) {
  if (roomUrl) {
    const joinUrl = userName
      ? `${roomUrl}${roomUrl.includes("?") ? "&" : "?"}userName=${encodeURIComponent(userName)}`
      : roomUrl;

    return (
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-black">
        <iframe
          title="Daily.co Meeting"
          src={joinUrl}
          allow="camera; microphone; fullscreen; display-capture; autoplay"
          className="aspect-video w-full min-h-[320px] border-0 bg-black"
        />
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/10 bg-[#0d1526] px-3 py-2 text-xs text-slate-400">
          <span>Daily.co · eingebettet</span>
          <a
            href={roomUrl}
            target="_blank"
            rel="noreferrer"
            className="text-indigo-300 underline"
          >
            Im neuen Tab öffnen
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex aspect-video min-h-[280px] flex-col items-center justify-center gap-4 bg-gradient-to-br from-slate-900 to-indigo-950 p-6 text-center">
      <p className="text-xs uppercase tracking-widest text-slate-400">
        {emptyTitle}
      </p>
      <p className="max-w-sm text-sm text-slate-300">{emptyHint}</p>
      {error && (
        <p className="max-w-md rounded-xl bg-rose-500/15 px-3 py-2 text-sm text-rose-200">
          {error}
        </p>
      )}
      {canStart && onStart && (
        <button
          type="button"
          disabled={starting}
          onClick={onStart}
          className="rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          {starting ? "Meeting wird erstellt…" : startLabel}
        </button>
      )}
    </div>
  );
}
