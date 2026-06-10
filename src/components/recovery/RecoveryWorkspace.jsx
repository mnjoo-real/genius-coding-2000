import { useMemo, useState } from "react";

const STORAGE_KEY = "recoveryDamageRecord";

const DAMAGE_TYPE_GROUPS = [
  {
    id: "human-impact",
    label: "Human impact",
    description: "Health, injury, accessibility, or household safety impacts.",
    options: [
      "Injury or medical care",
      "Medication or medical equipment loss",
      "Accessibility needs",
      "Household member displaced",
    ],
  },
  {
    id: "property-damage",
    label: "Property damage",
    description: "Damage to the home structure, rooms, systems, or belongings.",
    options: [
      "Roof or exterior damage",
      "Interior water or mold damage",
      "Foundation or structural damage",
      "Furniture or appliance damage",
    ],
  },
  {
    id: "temporary-living",
    label: "Temporary living costs",
    description: "Costs caused by not being able to safely stay at home.",
    options: [
      "Hotel or short-term lodging",
      "Food replacement",
      "Transportation",
      "Emergency supplies",
    ],
  },
  {
    id: "utilities-vehicle",
    label: "Utilities or vehicle",
    description: "Damage affecting power, water, HVAC, vehicles, or access.",
    options: [
      "Electrical or utility issue",
      "HVAC or water heater damage",
      "Vehicle damage",
      "Driveway or access blocked",
    ],
  },
];

const EMPTY_RECORD = {
  damageDate: "",
  damageTypes: {},
  homePhotos: [],
  receiptPhotos: [],
};

function safeParseObject(rawValue) {
  if (!rawValue) {
    return {};
  }

  try {
    const parsed = JSON.parse(rawValue);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed;
    }
  } catch {
    // Use the empty fallback below.
  }

  return {};
}

function normalizeRecord(value) {
  const parsed = value && typeof value === "object" && !Array.isArray(value) ? value : {};

  return {
    ...EMPTY_RECORD,
    ...parsed,
    damageTypes:
      parsed.damageTypes && typeof parsed.damageTypes === "object" && !Array.isArray(parsed.damageTypes)
        ? parsed.damageTypes
        : {},
    homePhotos: Array.isArray(parsed.homePhotos) ? parsed.homePhotos : [],
    receiptPhotos: Array.isArray(parsed.receiptPhotos) ? parsed.receiptPhotos : [],
  };
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      resolve({
        id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2)}`,
        name: file.name,
        url: typeof reader.result === "string" ? reader.result : "",
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function PhotoTile({ item, label, onUpload, onRemove }) {
  const inputId = `${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${item?.id || "empty"}`;

  return (
    <div className="group relative aspect-square overflow-hidden rounded-2xl border border-stone-200 bg-stone-50">
      {item ? (
        <>
          <img src={item.url} alt={item.name} className="h-full w-full object-cover" />
          <div className="absolute inset-x-0 bottom-0 bg-stone-950/70 px-3 py-2">
            <p className="truncate text-xs font-medium text-white">{item.name}</p>
          </div>
          <button
            type="button"
            onClick={onRemove}
            className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full border border-white/60 bg-white/90 text-sm font-semibold text-stone-700 shadow-sm transition-colors hover:bg-white"
            aria-label={`Remove ${item.name}`}
          >
            x
          </button>
        </>
      ) : (
        <label
          htmlFor={inputId}
          className="flex h-full w-full cursor-pointer items-center justify-center text-4xl font-light text-stone-400 transition-colors hover:bg-emerald-50 hover:text-emerald-700"
          aria-label={`Upload ${label}`}
        >
          +
          <input
            id={inputId}
            type="file"
            accept="image/*"
            onChange={(event) => onUpload(event.target.files?.[0] || null)}
            className="sr-only"
          />
        </label>
      )}
    </div>
  );
}

function PhotoUploadGrid({ title, description, items, minimumSlots = 4, onUpload, onRemove }) {
  const slots = useMemo(() => {
    const targetLength = Math.max(minimumSlots, items.length + 1);
    return Array.from({ length: targetLength }, (_, index) => items[index] || null);
  }, [items, minimumSlots]);

  return (
    <section className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="text-xl font-semibold text-stone-900">{title}</h3>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-stone-600">{description}</p>
        </div>
        <p className="text-sm font-medium text-stone-600">{items.length} uploaded</p>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-4">
        {slots.map((item, index) => (
          <PhotoTile
            key={item?.id || `empty-${index}`}
            item={item}
            label={`${title} ${index + 1}`}
            onUpload={(file) => onUpload(file, index)}
            onRemove={() => onRemove(index)}
          />
        ))}
      </div>
    </section>
  );
}

export default function RecoveryWorkspace() {
  const [record, setRecord] = useState(() => {
    if (typeof window === "undefined") {
      return EMPTY_RECORD;
    }

    return normalizeRecord(safeParseObject(window.localStorage.getItem(STORAGE_KEY)));
  });
  const [saveStatus, setSaveStatus] = useState("");

  const handleRecordChange = (field, value) => {
    setRecord((currentRecord) => ({
      ...currentRecord,
      [field]: value,
    }));
    setSaveStatus("");
  };

  const handleDamageTypeToggle = (groupId, option) => {
    setRecord((currentRecord) => {
      const currentOptions = Array.isArray(currentRecord.damageTypes[groupId])
        ? currentRecord.damageTypes[groupId]
        : [];
      const nextOptions = currentOptions.includes(option)
        ? currentOptions.filter((item) => item !== option)
        : [...currentOptions, option];

      return {
        ...currentRecord,
        damageTypes: {
          ...currentRecord.damageTypes,
          [groupId]: nextOptions,
        },
      };
    });
    setSaveStatus("");
  };

  const handlePhotoUpload = async (kind, file, index) => {
    if (!file) {
      return;
    }

    const imageItem = await readFileAsDataUrl(file);
    const field = kind === "home" ? "homePhotos" : "receiptPhotos";

    setRecord((currentRecord) => {
      const nextItems = [...currentRecord[field]];
      nextItems[index] = imageItem;

      return {
        ...currentRecord,
        [field]: nextItems.filter(Boolean),
      };
    });
    setSaveStatus("");
  };

  const handlePhotoRemove = (kind, index) => {
    const field = kind === "home" ? "homePhotos" : "receiptPhotos";

    setRecord((currentRecord) => {
      const nextItems = [...currentRecord[field]];
      nextItems.splice(index, 1);

      return {
        ...currentRecord,
        [field]: nextItems,
      };
    });
    setSaveStatus("");
  };

  const handleSave = () => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
    setSaveStatus("Saved to this browser.");
  };

  return (
    <section className="grid gap-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <PhotoUploadGrid
          title="Damaged home photos"
          description="Start with four core photos. Add more if you need additional rooms, angles, or damage details."
          items={record.homePhotos}
          minimumSlots={4}
          onUpload={(file, index) => handlePhotoUpload("home", file, index)}
          onRemove={(index) => handlePhotoRemove("home", index)}
        />

        <PhotoUploadGrid
          title="Receipt photos"
          description="Upload receipts for hotel stays, emergency supplies, temporary repairs, food replacement, or transportation."
          items={record.receiptPhotos}
          minimumSlots={4}
          onUpload={(file, index) => handlePhotoUpload("receipt", file, index)}
          onRemove={(index) => handlePhotoRemove("receipt", index)}
        />
      </div>

      <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
        <div>
          <h3 className="text-xl font-semibold text-stone-900">Damage date and type</h3>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-stone-600">
            Record when the damage happened and classify what kind of loss occurred.
          </p>
        </div>

        <div className="mt-5 grid gap-6">
          <label className="block max-w-sm">
            <span className="mb-2 block text-sm font-semibold text-stone-800">
              Date damage occurred
            </span>
            <input
              type="date"
              value={record.damageDate}
              onChange={(event) => handleRecordChange("damageDate", event.target.value)}
              className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition-colors focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/15"
            />
          </label>

          <div className="grid gap-4 lg:grid-cols-2">
            {DAMAGE_TYPE_GROUPS.map((group) => {
              const selectedOptions = Array.isArray(record.damageTypes[group.id])
                ? record.damageTypes[group.id]
                : [];

              return (
                <fieldset
                  key={group.id}
                  className="rounded-3xl border border-stone-200 bg-stone-50/70 p-5"
                >
                  <legend className="text-base font-semibold text-stone-900">
                    {group.label}
                  </legend>
                  <p className="mt-1 text-sm leading-6 text-stone-600">{group.description}</p>

                  <div className="mt-4 grid gap-3">
                    {group.options.map((option) => {
                      const checked = selectedOptions.includes(option);

                      return (
                        <label
                          key={option}
                          className={`flex cursor-pointer items-start gap-3 rounded-2xl border px-4 py-3 text-sm transition-colors ${
                            checked
                              ? "border-emerald-300 bg-emerald-50 text-emerald-950"
                              : "border-stone-200 bg-white text-stone-700 hover:border-stone-300"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => handleDamageTypeToggle(group.id, option)}
                            className="mt-0.5 h-4 w-4 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
                          />
                          <span className="font-medium">{option}</span>
                        </label>
                      );
                    })}
                  </div>
                </fieldset>
              );
            })}
          </div>

          <div className="flex flex-col gap-3 border-t border-stone-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm leading-6 text-stone-500">
              Save stores the date, damage selections, home photos, and receipt photos in this
              browser.
            </p>
            <div className="flex flex-col gap-2 sm:items-end">
              <button
                type="button"
                onClick={handleSave}
                className="inline-flex items-center justify-center rounded-full bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-800"
              >
                Save Damage Record
              </button>
              {saveStatus ? (
                <p className="text-sm font-medium text-emerald-700">{saveStatus}</p>
              ) : null}
            </div>
          </div>
        </div>
      </section>
    </section>
  );
}
