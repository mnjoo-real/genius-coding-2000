function Checkmark() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
      <path d="M2 6.5l3.5 3.5 5.5-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function ProgressStepper({ steps = [], currentStep = 0 }) {
  return (
    <nav aria-label="Progress">
      <ol className="flex items-start">
        {steps.map((step, i) => {
          const completed = i < currentStep;
          const active    = i === currentStep;

          return (
            <li key={step.label} className="flex flex-1 items-center">
              {/* Left connector */}
              {i > 0 && (
                <div className={`flex-1 h-0.5 transition-base ${i <= currentStep ? 'bg-leaf' : 'bg-stone-200'}`} />
              )}

              {/* Circle + label */}
              <div className="flex flex-col items-center gap-2">
                <div
                  className={[
                    'w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-base',
                    completed ? 'bg-leaf' : active ? 'bg-forest' : 'bg-white border-2 border-stone-300',
                  ].join(' ')}
                  aria-current={active ? 'step' : undefined}
                >
                  {completed ? (
                    <Checkmark />
                  ) : (
                    <span
                      className={`w-2.5 h-2.5 rounded-full block ${active ? 'bg-white' : 'bg-stone-300'}`}
                    />
                  )}
                </div>

                {/* Desktop: all labels visible */}
                <span
                  className={[
                    'hidden sm:block text-xs whitespace-nowrap transition-base',
                    completed ? 'text-leaf' : active ? 'font-semibold text-forest' : 'text-stone-400',
                  ].join(' ')}
                >
                  {step.label}
                </span>
              </div>

              {/* Right connector */}
              {i < steps.length - 1 && (
                <div className={`flex-1 h-0.5 transition-base ${i < currentStep ? 'bg-leaf' : 'bg-stone-200'}`} />
              )}
            </li>
          );
        })}
      </ol>

      {/* Mobile: current step label only */}
      <p className="sm:hidden mt-3 text-center text-sm font-semibold text-forest">
        Step {currentStep + 1} of {steps.length}: {steps[currentStep]?.label}
      </p>
    </nav>
  );
}
