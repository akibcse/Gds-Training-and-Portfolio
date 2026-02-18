import { isAdminAuthenticated } from "./admin";

type FirebaseLookupUser = {
  email?: string;
};

const FIREBASE_API_KEY =
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBRBK0TnBJ7ga3H7-DOYUHmQqZXbLJ5LiY";
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "roadyakib@gmail.com").toLowerCase();

const getBearerToken = (request: Request): string | null => {
  const authHeader = request.headers.get("authorization") || "";
  if (!authHeader.toLowerCase().startsWith("bearer ")) {
    return null;
  }

  return authHeader.slice(7).trim() || null;
};

export const verifyFirebaseAdminRequest = async (request: Request): Promise<boolean> => {
  // 1. Check Legacy Session (Cookie)
  if (await isAdminAuthenticated()) {
    return true;
  }

  // 2. Check Firebase Token (Bearer)
  const idToken = getBearerToken(request);
  if (!idToken) {
    return false;
  }

  try {
    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${FIREBASE_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken })
      }
    );

    if (!response.ok) {
      return false;
    }

    const payload = (await response.json()) as { users?: FirebaseLookupUser[] };
    const user = payload.users?.[0];
    if (!user?.email) {
      return false;
    }

    return user.email.toLowerCase() === ADMIN_EMAIL;
  } catch {
    return false;
  }
};
