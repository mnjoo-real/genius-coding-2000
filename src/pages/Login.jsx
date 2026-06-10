import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

function Field({ id, label, type, value, onChange, placeholder, autoComplete }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-stone-700">{label}</span>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition-colors placeholder:text-stone-400 focus:border-leaf focus:ring-2 focus:ring-leaf/15"
      />
    </label>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState({ type: "idle", message: "" });

  async function handleSignIn() {
    if (!email || !password) {
      setStatus({ type: "error", message: "Enter your email and password." });
      return;
    }

    if (!supabase) {
      setStatus({
        type: "error",
        message: "Supabase client is not configured in this environment.",
      });
      return;
    }

    setStatus({ type: "loading", message: "Signing in..." });

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setStatus({ type: "error", message: error.message });
      return;
    }

    setStatus({
      type: "success",
      message: "Signed in. Auth session is now available in Supabase.",
    });
  }

  async function handleCreateAccount() {
    if (!email || !password) {
      setStatus({ type: "error", message: "Enter your email and password." });
      return;
    }

    if (!supabase) {
      setStatus({
        type: "error",
        message: "Supabase client is not configured in this environment.",
      });
      return;
    }

    setStatus({ type: "loading", message: "Creating account..." });

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setStatus({ type: "error", message: error.message });
      return;
    }

    setStatus({
      type: "success",
      message: "Account created. Check your email if confirmation is enabled.",
    });
  }

  function handleContinueAsGuest() {
    console.log("TODO: continue as guest without auth", { email });
    navigate("/");
  }

  return (
    <main className="min-h-screen bg-parchment px-6 py-12 sm:py-16">
      <div className="mx-auto flex max-w-6xl items-center">
        <section className="w-full overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
            <div className="border-b border-stone-100 bg-gradient-to-br from-moss/40 via-white to-parchment p-8 sm:p-10 lg:border-b-0 lg:border-r">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-leaf">
                Login
              </p>
              <h1 className="mt-4 text-3xl font-semibold text-stone-900 sm:text-4xl">
                Welcome back
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-6 text-stone-600">
                Sign in to save your recovery profile across devices.
              </p>

              <div className="mt-8 rounded-2xl border border-stone-200 bg-white/80 p-5">
                <p className="text-sm font-medium text-stone-900">Why this page exists</p>
                <p className="mt-2 text-sm leading-6 text-stone-600">
                  The first commit only prepares the UI. Your current guest and localStorage
                  workflow stays intact until Supabase Auth is added later.
                </p>
              </div>
            </div>

            <div className="p-8 sm:p-10">
              <div className="max-w-md">
                <div className="space-y-5">
                  <Field
                    id="email"
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="name@example.com"
                    autoComplete="email"
                  />

                  <Field
                    id="password"
                    label="Password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                </div>

                <div className="mt-8 flex flex-col gap-3">
                  <button
                    type="button"
                    onClick={handleSignIn}
                    className="inline-flex items-center justify-center rounded-full bg-forest px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-900"
                  >
                    Sign In
                  </button>

                  <button
                    type="button"
                    onClick={handleCreateAccount}
                    className="inline-flex items-center justify-center rounded-full border border-stone-200 bg-white px-5 py-3 text-sm font-semibold text-stone-800 transition-colors hover:border-stone-300 hover:bg-stone-50"
                  >
                    Create Account
                  </button>

                  <button
                    type="button"
                    onClick={handleContinueAsGuest}
                    className="inline-flex items-center justify-center rounded-full border border-dashed border-stone-300 bg-transparent px-5 py-3 text-sm font-semibold text-stone-700 transition-colors hover:border-stone-400 hover:bg-stone-50"
                  >
                    Continue as Guest
                  </button>
                </div>

                <p className="mt-6 text-xs leading-5 text-stone-500">
                  Create Account is now wired to Supabase Auth. Guest flow is unchanged.
                </p>

                {status.message ? (
                  <div
                    className={`mt-5 rounded-2xl border px-4 py-3 text-sm leading-6 ${
                      status.type === "success"
                        ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                        : status.type === "error"
                          ? "border-red-200 bg-red-50 text-red-900"
                          : status.type === "loading"
                            ? "border-stone-200 bg-stone-50 text-stone-700"
                            : "border-stone-200 bg-stone-50 text-stone-600"
                    }`}
                  >
                    {status.message}
                  </div>
                ) : null}

                <div className="mt-8 flex items-center justify-between gap-4 border-t border-stone-100 pt-5 text-sm">
                  <Link
                    to="/"
                    className="font-medium text-stone-600 no-underline transition-colors hover:text-stone-900"
                  >
                    Go to Home
                  </Link>
                  <Link
                    to="/user-info"
                    className="font-medium text-stone-600 no-underline transition-colors hover:text-stone-900"
                  >
                    Open My Info
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
