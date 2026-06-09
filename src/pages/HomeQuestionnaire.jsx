import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import ProgressStepper from '../components/layout/ProgressStepper';
import QuestionCard from '../components/questionnaire/QuestionCard';
import Button from '../components/ui/Button';
import { homeQuestions } from '../data/homeQuestions';

const STEPS = [
  { label: 'Location' },
  { label: 'Risk' },
  { label: 'Home Check' },
  { label: 'Score' },
];

export default function HomeQuestionnaire() {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState({});

  const total = homeQuestions.length;

  function handleChange(questionId, value) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }

  const answeredCount = homeQuestions.filter((q) => {
    const val = answers[q.id];
    if (q.type === 'multi') return Array.isArray(val) && val.length > 0;
    return typeof val === 'string' && val !== '';
  }).length;

  const isComplete = answeredCount === total;

  function handleSubmit() {
    if (!isComplete) return;
    const homeProfile = { ...answers, savedAt: new Date().toISOString() };
    localStorage.setItem('homeProfile', JSON.stringify(homeProfile));
    navigate('/dashboard');
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-parchment pb-20">
        <div className="mx-auto max-w-3xl px-4 pt-10">

          <div className="mb-8">
            <ProgressStepper steps={STEPS} currentStep={2} />
          </div>

          <h1 className="text-3xl mb-2">Tell us about your home</h1>
          <p className="text-stone-500 mb-2">
            Your answers are used only to calculate your risk score.
          </p>
          <p className="text-sm font-medium text-leaf mb-8">
            {answeredCount} of {total} answered
          </p>

          <div className="flex flex-col gap-4">
            {homeQuestions.map((q) => {
              const val = answers[q.id] ?? (q.type === 'multi' ? [] : null);

              let activeFlag;
              if (q.flag) {
                const isFlagged =
                  q.type === 'multi'
                    ? Array.isArray(val) && val.some((v) => q.flag.values.includes(v))
                    : q.flag.values.includes(val);
                if (isFlagged) activeFlag = q.flag;
              }

              return (
                <QuestionCard
                  key={q.id}
                  question={q.question}
                  why={q.whyItMatters}
                  type={q.type}
                  options={q.options}
                  value={val}
                  onChange={(newVal) => handleChange(q.id, newVal)}
                  flag={activeFlag}
                />
              );
            })}
          </div>

          <div className="mt-10 flex justify-end">
            <Button variant="primary" size="lg" disabled={!isComplete} onClick={handleSubmit}>
              See My Score
            </Button>
          </div>

        </div>
      </main>
    </>
  );
}
