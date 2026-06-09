export function getRiskLevel(value = 0) {
  const numericValue = Number(value) || 0;

  if (numericValue >= 75) return "High";
  if (numericValue >= 45) return "Medium";
  return "Low";
}