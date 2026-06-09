import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <main className="min-h-screen bg-parchment text-stone-900">
      <section className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-6 py-16">
        <p className="mb-4 text-sm font-medium uppercase tracking-[0.25em] text-leaf">
          Home Risk Planner
        </p>
        <h1 className="max-w-3xl text-5xl leading-tight md:text-7xl">
          Understand your home risks before they become expensive.
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-stone-700">
          Check location exposure, answer a short questionnaire, and get a
          practical resilience score with next-step recommendations.
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            to="/location"
            className="rounded-full bg-forest px-6 py-3 text-sm font-semibold text-white no-underline transition-base hover:bg-leaf"
          >
            Start assessment
          </Link>
          <Link
            to="/login"
            className="rounded-full border border-stone-300 px-6 py-3 text-sm font-semibold text-stone-900 no-underline transition-base hover:border-forest hover:text-forest"
          >
            Sign in
          </Link>
        </div>
      </section>
    </main>
  );
}
