import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Button from '../components/ui/Button';

export default function ScoreDashboard() {
  const navigate = useNavigate();
  const [homeProfile, setHomeProfile] = useState(null);
  const [regionalRisk, setRegionalRisk] = useState(null);

  useEffect(() => {
    const profile = JSON.parse(localStorage.getItem('homeProfile'));
    const risk = JSON.parse(localStorage.getItem('regionalRisk'));
    setHomeProfile(profile);
    setRegionalRisk(risk);
  }, []);

  const handleStartOver = () => {
    localStorage.removeItem('homeProfile');
    localStorage.removeItem('regionalRisk');
    navigate('/location');
  };

  if (!homeProfile || !regionalRisk) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-parchment px-6 py-16">
          <div className="mx-auto max-w-5xl flex flex-col items-center text-center py-16">
            <h2 className="text-2xl">No data found</h2>
            <p className="mt-3 text-stone-500">
              Please complete the location and home assessment steps first.
            </p>
            <Button
              variant="primary"
              className="mt-6"
              onClick={() => navigate('/location')}
            >
              Start Over
            </Button>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-parchment px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-3xl">Your DisasterReady Score</h1>
          <p className="mt-2 text-stone-500">Based on your location and home assessment.</p>

          <div className="mt-10 flex flex-col gap-10">
            <section>
              <p className="text-xs font-medium uppercase tracking-widest text-stone-400 mb-3">
                Score &amp; Weaknesses
              </p>
              <div />
            </section>

            <section>
              <p className="text-xs font-medium uppercase tracking-widest text-stone-400 mb-3">
                Recommended Actions
              </p>
              <div />
            </section>

            <section>
              <p className="text-xs font-medium uppercase tracking-widest text-stone-400 mb-3">
                Score Simulator
              </p>
              <div />
            </section>

            <section>
              <p className="text-xs font-medium uppercase tracking-widest text-stone-400 mb-3">
                Recovery Vault
              </p>
              <div />
            </section>
          </div>

          <div className="mt-12">
            <Button variant="secondary" size="sm" onClick={handleStartOver}>
              Start Over
            </Button>
          </div>
        </div>
      </main>
    </>
  );
}
