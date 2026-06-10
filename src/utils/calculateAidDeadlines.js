const MS_PER_DAY = 24 * 60 * 60 * 1000;

function parseDateInput(value) {
  if (!value) {
    return null;
  }

  if (typeof value === "string") {
    const isoDateMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);

    if (isoDateMatch) {
      const year = Number(isoDateMatch[1]);
      const month = Number(isoDateMatch[2]) - 1;
      const day = Number(isoDateMatch[3]);
      const localDate = new Date(year, month, day);

      if (
        localDate.getFullYear() !== year ||
        localDate.getMonth() !== month ||
        localDate.getDate() !== day
      ) {
        return null;
      }

      return localDate;
    }
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  return parsedDate;
}

function normalizeToMidnight(date) {
  const normalizedDate = new Date(date);
  normalizedDate.setHours(0, 0, 0, 0);
  return normalizedDate;
}

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function calculateAidDeadline(disasterDate, applicationWindowDays) {
  if (!disasterDate || applicationWindowDays == null) {
    return null;
  }

  const parsedDisasterDate = parseDateInput(disasterDate);
  if (!parsedDisasterDate) {
    return null;
  }

  const windowDays = Number(applicationWindowDays);
  if (!Number.isFinite(windowDays)) {
    return null;
  }

  const deadlineDate = new Date(parsedDisasterDate);
  deadlineDate.setDate(deadlineDate.getDate() + windowDays);

  if (Number.isNaN(deadlineDate.getTime())) {
    return null;
  }

  return formatDate(deadlineDate);
}

export function getDaysUntilDeadline(deadlineDate) {
  if (!deadlineDate) {
    return null;
  }

  const parsedDeadlineDate = parseDateInput(deadlineDate);
  if (!parsedDeadlineDate) {
    return null;
  }

  const today = normalizeToMidnight(new Date());
  const deadline = normalizeToMidnight(parsedDeadlineDate);
  const diffInMs = deadline.getTime() - today.getTime();

  return Math.round(diffInMs / MS_PER_DAY);
}
