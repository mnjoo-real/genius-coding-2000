import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { homeQuestions } from "../data/homeQuestions";
import { calculateScore } from "../utils/calculateScore";
import {
  readPreparednessSnapshot,
  readRecoveryDamageRecord,
} from "../services/userInfoSyncService";
import {
  formatRiskScore,
  getRelativeRiskValue,
} from "../utils/riskDisplay";

const REPORT_TYPES = [
  {
    id: "preparedness",
    title: "Canopy Preparedness Report",
    description: "Summarizes ZIP risk, home profile answers, readiness score, and priority gaps.",
  },
  {
    id: "damage",
    title: "Post-Disaster Damage Summary",
    description: "Collects damaged-home photos, damage date, and selected damage categories.",
  },
  {
    id: "receipts",
    title: "Expense Receipt Packet",
    description: "Organizes receipt photos for hotel stays, supplies, repairs, and related costs.",
  },
];

const RISK_FIELDS = [
  { key: "floodRisk", label: "Flood risk" },
  { key: "wildfireRisk", label: "Wildfire risk" },
  { key: "heatRisk", label: "Heat risk" },
  { key: "stormRisk", label: "Storm risk" },
  { key: "winterStormRisk", label: "Winter storm risk" },
];

const CATEGORY_FIELDS = [
  { key: "locationRiskScore", label: "Location risk" },
  { key: "homeVulnerabilityScore", label: "Home vulnerability" },
  { key: "ecoMitigationScore", label: "Eco-mitigation" },
  { key: "recoveryPreparednessScore", label: "Recovery preparedness" },
];

function formatLabel(value) {
  if (!value) {
    return "";
  }

  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function formatValue(value) {
  if (value == null || value === "") {
    return "Not provided";
  }

  if (Array.isArray(value)) {
    return value.length > 0 ? value.join(", ") : "Not provided";
  }

  if (typeof value === "object") {
    const entries = Object.entries(value).filter(([, entryValue]) => {
      return Array.isArray(entryValue) ? entryValue.length > 0 : Boolean(entryValue);
    });

    if (entries.length === 0) {
      return "Not provided";
    }

    return entries
      .map(([key, entryValue]) => `${formatLabel(key)}: ${formatValue(entryValue)}`)
      .join("; ");
  }

  return String(value);
}

function getRiskValue(regionalRisk, key) {
  if (!regionalRisk || typeof regionalRisk !== "object") {
    return "Not provided";
  }

  const relativeKey = `${key}Relative`;
  if (regionalRisk[relativeKey] == null && regionalRisk[key] == null) {
    return "Not provided";
  }

  return formatRiskScore(getRelativeRiskValue(regionalRisk, key));
}

function getCategoryScore(scoreData, key) {
  const value = scoreData?.categoryScores?.[key];
  return typeof value === "number" ? value : 0;
}

function getRiskBarWidth(regionalRisk, key) {
  return `${Math.round(getRelativeRiskValue(regionalRisk, key) * 100)}%`;
}

function getScoreBarWidth(score, maxScore) {
  if (!maxScore) {
    return "0%";
  }

  return `${Math.round((score / maxScore) * 100)}%`;
}

function ProgressMetricCard({ label, value, barWidth }) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-medium text-stone-700">{label}</p>
        <p className="text-sm font-semibold text-stone-900">{value}</p>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-stone-100">
        <div className="h-full rounded-full bg-stone-500" style={{ width: barWidth }} />
      </div>
    </div>
  );
}

function formatCompactValue(value) {
  if (value == null || value === "") {
    return "Not provided";
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return "Not provided";
    }

    if (value.length <= 2) {
      return value.join(", ");
    }

    return `${value.slice(0, 2).join(", ")} +${value.length - 2}`;
  }

  if (typeof value === "object") {
    return formatValue(value);
  }

  return String(value);
}

function buildHomeProfileSections(homeProfile) {
  if (!homeProfile || typeof homeProfile !== "object" || Array.isArray(homeProfile)) {
    return [];
  }

  const sectionOrder = [];
  const sectionMap = new Map();

  homeQuestions.forEach((question) => {
    if (!sectionMap.has(question.section)) {
      sectionMap.set(question.section, []);
      sectionOrder.push(question.section);
    }

    sectionMap.get(question.section).push(question);
  });

  return sectionOrder
    .map((sectionName) => {
      const questions = sectionMap.get(sectionName) || [];
      const entries = questions
        .map((question) => {
          const value = homeProfile[question.id];
          const isEmpty =
            value == null ||
            value === "" ||
            (Array.isArray(value) && value.length === 0);

          if (isEmpty) {
            return null;
          }

          return {
            label: question.category || formatLabel(question.id),
            value: formatCompactValue(value),
          };
        })
        .filter(Boolean);

      return {
        section: sectionName,
        totalCount: questions.length,
        answeredCount: entries.length,
        entries,
      };
    })
    .filter((section) => section.answeredCount > 0);
}

function getSelectedDamageDetails(damageTypes) {
  if (!damageTypes || typeof damageTypes !== "object" || Array.isArray(damageTypes)) {
    return [];
  }

  return Object.entries(damageTypes).flatMap(([groupId, values]) => {
    if (!Array.isArray(values) || values.length === 0) {
      return [];
    }

    return values.map((value) => ({
      group: formatLabel(groupId),
      value,
    }));
  });
}

function ReportRow({ label, value }) {
  return (
    <div className="grid gap-1 rounded-xl border border-stone-200 bg-stone-50 p-4">
      <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
        {label}
      </dt>
      <dd className="text-sm leading-6 text-stone-800">{value}</dd>
    </div>
  );
}

function PhotoStrip({ photos = [], emptyText }) {
  if (!Array.isArray(photos) || photos.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-stone-200 bg-stone-50 px-4 py-5 text-sm text-stone-600">
        {emptyText}
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {photos.map((photo) => (
        <figure
          key={photo.id || photo.name}
          className="overflow-hidden rounded-2xl border border-stone-200 bg-stone-50"
        >
          <img src={photo.url} alt={photo.name || "Report photo"} className="aspect-square w-full object-cover" />
          <figcaption className="truncate px-3 py-2 text-xs text-stone-500">
            {photo.name || "Uploaded photo"}
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

function PreparednessReportPreview({ data }) {
  const { selectedZipCode, regionalRisk, homeProfile, scoreData, scoreUnavailable } = data;
  const homeProfileSections = buildHomeProfileSections(homeProfile);

  return (
    <article className="report-document rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
      <div className="border-b border-stone-100 pb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
          Preparedness
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-stone-900">
          Canopy Preparedness Report
        </h2>
        <p className="mt-2 text-sm leading-6 text-stone-600">
          A report-ready summary of location risk, home profile answers, and preparedness score.
        </p>
      </div>

      <dl className="mt-6 grid gap-3 sm:grid-cols-3">
        <ReportRow label="ZIP code" value={selectedZipCode || "Not provided"} />
        <ReportRow
          label="Current score"
          value={scoreData ? `${scoreData.totalScore}/100` : "Score unavailable"}
        />
        <ReportRow
          label="Potential score"
          value={scoreData ? `${scoreData.maxAchievableScore}/100` : "Score unavailable"}
        />
      </dl>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <section>
          <h3 className="text-lg font-semibold text-stone-900">Regional risk</h3>
          <div className="mt-3 grid gap-3">
            {RISK_FIELDS.map((risk) => {
              return (
                <ProgressMetricCard
                  key={risk.key}
                  label={risk.label}
                  value={formatRiskScore(getRelativeRiskValue(regionalRisk, risk.key))}
                  barWidth={getRiskBarWidth(regionalRisk, risk.key)}
                />
              );
            })}
          </div>
        </section>

        <section>
          <h3 className="text-lg font-semibold text-stone-900">Score breakdown</h3>
          {!scoreData ? (
            <p className="mt-3 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-5 text-sm text-stone-600">
              {scoreUnavailable ? "Score unavailable." : "Complete profile data is needed."}
            </p>
          ) : (
            <div className="mt-3 grid gap-3">
              {CATEGORY_FIELDS.map((category) => {
                const score = getCategoryScore(scoreData, category.key);

                return (
                  <ProgressMetricCard
                    key={category.key}
                    label={category.label}
                    value={`${score}/25`}
                    barWidth={getScoreBarWidth(score, 25)}
                  />
                );
              })}
            </div>
          )}
        </section>
      </div>

      <section className="mt-6">
        <div>
          <h3 className="text-lg font-semibold text-stone-900">Home profile answers</h3>
          <p className="mt-1 text-sm text-stone-600">
            Condensed by section so the key answers are visible at a glance.
          </p>
        </div>

        {homeProfileSections.length === 0 ? (
          <p className="mt-3 rounded-2xl border border-dashed border-stone-200 bg-stone-50 px-4 py-5 text-sm text-stone-600">
            No saved questionnaire answers found.
          </p>
        ) : (
          <div className="mt-3 max-h-[28rem] overflow-y-auto pr-1">
            <div className="grid gap-3 lg:grid-cols-3">
              {homeProfileSections.map((section) => (
                <div
                  key={section.section}
                  className="rounded-2xl border border-stone-200 bg-stone-50 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-stone-900">{section.section}</p>
                      <p className="mt-1 text-xs font-medium uppercase tracking-[0.16em] text-stone-500">
                        {section.answeredCount}/{section.totalCount} answered
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-2">
                    {section.entries.map((entry) => (
                      <div
                        key={`${section.section}-${entry.label}`}
                        className="rounded-xl border border-white/80 bg-white px-3 py-2 shadow-sm"
                      >
                        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-500">
                          {entry.label}
                        </p>
                        <p className="mt-1 text-sm font-medium leading-5 text-stone-800">
                          {entry.value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </article>
  );
}

function DamageReportPreview({ recoveryRecord }) {
  const damageDetails = getSelectedDamageDetails(recoveryRecord.damageTypes);

  return (
    <article className="report-document rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
      <div className="border-b border-stone-100 pb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
          Recovery
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-stone-900">
          Post-Disaster Damage Summary
        </h2>
        <p className="mt-2 text-sm leading-6 text-stone-600">
          A report-ready summary of damage date, damaged-home photos, and selected damage types.
        </p>
      </div>

      <dl className="mt-6 grid gap-3 sm:grid-cols-2">
        <ReportRow label="Damage date" value={recoveryRecord.damageDate || "Not provided"} />
        <ReportRow label="Damage details selected" value={String(damageDetails.length)} />
      </dl>

      <section className="mt-6">
        <h3 className="text-lg font-semibold text-stone-900">Damaged home photos</h3>
        <div className="mt-3">
          <PhotoStrip
            photos={recoveryRecord.homePhotos}
            emptyText="No damaged-home photos have been saved yet."
          />
        </div>
      </section>

      <section className="mt-6">
        <h3 className="text-lg font-semibold text-stone-900">Damage type details</h3>
        {damageDetails.length === 0 ? (
          <p className="mt-3 rounded-2xl border border-dashed border-stone-200 bg-stone-50 px-4 py-5 text-sm text-stone-600">
            No damage type details selected yet.
          </p>
        ) : (
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {damageDetails.map((detail) => (
              <div key={`${detail.group}-${detail.value}`} className="rounded-xl border border-stone-200 bg-stone-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
                  {detail.group}
                </p>
                <p className="mt-2 text-sm font-medium text-stone-800">{detail.value}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </article>
  );
}

function ReceiptReportPreview({ recoveryRecord }) {
  return (
    <article className="report-document rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
      <div className="border-b border-stone-100 pb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
          Recovery
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-stone-900">
          Expense Receipt Packet
        </h2>
        <p className="mt-2 text-sm leading-6 text-stone-600">
          A report-ready packet of receipt photos saved from the recovery workspace.
        </p>
      </div>

      <dl className="mt-6 grid gap-3 sm:grid-cols-2">
        <ReportRow label="Damage date" value={recoveryRecord.damageDate || "Not provided"} />
        <ReportRow
          label="Receipt photos"
          value={String(Array.isArray(recoveryRecord.receiptPhotos) ? recoveryRecord.receiptPhotos.length : 0)}
        />
      </dl>

      <section className="mt-6">
        <h3 className="text-lg font-semibold text-stone-900">Receipt photos</h3>
        <div className="mt-3">
          <PhotoStrip
            photos={recoveryRecord.receiptPhotos}
            emptyText="No receipt photos have been saved yet."
          />
        </div>
      </section>
    </article>
  );
}

function renderReportHtml(title, reportMarkup) {
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${title}</title>
    <style>
      body { font-family: "Nunito Sans", sans-serif; color: #1c1917; margin: 32px; }
      h1, h2, h3 { margin: 0; }
      .section { border: 1px solid #e7e5e4; border-radius: 18px; padding: 22px; margin: 18px 0; }
      .muted { color: #57534e; }
      .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
      .row { border: 1px solid #e7e5e4; border-radius: 12px; padding: 12px; background: #fafaf9; }
      .label { font-size: 10px; text-transform: uppercase; letter-spacing: .12em; color: #78716c; font-weight: 700; }
      .value { margin-top: 6px; font-size: 13px; line-height: 1.5; }
      .photos { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; }
      .photos img { width: 100%; aspect-ratio: 1; object-fit: cover; border-radius: 12px; border: 1px solid #e7e5e4; }
      @page { margin: 18mm; }
    </style>
  </head>
  <body>
    ${reportMarkup}
    <script>window.addEventListener("load", () => window.print());</script>
  </body>
</html>`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function rowsToHtml(rows) {
  return `<div class="grid">${rows
    .map(
      (row) =>
        `<div class="row"><div class="label">${escapeHtml(row.label)}</div><div class="value">${escapeHtml(row.value)}</div></div>`,
    )
    .join("")}</div>`;
}

function photosToHtml(photos = [], emptyText) {
  if (!Array.isArray(photos) || photos.length === 0) {
    return `<p class="muted">${escapeHtml(emptyText)}</p>`;
  }

  return `<div class="photos">${photos
    .map((photo) => `<img src="${escapeHtml(photo.url)}" alt="${escapeHtml(photo.name || "Report photo")}" />`)
    .join("")}</div>`;
}

function buildPrintableReport(selectedReport, data) {
  if (selectedReport === "preparedness") {
    const homeEntries =
      data.homeProfile && typeof data.homeProfile === "object" && !Array.isArray(data.homeProfile)
        ? Object.entries(data.homeProfile)
        : [];
    const rows = [
      { label: "ZIP code", value: data.selectedZipCode || "Not provided" },
      { label: "Current score", value: data.scoreData ? `${data.scoreData.totalScore}/100` : "Score unavailable" },
      { label: "Potential score", value: data.scoreData ? `${data.scoreData.maxAchievableScore}/100` : "Score unavailable" },
      ...RISK_FIELDS.map((risk) => ({ label: risk.label, value: getRiskValue(data.regionalRisk, risk.key) })),
      ...homeEntries.map(([key, value]) => ({ label: formatLabel(key), value: formatValue(value) })),
    ];

    return renderReportHtml(
      "Canopy Preparedness Report",
      `<h1>Canopy Preparedness Report</h1><p class="muted">Preparedness profile summary.</p><div class="section">${rowsToHtml(rows)}</div>`,
    );
  }

  if (selectedReport === "damage") {
    const damageDetails = getSelectedDamageDetails(data.recoveryRecord.damageTypes);
    const rows = [
      { label: "Damage date", value: data.recoveryRecord.damageDate || "Not provided" },
      { label: "Damage details selected", value: String(damageDetails.length) },
      ...damageDetails.map((detail) => ({ label: detail.group, value: detail.value })),
    ];

    return renderReportHtml(
      "Post-Disaster Damage Summary",
      `<h1>Post-Disaster Damage Summary</h1><p class="muted">Damage record summary.</p><div class="section">${rowsToHtml(rows)}</div><div class="section"><h2>Damaged Home Photos</h2>${photosToHtml(data.recoveryRecord.homePhotos, "No damaged-home photos saved.")}</div>`,
    );
  }

  return renderReportHtml(
    "Expense Receipt Packet",
    `<h1>Expense Receipt Packet</h1><p class="muted">Receipt photo packet.</p><div class="section">${rowsToHtml([
      { label: "Damage date", value: data.recoveryRecord.damageDate || "Not provided" },
      {
        label: "Receipt photos",
        value: String(Array.isArray(data.recoveryRecord.receiptPhotos) ? data.recoveryRecord.receiptPhotos.length : 0),
      },
    ])}</div><div class="section"><h2>Receipt Photos</h2>${photosToHtml(data.recoveryRecord.receiptPhotos, "No receipt photos saved.")}</div>`,
  );
}

function ReportsContent() {
  const [preparednessSnapshot] = useState(() => readPreparednessSnapshot());
  const [recoveryRecord] = useState(() => readRecoveryDamageRecord());
  const [selectedReport, setSelectedReport] = useState("preparedness");

  const selectedZipCode = preparednessSnapshot.selectedZipCode;
  const regionalRisk = preparednessSnapshot.regionalRisk;
  const homeProfile = preparednessSnapshot.homeProfile;

  const { scoreData, scoreUnavailable } = useMemo(() => {
    if (!regionalRisk || !homeProfile) {
      return { scoreData: null, scoreUnavailable: false };
    }

    try {
      return {
        scoreData: calculateScore(regionalRisk, homeProfile),
        scoreUnavailable: false,
      };
    } catch {
      return { scoreData: null, scoreUnavailable: true };
    }
  }, [regionalRisk, homeProfile]);

  const reportData = {
    selectedZipCode,
    regionalRisk,
    homeProfile,
    scoreData,
    scoreUnavailable,
    recoveryRecord,
  };

  const handleDownloadPdf = () => {
    const printWindow = window.open("", "_blank");

    if (!printWindow) {
      window.print();
      return;
    }

    printWindow.document.open();
    printWindow.document.write(buildPrintableReport(selectedReport, reportData));
    printWindow.document.close();
  };

  return (
    <main className="min-h-screen bg-parchment px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <section className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-leaf">
              Reports
            </p>
            <h1 className="mt-2 text-3xl sm:text-4xl">Reports</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600">
              Generate report-ready summaries from the information saved across Canopy.
            </p>
          </div>

          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-semibold text-stone-700 no-underline shadow-sm transition-colors hover:border-stone-300 hover:bg-stone-50 hover:text-stone-900"
          >
            Back to Dashboard
          </Link>
        </section>

        <div className="grid gap-8 lg:grid-cols-[320px_1fr] lg:items-start">
          <aside className="rounded-3xl border border-stone-200 bg-white p-4 shadow-sm">
            <p className="px-2 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
              Report type
            </p>
            <div className="mt-3 grid gap-2">
              {REPORT_TYPES.map((report) => {
                const isActive = selectedReport === report.id;

                return (
                  <button
                    key={report.id}
                    type="button"
                    onClick={() => setSelectedReport(report.id)}
                    className={`rounded-2xl border px-4 py-3 text-left transition-colors ${
                      isActive
                        ? "border-emerald-700 bg-emerald-700 text-white"
                        : "border-stone-200 bg-stone-50 text-stone-800 hover:border-stone-300 hover:bg-stone-100"
                    }`}
                  >
                    <span className="block text-sm font-semibold">{report.title}</span>
                    <span
                      className={`mt-1 block text-xs leading-5 ${
                        isActive ? "text-emerald-50" : "text-stone-500"
                      }`}
                    >
                      {report.description}
                    </span>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={handleDownloadPdf}
              className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-forest px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-900"
            >
              Download PDF
            </button>
            <p className="mt-3 px-2 text-xs leading-5 text-stone-500">
              Opens your browser print dialog. Choose Save as PDF to download.
            </p>
          </aside>

          {selectedReport === "preparedness" ? (
            <PreparednessReportPreview data={reportData} />
          ) : null}
          {selectedReport === "damage" ? (
            <DamageReportPreview recoveryRecord={recoveryRecord} />
          ) : null}
          {selectedReport === "receipts" ? (
            <ReceiptReportPreview recoveryRecord={recoveryRecord} />
          ) : null}
        </div>
      </div>
    </main>
  );
}

export default function Reports() {
  const { user } = useAuth();

  return <ReportsContent key={user?.id ?? "guest"} />;
}
