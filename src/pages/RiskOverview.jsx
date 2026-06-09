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
    return JSON.parse(storedRegionalRisk);
  } catch {
    return null;
  }
}

export default function RiskOverview() {
  const regionalRisk = readRegionalRisk();
  const regionLabel = regionalRisk
    ? [regionalRisk.city, regionalRisk.state].filter(Boolean).join(", ") ||
      regionalRisk.zipCode ||
      "Selected region"
    : null;

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
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-lg border border-leaf bg-transparent px-6 py-3 font-medium text-leaf transition-fast hover:bg-moss"
              >
                Go to Location Input
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-8 grid gap-6">
            <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-leaf">
                Region Summary
              </p>
              <h2 className="mt-3 text-2xl">{regionLabel}</h2>
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

              <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-medium uppercase tracking-[0.2em] text-leaf">
                  Risk Cards & Chart
                </p>
                <h2 className="mt-3 text-2xl">Risk visualization placeholder</h2>
                <p className="mt-3 text-stone-600">
                  Risk cards and a chart will summarize flood, wildfire, heat,
                  storm, and winter storm exposure here.
                </p>
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
