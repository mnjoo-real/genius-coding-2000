import AidProgramCard from "./AidProgramCard";

export default function DeadlineTracker({ programs = [], disasterDate }) {
  const safePrograms = Array.isArray(programs) ? programs : [];

  return (
    <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
          Recovery Center
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-stone-900">Aid Deadlines</h2>
      </div>

      {safePrograms.length === 0 ? (
        <p className="mt-5 rounded-2xl border border-dashed border-stone-200 bg-stone-50 px-4 py-5 text-sm text-stone-600">
          No matched programs yet. Complete the aid eligibility check first.
        </p>
      ) : (
        <div className="mt-6 grid gap-4">
          {safePrograms.map((program) => (
            <AidProgramCard
              key={program?.id || program?.name || program?.title}
              program={program}
              disasterDate={disasterDate}
            />
          ))}
        </div>
      )}
    </section>
  );
}
