import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { regionalRiskData } from "../data/regionalRiskData";
import { getRegionalRiskByZip } from "../services/riskLookupService";
import {
  readRegionalRisk,
  readSelectedZipCode,
  saveResolvedLocationProfile,
} from "../services/userInfoSyncService";
import {
  formatRiskScore,
  getRelativeRiskValue,
  getRiskBandClasses,
} from "../utils/riskDisplay";

const RISK_LOOKUP_ERROR =
  "We could not find regional risk data for this ZIP code. Please check the ZIP code and try again.";

export default function LocationInput() {
  const navigate = useNavigate();
  const [zipCode, setZipCode] = useState(() => readSelectedZipCode());
  const [error, setError] = useState("");
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [resolvedRiskProfile, setResolvedRiskProfile] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [savedZipCode, setSavedZipCode] = useState(() => readSelectedZipCode());
  const [savedRegionalRisk, setSavedRegionalRisk] = useState(() => readRegionalRisk());
  const [isEditingSavedProfile, setIsEditingSavedProfile] = useState(false);

  function handleZipChange(event) {
    setZipCode(event.target.value);
    setResolvedRiskProfile(null);
    setStatusMessage("");

    if (error) {
      setError("");
    }
  }

  function handleSampleZipClick(sampleZipCode) {
    setZipCode(sampleZipCode);
    setResolvedRiskProfile(null);
    setStatusMessage("");

    if (error) {
      setError("");
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const normalizedZipCode = String(zipCode ?? "").trim();

    if (isLookingUp) {
      return;
    }

    if (!normalizedZipCode) {
      setError("Enter a ZIP code to check regional risk.");
      setResolvedRiskProfile(null);
      setStatusMessage("");
      return;
    }

    setIsLookingUp(true);
    setError("");
    setStatusMessage("");

    try {
      const regionalRisk = await getRegionalRiskByZip(normalizedZipCode);

      if (!regionalRisk) {
        setError(RISK_LOOKUP_ERROR);
        setResolvedRiskProfile(null);
        return;
      }

      saveResolvedLocationProfile(normalizedZipCode, regionalRisk);
      setSavedZipCode(normalizedZipCode);
      setSavedRegionalRisk(regionalRisk);
      setResolvedRiskProfile(regionalRisk);
      setStatusMessage(
        `Regional profile ready for ${regionalRisk.city}, ${regionalRisk.state}.`
      );
      navigate("/risk");
    } catch (error) {
      console.error("Unexpected regional risk lookup error:", error);
      setError(RISK_LOOKUP_ERROR);
      setResolvedRiskProfile(null);
    } finally {
      setIsLookingUp(false);
    }
  }

  function handleEditResponse() {
    setIsEditingSavedProfile(true);
    setZipCode(savedZipCode || "");
    setResolvedRiskProfile(null);
    setStatusMessage("");
    setError("");
  }

  const hasSavedLocationProfile = Boolean(savedZipCode && savedRegionalRisk);

  if (hasSavedLocationProfile && !isEditingSavedProfile) {
    return (
      <main className="min-h-screen bg-parchment px-6 py-12 sm:py-16">
        <section className="mx-auto max-w-3xl">
          <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
            <h1 className="text-3xl text-stone-900">Location profile already completed</h1>
            <p className="mt-3 text-stone-600">
              You already saved a regional risk profile for this ZIP code.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-stone-200 bg-parchment/60 p-4">
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-stone-500">
                  ZIP code
                </p>
                <p className="mt-2 text-lg font-semibold text-stone-900">{savedZipCode}</p>
              </div>
              <div className="rounded-2xl border border-stone-200 bg-parchment/60 p-4">
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-stone-500">
                  Location
                </p>
                <p className="mt-2 text-lg font-semibold text-stone-900">
                  {savedRegionalRisk.city && savedRegionalRisk.state
                    ? `${savedRegionalRisk.city}, ${savedRegionalRisk.state}`
                    : "Not provided"}
                </p>
              </div>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-stone-200 bg-white p-4">
                <p className="text-sm font-medium text-stone-700">Flood risk score</p>
                <p className={`mt-1 text-lg font-semibold ${getRiskBandClasses(getRelativeRiskValue(savedRegionalRisk, "floodRisk")).valueClassName}`}>
                  {formatRiskScore(getRelativeRiskValue(savedRegionalRisk, "floodRisk"))}
                </p>
              </div>
              <div className="rounded-2xl border border-stone-200 bg-white p-4">
                <p className="text-sm font-medium text-stone-700">Wildfire risk score</p>
                <p className={`mt-1 text-lg font-semibold ${getRiskBandClasses(getRelativeRiskValue(savedRegionalRisk, "wildfireRisk")).valueClassName}`}>
                  {formatRiskScore(getRelativeRiskValue(savedRegionalRisk, "wildfireRisk"))}
                </p>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Button variant="primary" onClick={() => navigate("/reports")}>
                View Reports
              </Button>
              <Button variant="secondary" onClick={() => navigate("/risk")}>
                Continue
              </Button>
              <Button variant="secondary" onClick={handleEditResponse}>
                Edit Response
              </Button>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-parchment px-6 py-12 sm:py-16">
      <section className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <div className="pt-2">
          <p className="text-sm font-medium uppercase tracking-[0.25em] text-leaf">
            Regional Risk
          </p>
          <h1 className="mt-4 max-w-xl text-4xl sm:text-5xl">
            Start with the risks around your home.
          </h1>
          <p className="mt-5 max-w-xl text-base text-stone-600 sm:text-lg">
            Enter a ZIP code to prepare a regional risk profile before the home
            readiness questions. Sample ZIPs are available for testing the MVP
            flow.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8"
        >
          <div className="border-b border-stone-100 pb-5">
            <h2 className="text-2xl">Find your regional profile</h2>
            <p className="mt-2 text-sm text-stone-600">
              Your ZIP is saved locally so the next step can show the right
              regional risk context.
            </p>
          </div>

          <div className="mt-6 flex flex-col gap-6">
            <div>
              <Input
                label="ZIP code"
                placeholder="Enter ZIP code"
                value={zipCode}
                onChange={handleZipChange}
                inputMode="numeric"
                autoComplete="postal-code"
                disabled={isLookingUp}
                error={error}
                aria-required="true"
              />
              <p className="mt-2 text-sm text-stone-500">
                Use a 5-digit ZIP code, or choose a sample below.
              </p>
            </div>

            <div className="rounded-xl border border-stone-200 bg-parchment/60 p-4">
              <p className="text-sm font-medium text-stone-800">
                Sample ZIP codes
              </p>
              <p className="mt-1 text-sm text-stone-600">
                These locations have sample regional risk data for testing the
                MVP flow.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                {regionalRiskData.map((sample) => {
                  const isSelected = zipCode === sample.zipCode;

                  return (
                    <button
                      key={sample.zipCode}
                      type="button"
                      onClick={() => handleSampleZipClick(sample.zipCode)}
                      disabled={isLookingUp}
                      aria-pressed={isSelected}
                      className={[
                        "rounded-full border px-4 py-2 text-sm font-medium transition-base",
                        isSelected
                          ? "border-forest bg-moss text-forest shadow-sm"
                          : "border-stone-200 bg-white text-stone-700 hover:border-leaf hover:bg-moss/50 hover:text-forest",
                      ].join(" ")}
                    >
                      <span>{sample.zipCode}</span>
                      <span className="ml-1 text-stone-500">{sample.city}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {statusMessage && resolvedRiskProfile ? (
              <p
                className="rounded-lg border border-moss bg-moss/45 px-4 py-3 text-sm font-medium text-forest"
                role="status"
              >
                {statusMessage}
              </p>
            ) : null}

            <Button type="submit" size="lg" fullWidth disabled={isLookingUp}>
              {isLookingUp
                ? "Checking regional risk..."
                : "Continue to Regional Risk"}
            </Button>
          </div>
        </form>
      </section>
    </main>
  );
}
