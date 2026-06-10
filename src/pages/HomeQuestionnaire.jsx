import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProgressStepper from '../components/layout/ProgressStepper';
import QuestionCard from '../components/questionnaire/QuestionCard';
import Button from '../components/ui/Button';
import { homeQuestions } from '../data/homeQuestions';

const STEPS = [
  { label: 'Location' },
  { label: 'Regional Risk Profile' },
  { label: 'Home Survey' },
  { label: 'Your Score' },
];

function safeParseObject(rawValue) {
  if (!rawValue) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawValue);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed;
    }
  } catch {
    // Ignore invalid saved profile data.
  }

  return null;
}

function getQuestionnaireAnswers(profile) {
  if (!profile || typeof profile !== 'object' || Array.isArray(profile)) {
    return {};
  }

  return homeQuestions.reduce((nextAnswers, question) => {
    if (!(question.id in profile)) {
      return nextAnswers;
    }

    nextAnswers[question.id] = profile[question.id];
    return nextAnswers;
  }, {});
}

export default function HomeQuestionnaire() {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState({});
  const [savedProfile, setSavedProfile] = useState(() =>
    safeParseObject(localStorage.getItem('homeProfile'))
  );
  const [isEditingSavedProfile, setIsEditingSavedProfile] = useState(false);

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
    setSavedProfile(homeProfile);
    navigate('/dashboard');
  }

  function handleEditResponse() {
    setAnswers(getQuestionnaireAnswers(savedProfile));
    setIsEditingSavedProfile(true);
  }

  if (savedProfile && !isEditingSavedProfile) {
    return (
      <main className="min-h-screen bg-parchment pb-20">
        <div className="mx-auto max-w-3xl px-4 pt-10">
          <div className="mb-8">
            <ProgressStepper steps={STEPS} currentStep={2} />
          </div>

          <section className="rounded-3xl border border-stone-200 bg-white p-8 shadow-sm">
            <h1 className="text-3xl mb-2 text-stone-900">Home questionnaire already completed</h1>
            <p className="text-stone-500 mb-8">
              You already answered the home assessment. You can review your saved profile or edit
              your responses.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Button variant="primary" onClick={() => navigate('/user-info')}>
                View User Info
              </Button>
              <Button variant="secondary" onClick={() => navigate('/dashboard')}>
                Go to Dashboard
              </Button>
              <Button variant="secondary" onClick={handleEditResponse}>
                Edit Response
              </Button>
            </div>
          </section>
        </div>
      </main>
    );
  }

  return (
      <main className="min-h-screen bg-parchment pb-20">
        <div className="mx-auto max-w-3xl px-4 pt-10">

          <div className="mb-8">
            <ProgressStepper steps={STEPS} currentStep={2} />
          </div>

          <h1 className="text-3xl mb-2">Tell us about your home</h1>
          <p className="text-stone-500 mb-2">
            Your answers calculate your home's risk score, shape your personalized eco-mitigation recommendations, and help identify which disaster aid and recovery programs you may qualify for.
          </p>
          <p className="text-sm font-medium text-leaf mb-8">
            {answeredCount} of {total} answered
          </p>

          <div className="flex flex-col gap-4">
            {homeQuestions.map((q, index) => {
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
                  questionNumber={index + 1}
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
  );
}
