const SCORE_BANDS = {
  low: {
    color: 'var(--color-red-500)',
    className: 'bg-red-500',
    textClassName: 'text-red-500',
  },
  medium: {
    color: 'var(--color-amber-400)',
    className: 'bg-amber-400',
    textClassName: 'text-amber-500',
  },
  high: {
    color: 'var(--color-leaf)',
    className: 'bg-leaf',
    textClassName: 'text-leaf',
  },
};

export function clampScore(score, maxScore = 100) {
  const numericScore = Number(score);
  const numericMaxScore = Number(maxScore);

  if (!Number.isFinite(numericScore) || !Number.isFinite(numericMaxScore) || numericMaxScore <= 0) {
    return 0;
  }

  return Math.max(0, Math.min(100, (numericScore / numericMaxScore) * 100));
}

export function getScoreBand(score, maxScore = 100) {
  const normalized = clampScore(score, maxScore);

  if (normalized >= 66) return 'high';
  if (normalized >= 41) return 'medium';
  return 'low';
}

export function getScoreBandStyles(score, maxScore = 100) {
  return SCORE_BANDS[getScoreBand(score, maxScore)];
}
