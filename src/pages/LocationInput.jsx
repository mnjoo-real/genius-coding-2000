import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { fallbackRiskData, regionalRiskData } from "../data/regionalRiskData";

function saveResolvedLocation(submittedZipCode, regionalRiskProfile) {
  localStorage.setItem("selectedZipCode", submittedZipCode);
  localStorage.setItem("regionalRisk", JSON.stringify(regionalRiskProfile));
}

export default function LocationInput() {
  const navigate = useNavigate();
  const [zipCode, setZipCode] = useState("");
  const [error, setError] = useState("");
  const [resolvedRiskProfile, setResolvedRiskProfile] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");

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

  function handleSubmit(event) {
    event.preventDefault();

    const submittedZipCode = zipCode.trim();

    if (!submittedZipCode) {
      setError("Enter a ZIP code to check regional risk.");
      setResolvedRiskProfile(null);
      setStatusMessage("");
      return;
    }

    const matchingRiskProfile = regionalRiskData.find(
      (regionalRiskProfile) => regionalRiskProfile.zipCode === submittedZipCode
    );

    if (matchingRiskProfile) {
      saveResolvedLocation(submittedZipCode, matchingRiskProfile);
      setResolvedRiskProfile(matchingRiskProfile);
      setStatusMessage(
        `Regional profile ready for ${matchingRiskProfile.city}, ${matchingRiskProfile.state}.`
      );
      navigate("/risk");
      return;
    }

    const fallbackRiskProfile = {
      ...fallbackRiskData,
      zipCode: submittedZipCode,
    };

    saveResolvedLocation(submittedZipCode, fallbackRiskProfile);
    setResolvedRiskProfile(fallbackRiskProfile);
    setStatusMessage(
      "This ZIP is outside the sample set, so a general regional profile will be used."
    );
    navigate("/risk");
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
            readiness questions. Sample ZIPs use the MVP data set; other ZIPs
            continue with a general profile.
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

            <Button type="submit" size="lg" fullWidth>
              Continue to Regional Risk
            </Button>
          </div>
        </form>
      </section>
    </main>
  );
}
