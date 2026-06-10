import { Fragment } from 'react';

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

      {/*
        Top layer: circles with connectors interleaved as direct siblings.
        Each connector is a single flex-1 element between two step circles,
        so all three gaps are guaranteed equal width.
      */}
      <div role="list" className="flex items-center">
        {steps.map((step, i) => {
          const completed = i < currentStep;
          const active    = i === currentStep;
          return (
            <Fragment key={step.label}>
              {/* Connector between steps — placed before each step except the first */}
              {i > 0 && (
                <div
                  className={`flex-1 h-0.5 transition-base ${i <= currentStep ? 'bg-leaf' : 'bg-stone-200'}`}
                  aria-hidden="true"
                />
              )}

              {/* Circle */}
              <div
                role="listitem"
                className="shrink-0"
                aria-label={step.label}
                aria-current={active ? 'step' : undefined}
              >
                <div
                  className={[
                    'w-8 h-8 rounded-full flex items-center justify-center transition-base',
                    completed ? 'bg-leaf' : active ? 'bg-forest' : 'bg-white border-2 border-stone-300',
                  ].join(' ')}
                >
                  {completed ? (
                    <Checkmark />
                  ) : (
                    <span
                      className={`w-2.5 h-2.5 rounded-full block ${active ? 'bg-white' : 'bg-stone-300'}`}
                    />
                  )}
                </div>
              </div>
            </Fragment>
          );
        })}
      </div>

      {/*
        Bottom layer: labels only (desktop).
        Mirrors the top layer exactly — connector spacers (flex-1) between
        label cells (w-8 shrink-0) — so each label sits centered under its circle.
      */}
      <div className="hidden sm:flex mt-2" aria-hidden="true">
        {steps.map((step, i) => {
          const completed = i < currentStep;
          const active    = i === currentStep;
          return (
            <Fragment key={step.label}>
              {i > 0 && <div className="flex-1" />}

              <div className="w-8 shrink-0 flex justify-center">
                <span
                  className={[
                    'text-xs whitespace-nowrap transition-base',
                    completed ? 'text-leaf' : active ? 'font-semibold text-forest' : 'text-stone-400',
                  ].join(' ')}
                >
                  {step.label}
                </span>
              </div>
            </Fragment>
          );
        })}
      </div>

      {/* Mobile: current step label only */}
      <p className="sm:hidden mt-3 text-center text-sm font-semibold text-forest">
        Step {currentStep + 1} of {steps.length}: {steps[currentStep]?.label}
      </p>

    </nav>
  );
}
