import { useEffect, useMemo, useRef, useState } from "react";

const STORAGE_KEY = "homePhotoEvidence";
const MAX_PHOTOS = 4;
const OUTPUT_SIZE = 512;

function normalizePhotos(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item) => item && typeof item === "object" && !Array.isArray(item))
    .map((item) => ({
      id: typeof item.id === "string" && item.id ? item.id : `photo-${Math.random().toString(36).slice(2, 10)}`,
      dataUrl: typeof item.dataUrl === "string" ? item.dataUrl : "",
      fileName: typeof item.fileName === "string" ? item.fileName : "home-photo.jpg",
    }))
    .filter((item) => item.dataUrl)
    .slice(0, MAX_PHOTOS);
}

function readStoredPhotos() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const rawValue = window.localStorage.getItem(STORAGE_KEY);
    if (!rawValue) {
      return [];
    }

    return normalizePhotos(JSON.parse(rawValue));
  } catch {
    return [];
  }
}

function createPhotoId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `photo-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function persistPhotos(nextPhotos) {
  if (typeof window === "undefined") {
    return { ok: true };
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextPhotos));
    return { ok: true };
  } catch {
    return {
      ok: false,
      message: "Photos could not be saved to local storage on this device.",
    };
  }
}

function loadImage(dataUrl) {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Image failed to load."));
    image.src = dataUrl;
  });
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }

      reject(new Error("File could not be read."));
    };

    reader.onerror = () => reject(new Error("File could not be read."));
    reader.readAsDataURL(file);
  });
}

async function processImageFile(file) {
  if (!(file instanceof File) || !file.type.startsWith("image/")) {
    throw new Error("Please choose a valid image file.");
  }

  const sourceDataUrl = await readFileAsDataUrl(file);
  const image = await loadImage(sourceDataUrl);

  const squareSize = Math.min(image.width, image.height);
  if (!squareSize) {
    throw new Error("Image dimensions are invalid.");
  }

  const sourceX = (image.width - squareSize) / 2;
  const sourceY = (image.height - squareSize) / 2;
  const canvas = document.createElement("canvas");
  canvas.width = OUTPUT_SIZE;
  canvas.height = OUTPUT_SIZE;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Image processing is unavailable in this browser.");
  }

  context.drawImage(
    image,
    sourceX,
    sourceY,
    squareSize,
    squareSize,
    0,
    0,
    OUTPUT_SIZE,
    OUTPUT_SIZE,
  );

  const dataUrl = canvas.toDataURL("image/jpeg", 0.88);
  if (!dataUrl) {
    throw new Error("Image processing failed.");
  }

  return {
    id: createPhotoId(),
    dataUrl,
    fileName: file.name || "home-photo.jpg",
  };
}

export default function HomePhotoUploadGrid() {
  const inputRefs = useRef([]);
  const [photos, setPhotos] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [storageWarning, setStorageWarning] = useState("");

  useEffect(() => {
    setPhotos(readStoredPhotos());
  }, []);

  const slots = useMemo(
    () => Array.from({ length: MAX_PHOTOS }, (_, index) => photos[index] ?? null),
    [photos],
  );
  const nextEmptySlotIndex = slots.findIndex((slot) => slot === null);
  const isAtCapacity = nextEmptySlotIndex === -1;

  const openPicker = (slotIndex) => {
    inputRefs.current[slotIndex]?.click();
  };

  const updatePhotos = (updater) => {
    setPhotos((currentPhotos) => {
      const nextPhotos = normalizePhotos(
        typeof updater === "function" ? updater(currentPhotos) : updater,
      );
      const result = persistPhotos(nextPhotos);

      if (result.ok) {
        setStorageWarning("");
      } else {
        setStorageWarning(result.message);
      }

      return nextPhotos;
    });
  };

  const handleFileChange = async (slotIndex, event) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    setErrorMessage("");

    try {
      const nextPhoto = await processImageFile(file);

      updatePhotos((currentPhotos) => {
        const boundedPhotos = currentPhotos.slice(0, MAX_PHOTOS);

        if (slotIndex < boundedPhotos.length) {
          const updatedPhotos = [...boundedPhotos];
          updatedPhotos[slotIndex] = nextPhoto;
          return updatedPhotos;
        }

        if (boundedPhotos.length >= MAX_PHOTOS) {
          return boundedPhotos;
        }

        return [...boundedPhotos, nextPhoto];
      });
    } catch (error) {
      setErrorMessage(
        error instanceof Error && error.message
          ? error.message
          : "The selected image could not be processed.",
      );
    }
  };

  const handleRemove = (slotIndex) => {
    setErrorMessage("");

    updatePhotos((currentPhotos) => currentPhotos.filter((_, index) => index !== slotIndex));
  };

  return (
    <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
      <div className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
          Preparedness Profile
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-stone-900">Home Photos</h2>
        <p className="mt-3 text-sm leading-6 text-stone-600">
          Upload up to 4 reference photos of your home. These can help you keep a visual record of
          your property before or after damage.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {slots.map((photo, slotIndex) => {
          const hasPhoto = Boolean(photo);
          const label = hasPhoto ? "Replace photo" : "Upload photo";

          return (
            <div key={slotIndex} className="relative">
              <input
                ref={(node) => {
                  inputRefs.current[slotIndex] = node;
                }}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => handleFileChange(slotIndex, event)}
                aria-label={label}
              />

              <button
                type="button"
                onClick={() => openPicker(slotIndex)}
                aria-label={label}
                className="group relative aspect-square w-full overflow-hidden rounded-3xl border border-stone-200 bg-stone-50 transition-colors hover:border-emerald-300 hover:bg-emerald-50/40 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
              >
                {hasPhoto ? (
                  <img
                    src={photo.dataUrl}
                    alt={photo.fileName || "Uploaded home photo"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-5xl font-light leading-none text-stone-400 transition-colors group-hover:text-emerald-600">
                    +
                  </span>
                )}

                {hasPhoto ? (
                  <span className="absolute inset-x-3 bottom-3 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-stone-700 backdrop-blur">
                    Replace photo
                  </span>
                ) : null}
              </button>

              {hasPhoto ? (
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    handleRemove(slotIndex);
                  }}
                  aria-label="Remove photo"
                  className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full border border-stone-200 bg-white text-sm font-semibold text-stone-700 shadow-sm transition-colors hover:border-stone-300 hover:bg-stone-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  ×
                </button>
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="mt-5 flex flex-col gap-3">
        {!isAtCapacity ? (
          <button
            type="button"
            onClick={() => openPicker(nextEmptySlotIndex)}
            className="inline-flex w-fit items-center justify-center rounded-full bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          >
            Add photo
          </button>
        ) : (
          <p className="text-sm text-stone-600">
            You can store up to 4 home photos in this MVP.
          </p>
        )}

        {errorMessage ? (
          <p className="text-sm text-rose-700">
            {errorMessage}
          </p>
        ) : null}

        {storageWarning ? (
          <p className="text-sm text-amber-700">
            {storageWarning}
          </p>
        ) : null}
      </div>
    </section>
  );
}
