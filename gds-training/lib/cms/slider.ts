import { ref, get, push, update, remove } from "firebase/database";
import { getFirebaseDatabase } from "../firebase";

export type HeroSlide = {
  id: string;
  title: string;
  subtitle: string;
  bgImageUrl: string;
  ctaText: string;
  ctaLink: string;
  badgeText?: string;
  displayOrder?: number;
};

const NODE_PATH = "cms/heroSlider";

export const getHeroSlides = async (): Promise<HeroSlide[]> => {
  const db = getFirebaseDatabase();
  if (!db) return getFallbackSlides();

  try {
    const snapshot = await get(ref(db, NODE_PATH));
    const data = snapshot.val();

    if (!data) return getFallbackSlides();

    return Object.entries(data)
      .map(([key, value]) => ({
        id: key,
        ...(value as any)
      }))
      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  } catch (error) {
    console.error("Error fetching hero slides:", error);
    return getFallbackSlides();
  }
};

export const createHeroSlide = async (data: Omit<HeroSlide, "id">): Promise<string> => {
  const db = getFirebaseDatabase();
  if (!db) throw new Error("Database not initialized");

  const newRef = push(ref(db, NODE_PATH));
  await update(newRef, data);
  return newRef.key || "";
};

export const updateHeroSlide = async (id: string, data: Partial<HeroSlide>): Promise<void> => {
  const db = getFirebaseDatabase();
  if (!db) throw new Error("Database not initialized");

  const { id: _, ...updateData } = data;
  await update(ref(db, `${NODE_PATH}/${id}`), updateData);
};

export const deleteHeroSlide = async (id: string): Promise<void> => {
  const db = getFirebaseDatabase();
  if (!db) throw new Error("Database not initialized");

  await remove(ref(db, `${NODE_PATH}/${id}`));
};

function getFallbackSlides(): HeroSlide[] {
  return [
    {
      id: "slide-1",
      title: "Master Amadeus & Sabre GDS Systems in Dhaka",
      subtitle: "Join Bangladesh's premier Aviation & Air Ticketing Academy. Get hands-on live GDS software access with 100% job placement support.",
      bgImageUrl: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1600&q=80",
      ctaText: "Explore Training Courses",
      ctaLink: "/courses",
      badgeText: "Admission Open • Batch 2026",
      displayOrder: 1
    },
    {
      id: "slide-2",
      title: "Certified Air Ticketing & Reservation Masterclass",
      subtitle: "Learn PNR creation, fare build, ticket reissue, and refund automation directly from airline industry professionals.",
      bgImageUrl: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1600&q=80",
      ctaText: "Book Free Demo Class",
      ctaLink: "/contact",
      badgeText: "IATA Standard Syllabus",
      displayOrder: 2
    }
  ];
}
