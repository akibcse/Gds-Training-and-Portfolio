import { cookies } from "next/headers";
import { createHash } from "crypto";
import { readJsonFile, writeJsonFile } from "@/lib/storage";

export const ADMIN_COOKIE = "akib_admin_session";
export const ADMIN_EMAIL = "roadyakib@gmail.com";
export const ADMIN_PASSWORD = "Akib@12345";

export const isAdminEmail = (email: string) => email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase();
export const isAdminPassword = (password: string) => password === ADMIN_PASSWORD;
export const isAdminCredentials = (email: string, password: string) =>
  isAdminEmail(email) && isAdminPassword(password);

type AdminConfig = {
  email: string;
  passwordHash: string;
};

const hashValue = (input: string) => createHash("sha256").update(input).digest("hex");

const getAdminConfig = async (): Promise<AdminConfig> => {
  const data = await readJsonFile<AdminConfig>("admin.json");
  return data;
};

export const verifyAdminCredentials = async (email: string, password: string) => {
  if (isAdminCredentials(email, password)) {
    return true;
  }

  try {
    const config = await getAdminConfig();
    const emailMatch = config.email?.trim().toLowerCase() === email.trim().toLowerCase();
    const passwordMatch = config.passwordHash === hashValue(password);
    return emailMatch && passwordMatch;
  } catch {
    return isAdminCredentials(email, password);
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
