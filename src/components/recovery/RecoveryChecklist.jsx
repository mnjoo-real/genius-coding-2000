import { useEffect, useMemo, useState } from "react";
import { recoveryDocuments } from "../../data/recoveryDocuments";

const STORAGE_KEY = "recoveryDocumentChecklist";

function safeParseObject(rawValue) {
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

function normalizeAnswers(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeMultiValue(value) {
  return Array.isArray(value) ? value.filter((item) => typeof item === "string" && item) : [];
}

function getDocumentTitle(document) {
  return document?.title || document?.name || "Recovery Document";
}

function getPriorityStyles(priority) {
  switch (priority) {
    case "required":
    case "High":
      return "border border-amber-200 bg-amber-50 text-amber-800";
    case "recommended":
    case "Medium":
      return "border border-blue-200 bg-blue-50 text-blue-800";
    case "optional":
    case "Low":
      return "border border-slate-200 bg-slate-50 text-slate-700";
    default:
      return "border border-slate-200 bg-slate-50 text-slate-700";
  }
}

function getCategoryLabel(document) {
  return document?.category || "Other";
}

function getExamplesText(document) {
  if (!Array.isArray(document?.examples) || document.examples.length === 0) {
    return "";
  }

  const [first, second, third, ...rest] = document.examples;
  const shownExamples = [first, second, third].filter(Boolean);

  if (shownExamples.length === 0) {
    return "";
  }

  const extraText = rest.length > 0 ? ` +${rest.length} more` : "";
  return `Examples: ${shownExamples.join(", ")}${extraText}`;
}

function getMatchedRequiredDocumentIds(matchedPrograms) {
  if (!Array.isArray(matchedPrograms)) {
    return [];
  }

  return matchedPrograms.flatMap((program) =>
    Array.isArray(program?.requiredDocumentIds) ? program.requiredDocumentIds : [],
  );
}

function getProgramTypes(matchedPrograms) {
  if (!Array.isArray(matchedPrograms)) {
    return [];
  }

  return matchedPrograms
    .map((program) => program?.programType)
    .filter((programType) => typeof programType === "string" && programType);
}

function getRecommendedDocumentIds(answers, matchedPrograms) {
  const normalizedAnswers = normalizeAnswers(answers);
  const recoveryNeeds = normalizeMultiValue(normalizedAnswers.recoveryNeeds);
  const damageTypes = normalizeMultiValue(normalizedAnswers.damageTypes);
  const requiredProgramTypes = getProgramTypes(matchedPrograms);

  const recommended = new Set(["government-id"]);

  if (normalizedAnswers.ownershipStatus === "Owner") {
    recommended.add("proof-of-ownership");
  }

  if (
    normalizedAnswers.isPrimaryResidence === "Yes" ||
    recoveryNeeds.includes("primary-residence")
  ) {
    recommended.add("proof-of-occupancy");
  }

  if (["Insured", "Partially Insured"].includes(normalizedAnswers.insuranceStatus)) {
    recommended.add("insurance-policy");
    recommended.add("insurance-settlement-or-denial");
  }

  if (
    ["Settled", "Denied", "Loss not covered", "Pending"].includes(normalizedAnswers.insuranceClaimStatus)
  ) {
    recommended.add("insurance-settlement-or-denial");
  }

  if (
    damageTypes.length > 0 ||
    recoveryNeeds.some((need) => ["home-damage", "repair-needed", "uninsured-loss"].includes(need))
  ) {
    recommended.add("damage-photos");
    recommended.add("home-inventory-list");
  }

  if (damageTypes.includes("Home structure") || recoveryNeeds.includes("repair-needed")) {
    recommended.add("repair-estimates");
  }

  if (
    damageTypes.includes("Emergency supplies or lodging") ||
    recoveryNeeds.some((need) => ["urgent-need", "temporary-housing"].includes(need))
  ) {
    recommended.add("emergency-receipts");
  }

  if (normalizedAnswers.lostJobOrIncome === "Yes") {
    recommended.add("proof-of-income");
    recommended.add("tax-returns");
  }

  if (normalizedAnswers.hasBankAccount === "Yes" || normalizedAnswers.preferredPaymentMethod) {
    recommended.add("bank-account-details");
  }

  if (
    normalizedAnswers.hasSsnOrItin === "SSN" ||
    normalizedAnswers.hasSsnOrItin === "ITIN" ||
    requiredProgramTypes.length > 0
  ) {
    recommended.add("ssn-or-itin");
  }

  return Array.from(recommended);
}

function sortDocuments(documents, requiredIds, recommendedIds) {
  const requiredSet = new Set(requiredIds);
  const recommendedSet = new Set(recommendedIds);

  return [...documents].sort((a, b) => {
    const aRank = requiredSet.has(a.id) ? 0 : recommendedSet.has(a.id) ? 1 : 2;
    const bRank = requiredSet.has(b.id) ? 0 : recommendedSet.has(b.id) ? 1 : 2;

    if (aRank !== bRank) {
      return aRank - bRank;
    }

    const aPriority = a.priority === "required" || a.priority === "High" ? 0 : a.priority === "recommended" || a.priority === "Medium" ? 1 : 2;
    const bPriority = b.priority === "required" || b.priority === "High" ? 0 : b.priority === "recommended" || b.priority === "Medium" ? 1 : 2;

    if (aPriority !== bPriority) {
      return aPriority - bPriority;
    }

    return getDocumentTitle(a).localeCompare(getDocumentTitle(b));
  });
}

function groupDocuments(documents, requiredIds, recommendedIds) {
  const requiredSet = new Set(requiredIds);
  const recommendedSet = new Set(recommendedIds);

  const required = [];
  const recommended = [];
  const general = [];

  documents.forEach((document) => {
    if (requiredSet.has(document.id)) {
      required.push(document);
      return;
    }

    if (recommendedSet.has(document.id)) {
      recommended.push(document);
      return;
    }

    general.push(document);
  });

  return {
    required,
    recommended,
    general,
  };
}

function DocumentCard({ document, isReady, onToggle }) {
  return (
    <label className="flex cursor-pointer flex-col gap-4 rounded-2xl border border-stone-200 bg-stone-50 p-4 transition-colors hover:border-stone-300 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-base font-semibold text-stone-900">
            {getDocumentTitle(document)}
          </h3>
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${getPriorityStyles(
              document.priority,
            )}`}
          >
            {document.priority}
          </span>
        </div>

        <p className="mt-1 text-xs font-medium uppercase tracking-[0.16em] text-stone-500">
          {getCategoryLabel(document)}
        </p>
        <p className="mt-3 text-sm leading-6 text-stone-600">
          {document.description}
        </p>

        {getExamplesText(document) ? (
          <p className="mt-2 text-xs leading-5 text-stone-500">
            {getExamplesText(document)}
          </p>
        ) : null}
      </div>

      <div className="flex items-center gap-3 self-start sm:self-center">
        <span className="text-sm font-medium text-stone-700">
          {isReady ? "Ready" : "Not ready"}
        </span>
        <input
          type="checkbox"
          checked={isReady}
          onChange={() => onToggle(document.id)}
          className="h-5 w-5 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
          aria-label={`Mark ${getDocumentTitle(document)} as ${isReady ? "not ready" : "ready"}`}
        />
      </div>
    </label>
  );
}

function DocumentGroup({ title, description, documents, checklist, onToggle }) {
  if (!documents || documents.length === 0) {
    return null;
  }

  return (
    <section className="grid gap-4">
      <div>
        <h3 className="text-lg font-semibold text-stone-900">{title}</h3>
        {description ? (
          <p className="mt-1 text-sm leading-6 text-stone-600">{description}</p>
        ) : null}
      </div>

      <div className="grid gap-4">
        {documents.map((document) => (
          <DocumentCard
            key={document.id}
            document={document}
            isReady={Boolean(checklist[document.id])}
            onToggle={onToggle}
          />
        ))}
      </div>
    </section>
  );
}

export default function RecoveryChecklist({ matchedPrograms, answers = {} }) {
  const [checklist, setChecklist] = useState({});

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    setChecklist(safeParseObject(window.localStorage.getItem(STORAGE_KEY)));
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(checklist));
  }, [checklist]);

  const documents = Array.isArray(recoveryDocuments) ? recoveryDocuments : [];
  const normalizedAnswers = normalizeAnswers(answers);
  const requiredDocumentIds = getMatchedRequiredDocumentIds(matchedPrograms);
  const recommendedDocumentIds = getRecommendedDocumentIds(normalizedAnswers, matchedPrograms).filter(
    (documentId) => !requiredDocumentIds.includes(documentId),
  );

  const sortedDocuments = useMemo(
    () => sortDocuments(documents, requiredDocumentIds, recommendedDocumentIds),
    [documents, requiredDocumentIds, recommendedDocumentIds],
  );

  const groupedDocuments = useMemo(
    () => groupDocuments(sortedDocuments, requiredDocumentIds, recommendedDocumentIds),
    [sortedDocuments, requiredDocumentIds, recommendedDocumentIds],
  );

  const readyCount = documents.reduce((count, document) => (checklist[document.id] ? count + 1 : count), 0);

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

      <div className="mt-6 grid gap-8">
        {documents.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-stone-200 bg-stone-50 px-4 py-5 text-sm text-stone-600">
            No recovery documents are available yet.
          </p>
        ) : (
          <>
            <DocumentGroup
              title="Required for matched programs"
              description="Documents that matched aid programs may commonly request."
              documents={groupedDocuments.required}
              checklist={checklist}
              onToggle={handleToggle}
            />

            <DocumentGroup
              title="Recommended based on your answers"
              description="Documents that may help based on your recovery answers."
              documents={groupedDocuments.recommended}
              checklist={checklist}
              onToggle={handleToggle}
            />

            <DocumentGroup
              title="General preparedness"
              description="Helpful documents to keep ready for recovery planning."
              documents={groupedDocuments.general}
              checklist={checklist}
              onToggle={handleToggle}
            />
          </>
        )}
      </div>
    </section>
  );
}
