import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  createLocalAccount,
  signInLocalAccount,
  signOutLocalAccount,
} from "../services/localAuthService";

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
  const { isAuthenticated, isLoading, user } = useAuth();
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState({ type: "idle", message: "" });
  const isSubmitting = status.type === "loading";

  function handleModeChange(nextMode) {
    if (isSubmitting) {
      return;
    }

    setIsCreateMode(nextMode);
    setStatus({ type: "idle", message: "" });
  }

  function handleSubmit() {
    if (isSubmitting) {
      return;
    }

    if (isCreateMode) {
      if (!firstName || !lastName || !email || !password) {
        setStatus({
          type: "error",
          message: "Enter your first name, last name, email, and password.",
        });
        return;
      }

      setStatus({ type: "loading", message: "Creating account..." });

      const result = createLocalAccount({
        firstName,
        lastName,
        email,
        password,
      });

      if (!result.ok) {
        setStatus({
          type: "error",
          message: result.message,
        });
        return;
      }

      navigate("/");
      return;
    }

    if (!email || !password) {
      setStatus({ type: "error", message: "Enter your email and password." });
      return;
    }

    setStatus({ type: "loading", message: "Signing in..." });

    const result = signInLocalAccount({
      email,
      password,
    });

    if (!result.ok) {
      setStatus({
        type: "error",
        message: result.message,
      });
      return;
    }

    navigate("/");
  }

  function handleLogout() {
    signOutLocalAccount();
    navigate("/login");
  }

  return (
    <main className="min-h-screen bg-parchment px-6 py-12 sm:py-16">
      <div className="mx-auto flex max-w-6xl items-center">
        <section className="w-full overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
            <div className="border-b border-stone-100 bg-linear-to-br from-moss/40 via-white to-parchment p-8 sm:p-10 lg:border-b-0 lg:border-r">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-leaf">
                Login
              </p>
              <h1 className="mt-4 text-3xl font-semibold text-stone-900 sm:text-4xl">
                Welcome back
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-6 text-stone-600">
                Sign in to keep this browser's preparedness profile organized locally.
              </p>
            </div>

            <div className="p-8 sm:p-10">
              <div className="max-w-md">
                {isLoading ? (
                  <div className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-600">
                    Checking your session...
                  </div>
                ) : isAuthenticated ? (
                  <div className="space-y-5">
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-800">
                        Signed in
                      </p>
                      <p className="mt-2 text-sm leading-6 text-emerald-950">
                        {user?.email || "Your session is active."}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleLogout}
                      disabled={isSubmitting}
                      className="inline-flex w-full items-center justify-center rounded-full border border-stone-200 bg-white px-5 py-3 text-sm font-semibold text-stone-800 transition-colors hover:border-stone-300 hover:bg-stone-50"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <>
                    <div>
                      <p className="text-sm font-medium uppercase tracking-[0.18em] text-leaf">
                        {isCreateMode ? "Create account" : "Login"}
                      </p>
                      <h1 className="mt-4 text-3xl font-semibold text-stone-900 sm:text-4xl">
                        {isCreateMode ? "Create your account" : "Welcome back"}
                      </h1>
                    </div>

                    <div className="space-y-5">
                      {isCreateMode ? (
                        <div className="grid gap-5 sm:grid-cols-2">
                          <Field
                            id="firstName"
                            label="First name"
                            type="text"
                            value={firstName}
                            onChange={(event) => setFirstName(event.target.value)}
                            placeholder="First name"
                            autoComplete="given-name"
                          />

                          <Field
                            id="lastName"
                            label="Last name"
                            type="text"
                            value={lastName}
                            onChange={(event) => setLastName(event.target.value)}
                            placeholder="Last name"
                            autoComplete="family-name"
                          />
                        </div>
                      ) : null}

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
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="inline-flex items-center justify-center rounded-full bg-forest px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-900"
                      >
                        {isCreateMode ? "Create Account" : "Sign In"}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleModeChange(!isCreateMode)}
                        disabled={isSubmitting}
                        className="self-center text-sm font-medium text-stone-600 transition-colors hover:text-stone-900"
                      >
                        {isCreateMode ? "Already have an account? Sign in" : "Create Account"}
                      </button>
                    </div>

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
                  </>
                )}

              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
