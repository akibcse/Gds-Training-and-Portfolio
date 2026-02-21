import { cookies } from "next/headers";
import { readJsonObject, writeJsonFile } from "@/lib/storage";

export const ADMIN_COOKIE = "akib_admin_session";
export const DEFAULT_ADMIN_EMAIL = "roadyakib@gmail.com";

type AdminConfig = {
  email: string;
};

const getAdminConfig = async (): Promise<AdminConfig> => {
  const data = await readJsonObject<AdminConfig>("admin.json");
  if (!data || !data.email) {
    return { email: DEFAULT_ADMIN_EMAIL };
  }
  return { email: data.email };
};

export const isAdminEmail = async (email: string) => {
  const config = await getAdminConfig();
  return email.trim().toLowerCase() === (config.email || DEFAULT_ADMIN_EMAIL).toLowerCase();
};

export const getAdminEmail = async (): Promise<string> => {
  const config = await getAdminConfig();
  return config.email || DEFAULT_ADMIN_EMAIL;
};

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
