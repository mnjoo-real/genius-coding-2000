import { useEffect, useState } from "react";
import { homePhotoCategories } from "../../data/homePhotoCategories";
import PhotoCategoryCard from "./PhotoCategoryCard";

const STORAGE_KEY = "homePhotoChecklist";

function safeParseChecklist(rawValue) {
  if (!rawValue) {
    return {};
  }

  try {
    const parsed = JSON.parse(rawValue);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed;
    }
  } catch {
    // Fall back to a safe empty object.
  }

  return {};
}

export default function HomePhotoGallery() {
  const [checklist, setChecklist] = useState({});

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    setChecklist(safeParseChecklist(window.localStorage.getItem(STORAGE_KEY)));
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(checklist));
  }, [checklist]);

  const categories = Array.isArray(homePhotoCategories) ? homePhotoCategories : [];
  const documentedCount = categories.reduce((count, category) => {
    return checklist[category.id] ? count + 1 : count;
  }, 0);

  const handleToggle = (categoryId) => {
    setChecklist((currentChecklist) => ({
      ...currentChecklist,
      [categoryId]: !currentChecklist[categoryId],
    }));
  };

  return (
    <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
            Recovery Center
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-stone-900">
            Pre-Disaster Home Photo Gallery
          </h2>
        </div>
        <p className="text-sm font-medium text-stone-600">
          {documentedCount} of {categories.length} documented
        </p>
      </div>

      <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600">
        This MVP uses documentation placeholders instead of real uploads so you can organize the
        home photo record you will want ready before recovery begins.
      </p>

      <div className="mt-6 grid gap-4">
        {categories.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-stone-200 bg-stone-50 px-4 py-5 text-sm text-stone-600">
            No photo categories are available yet.
          </p>
        ) : (
          categories.map((category) => (
            <PhotoCategoryCard
              key={category.id}
              category={category}
              checked={Boolean(checklist[category.id])}
              onToggle={() => handleToggle(category.id)}
            />
          ))
        )}
      </div>
    </section>
  );
}
