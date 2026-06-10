// MVP deadline estimates only; users should verify official program deadlines.

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function parseDate(value) {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : new Date(value.getTime());
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

function addDays(date, days) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return null;
  }

  const nextDate = new Date(date.getTime());
  nextDate.setDate(nextDate.getDate() + Number(days));

  return Number.isNaN(nextDate.getTime()) ? null : nextDate;
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

function getDaysRemaining(deadlineDate) {
  const parsedDeadlineDate = parseDate(deadlineDate);

  if (!parsedDeadlineDate) {
    return null;
  }

  const today = normalizeToMidnight(new Date());
  const deadline = normalizeToMidnight(parsedDeadlineDate);
  const diffInMs = deadline.getTime() - today.getTime();

  return Math.round(diffInMs / MS_PER_DAY);
}

function getBaseDateForProgram(program = {}, answers = {}) {
  const deadlineBasis = program?.deadlineBasis || "disasterDate";

  if (deadlineBasis === "none") {
    return {
      baseDate: null,
      deadlineBasis,
      note: "This program does not use a fixed application deadline.",
    };
  }

  if (deadlineBasis === "declarationDate") {
    const baseDate = parseDate(answers.declarationDate);

    if (!baseDate) {
      return {
        baseDate: null,
        deadlineBasis,
        note: "Declaration date needed to estimate this deadline.",
      };
    }

    return { baseDate, deadlineBasis, note: "" };
  }

  const baseDate = parseDate(answers.disasterDate);

  if (!baseDate) {
    return {
      baseDate: null,
      deadlineBasis,
      note: "Disaster date needed to estimate this deadline.",
    };
  }

  return { baseDate, deadlineBasis, note: "" };
}

function getProgramName(program = {}) {
  return program?.name || program?.title || "Aid Program";
}

function getProgramId(program = {}) {
  return program?.id || "";
}

function getDeadlineStatus(daysRemaining) {
  if (typeof daysRemaining !== "number" || Number.isNaN(daysRemaining)) {
    return "unknown";
  }

  if (daysRemaining < 0) {
    return "overdue";
  }

  if (daysRemaining <= 7) {
    return "urgent";
  }

  if (daysRemaining <= 30) {
    return "soon";
  }

  return "open";
}

function buildDeadlineItem(program = {}, answers = {}) {
  const windowDays = Number(
    program?.applicationWindowDays ?? program?.windowDays ?? program?.deadlineDays,
  );
  const { baseDate, deadlineBasis, note } = getBaseDateForProgram(program, answers);
  const hasFixedDeadline = deadlineBasis !== "none";

  if (deadlineBasis === "none") {
    return {
      programId: getProgramId(program),
      programName: getProgramName(program),
      deadline: null,
      daysRemaining: null,
      status: "none",
      deadlineBasis,
      baseDate: null,
      note,
      hasFixedDeadline: false,
      applicationWindowDays: Number.isFinite(windowDays) ? windowDays : null,
    };
  }

  if (!baseDate) {
    return {
      programId: getProgramId(program),
      programName: getProgramName(program),
      deadline: null,
      daysRemaining: null,
      status: "needs-date",
      deadlineBasis,
      baseDate: null,
      note,
      hasFixedDeadline,
      applicationWindowDays: Number.isFinite(windowDays) ? windowDays : null,
    };
  }

  if (!Number.isFinite(windowDays)) {
    return {
      programId: getProgramId(program),
      programName: getProgramName(program),
      deadline: null,
      daysRemaining: null,
      status: "unknown",
      deadlineBasis,
      baseDate: formatDate(baseDate),
      note: "Application window is not specified.",
      hasFixedDeadline,
      applicationWindowDays: null,
    };
  }

  const deadlineDate = addDays(baseDate, windowDays);

  if (!deadlineDate) {
    return {
      programId: getProgramId(program),
      programName: getProgramName(program),
      deadline: null,
      daysRemaining: null,
      status: "unknown",
      deadlineBasis,
      baseDate: formatDate(baseDate),
      note: "Unable to calculate deadline.",
      hasFixedDeadline,
      applicationWindowDays: windowDays,
    };
  }

  const deadline = formatDate(deadlineDate);
  const daysRemaining = getDaysRemaining(deadline);

  return {
    programId: getProgramId(program),
    programName: getProgramName(program),
    deadline,
    daysRemaining,
    status: getDeadlineStatus(daysRemaining),
    deadlineBasis,
    baseDate: formatDate(baseDate),
    note,
    hasFixedDeadline,
    applicationWindowDays: windowDays,
  };
}

export function calculateAidDeadline(disasterDate, applicationWindowDays, programOrAnswers) {
  if (
    disasterDate &&
    typeof disasterDate === "object" &&
    !Array.isArray(disasterDate) &&
    applicationWindowDays &&
    typeof applicationWindowDays === "object" &&
    !Array.isArray(applicationWindowDays)
  ) {
    const [deadlineItem] = calculateAidDeadlines([disasterDate], applicationWindowDays);
    return deadlineItem?.deadline ?? null;
  }

  if (programOrAnswers && typeof programOrAnswers === "object" && !Array.isArray(programOrAnswers)) {
    const windowDays = Number(applicationWindowDays);

    if (!disasterDate || !Number.isFinite(windowDays)) {
      return null;
    }

    const parsedDisasterDate = parseDate(disasterDate);
    if (!parsedDisasterDate) {
      return null;
    }

    const deadlineDate = addDays(parsedDisasterDate, windowDays);
    return deadlineDate ? formatDate(deadlineDate) : null;
  }

  if (!disasterDate || applicationWindowDays == null) {
    return null;
  }

  const parsedDisasterDate = parseDate(disasterDate);
  if (!parsedDisasterDate) {
    return null;
  }

  const windowDays = Number(applicationWindowDays);
  if (!Number.isFinite(windowDays)) {
    return null;
  }

  const deadlineDate = addDays(parsedDisasterDate, windowDays);
  return deadlineDate ? formatDate(deadlineDate) : null;
}

export function getDaysUntilDeadline(deadlineDate) {
  return getDaysRemaining(deadlineDate);
}

export function calculateAidDeadlines(programs, answers = {}) {
  if (!Array.isArray(programs)) {
    return [];
  }

  return programs.map((program) => buildDeadlineItem(program, answers));
}
