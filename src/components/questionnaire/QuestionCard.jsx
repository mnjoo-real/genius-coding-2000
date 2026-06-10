import Card from '../ui/Card';

function SingleOptions({ options, value, onChange }) {
  return (
    <div role="radiogroup" className="flex flex-wrap gap-2">
      {options.map((option) => {
        const selected = value === option;
        return (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option)}
            className={[
              'px-4 py-2 rounded-lg border text-sm font-medium transition-fast',
              selected
                ? 'bg-leaf text-white border-leaf'
                : 'bg-white text-stone-700 border-stone-200 hover:border-leaf hover:bg-moss/30',
            ].join(' ')}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}

function isNoneOption(option) {
  return /^none\b/i.test(option.trim()) || /^neither\b/i.test(option.trim());
}

function MultiOptions({ options, value, onChange }) {
  const toggle = (option) => {
    if (value.includes(option)) {
      onChange(value.filter((v) => v !== option));
      return;
    }
    if (isNoneOption(option)) {
      // Selecting a "none" option clears everything else
      onChange([option]);
    } else {
      // Selecting any regular option clears any active "none" option
      const withoutNone = value.filter((v) => !isNoneOption(v));
      onChange([...withoutNone, option]);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {options.map((option) => {
        const selected = value.includes(option);
        return (
          <label
            key={option}
            className={[
              'flex items-center gap-3 px-4 py-2.5 rounded-lg border text-sm font-medium cursor-pointer transition-fast',
              selected
                ? 'bg-leaf/10 border-leaf text-forest'
                : 'bg-white border-stone-200 text-stone-700 hover:border-leaf hover:bg-moss/20',
            ].join(' ')}
          >
            <input
              type="checkbox"
              checked={selected}
              onChange={() => toggle(option)}
              className="sr-only"
            />
            <span
              className={[
                'w-4 h-4 rounded border-2 flex items-center justify-center shrink-0',
                selected ? 'bg-leaf border-leaf' : 'bg-white border-stone-300',
              ].join(' ')}
              aria-hidden="true"
            >
              {selected && (
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path
                    d="M2 5l2.5 2.5 3.5-4"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </span>
            {option}
          </label>
        );
      })}
    </div>
  );
}

export default function QuestionCard({
  questionNumber,
  question,
  why,
  type = 'single',
  options = [],
  value,
  onChange,
  flag,
}) {
  const multiValue = Array.isArray(value) ? value : [];

  return (
    <Card>
      {questionNumber != null && (
        <p className="text-xs font-medium text-stone-400 mb-0.5">Q{questionNumber}</p>
      )}
      <p className="text-base font-medium text-stone-900 mb-1">{question}</p>
      {why && <p className="text-sm text-stone-400 mb-4 leading-relaxed">{why}</p>}

      {type === 'single' ? (
        <SingleOptions options={options} value={value ?? ''} onChange={onChange} />
      ) : (
        <MultiOptions options={options} value={multiValue} onChange={onChange} />
      )}

      {flag && (
        <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            className="mt-0.5 shrink-0"
            aria-hidden="true"
          >
            <path
              d="M8 2L14 13H2L8 2Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <path
              d="M8 6v3M8 11v.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          {flag.message}
        </div>
      )}
    </Card>
  );
}
