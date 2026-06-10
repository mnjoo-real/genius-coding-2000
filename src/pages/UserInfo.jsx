import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { calculateScore } from "../utils/calculateScore";
import { readPreparednessSnapshot } from "../services/userInfoSyncService";

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
    try {
      const serialized = JSON.stringify(value);
      return serialized === "{}" ? "Provided" : serialized;
    } catch {
      return "Provided";
    }
  }

  return String(value);
}

function getRiskValue(regionalRisk, key) {
  if (!regionalRisk || typeof regionalRisk !== "object") {
    return "Not provided";
  }

  const value = regionalRisk[key];
  return value == null || value === "" ? "Not provided" : String(value);
}

function getRiskCardStyle(regionalRisk, key) {
  if (!regionalRisk || typeof regionalRisk !== "object") {
    return {
      label: "Unknown",
      className: "border-stone-200 bg-stone-50",
      labelClassName: "text-stone-500",
      valueClassName: "text-stone-900",
      badgeClassName: "border-stone-200 bg-white text-stone-500",
    };
  }

  const numericValue = Number(regionalRisk[key]);
  if (!Number.isFinite(numericValue)) {
    return {
      label: "Unknown",
      className: "border-stone-200 bg-stone-50",
      labelClassName: "text-stone-500",
      valueClassName: "text-stone-900",
      badgeClassName: "border-stone-200 bg-white text-stone-500",
    };
  }

  if (numericValue >= 75) {
    return {
      label: "High",
      className: "border-red-200 bg-red-50",
      labelClassName: "text-red-700",
      valueClassName: "text-red-700",
      badgeClassName: "border-red-200 bg-white/70 text-red-700",
    };
  }

  if (numericValue >= 45) {
    return {
      label: "Medium",
      className: "border-amber-200 bg-amber-50",
      labelClassName: "text-amber-700",
      valueClassName: "text-amber-700",
      badgeClassName: "border-amber-200 bg-white/70 text-amber-700",
    };
  }

  return {
    label: "Low",
    className: "border-leaf/30 bg-moss/40",
    labelClassName: "text-forest",
    valueClassName: "text-forest",
    badgeClassName: "border-leaf/30 bg-white/70 text-forest",
  };
}

function getCategoryScore(scoreData, key) {
  const value = scoreData?.categoryScores?.[key];
  return typeof value === "number" ? value : 0;
}

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

function ReportRow({ label, value }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-24 shrink-0 text-[10px] font-medium uppercase tracking-[0.12em] text-stone-400">
        {label}
      </span>
      <span className="min-w-0 flex-1 truncate rounded bg-stone-100 px-2.5 py-1.5 text-xs font-medium text-stone-700">
        {value}
      </span>
    </div>
  );
}

function PreparednessReport({ selectedZipCode, scoreData, scoreUnavailable }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-md lg:sticky lg:top-20">
      <div className="flex items-center gap-2.5 bg-forest px-5 py-3">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path
            d="M7 1.5C4 1.5 1.5 4 1.5 7S4 12.5 7 12.5 12.5 10 12.5 7 10 1.5 7 1.5z"
            stroke="rgba(255,255,255,0.5)"
            strokeWidth="1.2"
          />
          <path
            d="M4.75 7.25 6.3 8.8 9.4 5.7"
            stroke="white"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.3"
          />
        </svg>
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
          Canopy Preparedness Report
        </span>
      </div>

      <div className="flex flex-col gap-5 p-5">
        <div className="space-y-2">
          <ReportRow label="ZIP code" value={selectedZipCode || "Not provided"} />
          <ReportRow
            label="Current"
            value={scoreData ? `${scoreData.totalScore}/100` : "Score unavailable"}
          />
          <ReportRow
            label="Potential"
            value={scoreData ? `${scoreData.maxAchievableScore}/100` : "Score unavailable"}
          />
        </div>

        <div className="h-px bg-stone-100" />

        <div>
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-stone-500">
            Score Breakdown
          </p>
          {!scoreData ? (
            <p className="rounded-lg bg-stone-50 px-3 py-2 text-xs text-stone-500">
              {scoreUnavailable ? "Score unavailable." : "Score unavailable."}
            </p>
          ) : (
            <div className="space-y-2">
              {CATEGORY_FIELDS.map((category) => {
                const score = getCategoryScore(scoreData, category.key);

                return (
                  <div key={category.key} className="flex items-center gap-3">
                    <span className="w-28 shrink-0 text-[11px] text-stone-600">
                      {category.label}
                    </span>
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-stone-100">
                      <div
                        className="h-full rounded-full bg-leaf"
                        style={{ width: `${Math.min((score / 25) * 100, 100)}%` }}
                      />
                    </div>
                    <span className="w-10 text-right text-[11px] tabular-nums text-stone-500">
                      {score}/25
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="h-px bg-stone-100" />

        <div>
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-stone-500">
            Priority Notes
          </p>
          {scoreData?.weaknesses?.length ? (
            <div className="space-y-1.5">
              {scoreData.weaknesses.slice(0, 5).map((weakness) => (
                <div key={weakness} className="flex items-start gap-2">
                  <div className="mt-1 h-2.5 w-2.5 shrink-0 rounded-sm border border-leaf/40 bg-moss" />
                  <span className="text-[11px] leading-5 text-stone-600">{weakness}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-stone-500">No major vulnerabilities detected.</p>
          )}
        </div>
      </div>
    </section>
  );
}

export default function UserInfo() {
  const [preparednessSnapshot] = useState(() => readPreparednessSnapshot());

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

  if (!homeProfile || !regionalRisk) {
    return (
      <main className="min-h-screen bg-parchment px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <section className="rounded-3xl border border-stone-200 bg-white p-8 shadow-sm">
            <h1 className="text-3xl font-semibold text-stone-900">No user profile found</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600">
              Complete the location and home assessment to build your preparedness profile.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/location"
                className="inline-flex items-center justify-center rounded-full bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-800"
              >
                Start Assessment
              </Link>
              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center rounded-full border border-stone-200 bg-stone-50 px-5 py-3 text-sm font-semibold text-stone-700 transition-colors hover:border-stone-300 hover:bg-stone-100"
              >
                Back to Dashboard
              </Link>
            </div>
          </section>
        </div>
      </main>
    );
  }

  const homeProfileEntries =
    homeProfile && typeof homeProfile === "object" && !Array.isArray(homeProfile)
      ? Object.entries(homeProfile)
      : [];

  return (
    <main className="min-h-screen bg-parchment px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <section className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-leaf">
              Preparedness Profile
            </p>
            <h1 className="mt-2 text-3xl sm:text-4xl">User Info</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600">
              Review the location, home assessment answers, and readiness profile saved in this
              browser.
            </p>
          </div>

          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-semibold text-stone-700 no-underline shadow-sm transition-colors hover:border-stone-300 hover:bg-stone-50 hover:text-stone-900"
          >
            Back to Dashboard
          </Link>
        </section>

        <div className="grid gap-8 lg:grid-cols-[minmax(300px,380px)_1fr] lg:items-start">
          <PreparednessReport
            selectedZipCode={selectedZipCode}
            scoreData={scoreData}
            scoreUnavailable={scoreUnavailable}
          />

          <div className="flex min-w-0 flex-col gap-6">
            <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl">Location summary</h2>
              <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                <div className="rounded-xl border border-stone-200 bg-stone-50 p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-500">
                    ZIP code
                  </p>
                  <p className="mt-2 text-lg font-semibold text-stone-900">
                    {selectedZipCode || "Not provided"}
                  </p>
                </div>

                {RISK_FIELDS.map((risk) => {
                  const style = getRiskCardStyle(regionalRisk, risk.key);

                  return (
                    <div key={risk.key} className={`rounded-xl border p-4 ${style.className}`}>
                      <div className="flex items-start justify-between gap-3">
                        <p
                          className={`text-[10px] font-semibold uppercase tracking-[0.16em] ${style.labelClassName}`}
                        >
                          {risk.label}
                        </p>
                        <span
                          className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] ${style.badgeClassName}`}
                        >
                          {style.label}
                        </span>
                      </div>
                      <p className={`mt-2 text-lg font-semibold ${style.valueClassName}`}>
                        {getRiskValue(regionalRisk, risk.key)}
                      </p>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-400">
                    Local storage
                  </p>
                  <h2 className="mt-1 text-xl">Saved profile source</h2>
                </div>
                <span className="text-xs text-stone-400">
                  Browser only
                </span>
              </div>

              <p className="mt-4 max-w-3xl text-sm leading-6 text-stone-600">
                Login state and questionnaire data are stored locally on this device. ZIP code
                lookup still uses the Supabase-backed regional risk data source before saving the
                resolved risk profile here.
              </p>

              <div className="mt-5 rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-600">
                <p className="font-medium text-stone-900">Keys used</p>
                <p className="mt-1 text-xs leading-5">
                  selectedZipCode, regionalRisk, homeProfile, canopyLocalAuthSession,
                  canopyLocalAuthUsers
                </p>
              </div>
            </section>

            <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-400">
                    Saved answers
                  </p>
                  <h2 className="mt-1 text-xl">Home questionnaire</h2>
                </div>
                <span className="text-xs text-stone-400">
                  {homeProfileEntries.length} fields
                </span>
              </div>

              {homeProfileEntries.length === 0 ? (
                <p className="mt-4 text-sm text-stone-600">
                  No saved questionnaire answers found.
                </p>
              ) : (
                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  {homeProfileEntries.map(([key, value]) => (
                    <div key={key} className="rounded-xl border border-stone-200 bg-stone-50 p-4">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-500">
                        {formatLabel(key)}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-stone-800">
                        {formatValue(value)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
