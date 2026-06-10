const LOCAL_AUTH_USERS_KEY = "canopyLocalAuthUsers";
const LOCAL_AUTH_SESSION_KEY = "canopyLocalAuthSession";
const LOCAL_AUTH_EVENT = "canopy-local-auth-change";

function safeParseJson(rawValue, fallback) {
  if (typeof rawValue !== "string" || rawValue.trim() === "") {
    return fallback;
  }

  try {
    return JSON.parse(rawValue);
  } catch {
    return fallback;
  }
}

function canUseLocalStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

function normalizeEmail(email) {
  return String(email ?? "").trim().toLowerCase();
}

function createLocalUserId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `local-user-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function readUsers() {
  if (!canUseLocalStorage()) {
    return [];
  }

  const users = safeParseJson(window.localStorage.getItem(LOCAL_AUTH_USERS_KEY), []);
  return Array.isArray(users) ? users : [];
}

function writeUsers(users) {
  if (!canUseLocalStorage()) {
    return;
  }

  window.localStorage.setItem(LOCAL_AUTH_USERS_KEY, JSON.stringify(users));
}

function writeSession(session) {
  if (!canUseLocalStorage()) {
    return;
  }

  if (!session) {
    window.localStorage.removeItem(LOCAL_AUTH_SESSION_KEY);
  } else {
    window.localStorage.setItem(LOCAL_AUTH_SESSION_KEY, JSON.stringify(session));
  }

  window.dispatchEvent(new Event(LOCAL_AUTH_EVENT));
}

function toPublicUser(user) {
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    createdAt: user.createdAt,
  };
}

export function getLocalAuthSession() {
  if (!canUseLocalStorage()) {
    return null;
  }

  const session = safeParseJson(window.localStorage.getItem(LOCAL_AUTH_SESSION_KEY), null);
  if (!session?.user?.id) {
    return null;
  }

  return session;
}

export function subscribeToLocalAuth(callback) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handleAuthChange = () => callback(getLocalAuthSession());
  const handleStorage = (event) => {
    if (event.key === LOCAL_AUTH_SESSION_KEY || event.key === LOCAL_AUTH_USERS_KEY) {
      handleAuthChange();
    }
  };

  window.addEventListener(LOCAL_AUTH_EVENT, handleAuthChange);
  window.addEventListener("storage", handleStorage);

  return () => {
    window.removeEventListener(LOCAL_AUTH_EVENT, handleAuthChange);
    window.removeEventListener("storage", handleStorage);
  };
}

export function createLocalAccount({ firstName, lastName, email, password }) {
  const normalizedEmail = normalizeEmail(email);

  if (!firstName?.trim() || !lastName?.trim() || !normalizedEmail || !password) {
    return {
      ok: false,
      message: "Enter your first name, last name, email, and password.",
    };
  }

  const users = readUsers();
  const existingUser = users.find((user) => user.email === normalizedEmail);

  if (existingUser) {
    return {
      ok: false,
      message: "An account with this email already exists on this browser.",
    };
  }

  const now = new Date().toISOString();
  const nextUser = {
    id: createLocalUserId(),
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    email: normalizedEmail,
    password,
    createdAt: now,
  };
  const session = {
    user: toPublicUser(nextUser),
    createdAt: now,
  };

  writeUsers([...users, nextUser]);
  writeSession(session);

  return {
    ok: true,
    session,
  };
}

export function signInLocalAccount({ email, password }) {
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail || !password) {
    return {
      ok: false,
      message: "Enter your email and password.",
    };
  }

  const user = readUsers().find((storedUser) => storedUser.email === normalizedEmail);

  if (!user || user.password !== password) {
    return {
      ok: false,
      message: "Email or password does not match a local account on this browser.",
    };
  }

  const session = {
    user: toPublicUser(user),
    createdAt: new Date().toISOString(),
  };

  writeSession(session);

  return {
    ok: true,
    session,
  };
}

export function signOutLocalAccount() {
  writeSession(null);
}
