import { getSeoPages } from "@/lib/getData";

export const getSeoOverride = async (pageKey: string) => {
  const pages = await getSeoPages();
  return pages.find((item) => item.pageKey === pageKey) ?? null;
};
