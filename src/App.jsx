import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'

function App() {
  const [count, setCount] = useState(0)

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(170,59,255,0.12),_transparent_35%),linear-gradient(180deg,#ffffff_0%,#faf7ff_100%)] text-slate-700">
      <section className="mx-auto flex min-h-screen w-full max-w-5xl flex-col items-center justify-center px-6 py-12">
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="relative h-[179px] w-[170px]">
            <img
              src={heroImg}
              className="absolute inset-0 z-0 h-[179px] w-[170px]"
              width="170"
              height="179"
              alt=""
            />
            <img
              src={reactLogo}
              className="absolute left-1/2 top-8 z-10 h-7 w-auto -translate-x-1/2 [transform:translateX(-50%)_perspective(2000px)_rotateZ(300deg)_rotateX(44deg)_rotateY(39deg)_scale(1.4)]"
              alt="React logo"
            />
            <img
              src={viteLogo}
              className="absolute left-1/2 top-[107px] z-0 h-[26px] w-auto -translate-x-1/2 [transform:translateX(-50%)_perspective(2000px)_rotateZ(300deg)_rotateX(40deg)_rotateY(39deg)_scale(0.8)]"
              alt="Vite logo"
            />
          </div>

          <div className="space-y-3">
            <h1 className="text-4xl font-semibold tracking-tight text-slate-950 md:text-6xl">
              Get started
            </h1>
            <p className="text-base text-slate-500 md:text-lg">
              Edit <code className="rounded bg-slate-100 px-2 py-1 font-mono text-slate-900">src/App.jsx</code> and save to test{' '}
              <code className="rounded bg-slate-100 px-2 py-1 font-mono text-slate-900">HMR</code>
            </p>
          </div>

          <button
            type="button"
            className="rounded-lg border border-transparent bg-violet-100 px-4 py-2 text-sm font-medium text-violet-700 transition hover:border-violet-300 hover:bg-violet-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500"
            onClick={() => setCount((value) => value + 1)}
          >
            Count is {count}
          </button>
        </div>

        <div className="my-10 h-px w-full max-w-5xl bg-slate-200" />

        <section className="grid w-full max-w-5xl gap-px overflow-hidden rounded-3xl border border-slate-200 bg-slate-200 shadow-[0_20px_60px_rgba(15,23,42,0.08)] lg:grid-cols-2">
          <article className="bg-white p-8 text-left md:p-10">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-50 text-violet-700">
              <span className="text-xl">i</span>
            </div>
            <h2 className="mb-2 text-2xl font-semibold tracking-tight text-slate-950">
              Documentation
            </h2>
            <p className="text-slate-500">Your questions, answered</p>
            <ul className="mt-8 flex flex-wrap gap-3">
              <li>
                <a
                  href="https://vite.dev/"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-200"
                >
                  <img className="h-[18px] w-auto" src={viteLogo} alt="" />
                  Explore Vite
                </a>
              </li>
              <li>
                <a
                  href="https://react.dev/"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-200"
                >
                  <img className="h-[18px] w-[18px]" src={reactLogo} alt="" />
                  Learn more
                </a>
              </li>
            </ul>
          </article>

          <article className="bg-white p-8 text-left md:p-10">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-50 text-violet-700">
              <span className="text-xl">+</span>
            </div>
            <h2 className="mb-2 text-2xl font-semibold tracking-tight text-slate-950">
              Connect with us
            </h2>
            <p className="text-slate-500">Join the Vite community</p>
            <ul className="mt-8 flex flex-wrap gap-3">
              <li>
                <a
                  href="https://github.com/vitejs/vite"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-200"
                >
                  GitHub
                </a>
              </li>
              <li>
                <a
                  href="https://chat.vite.dev/"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-200"
                >
                  Discord
                </a>
              </li>
              <li>
                <a
                  href="https://x.com/vite_js"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-200"
                >
                  X.com
                </a>
              </li>
              <li>
                <a
                  href="https://bsky.app/profile/vite.dev"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-200"
                >
                  Bluesky
                </a>
              </li>
            </ul>
          </article>
        </section>
      </section>
    </main>
  )
}

export default App
