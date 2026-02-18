import { cookies } from "next/headers";
import { createHash } from "crypto";
import { readJsonObject, writeJsonFile } from "@/lib/storage";

export const ADMIN_COOKIE = "akib_admin_session";
export const DEFAULT_ADMIN_EMAIL = "roadyakib@gmail.com";
export const DEFAULT_ADMIN_PASSWORD = "Akib@12345";

type AdminConfig = {
  email: string;
  passwordHash: string;
};

const hashValue = (input: string) => createHash("sha256").update(input).digest("hex");

const getAdminConfig = async (): Promise<AdminConfig> => {
  const data = await readJsonObject<AdminConfig>("admin.json");
  if (!data || !data.email) {
    return { email: DEFAULT_ADMIN_EMAIL, passwordHash: hashValue(DEFAULT_ADMIN_PASSWORD) };
  }
  return data;
};

export const isAdminEmail = async (email: string) => {
  const config = await getAdminConfig();
  return email.trim().toLowerCase() === (config.email || DEFAULT_ADMIN_EMAIL).toLowerCase();
};

export const isAdminPassword = async (password: string) => {
  const config = await getAdminConfig();
  return config.passwordHash === hashValue(password);
};

export const isAdminCredentials = async (email: string, password: string) =>
  (await isAdminEmail(email)) && (await isAdminPassword(password));

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
  try {
    return await isAdminCredentials(email, password);
  } catch {
    return false;
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
