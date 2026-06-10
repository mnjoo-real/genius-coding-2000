import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { calculateScore } from "../utils/calculateScore";

function safeParseJson(value) {
  if (typeof value !== "string") {
    return null;
  }

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function readStorageValue(key) {
  if (typeof window === "undefined") {
    return null;
  }

  const rawValue = window.localStorage.getItem(key);
  if (rawValue == null) {
    return null;
  }

  if (key === "selectedZipCode") {
    const parsedValue = safeParseJson(rawValue);

    if (typeof parsedValue === "string") {
      return parsedValue;
    }

    return rawValue;
  }

  return safeParseJson(rawValue);
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

export default function UserInfo() {
  const [selectedZipCode, setSelectedZipCode] = useState(null);
  const [regionalRisk, setRegionalRisk] = useState(null);
  const [homeProfile, setHomeProfile] = useState(null);
  const [scoreData, setScoreData] = useState(null);
  const [scoreUnavailable, setScoreUnavailable] = useState(false);

  useEffect(() => {
    setSelectedZipCode(readStorageValue("selectedZipCode"));
    setRegionalRisk(readStorageValue("regionalRisk"));
    setHomeProfile(readStorageValue("homeProfile"));
  }, []);

  useEffect(() => {
    if (!regionalRisk || !homeProfile) {
      setScoreData(null);
      setScoreUnavailable(false);
      return;
    }

    try {
      setScoreData(calculateScore(regionalRisk, homeProfile));
      setScoreUnavailable(false);
    } catch {
      setScoreData(null);
      setScoreUnavailable(true);
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
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
                Preparedness Profile
              </p>
              <h1 className="mt-2 text-3xl font-semibold text-stone-900">User Info</h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-stone-600">
                Review your saved location, home assessment answers, and readiness profile.
              </p>
            </div>

            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center rounded-full border border-stone-200 bg-stone-50 px-4 py-2 text-sm font-semibold text-stone-700 transition-colors hover:border-stone-300 hover:bg-stone-100"
            >
              Back to Dashboard
            </Link>
          </div>
        </section>

        <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-stone-900">Location summary</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                ZIP code
              </p>
              <p className="mt-2 text-lg font-semibold text-stone-900">
                {selectedZipCode || "Not provided"}
              </p>
            </div>

            {RISK_FIELDS.map((risk) => (
              <div
                key={risk.key}
                className="rounded-2xl border border-stone-200 bg-stone-50 p-4"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                  {risk.label}
                </p>
                <p className="mt-2 text-lg font-semibold text-stone-900">
                  {getRiskValue(regionalRisk, risk.key)}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-stone-900">Readiness score summary</h2>
          {!scoreData ? (
            <p className="mt-4 text-sm text-stone-600">
              {scoreUnavailable ? "Score unavailable." : "Score unavailable."}
            </p>
          ) : (
            <>
              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
                  <p className="text-sm font-medium text-emerald-800">Current score</p>
                  <p className="mt-2 text-3xl font-semibold text-stone-900">
                    {scoreData.totalScore}/100
                  </p>
                </div>
                <div className="rounded-2xl border border-stone-200 bg-stone-50 p-5">
                  <p className="text-sm font-medium text-stone-700">Maximum achievable score</p>
                  <p className="mt-2 text-3xl font-semibold text-stone-900">
                    {scoreData.maxAchievableScore}/100
                  </p>
                </div>
              </div>

              <p className="mt-4 text-sm leading-6 text-stone-600">
                Location risk is based on your saved ZIP code, while the other categories can
                improve through actions.
              </p>

              <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {CATEGORY_FIELDS.map((category) => (
                  <div
                    key={category.key}
                    className="rounded-2xl border border-stone-200 bg-stone-50 p-4"
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                      {category.label}
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-stone-900">
                      {getCategoryScore(scoreData, category.key)}/25
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>

        <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-stone-900">Weaknesses</h2>
          {scoreData?.weaknesses?.length ? (
            <ul className="mt-4 space-y-3 text-sm leading-6 text-stone-700">
              {scoreData.weaknesses.map((weakness) => (
                <li
                  key={weakness}
                  className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3"
                >
                  {weakness}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-stone-600">No major vulnerabilities detected.</p>
          )}
        </section>

        <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-stone-900">Home questionnaire answers</h2>
          {homeProfileEntries.length === 0 ? (
            <p className="mt-4 text-sm text-stone-600">No saved questionnaire answers found.</p>
          ) : (
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {homeProfileEntries.map(([key, value]) => (
                <div
                  key={key}
                  className="rounded-2xl border border-stone-200 bg-stone-50 p-4"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                    {formatLabel(key)}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-stone-800">{formatValue(value)}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
