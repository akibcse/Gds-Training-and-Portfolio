import { cookies } from "next/headers";
import { createHash } from "crypto";
import { readJsonFile, writeJsonFile } from "@/lib/storage";

export const ADMIN_COOKIE = "akib_admin_session";
export const DEFAULT_ADMIN_EMAIL = "roadyakib@gmail.com";
export const DEFAULT_ADMIN_PASSWORD = "Akib@12345";

export const isAdminEmail = async (email: string) => email.trim().toLowerCase() === (await getAdminEmail()).toLowerCase();
export const isAdminPassword = (password: string) => password === DEFAULT_ADMIN_PASSWORD;
export const isAdminCredentials = async (email: string, password: string) =>
  (await isAdminEmail(email)) && isAdminPassword(password);

type AdminConfig = {
  email: string;
  passwordHash: string;
};

const hashValue = (input: string) => createHash("sha256").update(input).digest("hex");

const getAdminConfig = async (): Promise<AdminConfig> => {
  const data = await readJsonFile<AdminConfig>("admin.json");
  if (!data || !data.email) {
    return { email: DEFAULT_ADMIN_EMAIL, passwordHash: hashValue(DEFAULT_ADMIN_PASSWORD) };
  }
  return data;
};

export const getAdminEmail = async (): Promise<string> => {
  const config = await getAdminConfig();
  return config.email || DEFAULT_ADMIN_EMAIL;
};

export const getAdminPassword = (): string => DEFAULT_ADMIN_PASSWORD;

export const changeAdminEmail = async (newEmail: string) => {
  try {
    const config = await getAdminConfig();
    await writeJsonFile("admin.json", {
      ...config,
      email: newEmail.trim().toLowerCase()
    });
    return true;
  } catch {
    return false;
  }
};

export const verifyAdminCredentials = async (email: string, password: string) => {
  if (await isAdminCredentials(email, password)) {
    return true;
  }

  try {
    const config = await getAdminConfig();
    const emailMatch = config.email?.trim().toLowerCase() === email.trim().toLowerCase();
    const passwordMatch = config.passwordHash === hashValue(password);
    return emailMatch && passwordMatch;
  } catch {
    return await isAdminCredentials(email, password);
  }
};

export const changeAdminPassword = async (currentPassword: string, nextPassword: string) => {
  try {
    const config = await getAdminConfig();
    const currentPasswordMatch = config.passwordHash === hashValue(currentPassword);

    if (!currentPasswordMatch) {
      return false;
    }

    await writeJsonFile("admin.json", {
      ...config,
      passwordHash: hashValue(nextPassword)
    });

    return true;
  } catch {
    return false;
  }
};

export const createAdminSession = async () => {
  const store = await cookies();
  store.set(ADMIN_COOKIE, "authorized", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12
  });
};

export const clearAdminSession = async () => {
  const store = await cookies();
  store.delete(ADMIN_COOKIE);
};

export const isAdminAuthenticated = async () => {
  const store = await cookies();
  return store.get(ADMIN_COOKIE)?.value === "authorized";
};
