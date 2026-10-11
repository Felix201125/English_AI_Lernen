"use client";

import { useApp } from "@/components/providers/app-provider";
import { Button } from "@/components/ui/button";

export default function TranslatorPage() {
  const { translations, decideTranslation, permissions, activeStudentId } =
    useApp();
  const approved = translations.filter((t) => t.status === "approved").length;
  const denied = translations.filter((t) => t.status === "denied").length;

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold text-white">
        🌐 Translator
      </h1>
      <div className="eq-card p-5 text-sm">
        <p>
          Status: {permissions[activeStudentId].translator} · Usage today:{" "}
          {translations.length} requests · {approved} approved · {denied} denied
        </p>
      </div>
      <div className="space-y-3">
        {translations.map((t) => (
          <div key={t.id} className="eq-card p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-medium text-white">
                  “{t.sourceText}” · {t.sourceLanguage} → {t.targetLanguage}
                </p>
                <p className="text-xs text-slate-500">
                  {t.studentName} · {new Date(t.createdAt).toLocaleTimeString("de-DE")} ·{" "}
                  {t.status}
                  {t.status === "denied" ? " (hidden from student)" : ""}
                </p>
                {t.status === "approved" && t.shown && (
                  <p className="mt-1 text-sm text-emerald-300">
                    {t.translatedText}
                  </p>
                )}
              </div>
              {t.status === "pending" && (
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => decideTranslation(t.id, true)}>
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => decideTranslation(t.id, false)}
                  >
                    Deny
                  </Button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
