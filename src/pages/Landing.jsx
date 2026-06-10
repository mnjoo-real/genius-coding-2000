import { useState, useRef, useEffect, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import { regionalRiskData, fallbackRiskData } from '../data/regionalRiskData';
import { saveResolvedLocationProfile } from '../services/userInfoSyncService';

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

const ECO_STATS = [
  {
    stat: 'Up to 40%',
    label: 'Reduction in stormwater runoff',
    detail: 'Green infrastructure like rain gardens and permeable pavement significantly reduces runoff volume.',
    source: 'EPA, 2021',
  },
  {
    stat: '29%',
    label: 'Lower wildfire spread risk',
    detail: 'Properties with defensible landscaping and native plants have measurably slower fire progression.',
    source: 'IBHS Research',
  },
  {
    stat: '$6 : $1',
    label: 'Return on mitigation investment',
    detail: 'Every dollar invested in pre-disaster mitigation returns an average of six dollars in avoided losses.',
    source: 'NIBS, 2020',
  },
  {
    stat: '3–5°F',
    label: 'Cooler with urban tree canopy',
    detail: 'Urban green spaces and tree cover reduce local temperature extremes that worsen heat disasters.',
    source: 'USDA Forest Service',
  },
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

// ── Shared scroll-fade hook ────────────────────────────────────────────────

function useFadeIn(threshold = 0.1) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);
  return [ref, visible];
}

// ── Eco-mitigation stat card ───────────────────────────────────────────────

function StatCard({ stat, label, detail, source, delay = 0 }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
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
        transform: visible ? 'translateY(0)' : 'translateY(24px)',
      }}
      className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm flex flex-col gap-2"
    >
      <p className="text-3xl font-bold text-forest leading-none">{stat}</p>
      <p className="text-sm font-semibold text-stone-900 leading-snug mt-1">{label}</p>
      <p className="text-xs text-stone-500 leading-relaxed flex-1">{detail}</p>
      <p className="text-[10px] font-medium text-stone-400 uppercase tracking-wider mt-auto pt-2">{source}</p>
    </div>
  );
}

// ── Recovery vault: PDF mockup ─────────────────────────────────────────────

function PDFMockup() {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white shadow-md overflow-hidden w-full max-w-sm mx-auto lg:mx-0">
      {/* Green header bar */}
      <div className="bg-forest px-5 py-3 flex items-center gap-2.5">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M7 1.5C4 1.5 1.5 4 1.5 7S4 12.5 7 12.5 12.5 10 12.5 7 10 1.5 7 1.5z" stroke="rgba(255,255,255,0.5)" strokeWidth="1.2"/>
          <path d="M5 9.5C5.8 8 8.2 8 9 9.5" stroke="white" strokeWidth="1.2" strokeLinecap="round"/>
          <circle cx="7" cy="5.5" r="1.25" fill="white" opacity="0.9"/>
        </svg>
        <span className="text-white text-[11px] font-semibold tracking-[0.18em] uppercase">Canopy Recovery Report</span>
      </div>
      {/* Body */}
      <div className="p-5 flex flex-col gap-4">
        {/* Info rows */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-stone-400 w-14 shrink-0 font-medium">Name</span>
            <div className="h-2.5 rounded flex-1 bg-stone-100" />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-stone-400 w-14 shrink-0 font-medium">Address</span>
            <div className="h-2.5 rounded w-3/4 bg-stone-100" />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-stone-400 w-14 shrink-0 font-medium">ZIP Code</span>
            <div className="h-2.5 rounded w-1/3 bg-stone-100" />
          </div>
        </div>
        <div className="h-px bg-stone-100" />
        {/* Photo grid */}
        <div>
          <p className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-2">Damage Photos</p>
          <div className="grid grid-cols-3 gap-1.5">
            {[0,1,2,3,4,5].map(i => (
              <div key={i} className="h-10 rounded-lg bg-stone-100 flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <rect x="1" y="3" width="12" height="9" rx="1.5" stroke="#c4b5a5" strokeWidth="1.2"/>
                  <circle cx="7" cy="7.5" r="2" stroke="#c4b5a5" strokeWidth="1.2"/>
                  <path d="M4.5 3l1-1.5h3l1 1.5" stroke="#c4b5a5" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            ))}
          </div>
        </div>
        <div className="h-px bg-stone-100" />
        {/* Submission checklist */}
        <div>
          <p className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-2">Submission Checklist</p>
          <div className="space-y-1.5">
            {['FEMA Individual Assistance', 'SBA Disaster Loan', 'Homeowner Insurance', 'Red Cross Emergency Aid'].map(agency => (
              <div key={agency} className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-sm bg-moss border border-leaf/40 shrink-0" />
                <span className="text-[11px] text-stone-600">{agency}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Recovery vault: text column ────────────────────────────────────────────

function RecoveryVaultText() {
  const [ref, visible] = useFadeIn(0.1);
  return (
    <div
      ref={ref}
      style={{
        transition: 'opacity 650ms ease, transform 650ms ease',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(28px)',
      }}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-400 mb-3">
        Recovery Documents
      </p>
      <h2 className="text-3xl sm:text-4xl mb-5">
        Your recovery file, ready before disaster strikes.
      </h2>
      <p className="text-base text-stone-600 leading-relaxed mb-5">
        Canopy compiles your personal info, home profile, and regional risk data into a single
        ready-to-submit PDF — pre-formatted for FEMA Individual Assistance applications, SBA disaster
        loan forms, homeowner insurance claims, and Red Cross emergency aid requests. When disaster
        hits, skip the paperwork chaos and submit immediately.
      </p>
      <ul className="space-y-2.5 mb-6">
        {[
          'Pre-filled with your address, household info, and risk profile',
          'Structured sections for damage photos with timestamps',
          'Formatted to match FEMA, SBA, and insurance submission requirements',
        ].map((point) => (
          <li key={point} className="flex items-start gap-2.5 text-sm text-stone-700">
            <svg
              width="16" height="16" viewBox="0 0 16 16" fill="none"
              className="mt-0.5 shrink-0 text-leaf" aria-hidden="true"
            >
              <circle cx="8" cy="8" r="7.25" stroke="currentColor" strokeWidth="1.4"/>
              <path d="M5 8l2.5 2.5 3.5-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {point}
          </li>
        ))}
      </ul>
      <p className="text-xs text-stone-400 leading-relaxed">
        No data is stored on our servers. Your profile stays on your device.
      </p>
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

  // Set initial camera and controls once the globe has rendered
  useEffect(() => {
    if (!globeReady || !globeRef.current) return;
    globeRef.current.pointOfView({ lat: 38, lng: -97, altitude: 2.2 }, 0);
    // Small delay ensures OrbitControls are fully initialised before we mutate them
    setTimeout(() => {
      const controls = globeRef.current?.controls();
      if (!controls) return;
      controls.enableZoom = false;
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.5;
    }, 150);
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

    saveResolvedLocationProfile(trimmed, risk);

    setSelectedRisk(risk);
    setZipError('');
    setPinData([{ lat: coords.lat, lng: coords.lng }]);

    if (globeRef.current) {
      globeRef.current.pointOfView(
        { lat: coords.lat, lng: coords.lng, altitude: 1.4 },
        1500
      );
      // Re-assert auto-rotate so it survives the pointOfView call
      const controls = globeRef.current.controls();
      if (controls) {
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.5;
      }
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
        <div className="relative z-20 flex flex-col justify-center px-8 pt-14 pb-24 sm:px-12 lg:absolute lg:inset-y-0 lg:left-0 lg:w-[44%] lg:pl-72 lg:pr-8 lg:pt-0 lg:pb-0">

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
                atmosphereColor="rgb(100,180,255)"
                atmosphereAltitude={0.28}
                autoRotate
                autoRotateSpeed={0.35}
                htmlElementsData={pinData}
                htmlLat="lat"
                htmlLng="lng"
                htmlElement={() => {
                  const el = document.createElement('div');
                  el.innerHTML = '<svg width="26" height="36" viewBox="0 0 26 36" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13 0C6.373 0 1 5.373 1 12c0 9.25 12 24 12 24S25 21.25 25 12C25 5.373 19.627 0 13 0z" fill="#E53935" stroke="#7f0000" stroke-width="1.5"/><circle cx="13" cy="12" r="4.5" fill="white" opacity="0.9"/></svg>';
                  el.style.transform = 'translate(-50%, -100%)';
                  el.style.filter = 'drop-shadow(0 2px 6px rgba(0,0,0,0.5))';
                  el.style.pointerEvents = 'none';
                  return el;
                }}
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

      {/* ── Eco-Mitigation Stats ─────────────────────────────────── */}
      <section className="bg-white py-20 px-6">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <p className="text-sm font-medium uppercase tracking-[0.25em] text-leaf">
              The evidence
            </p>
            <h2 className="mt-3 text-3xl sm:text-4xl">Why eco-mitigation works</h2>
            <p className="mt-4 text-base text-stone-500 max-w-xl mx-auto leading-relaxed">
              Independent research shows nature-based home improvements measurably reduce your disaster risk.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {ECO_STATS.map((s, i) => (
              <StatCard key={s.label} {...s} delay={i * 100} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Recovery PDF Vault ───────────────────────────────────── */}
      <section className="bg-parchment py-20 px-6">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <RecoveryVaultText />
            <PDFMockup />
          </div>
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
