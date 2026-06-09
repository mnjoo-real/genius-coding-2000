import { Link } from "react-router-dom";
import RiskBarChart from "../components/risk/RiskBarChart";
import RiskCard from "../components/risk/RiskCard";
import { getRiskLevel } from "../utils/getRiskLevel";

const riskCategoryFields = [
  {
    label: "Flood",
    field: "floodRisk",
    color: "#6d8f4a",
    description: "Regional exposure to flooding and stormwater impacts.",
  },
  {
    label: "Wildfire",
    field: "wildfireRisk",
    color: "#ef4444",
    description: "Regional exposure to wildfire and ember-related hazards.",
  },
  {
    label: "Heat Wave",
    field: "heatRisk",
    color: "#f59e0b",
    description: "Regional exposure to extended high-heat conditions.",
  },
  {
    label: "Storm",
    field: "stormRisk",
    color: "#2f5d40",
    description: "Regional exposure to severe storms, wind, and heavy rain.",
  },
  {
    label: "Winter Storm",
    field: "winterStormRisk",
    color: "#a8b89a",
    description: "Regional exposure to snow, ice, and freezing conditions.",
  },
];

function readRegionalRisk() {
  if (typeof window === "undefined") {
    return null;
  }

  let storedRegionalRisk;

  try {
    storedRegionalRisk = window.localStorage.getItem("regionalRisk");
  } catch {
    return null;
  }

  if (!storedRegionalRisk) {
    return null;
  }

  try {
    const parsedRegionalRisk = JSON.parse(storedRegionalRisk);

    if (
      !parsedRegionalRisk ||
      typeof parsedRegionalRisk !== "object" ||
      Array.isArray(parsedRegionalRisk)
    ) {
      return null;
    }

    return parsedRegionalRisk;
  } catch {
    return null;
  }
}

function getRegionValue(value, fallback) {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function getRiskScore(value) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

export default function RiskOverview() {
  const regionalRisk = readRegionalRisk();
  const regionSummary = regionalRisk
    ? {
        city: getRegionValue(regionalRisk.city, "City unavailable"),
        state: getRegionValue(regionalRisk.state, "State unavailable"),
        zipCode: getRegionValue(regionalRisk.zipCode, "ZIP unavailable"),
      }
    : null;
  const riskCategories = regionalRisk
    ? riskCategoryFields.map((riskCategory) => {
        const score = getRiskScore(regionalRisk[riskCategory.field]);

        return {
          ...riskCategory,
          score,
          level: getRiskLevel(score).toLowerCase(),
        };
      })
    : [];
  const chartRisks = riskCategories.map((riskCategory) => ({
    label: riskCategory.label,
    value: riskCategory.score,
    color: riskCategory.color,
  }));

  return (
    <main className="min-h-screen bg-parchment px-6 py-12 sm:py-16">
      <section className="mx-auto max-w-5xl">
        <p className="text-sm font-medium uppercase tracking-[0.25em] text-leaf">
          Regional Risk
        </p>
        <h1 className="mt-4 text-4xl sm:text-5xl">
          Regional Risk Overview
        </h1>
        <p className="mt-5 max-w-2xl text-base text-stone-600 sm:text-lg">
          Review the regional risk profile before answering the home readiness
          questions.
        </p>

        {!regionalRisk ? (
          <div className="mt-8 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-2xl">We need your location first.</h2>
            <p className="mt-3 text-stone-600">
              No regional risk profile is available yet. Go back to location
              input to choose a ZIP code and prepare this overview.
            </p>
            <div className="mt-6">
              <Link
                to="/location"
                className="inline-flex items-center justify-center rounded-lg border border-leaf bg-transparent px-6 py-3 font-medium text-leaf transition-fast hover:bg-moss"
              >
                Go to Location Input
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-8 grid gap-6">
            <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-leaf">
                Region Summary
              </p>
              <h2 className="mt-3 text-2xl">
                {regionSummary.city}, {regionSummary.state}
              </h2>
              <dl className="mt-5 grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-stone-200 bg-parchment/60 p-4">
                  <dt className="text-sm font-medium text-stone-500">City</dt>
                  <dd className="mt-1 text-lg font-medium text-stone-900">
                    {regionSummary.city}
                  </dd>
                </div>
                <div className="rounded-xl border border-stone-200 bg-parchment/60 p-4">
                  <dt className="text-sm font-medium text-stone-500">State</dt>
                  <dd className="mt-1 text-lg font-medium text-stone-900">
                    {regionSummary.state}
                  </dd>
                </div>
                <div className="rounded-xl border border-stone-200 bg-parchment/60 p-4">
                  <dt className="text-sm font-medium text-stone-500">ZIP code</dt>
                  <dd className="mt-1 text-lg font-medium text-stone-900">
                    {regionSummary.zipCode}
                  </dd>
                </div>
              </dl>
              <p className="mt-3 text-stone-600">
                This area profile is loaded from your saved location. Detailed
                regional context will be added here next.
              </p>
            </section>

            <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-medium uppercase tracking-[0.2em] text-leaf">
                  Top Risks
                </p>
                <h2 className="mt-3 text-2xl">Top risks placeholder</h2>
                <p className="mt-3 text-stone-600">
                  The top three regional risks will appear here after the risk
                  utility is connected.
                </p>
              </div>

              <div>
                <p className="text-sm font-medium uppercase tracking-[0.2em] text-leaf">
                  Risk Cards & Chart
                </p>
                <h2 className="mt-3 text-2xl">Risk visualization placeholder</h2>
                <p className="mt-3 text-stone-600">
                  Risk cards and a chart will summarize flood, wildfire, heat,
                  storm, and winter storm exposure here.
                </p>
                <div className="mt-5 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
                  <RiskBarChart risks={chartRisks} />
                </div>
                <div className="mt-5 grid gap-3">
                  {riskCategories.map((riskCategory) => (
                    <RiskCard
                      key={riskCategory.field}
                      disasterType={riskCategory.label}
                      riskLevel={riskCategory.level}
                      riskPercent={riskCategory.score}
                      description={riskCategory.description}
                    />
                  ))}
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:flex sm:items-center sm:justify-between sm:gap-6">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.2em] text-leaf">
                  Next Step
                </p>
                <h2 className="mt-3 text-2xl">Continue button placeholder</h2>
                <p className="mt-3 text-stone-600">
                  Navigation to the home questionnaire will be wired in a later
                  pass.
                </p>
              </div>
              <button
                type="button"
                className="mt-6 inline-flex w-full items-center justify-center rounded-lg border border-transparent bg-leaf px-6 py-3 font-medium text-white transition-fast hover:bg-forest sm:mt-0 sm:w-auto"
              >
                Continue
              </button>
            </section>
          </div>
        )}
      </section>
    </main>
  );
}
