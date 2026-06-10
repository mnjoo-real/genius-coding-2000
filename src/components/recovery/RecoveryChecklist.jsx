import { useEffect, useState } from "react";
import { recoveryDocuments } from "../../data/recoveryDocuments";

const STORAGE_KEY = "recoveryDocumentChecklist";

function safeParseChecklist(rawValue) {
  if (!rawValue) {
    return {};
  }

  try {
    const parsed = JSON.parse(rawValue);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed;
    }
  } catch {
    // Fall through to the safe default.
  }

  return {};
}

function getPriorityStyles(priority) {
  switch (priority) {
    case "High":
      return "border border-amber-200 bg-amber-50 text-amber-800";
    case "Medium":
      return "border border-blue-200 bg-blue-50 text-blue-800";
    case "Low":
      return "border border-slate-200 bg-slate-50 text-slate-700";
    default:
      return "border border-slate-200 bg-slate-50 text-slate-700";
  }
}

export default function RecoveryChecklist() {
  const [checklist, setChecklist] = useState({});

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    setChecklist(safeParseChecklist(window.localStorage.getItem(STORAGE_KEY)));
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(checklist));
  }, [checklist]);

  const documents = Array.isArray(recoveryDocuments) ? recoveryDocuments : [];
  const readyCount = documents.reduce((count, document) => {
    return checklist[document.id] ? count + 1 : count;
  }, 0);

  const handleToggle = (documentId) => {
    setChecklist((currentChecklist) => ({
      ...currentChecklist,
      [documentId]: !currentChecklist[documentId],
    }));
  };

  return (
    <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
            Recovery Center
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-stone-900">
            Prepare Recovery Documents
          </h2>
        </div>
        <p className="text-sm font-medium text-stone-600">
          {readyCount} of {documents.length} ready
        </p>
      </div>

      <div className="mt-6 grid gap-4">
        {documents.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-stone-200 bg-stone-50 px-4 py-5 text-sm text-stone-600">
            No recovery documents are available yet.
          </p>
        ) : (
          documents.map((document) => {
            const isReady = Boolean(checklist[document.id]);

            return (
              <label
                key={document.id}
                className="flex cursor-pointer flex-col gap-4 rounded-2xl border border-stone-200 bg-stone-50 p-4 transition-colors hover:border-stone-300 sm:flex-row sm:items-start sm:justify-between"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-semibold text-stone-900">{document.title}</h3>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${getPriorityStyles(document.priority)}`}
                    >
                      {document.priority}
                    </span>
                  </div>
                  <p className="mt-1 text-xs font-medium uppercase tracking-[0.16em] text-stone-500">
                    {document.category}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-stone-600">{document.description}</p>
                </div>

                <div className="flex items-center gap-3 self-start sm:self-center">
                  <span className="text-sm font-medium text-stone-700">
                    {isReady ? "Ready" : "Not ready"}
                  </span>
                  <input
                    type="checkbox"
                    checked={isReady}
                    onChange={() => handleToggle(document.id)}
                    className="h-5 w-5 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
                    aria-label={`Mark ${document.title} as ${isReady ? "not ready" : "ready"}`}
                  />
                </div>
              </label>
            );
          })
        )}
      </div>
    </section>
  );
}
