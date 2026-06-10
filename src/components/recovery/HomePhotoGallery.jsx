import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { homePhotoCategories } from "../../data/homePhotoCategories";
import {
  readHomePhotoChecklist,
  saveHomePhotoChecklist,
} from "../../services/userInfoSyncService";
import PhotoCategoryCard from "./PhotoCategoryCard";

function HomePhotoGalleryContent() {
  const [checklist, setChecklist] = useState(() => readHomePhotoChecklist());

  const categories = Array.isArray(homePhotoCategories) ? homePhotoCategories : [];
  const documentedCount = categories.reduce((count, category) => {
    return checklist[category.id] ? count + 1 : count;
  }, 0);

  const handleToggle = (categoryId) => {
    setChecklist((currentChecklist) => {
      const nextChecklist = {
        ...currentChecklist,
        [categoryId]: !currentChecklist[categoryId],
      };

      saveHomePhotoChecklist(nextChecklist);
      return nextChecklist;
    });
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

export default function HomePhotoGallery() {
  const { user } = useAuth();

  return <HomePhotoGalleryContent key={user?.id ?? "guest"} />;
}
