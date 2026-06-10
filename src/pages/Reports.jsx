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

const DEFAULT_APPLICANT = "Household applicant";

function formatReportDate(value = new Date()) {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not provided";
  }

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(date);
}

function getApplicantName(user) {
  const firstName = typeof user?.firstName === "string" ? user.firstName.trim() : "";
  const lastName = typeof user?.lastName === "string" ? user.lastName.trim() : "";
  const fullName = [firstName, lastName].filter(Boolean).join(" ");

  return fullName || user?.email || DEFAULT_APPLICANT;
}

function buildReportId(prefix, seed) {
  const safeSeed = String(seed || "NOZIP").replace(/[^a-z0-9]/gi, "").slice(0, 8).toUpperCase();
  return `${prefix}-${safeSeed}-${formatReportDate().replace(/[^0-9A-Za-z]/g, "").toUpperCase()}`;
}

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

function getReadinessClassification(scoreData) {
  const score = scoreData?.totalScore;

  if (typeof score !== "number") {
    return "Unscored";
  }

  if (score >= 80) {
    return "Strong readiness";
  }

  if (score >= 60) {
    return "Moderate readiness";
  }

  if (score >= 40) {
    return "Developing readiness";
  }

  return "High-priority gaps";
}

function getHighestRisks(regionalRisk) {
  return RISK_FIELDS
    .map((risk) => ({
      ...risk,
      value: getRelativeRiskValue(regionalRisk, risk.key),
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 3);
}

function buildDocumentReadinessRows(homeProfile = {}) {
  const digitalDocuments = Array.isArray(homeProfile.digitalDocuments) ? homeProfile.digitalDocuments : [];

  return [
    {
      label: "Insurance policy",
      status: digitalDocuments.includes("Insurance policy") ? "Available digitally" : "Needs copy",
    },
    {
      label: "Government-issued ID",
      status: digitalDocuments.includes("Government-issued ID") ? "Available digitally" : "Needs copy",
    },
    {
      label: "Proof of address",
      status: digitalDocuments.includes("Proof of address") ? "Available digitally" : "Needs copy",
    },
    {
      label: "Property deed or lease",
      status: digitalDocuments.includes("Property deed or lease") ? "Available digitally" : "Needs copy",
    },
    {
      label: "Pre-disaster photos",
      status: homeProfile.preDisasterPhotos === "Yes" ? "Available" : "Needs documentation",
    },
    {
      label: "Emergency plan",
      status: homeProfile.familyEmergencyPlan === "Yes" ? "Available" : "Needs update",
    },
  ];
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

function DocumentShell({ label, title, subtitle, metaItems, children }) {
  return (
    <article className="report-document overflow-hidden rounded-3xl border border-stone-300 bg-white shadow-sm">
      <header className="border-b border-stone-200 bg-stone-50 px-6 py-5">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-800">
              {label}
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-stone-950">{title}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">{subtitle}</p>
          </div>
          <div className="rounded-2xl border border-stone-200 bg-white px-4 py-3 text-right shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-stone-500">
              Prepared by
            </p>
            <p className="mt-1 text-sm font-semibold text-stone-900">Canopy Recovery File</p>
            <p className="text-xs text-stone-500">{formatReportDate()}</p>
          </div>
        </div>

        <dl className="mt-5 grid gap-px overflow-hidden rounded-2xl border border-stone-200 bg-stone-200 sm:grid-cols-2 xl:grid-cols-4">
          {metaItems.map((item) => (
            <div key={item.label} className="bg-white px-4 py-3">
              <dt className="text-[10px] font-bold uppercase tracking-[0.16em] text-stone-500">
                {item.label}
              </dt>
              <dd className="mt-1 text-sm font-semibold leading-5 text-stone-900">{item.value}</dd>
            </div>
          ))}
        </dl>
      </header>

      <div className="grid gap-6 p-6">{children}</div>
    </article>
  );
}

function DocumentSection({ eyebrow, title, children, className = "" }) {
  return (
    <section className={`rounded-2xl border border-stone-200 bg-white p-5 ${className}`}>
      {eyebrow ? (
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-800">
          {eyebrow}
        </p>
      ) : null}
      <h3 className="mt-1 text-lg font-semibold text-stone-950">{title}</h3>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function DocumentTable({ columns, rows, emptyText }) {
  if (!rows.length) {
    return (
      <p className="rounded-xl border border-dashed border-stone-200 bg-stone-50 px-4 py-5 text-sm text-stone-600">
        {emptyText}
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-stone-200">
      <table className="w-full border-collapse text-left text-sm">
        <thead className="bg-stone-50 text-[10px] font-bold uppercase tracking-[0.16em] text-stone-500">
          <tr>
            {columns.map((column) => (
              <th key={column.key} scope="col" className="border-b border-stone-200 px-3 py-2">
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100">
          {rows.map((row, index) => (
            <tr key={row.id || index}>
              {columns.map((column) => (
                <td key={column.key} className="px-3 py-3 align-top text-stone-800">
                  {row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SignatureBlock({ label = "Applicant attestation" }) {
  return (
    <div className="grid gap-4 border-t border-stone-200 pt-4 sm:grid-cols-[1fr_160px]">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-stone-500">{label}</p>
        <div className="mt-8 border-b border-stone-300" />
        <p className="mt-2 text-xs text-stone-500">Signature / name</p>
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-stone-500">Date</p>
        <div className="mt-8 border-b border-stone-300" />
        <p className="mt-2 text-xs text-stone-500">{formatReportDate()}</p>
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
  const { selectedZipCode, regionalRisk, homeProfile, scoreData, scoreUnavailable, user } = data;
  const homeProfileSections = buildHomeProfileSections(homeProfile);
  const highestRisks = getHighestRisks(regionalRisk);
  const documentRows = buildDocumentReadinessRows(homeProfile);
  const applicantName = getApplicantName(user);
  const reportId = buildReportId("PREP", selectedZipCode);

  return (
    <DocumentShell
      label="Preparedness dossier"
      title="Household Resilience Readiness Report"
      subtitle="Structured profile for preparedness planning, insurance review, and recovery document readiness."
      metaItems={[
        { label: "Report ID", value: reportId },
        { label: "Applicant", value: applicantName },
        { label: "Service ZIP", value: selectedZipCode || "Not provided" },
        { label: "Readiness class", value: getReadinessClassification(scoreData) },
      ]}
    >
      <div className="grid gap-4 lg:grid-cols-3">
        <ReportRow
          label="Current score"
          value={scoreData ? `${scoreData.totalScore}/100` : "Score unavailable"}
        />
        <ReportRow
          label="Potential score"
          value={scoreData ? `${scoreData.maxAchievableScore}/100` : "Score unavailable"}
        />
        <ReportRow label="Profile completion" value={`${homeProfileSections.length}/${new Set(homeQuestions.map((question) => question.section)).size} sections`} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <DocumentSection eyebrow="Assessment" title="Hazard Exposure Matrix">
          <div className="grid gap-3">
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
        </DocumentSection>

        <DocumentSection eyebrow="Score" title="Preparedness Scoring Summary">
          {!scoreData ? (
            <p className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-5 text-sm text-stone-600">
              {scoreUnavailable ? "Score unavailable." : "Complete profile data is needed."}
            </p>
          ) : (
            <div className="grid gap-3">
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
        </DocumentSection>
      </div>

      <DocumentSection eyebrow="Findings" title="Priority Review Notes">
        <div className="grid gap-3 md:grid-cols-3">
          {highestRisks.map((risk, index) => (
            <div key={risk.key} className="rounded-xl border border-stone-200 bg-stone-50 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-stone-500">
                Priority {index + 1}
              </p>
              <p className="mt-2 text-sm font-semibold text-stone-900">{risk.label}</p>
              <p className="mt-1 text-sm text-stone-600">{formatRiskScore(risk.value)}</p>
            </div>
          ))}
        </div>
      </DocumentSection>

      <DocumentSection eyebrow="Documents" title="Recovery Document Readiness">
        <DocumentTable
          columns={[
            { key: "label", label: "Document" },
            { key: "status", label: "Status" },
          ]}
          rows={documentRows}
          emptyText="No document readiness data found."
        />
      </DocumentSection>

      <DocumentSection eyebrow="Profile appendix" title="Household Profile Answers">
        {homeProfileSections.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-stone-200 bg-stone-50 px-4 py-5 text-sm text-stone-600">
            No saved questionnaire answers found.
          </p>
        ) : (
          <div className="max-h-[28rem] overflow-y-auto pr-1">
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
      </DocumentSection>

      <SignatureBlock label="Reviewed by household" />
    </DocumentShell>
  );
}

function DamageReportPreview({ recoveryRecord, data }) {
  const damageDetails = getSelectedDamageDetails(recoveryRecord.damageTypes);
  const applicantName = getApplicantName(data.user);
  const reportId = buildReportId("LOSS", data.selectedZipCode || recoveryRecord.damageDate);
  const photoRows = Array.isArray(recoveryRecord.homePhotos)
    ? recoveryRecord.homePhotos.map((photo, index) => ({
        id: photo.id || `${photo.name}-${index}`,
        item: `Photo ${index + 1}`,
        file: photo.name || "Uploaded photo",
        category: "Damaged home evidence",
      }))
    : [];

  return (
    <DocumentShell
      label="Loss documentation"
      title="Post-Disaster Damage Assessment Summary"
      subtitle="Field-style record for organizing observed property damage, selected impact categories, and photo evidence."
      metaItems={[
        { label: "Case reference", value: reportId },
        { label: "Applicant", value: applicantName },
        { label: "Damage date", value: recoveryRecord.damageDate || "Not provided" },
        { label: "Evidence photos", value: String(Array.isArray(recoveryRecord.homePhotos) ? recoveryRecord.homePhotos.length : 0) },
      ]}
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <ReportRow label="Inspection status" value="Self-reported household record" />
        <ReportRow label="Damage details selected" value={String(damageDetails.length)} />
        <ReportRow label="Location ZIP" value={data.selectedZipCode || "Not provided"} />
      </div>

      <DocumentSection eyebrow="Observed impacts" title="Damage Classification Log">
        {damageDetails.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-stone-200 bg-stone-50 px-4 py-5 text-sm text-stone-600">
            No damage type details selected yet.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
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
      </DocumentSection>

      <DocumentSection eyebrow="Evidence" title="Damaged Home Photo Exhibit">
        <PhotoStrip
          photos={recoveryRecord.homePhotos}
          emptyText="No damaged-home photos have been saved yet."
        />
      </DocumentSection>

      <DocumentSection eyebrow="Evidence index" title="Photo Evidence Register">
        <DocumentTable
          columns={[
            { key: "item", label: "Item" },
            { key: "file", label: "File name" },
            { key: "category", label: "Evidence category" },
          ]}
          rows={photoRows}
          emptyText="No photo evidence has been registered."
        />
      </DocumentSection>

      <SignatureBlock label="Damage record prepared by" />
    </DocumentShell>
  );
}

function ReceiptReportPreview({ recoveryRecord, data }) {
  const receiptPhotos = Array.isArray(recoveryRecord.receiptPhotos) ? recoveryRecord.receiptPhotos : [];
  const reportId = buildReportId("EXP", data.selectedZipCode || recoveryRecord.damageDate);
  const receiptRows = receiptPhotos.map((photo, index) => ({
    id: photo.id || `${photo.name}-${index}`,
    item: `Receipt ${index + 1}`,
    file: photo.name || "Uploaded receipt",
    category: "Emergency or recovery expense",
    amount: "Pending entry",
  }));

  return (
    <DocumentShell
      label="Expense documentation"
      title="Disaster-Related Expense Receipt Packet"
      subtitle="Organized expense packet for lodging, emergency supplies, temporary repairs, transportation, and other recovery costs."
      metaItems={[
        { label: "Packet reference", value: reportId },
        { label: "Applicant", value: getApplicantName(data.user) },
        { label: "Damage date", value: recoveryRecord.damageDate || "Not provided" },
        { label: "Receipts attached", value: String(receiptPhotos.length) },
      ]}
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <ReportRow label="Packet status" value="Draft expense register" />
        <ReportRow label="Review needed" value="Enter vendor, date, and amount for each receipt" />
        <ReportRow label="Location ZIP" value={data.selectedZipCode || "Not provided"} />
      </div>

      <DocumentSection eyebrow="Register" title="Receipt Index">
        <DocumentTable
          columns={[
            { key: "item", label: "Item" },
            { key: "file", label: "Receipt image" },
            { key: "category", label: "Expense category" },
            { key: "amount", label: "Amount" },
          ]}
          rows={receiptRows}
          emptyText="No receipt photos have been saved yet."
        />
      </DocumentSection>

      <DocumentSection eyebrow="Attachments" title="Receipt Photo Exhibits">
        <PhotoStrip
          photos={receiptPhotos}
          emptyText="No receipt photos have been saved yet."
        />
      </DocumentSection>

      <SignatureBlock label="Expense packet prepared by" />
    </DocumentShell>
  );
}

function renderReportHtml(title, reportMarkup) {
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${title}</title>
    <style>
      body { font-family: Arial, sans-serif; color: #1c1917; margin: 32px; }
      h1, h2, h3, p { margin: 0; }
      h1 { font-size: 28px; }
      h2 { font-size: 17px; margin-bottom: 12px; }
      h3 { font-size: 14px; margin-bottom: 8px; }
      .document-header { border: 1px solid #d6d3d1; border-radius: 18px; overflow: hidden; margin-bottom: 18px; }
      .masthead { background: #f5f5f4; border-bottom: 1px solid #d6d3d1; padding: 22px; }
      .eyebrow { font-size: 10px; text-transform: uppercase; letter-spacing: .18em; color: #166534; font-weight: 700; margin-bottom: 6px; }
      .meta { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); border-top: 1px solid #d6d3d1; }
      .meta-cell { border-right: 1px solid #d6d3d1; padding: 12px; }
      .meta-cell:last-child { border-right: 0; }
      .section { border: 1px solid #e7e5e4; border-radius: 14px; padding: 18px; margin: 14px 0; break-inside: avoid; }
      .muted { color: #57534e; }
      .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
      .row { border: 1px solid #e7e5e4; border-radius: 12px; padding: 12px; background: #fafaf9; }
      .label { font-size: 10px; text-transform: uppercase; letter-spacing: .12em; color: #78716c; font-weight: 700; }
      .value { margin-top: 6px; font-size: 13px; line-height: 1.5; }
      .photos { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; }
      .photos img { width: 100%; aspect-ratio: 1; object-fit: cover; border-radius: 12px; border: 1px solid #e7e5e4; }
      table { width: 100%; border-collapse: collapse; font-size: 12px; }
      th { text-align: left; font-size: 9px; text-transform: uppercase; letter-spacing: .12em; color: #78716c; background: #fafaf9; }
      th, td { border: 1px solid #e7e5e4; padding: 9px; vertical-align: top; }
      .signature { display: grid; grid-template-columns: 1fr 180px; gap: 24px; border-top: 1px solid #d6d3d1; padding-top: 18px; margin-top: 18px; }
      .signature-line { border-bottom: 1px solid #a8a29e; height: 32px; }
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

function tableToHtml(columns, rows, emptyText) {
  if (!rows.length) {
    return `<p class="muted">${escapeHtml(emptyText)}</p>`;
  }

  return `<table><thead><tr>${columns
    .map((column) => `<th>${escapeHtml(column.label)}</th>`)
    .join("")}</tr></thead><tbody>${rows
    .map(
      (row) =>
        `<tr>${columns
          .map((column) => `<td>${escapeHtml(row[column.key])}</td>`)
          .join("")}</tr>`,
    )
    .join("")}</tbody></table>`;
}

function photosToHtml(photos = [], emptyText) {
  if (!Array.isArray(photos) || photos.length === 0) {
    return `<p class="muted">${escapeHtml(emptyText)}</p>`;
  }

  return `<div class="photos">${photos
    .map((photo) => `<img src="${escapeHtml(photo.url)}" alt="${escapeHtml(photo.name || "Report photo")}" />`)
    .join("")}</div>`;
}

function documentHeaderToHtml({ eyebrow, title, subtitle, metaItems }) {
  return `<div class="document-header">
    <div class="masthead">
      <p class="eyebrow">${escapeHtml(eyebrow)}</p>
      <h1>${escapeHtml(title)}</h1>
      <p class="muted" style="margin-top: 8px;">${escapeHtml(subtitle)}</p>
    </div>
    <div class="meta">${metaItems
      .map(
        (item) =>
          `<div class="meta-cell"><div class="label">${escapeHtml(item.label)}</div><div class="value"><strong>${escapeHtml(item.value)}</strong></div></div>`,
      )
      .join("")}</div>
  </div>`;
}

function signatureToHtml(label) {
  return `<div class="signature">
    <div>
      <div class="label">${escapeHtml(label)}</div>
      <div class="signature-line"></div>
      <div class="value">Signature / name</div>
    </div>
    <div>
      <div class="label">Date</div>
      <div class="signature-line"></div>
      <div class="value">${escapeHtml(formatReportDate())}</div>
    </div>
  </div>`;
}

function buildPrintableReport(selectedReport, data) {
  if (selectedReport === "preparedness") {
    const profileSections = buildHomeProfileSections(data.homeProfile);
    const highestRisks = getHighestRisks(data.regionalRisk).map((risk, index) => ({
      priority: `Priority ${index + 1}`,
      hazard: risk.label,
      level: formatRiskScore(risk.value),
    }));
    const documentRows = buildDocumentReadinessRows(data.homeProfile);
    const profileRows = profileSections.flatMap((section) =>
      section.entries.map((entry) => ({
        section: section.section,
        field: entry.label,
        response: entry.value,
      })),
    );

    return renderReportHtml(
      "Household Resilience Readiness Report",
      `${documentHeaderToHtml({
        eyebrow: "Preparedness dossier",
        title: "Household Resilience Readiness Report",
        subtitle: "Structured profile for preparedness planning, insurance review, and recovery document readiness.",
        metaItems: [
          { label: "Report ID", value: buildReportId("PREP", data.selectedZipCode) },
          { label: "Applicant", value: getApplicantName(data.user) },
          { label: "Service ZIP", value: data.selectedZipCode || "Not provided" },
          { label: "Readiness class", value: getReadinessClassification(data.scoreData) },
        ],
      })}
      <div class="section"><h2>Preparedness Snapshot</h2>${rowsToHtml([
        { label: "Current score", value: data.scoreData ? `${data.scoreData.totalScore}/100` : "Score unavailable" },
        { label: "Potential score", value: data.scoreData ? `${data.scoreData.maxAchievableScore}/100` : "Score unavailable" },
        { label: "Profile completion", value: `${profileSections.length}/${new Set(homeQuestions.map((question) => question.section)).size} sections` },
        { label: "Prepared date", value: formatReportDate() },
      ])}</div>
      <div class="section"><h2>Hazard Exposure Matrix</h2>${rowsToHtml(RISK_FIELDS.map((risk) => ({ label: risk.label, value: getRiskValue(data.regionalRisk, risk.key) })))}</div>
      <div class="section"><h2>Priority Review Notes</h2>${tableToHtml(
        [
          { key: "priority", label: "Priority" },
          { key: "hazard", label: "Hazard" },
          { key: "level", label: "Relative risk" },
        ],
        highestRisks,
        "No risk data found.",
      )}</div>
      <div class="section"><h2>Recovery Document Readiness</h2>${tableToHtml(
        [
          { key: "label", label: "Document" },
          { key: "status", label: "Status" },
        ],
        documentRows,
        "No document readiness data found.",
      )}</div>
      <div class="section"><h2>Household Profile Appendix</h2>${tableToHtml(
        [
          { key: "section", label: "Section" },
          { key: "field", label: "Field" },
          { key: "response", label: "Response" },
        ],
        profileRows,
        "No saved questionnaire answers found.",
      )}</div>
      ${signatureToHtml("Reviewed by household")}`,
    );
  }

  if (selectedReport === "damage") {
    const damageDetails = getSelectedDamageDetails(data.recoveryRecord.damageTypes);
    const damageRows = damageDetails.map((detail) => ({
      group: detail.group,
      detail: detail.value,
      source: "Self-reported",
    }));
    const photoRows = Array.isArray(data.recoveryRecord.homePhotos)
      ? data.recoveryRecord.homePhotos.map((photo, index) => ({
          item: `Photo ${index + 1}`,
          file: photo.name || "Uploaded photo",
          category: "Damaged home evidence",
        }))
      : [];

    return renderReportHtml(
      "Post-Disaster Damage Assessment Summary",
      `${documentHeaderToHtml({
        eyebrow: "Loss documentation",
        title: "Post-Disaster Damage Assessment Summary",
        subtitle: "Field-style record for organizing observed property damage, selected impact categories, and photo evidence.",
        metaItems: [
          { label: "Case reference", value: buildReportId("LOSS", data.selectedZipCode || data.recoveryRecord.damageDate) },
          { label: "Applicant", value: getApplicantName(data.user) },
          { label: "Damage date", value: data.recoveryRecord.damageDate || "Not provided" },
          { label: "Evidence photos", value: String(Array.isArray(data.recoveryRecord.homePhotos) ? data.recoveryRecord.homePhotos.length : 0) },
        ],
      })}
      <div class="section"><h2>Claim Snapshot</h2>${rowsToHtml([
        { label: "Inspection status", value: "Self-reported household record" },
        { label: "Damage details selected", value: String(damageDetails.length) },
        { label: "Location ZIP", value: data.selectedZipCode || "Not provided" },
        { label: "Prepared date", value: formatReportDate() },
      ])}</div>
      <div class="section"><h2>Damage Classification Log</h2>${tableToHtml(
        [
          { key: "group", label: "Impact group" },
          { key: "detail", label: "Observed detail" },
          { key: "source", label: "Source" },
        ],
        damageRows,
        "No damage type details selected yet.",
      )}</div>
      <div class="section"><h2>Photo Evidence Register</h2>${tableToHtml(
        [
          { key: "item", label: "Item" },
          { key: "file", label: "File name" },
          { key: "category", label: "Evidence category" },
        ],
        photoRows,
        "No photo evidence has been registered.",
      )}</div>
      <div class="section"><h2>Damaged Home Photo Exhibit</h2>${photosToHtml(data.recoveryRecord.homePhotos, "No damaged-home photos saved.")}</div>
      ${signatureToHtml("Damage record prepared by")}`,
    );
  }

  const receiptPhotos = Array.isArray(data.recoveryRecord.receiptPhotos)
    ? data.recoveryRecord.receiptPhotos
    : [];
  const receiptRows = receiptPhotos.map((photo, index) => ({
    item: `Receipt ${index + 1}`,
    file: photo.name || "Uploaded receipt",
    category: "Emergency or recovery expense",
    amount: "Pending entry",
  }));

  return renderReportHtml(
    "Disaster-Related Expense Receipt Packet",
    `${documentHeaderToHtml({
      eyebrow: "Expense documentation",
      title: "Disaster-Related Expense Receipt Packet",
      subtitle: "Organized expense packet for lodging, emergency supplies, temporary repairs, transportation, and other recovery costs.",
      metaItems: [
        { label: "Packet reference", value: buildReportId("EXP", data.selectedZipCode || data.recoveryRecord.damageDate) },
        { label: "Applicant", value: getApplicantName(data.user) },
        { label: "Damage date", value: data.recoveryRecord.damageDate || "Not provided" },
        { label: "Receipts attached", value: String(receiptPhotos.length) },
      ],
    })}
    <div class="section"><h2>Packet Snapshot</h2>${rowsToHtml([
      { label: "Packet status", value: "Draft expense register" },
      { label: "Review needed", value: "Enter vendor, date, and amount for each receipt" },
      { label: "Location ZIP", value: data.selectedZipCode || "Not provided" },
      { label: "Prepared date", value: formatReportDate() },
    ])}</div>
    <div class="section"><h2>Receipt Index</h2>${tableToHtml(
      [
        { key: "item", label: "Item" },
        { key: "file", label: "Receipt image" },
        { key: "category", label: "Expense category" },
        { key: "amount", label: "Amount" },
      ],
      receiptRows,
      "No receipt photos have been saved yet.",
    )}</div>
    <div class="section"><h2>Receipt Photo Exhibits</h2>${photosToHtml(receiptPhotos, "No receipt photos saved.")}</div>
    ${signatureToHtml("Expense packet prepared by")}`,
  );
}

function ReportsContent({ user }) {
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
    user,
  };

  const handleDownloadPdf = () => {
    const iframe = document.createElement("iframe");
    iframe.setAttribute("aria-hidden", "true");
    iframe.style.position = "fixed";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.pointerEvents = "none";

    const cleanup = () => {
      window.setTimeout(() => {
        iframe.remove();
      }, 250);
    };

    iframe.onload = () => {
      const frameWindow = iframe.contentWindow;
      if (!frameWindow) {
        cleanup();
        return;
      }

      frameWindow.focus();
      frameWindow.addEventListener("afterprint", cleanup, { once: true });
      frameWindow.print();
      window.setTimeout(cleanup, 1000);
    };

    iframe.srcdoc = buildPrintableReport(selectedReport, reportData);
    document.body.appendChild(iframe);
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
            <DamageReportPreview recoveryRecord={recoveryRecord} data={reportData} />
          ) : null}
          {selectedReport === "receipts" ? (
            <ReceiptReportPreview recoveryRecord={recoveryRecord} data={reportData} />
          ) : null}
        </div>
      </div>
    </main>
  );
}

export default function Reports() {
  const { user } = useAuth();

  return <ReportsContent key={user?.id ?? "guest"} user={user} />;
}
