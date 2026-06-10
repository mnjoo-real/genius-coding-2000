import { mockAidApplications } from "../../data/aidApplications";
import { getAidStatusStyle } from "../../utils/getAidStatusStyle";

export default function AidApplicationStatusList() {
  const applications = Array.isArray(mockAidApplications) ? mockAidApplications : [];

  return (
    <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
          Recovery Center
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-stone-900">
          Application Status Tracker
        </h2>
      </div>

      {applications.length === 0 ? (
        <p className="mt-5 rounded-2xl border border-dashed border-stone-200 bg-stone-50 px-4 py-5 text-sm text-stone-600">
          No application statuses are available yet.
        </p>
      ) : (
        <div className="mt-6 grid gap-4">
          {applications.map((application) => {
            const status = application?.status || "Unknown";
            const submittedDate = application?.submittedDate || "";
            const deadlineDate = application?.deadlineDate || "Not available";

            return (
              <article
                key={application.id}
                className="rounded-2xl border border-stone-200 bg-stone-50 p-4"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                      {application.agency}
                    </p>
                    <h3 className="mt-1 text-lg font-semibold text-stone-900">
                      {application.programName}
                    </h3>
                    <dl className="mt-3 grid gap-2 text-sm text-stone-700">
                      <div className="flex items-center justify-between gap-4">
                        <dt className="font-medium text-stone-500">Submitted</dt>
                        <dd className="font-medium text-stone-900">
                          {submittedDate || "Not submitted yet"}
                        </dd>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <dt className="font-medium text-stone-500">Deadline</dt>
                        <dd className="font-medium text-stone-900">{deadlineDate}</dd>
                      </div>
                    </dl>
                  </div>

                  <span
                    className={`inline-flex shrink-0 items-center rounded-full px-3 py-1 text-xs font-semibold ${getAidStatusStyle(
                      status
                    )}`}
                  >
                    {status}
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
