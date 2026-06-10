import { useId, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  readRecoveryDamageRecord,
  saveRecoveryDamageRecord,
} from "../../services/userInfoSyncService";

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

async function readFilesAsDataUrls(files) {
  const fileList = Array.from(files || []).filter(Boolean);
  const uploads = await Promise.all(fileList.map((file) => readFileAsDataUrl(file)));
  return uploads.filter(Boolean);
}

function PhotoTile({ item, onRemove }) {
  return (
    <div className="group relative aspect-square overflow-hidden rounded-2xl border border-stone-200 bg-stone-50">
      <img src={item.url} alt={item.name} className="h-full w-full object-cover" />
      <button
        type="button"
        onClick={onRemove}
        className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full border border-white/60 bg-white/90 text-sm font-semibold text-stone-700 shadow-sm transition-colors hover:bg-white"
        aria-label={`Remove ${item.name}`}
      >
        x
      </button>
    </div>
  );
}

function AddPhotoButton({ label, onClick, inputId }) {
  return (
    <label
      htmlFor={inputId}
      className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 transition-colors hover:border-emerald-300 hover:bg-emerald-100"
      aria-label={label}
    >
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-xl font-semibold leading-none text-white shadow-sm transition-transform hover:scale-105">
        +
      </span>
      <input
        id={inputId}
        type="file"
        accept="image/*"
        multiple
        onChange={(event) => {
          onClick(event);
          event.target.value = "";
        }}
        className="sr-only"
      />
    </label>
  );
}

function InfoTooltip({ label, description }) {
  return (
    <div className="group relative inline-flex">
      <button
        type="button"
        className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-stone-300 bg-white text-[11px] font-semibold text-stone-500 transition-colors hover:border-emerald-300 hover:text-emerald-700 focus-visible:border-emerald-400 focus-visible:text-emerald-700"
        aria-label={label}
        title={description}
      >
        ?
      </button>
      <div className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 w-72 -translate-x-1/2 rounded-2xl bg-stone-900 px-3 py-2 text-xs leading-5 text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
        {description}
      </div>
    </div>
  );
}

function PhotoUploadGrid({ title, description, items, onAdd, onRemove }) {
  const inputId = useId();

  return (
    <section className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-semibold text-stone-900">{title}</h3>
            <InfoTooltip label={`${title} help`} description={description} />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <AddPhotoButton
            label={`Add ${title}`}
            inputId={`${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${inputId}`}
            onClick={onAdd}
          />
        </div>
      </div>

      <div className="mt-5 max-h-[28rem] overflow-y-auto pr-1">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
          {items.map((item, index) => (
            <PhotoTile
              key={item.id}
              item={item}
              onRemove={() => onRemove(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function RecoveryWorkspaceContent({ isAuthenticated }) {
  const [record, setRecord] = useState(() => normalizeRecord(readRecoveryDamageRecord()));
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

  const handlePhotoAdd = async (kind, files) => {
    const nextItems = await readFilesAsDataUrls(files);
    if (!nextItems.length) {
      return;
    }

    const field = kind === "home" ? "homePhotos" : "receiptPhotos";

    setRecord((currentRecord) => ({
      ...currentRecord,
      [field]: [...currentRecord[field], ...nextItems],
    }));
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
    saveRecoveryDamageRecord(record);
    setSaveStatus(isAuthenticated ? "Saved to this account." : "Saved to this browser.");
  };

  return (
    <section className="grid gap-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <PhotoUploadGrid
          title="Damaged home photos"
          description="Upload one or many photos of rooms, angles, and visible damage. Use the green + button to add more at any time."
          items={record.homePhotos}
          onAdd={(event) => handlePhotoAdd("home", event.target.files)}
          onRemove={(index) => handlePhotoRemove("home", index)}
        />

        <PhotoUploadGrid
          title="Receipt photos"
          description="Upload one or many receipts for hotel stays, emergency supplies, temporary repairs, food replacement, or transportation."
          items={record.receiptPhotos}
          onAdd={(event) => handlePhotoAdd("receipt", event.target.files)}
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

export default function RecoveryWorkspace() {
  const { user } = useAuth();

  return <RecoveryWorkspaceContent key={user?.id ?? "guest"} isAuthenticated={Boolean(user)} />;
}
