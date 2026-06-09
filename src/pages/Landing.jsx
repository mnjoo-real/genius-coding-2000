import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <main className="min-h-screen bg-parchment px-6 py-16">
      <section className="mx-auto max-w-3xl rounded-3xl border border-stone-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-[0.25em] text-leaf">
          Landing
        </p>
        <h1 className="mt-3 text-3xl">Landing page placeholder</h1>
        <p className="mt-3 text-stone-600">
          Routing is wired, but the full landing experience is not implemented
          yet.
        </p>
        <div className="mt-6 flex flex-wrap gap-4 text-sm">
          <Link to="/location">Go to location</Link>
          <Link to="/login">Go to login</Link>
        </div>
      </section>
    </main>
  );
}
