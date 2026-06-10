import { Link } from "react-router-dom";
import RiskBarChart from "../components/risk/RiskBarChart";

const RISK_FIELDS = [
  { label: "Flood",        field: "floodRisk",       color: "#6d8f4a" },
  { label: "Wildfire",     field: "wildfireRisk",     color: "#ef4444" },
  { label: "Heat Wave",    field: "heatRisk",         color: "#f59e0b" },
  { label: "Storm",        field: "stormRisk",        color: "#2f5d40" },
  { label: "Winter Storm", field: "winterStormRisk",  color: "#a8b89a" },
];

function readRegionalRisk() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem("regionalRisk");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null;
    return parsed;
  } catch {
    return null;
  }
}

function str(value, fallback) {
  return typeof value === "string" && value.trim() ? value : fallback;
}

export default function RiskOverview() {
  const regionalRisk = readRegionalRisk();

  const regionSummary = regionalRisk
    ? {
        city:    str(regionalRisk.city,    "City unavailable"),
        state:   str(regionalRisk.state,   "State unavailable"),
        zipCode: str(regionalRisk.zipCode, "ZIP unavailable"),
      }
    : null;

  const chartRisks = regionalRisk
    ? RISK_FIELDS.map(({ label, field, color }) => ({
        label,
        value: typeof regionalRisk[field] === "number" ? regionalRisk[field] : 0,
        color,
      }))
    : [];

  return (
    <main className="bg-parchment px-6 py-6">
      <section className="mx-auto max-w-4xl">

        {/* Page header */}
        <p className="text-sm font-medium uppercase tracking-[0.25em] text-leaf">
          Regional Risk
        </p>
        <h1 className="mt-2 text-4xl sm:text-5xl">Regional Risk Overview</h1>
        <p className="mt-2 text-base text-stone-600">
          Your area's risk profile.
        </p>

        {!regionalRisk ? (
          /* ── Fallback ─────────────────────────────────────────────── */
          <div className="mt-8 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl">We need your location first.</h2>
            <p className="mt-3 text-stone-600">
              No regional risk profile found. Go back to location input to choose a ZIP code.
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
          /* ── Main content ─────────────────────────────────────────── */
          <div className="mt-5 grid gap-4">

            {/* Region Summary */}
            <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-leaf">
                Region Summary
              </p>
              <dl className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-stone-200 bg-parchment/60 p-3">
                  <dt className="text-xs font-medium text-stone-500">City</dt>
                  <dd className="mt-1 text-base font-medium text-stone-900">
                    {regionSummary.city}
                  </dd>
                </div>
                <div className="rounded-xl border border-stone-200 bg-parchment/60 p-3">
                  <dt className="text-xs font-medium text-stone-500">State</dt>
                  <dd className="mt-1 text-base font-medium text-stone-900">
                    {regionSummary.state}
                  </dd>
                </div>
                <div className="rounded-xl border border-stone-200 bg-parchment/60 p-3">
                  <dt className="text-xs font-medium text-stone-500">ZIP code</dt>
                  <dd className="mt-1 text-base font-medium text-stone-900">
                    {regionSummary.zipCode}
                  </dd>
                </div>
              </dl>
            </section>

            {/* Risk bar chart */}
            <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-leaf">
                Risk Profile
              </p>
              <div className="mt-4">
                <RiskBarChart risks={chartRisks} />
              </div>
            </section>

            {/* Next step */}
            <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:flex sm:items-center sm:justify-between sm:gap-6">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-leaf">
                  Next Step
                </p>
                <p className="mt-2 text-stone-700">
                  Answer a short home check to get your personalized readiness score.
                </p>
              </div>
              <Link
                to="/questionnaire"
                className="mt-4 inline-flex w-full shrink-0 items-center justify-center rounded-lg border border-transparent bg-leaf px-6 py-3 font-medium text-white transition-fast hover:bg-forest sm:mt-0 sm:w-auto"
              >
                Continue to Home Check
              </Link>
            </section>

          </div>
        )}
      </section>
    </main>
  );
}
