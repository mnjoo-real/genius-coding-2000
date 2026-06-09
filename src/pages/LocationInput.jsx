import { useState } from "react";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

export default function LocationInput() {
  const [zipCode, setZipCode] = useState("");
  const [error, setError] = useState("");

  function handleZipChange(event) {
    setZipCode(event.target.value);

    if (error) {
      setError("");
    }
  }

  function handleSubmit(event) {
    event.preventDefault();

    const submittedZipCode = zipCode.trim();

    if (!submittedZipCode) {
      setError("Enter a ZIP code to check regional risk.");
    }
  }

  return (
    <main className="min-h-screen bg-parchment px-6 py-16">
      <section className="mx-auto max-w-2xl rounded-3xl border border-stone-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-[0.25em] text-leaf">
          Regional Risk
        </p>
        <h1 className="mt-3 text-3xl">Start with your ZIP code</h1>
        <p className="mt-3 text-stone-600">
          Enter your ZIP code to begin a regional risk and home readiness
          check for your area.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
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

          <Button type="submit" size="lg">
            Continue
          </Button>
        </form>
      </section>
    </main>
  );
}
