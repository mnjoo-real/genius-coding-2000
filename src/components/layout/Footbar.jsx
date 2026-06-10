export default function Footbar() {
  return (
    <footer className="border-t border-stone-200 bg-parchment mt-auto">
      <div className="mx-auto max-w-5xl px-4 py-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

        <div className="flex flex-col gap-1">
          <span className="font-display text-base text-forest">Canopy</span>
          <span className="text-sm text-stone-500">
            Eco-focused home resilience for the risks ahead.
          </span>
        </div>

        <nav aria-label="Footer links" className="flex items-center gap-5">
          <a
            href="https://github.com/mnjoo-real/genius-coding-2000"
            className="text-sm text-stone-500 hover:text-forest no-underline transition-fast"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
        </nav>

      </div>

      <div className="border-t border-stone-100">
        <p className="mx-auto max-w-5xl px-4 py-3 text-xs text-stone-400 leading-relaxed">
          Canopy Score is a rule-based educational estimate, not an official engineering inspection, insurance assessment, or government determination.
        </p>
      </div>
    </footer>
  );
}