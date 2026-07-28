import { ref, get, push, update, remove } from "firebase/database";
import { getFirebaseDatabase } from "../firebase";

export type GalleryItem = {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  caption?: string;
  createdAt?: string;
};

const NODE_PATH = "cms/gallery";

export const getGalleryItems = async (): Promise<GalleryItem[]> => {
  const db = getFirebaseDatabase();
  if (!db) return getFallbackGallery();

  try {
    const snapshot = await get(ref(db, NODE_PATH));
    const data = snapshot.val();

    if (!data) return getFallbackGallery();

    return Object.entries(data).map(([key, value]) => ({
      ...(value as any),
      id: key
    }));
  } catch (error) {
    console.error("Error fetching gallery items:", error);
    return getFallbackGallery();
  }
};

export const createGalleryItem = async (data: Omit<GalleryItem, "id">): Promise<string> => {
  const db = getFirebaseDatabase();
  if (!db) throw new Error("Database not initialized");

  const newItem = {
    ...data,
    createdAt: new Date().toISOString()
  };

  const newRef = push(ref(db, NODE_PATH));
  await update(newRef, newItem);
  return newRef.key || "";
};

export const updateGalleryItem = async (id: string, data: Partial<GalleryItem>): Promise<void> => {
  const db = getFirebaseDatabase();
  if (!db) throw new Error("Database not initialized");

  const { id: _, ...updateData } = data;
  await update(ref(db, `${NODE_PATH}/${id}`), updateData);
};

export const deleteGalleryItem = async (id: string): Promise<void> => {
  const db = getFirebaseDatabase();
  if (!db) throw new Error("Database not initialized");

  await remove(ref(db, `${NODE_PATH}/${id}`));
};

function getFallbackGallery(): GalleryItem[] {
  return [
    {
      id: "gal-1",
      title: "Interactive GDS Computer Lab Training",
      category: "Classroom",
      imageUrl: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80",
      caption: "Students practicing live PNR creation in our Dhaka computer lab."
    },
    {
      id: "gal-2",
      title: "Airline Industry Expert Workshop",
      category: "Workshops",
      imageUrl: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=800&q=80",
      caption: "Guest lecture by senior GDS automation managers."
    },
    {
      id: "gal-3",
      title: "Student Graduation & Certificate Distribution",
      category: "Certifications",
      imageUrl: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80",
      caption: "Successful graduates receiving their IATA standard certificates."
    },
    {
      id: "gal-4",
      title: "Hands-on Amadeus Booking Practice",
      category: "Classroom",
      imageUrl: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80",
      caption: "Realtime flight availability search and ticket reissue training."
    }
  ];
}
