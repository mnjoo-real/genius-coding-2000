const LOW_COLOR = '#6d8f4a';
const MEDIUM_COLOR = '#f59e0b';
const HIGH_COLOR = '#ef4444';

const BAND_CLASSES = {
  low: {
    className: 'border-leaf/30 bg-moss/40',
    labelClassName: 'text-forest',
    valueClassName: 'text-forest',
    badgeClassName: 'border-leaf/30 bg-white/70 text-forest',
  },
  medium: {
    className: 'border-amber-200 bg-amber-50',
    labelClassName: 'text-amber-700',
    valueClassName: 'text-amber-700',
    badgeClassName: 'border-amber-200 bg-white/70 text-amber-700',
  },
  high: {
    className: 'border-red-200 bg-red-50',
    labelClassName: 'text-red-700',
    valueClassName: 'text-red-700',
    badgeClassName: 'border-red-200 bg-white/70 text-red-700',
  },
};

function clampNormalizedScore(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return 0;
  }

  if (number <= 1) {
    return Math.max(0, Math.min(1, number));
  }

  return Math.max(0, Math.min(1, number / 100));
}

function hexToRgb(hex) {
  const normalized = hex.replace('#', '');
  const expanded = normalized.length === 3
    ? normalized.split('').map((char) => char + char).join('')
    : normalized;

  const red = Number.parseInt(expanded.slice(0, 2), 16);
  const green = Number.parseInt(expanded.slice(2, 4), 16);
  const blue = Number.parseInt(expanded.slice(4, 6), 16);

  return { red, green, blue };
}

function rgbToHex(red, green, blue) {
  return [red, green, blue]
    .map((component) => Math.max(0, Math.min(255, Math.round(component))).toString(16).padStart(2, '0'))
    .join('');
}

function mixColors(startHex, endHex, ratio) {
  const start = hexToRgb(startHex);
  const end = hexToRgb(endHex);
  const t = Math.max(0, Math.min(1, ratio));

  return `#${rgbToHex(
    start.red + (end.red - start.red) * t,
    start.green + (end.green - start.green) * t,
    start.blue + (end.blue - start.blue) * t,
  )}`;
}

export function getRelativeRiskValue(regionalRisk, key) {
  if (!regionalRisk || typeof regionalRisk !== 'object') {
    return 0;
  }

  const relativeKey = `${key}Relative`;
  const relativeValue = regionalRisk[relativeKey];
  if (relativeValue != null && relativeValue !== '') {
    return clampNormalizedScore(relativeValue);
  }

  return clampNormalizedScore(regionalRisk[key]);
}

export function formatRiskScore(value, digits = 2) {
  return clampNormalizedScore(value).toFixed(digits);
}

export function getRiskBand(value) {
  const normalized = clampNormalizedScore(value);

  if (normalized < 0.34) {
    return 'low';
  }

  if (normalized < 0.67) {
    return 'medium';
  }

  return 'high';
}

export function getRiskColor(value) {
  const normalized = clampNormalizedScore(value);

  if (normalized <= 0.5) {
    return mixColors(LOW_COLOR, MEDIUM_COLOR, normalized / 0.5);
  }

  return mixColors(MEDIUM_COLOR, HIGH_COLOR, (normalized - 0.5) / 0.5);
}

export function getRiskBandClasses(value) {
  return BAND_CLASSES[getRiskBand(value)];
}

