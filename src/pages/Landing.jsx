import { useState, useRef, useEffect, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import { regionalRiskData, fallbackRiskData } from '../data/regionalRiskData';

// Lazy-load the heavy Three.js globe so it doesn't block initial paint
const Globe = lazy(() => import('react-globe.gl'));

// ── Constants ──────────────────────────────────────────────────────────────

const ZIP_COORDS = {
  '33101': { lat: 25.7617,  lng: -80.1918  },
  '14623': { lat: 43.0954,  lng: -77.6631  },
  '90001': { lat: 33.9731,  lng: -118.2479 },
  '77001': { lat: 29.7604,  lng: -95.3698  },
  '80202': { lat: 39.7392,  lng: -104.9903 },
};

const FEATURES = [
  {
    icon: '🗺️',
    title: 'Know Your Risk',
    desc: 'Get a regional risk profile for wildfires, floods, storms, and more — based on your ZIP code.',
  },
  {
    icon: '🏡',
    title: 'Assess Your Home',
    desc: 'Answer a short home check to uncover vulnerabilities specific to your structure and surroundings.',
  },
  {
    icon: '📈',
    title: 'Improve Your Score',
    desc: 'Receive your DisasterReady Score and a personalised list of eco-mitigation actions.',
  },
  {
    icon: '🌿',
    title: 'Eco-Friendly Actions',
    desc: 'Every recommendation is chosen for its ecological benefit as well as its resilience impact.',
  },
];

const RISK_BARS = [
  { key: 'floodRisk',       label: 'Flood'        },
  { key: 'wildfireRisk',    label: 'Wildfire'      },
  { key: 'heatRisk',        label: 'Heat'          },
  { key: 'stormRisk',       label: 'Storm'         },
  { key: 'winterStormRisk', label: 'Winter Storm'  },
];

function riskBarColor(value) {
  if (value >= 75) return 'bg-red-500';
  if (value >= 45) return 'bg-amber-400';
  return 'bg-leaf';
}

// ── Sub-components ─────────────────────────────────────────────────────────

function FeatureBubble({ icon, title, desc, delay }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{
        transitionDelay: `${delay}ms`,
        transition: 'opacity 600ms ease, transform 600ms ease',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(28px)',
      }}
      className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm flex flex-col gap-3"
    >
      <span className="text-3xl leading-none" aria-hidden="true">{icon}</span>
      <h3 className="text-base">{title}</h3>
      <p className="text-sm text-stone-500 leading-relaxed">{desc}</p>
    </div>
  );
}

function RiskOverlay({ risk }) {
  return (
    <div
      className="absolute bottom-16 right-5 z-20 w-56 rounded-2xl border border-stone-200 bg-white/95 backdrop-blur-sm p-4 shadow-lg"
      style={{ animation: 'canopyFadeUp 0.4s ease-out both' }}
    >
      <p className="text-xs font-medium uppercase tracking-widest text-leaf mb-0.5">
        Regional Risk
      </p>
      <p className="font-display text-base text-stone-900 mb-3">
        {risk.city}{risk.state ? `, ${risk.state}` : ''}
      </p>
      <div className="flex flex-col gap-1.5">
        {RISK_BARS.map(({ key, label }) => (
          <div key={key} className="flex items-center gap-2">
            <span className="w-20 text-xs text-stone-500 shrink-0">{label}</span>
            <div className="flex-1 h-1.5 rounded-full bg-stone-100 overflow-hidden">
              <div
                className={`h-full rounded-full transition-[width] duration-700 ease-out ${riskBarColor(risk[key])}`}
                style={{ width: `${risk[key]}%` }}
              />
            </div>
            <span className="text-xs tabular-nums text-stone-400 w-6 text-right">
              {risk[key]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────

export default function Landing() {
  const navigate     = useNavigate();
  const globeRef     = useRef(null);
  const containerRef = useRef(null);

  const [zip, setZip]                   = useState('');
  const [zipError, setZipError]         = useState('');
  const [selectedRisk, setSelectedRisk] = useState(null);
  const [pinData, setPinData]           = useState([]);
  const [globeDims, setGlobeDims]       = useState({ width: 0, height: 0 });
  const [globeReady, setGlobeReady]     = useState(false);

  // Measure container so Globe receives explicit pixel dimensions
  useEffect(() => {
    function measure() {
      if (!containerRef.current) return;
      const r = containerRef.current.getBoundingClientRect();
      setGlobeDims({ width: Math.round(r.width), height: Math.round(r.height) });
    }
    measure();
    const ro = new ResizeObserver(measure);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // Set initial camera once the globe has rendered
  useEffect(() => {
    if (!globeReady || !globeRef.current) return;
    globeRef.current.pointOfView({ lat: 38, lng: -97, altitude: 2.2 }, 0);
  }, [globeReady]);

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = zip.trim();
    if (!trimmed) { setZipError('Please enter a ZIP code.'); return; }

    const profile = regionalRiskData.find(r => r.zipCode === trimmed);
    const risk = profile
      ? profile
      : { ...fallbackRiskData, zipCode: trimmed, city: 'Your area', state: '' };

    const coords = ZIP_COORDS[trimmed] || { lat: 39.5, lng: -98.35 };

    localStorage.setItem('selectedZipCode', trimmed);
    localStorage.setItem('regionalRisk', JSON.stringify(risk));

    setSelectedRisk(risk);
    setZipError('');
    setPinData([{ lat: coords.lat, lng: coords.lng }]);

    if (globeRef.current) {
      globeRef.current.pointOfView(
        { lat: coords.lat, lng: coords.lng, altitude: 1.4 },
        1500
      );
    }
  }

  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden bg-parchment"
        style={{ minHeight: 'calc(100vh - 3.5rem)' }}
      >
        {/* Left text + form panel */}
        <div className="relative z-10 flex flex-col justify-center px-8 pt-14 pb-24 sm:px-12 lg:absolute lg:inset-y-0 lg:left-0 lg:w-[44%] lg:px-16 lg:pt-0 lg:pb-0">

          <p className="text-sm font-medium uppercase tracking-[0.25em] text-leaf mb-5">
            Eco-Disaster Preparedness
          </p>

          <h1 className="text-4xl sm:text-5xl lg:text-[2.75rem] xl:text-5xl leading-tight">
            Canopy protects your home{' '}
            <span className="text-forest">before disaster strikes.</span>
          </h1>

          <p className="mt-5 text-base text-stone-600 max-w-xs sm:max-w-sm leading-relaxed">
            Know your regional risks, strengthen your home, and track your
            preparedness score — all in one place.
          </p>

          {/* ZIP form */}
          <form onSubmit={handleSubmit} className="mt-8 max-w-sm">
            <div className="flex gap-2">
              <input
                type="text"
                inputMode="numeric"
                placeholder="Enter ZIP code"
                value={zip}
                maxLength={5}
                aria-label="ZIP code"
                onChange={e => { setZip(e.target.value); setZipError(''); }}
                className={[
                  'flex-1 rounded-lg border bg-white px-4 py-2.5 text-stone-900',
                  'placeholder:text-stone-400 shadow-sm outline-none transition-base',
                  zipError
                    ? 'border-red-400'
                    : 'border-stone-300 focus:border-leaf',
                ].join(' ')}
              />
              <Button type="submit" size="md" className="shrink-0 py-2.5!">
                View My Risk
              </Button>
            </div>
            {zipError && (
              <p className="mt-2 text-sm text-red-600" role="alert">{zipError}</p>
            )}
          </form>

          {/* Continue link — appears after a ZIP has been resolved */}
          {selectedRisk && (
            <button
              type="button"
              onClick={() => navigate('/risk')}
              className="mt-4 inline-flex items-center gap-1.5 text-sm text-leaf hover:text-forest transition-fast"
            >
              Continue to full assessment
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
                <path d="M2 6.5h9M8 3l3.5 3.5L8 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}
        </div>

        {/* Globe — desktop only ─────────────────────────────────── */}
        <div
          ref={containerRef}
          className="hidden lg:flex absolute inset-y-0 right-0 w-[62%] items-center justify-end overflow-hidden"
        >
          {/* Gradient fade on left edge so globe blends into parchment */}
          <div
            className="absolute inset-y-0 left-0 w-32 pointer-events-none z-10"
            style={{ background: 'linear-gradient(to right, var(--color-parchment), transparent)' }}
          />

          {globeDims.width > 0 && (
            <Suspense fallback={null}>
              <Globe
                ref={globeRef}
                width={globeDims.width}
                height={globeDims.height}
                globeImageUrl="https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
                backgroundColor="rgba(0,0,0,0)"
                atmosphereColor="rgba(100,180,255,0.45)"
                atmosphereAltitude={0.28}
                autoRotate
                autoRotateSpeed={0.35}
                pointsData={pinData}
                pointLat="lat"
                pointLng="lng"
                pointRadius={0.55}
                pointAltitude={0.03}
                pointColor={() => '#6d8f4a'} /* var(--color-leaf) */
                onGlobeReady={() => setGlobeReady(true)}
              />
            </Suspense>
          )}

          {selectedRisk && <RiskOverlay risk={selectedRisk} />}
        </div>

        {/* Scroll indicator */}
        <div
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1"
          aria-hidden="true"
        >
          <span className="text-[10px] uppercase tracking-widest text-stone-400">scroll</span>
          <svg
            width="18" height="10" viewBox="0 0 18 10" fill="none"
            className="text-stone-400"
            style={{ animation: 'canopyBounce 2.2s ease-in-out infinite' }}
          >
            <path d="M1 1l8 8 8-8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </section>

      {/* ── Feature bubbles ───────────────────────────────────────── */}
      <section className="bg-parchment py-20 px-6">
        <div className="mx-auto max-w-5xl">

          <div className="mb-12 text-center">
            <p className="text-sm font-medium uppercase tracking-[0.25em] text-leaf">
              How it works
            </p>
            <h2 className="mt-3 text-3xl sm:text-4xl">
              Built for every stage of preparedness
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map((f, i) => (
              <FeatureBubble key={f.title} {...f} delay={i * 110} />
            ))}
          </div>

          <div className="mt-12 flex justify-center">
            <Button onClick={() => navigate('/location')} size="lg">
              Check My Home
            </Button>
          </div>
        </div>
      </section>

      {/* Keyframe animations scoped to this page */}
      <style>{`
        @keyframes canopyFadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes canopyBounce {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(5px); }
        }
      `}</style>
    </>
  );
}
