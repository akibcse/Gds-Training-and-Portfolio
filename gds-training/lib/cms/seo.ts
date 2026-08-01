import { ref, get, update } from "firebase/database";
import { getFirebaseDatabase } from "../firebase";

export type GlobalSeo = {
    siteUrl: string;
    siteName: string;
    defaultTitle: string;
    titleTemplate: string;
    defaultDescription: string;
    defaultKeywords: string[];
    defaultOgImage: string;
    twitterHandle: string;
    googleVerification: string;
    bingVerification: string;
};

export type PageSeo = {
    slug: string;
    title: string;
    description: string;
    keywords: string[];
    ogImage: string;
    jsonLd: string;
};

const GLOBAL_PATH = "cms/seo/global";
const PAGES_PATH = "cms/seo/pages";

export const DEFAULT_GLOBAL_SEO: GlobalSeo = {
    siteUrl: "https://akibhasan.online",
    siteName: "Md. Akib Hasan",
    defaultTitle: "Get personalized GDS training from Md. Akib Hasan",
    titleTemplate: "%s | Md. Akib Hasan",
    defaultDescription: "Professional GDS Training and Air Ticketing courses in Bangladesh.",
    defaultKeywords: ["GDS", "Training", "Aviation", "Air Ticketing", "Amadeus", "Sabre", "Travelport"],
    defaultOgImage: "https://akibhasan.online/api/og?title=Md.+Akib+Hasan",
    twitterHandle: "@akibhasan",
    googleVerification: "wyMy_PJ7kZvizW2GTPUZN9NSmNTaDjsbdjcJ3C3hrlY",
    bingVerification: ""
};

export const getGlobalSeo = async (): Promise<GlobalSeo> => {
    const db = getFirebaseDatabase();
    if (!db) return DEFAULT_GLOBAL_SEO;

    try {
        const snapshot = await get(ref(db, GLOBAL_PATH));
        const val = snapshot.val();
        if (!val) return DEFAULT_GLOBAL_SEO;
        return { ...DEFAULT_GLOBAL_SEO, ...val };
    } catch (error) {
        console.error("Error fetching global SEO:", error);
        return DEFAULT_GLOBAL_SEO;
    }
};

export const updateGlobalSeo = async (data: Partial<GlobalSeo>): Promise<void> => {
    const db = getFirebaseDatabase();
    if (!db) throw new Error("Database not initialized");

    await update(ref(db, GLOBAL_PATH), data);
};

export const getPageSeo = async (slug: string): Promise<PageSeo | null> => {
    const db = getFirebaseDatabase();
    if (!db) return null;

    try {
        const snapshot = await get(ref(db, `${PAGES_PATH}/${slug === "" ? "home" : slug.replace(/\//g, "_")}`));
        return snapshot.val() as PageSeo;
    } catch (error) {
        console.error(`Error fetching SEO for ${slug}:`, error);
        return null;
    }
};

export const updatePageSeo = async (slug: string, data: Partial<PageSeo>): Promise<void> => {
    const db = getFirebaseDatabase();
    if (!db) throw new Error("Database not initialized");

    const pageKey = slug === "" ? "home" : slug.replace(/\//g, "_");
    await update(ref(db, `${PAGES_PATH}/${pageKey}`), { ...data, slug });
};
