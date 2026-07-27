"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Image as ImageIcon, X } from "lucide-react";
import type { GalleryItem } from "@/lib/cms/gallery";

type Props = {
  initialItems?: GalleryItem[];
};

export default function Gallery({ initialItems }: Props) {
  const [items, setItems] = useState<GalleryItem[]>(initialItems || []);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryItem | null>(null);

  useEffect(() => {
    if (!initialItems || initialItems.length === 0) {
      fetch("/api/admin/gallery")
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setItems(data);
          }
        })
        .catch(() => {});
    }
  }, [initialItems]);

  const categories = ["All", ...Array.from(new Set(items.map((i) => i.category || "Classroom")))];

  const filteredItems = activeCategory === "All" ? items : items.filter((i) => i.category === activeCategory);

  return (
    <section className="py-16 md:py-24 bg-slate-50 border-t border-slate-200/60">
      <div className="mx-auto max-w-6xl px-5 md:px-10">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-extrabold text-blue-700 uppercase tracking-wider">
            <ImageIcon className="h-3.5 w-3.5" /> Photo Gallery
          </span>
          <h2 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
            Life at GDS Training Center
          </h2>
          <p className="mt-2 text-sm md:text-base text-slate-600">
            Explore our state-of-the-art computer labs, hands-on workshops, and student graduation ceremonies in Dhaka.
          </p>

          {/* Category Tabs */}
          <div className="mt-8 flex flex-wrap justify-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`rounded-full px-4 py-2 text-xs font-bold transition-all ${activeCategory === cat ? "bg-aviation-600 text-white shadow-md shadow-aviation-600/20" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Gallery Grid */}
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <AnimatePresence>
            {filteredItems.map((item) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                key={item.id}
                onClick={() => setSelectedPhoto(item)}
                className="group relative rounded-2xl overflow-hidden bg-white shadow-sm border border-slate-200 cursor-pointer hover:shadow-xl transition-all duration-300"
              >
                <div className="aspect-[4/3] w-full overflow-hidden bg-slate-100 relative">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                    <span className="text-xs font-bold text-white bg-blue-600/90 backdrop-blur-md px-2.5 py-1 rounded-md">
                      View Photo
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">{item.category}</span>
                  <h3 className="text-sm font-bold text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                    {item.title}
                  </h3>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Lightbox Modal */}
        <AnimatePresence>
          {selectedPhoto && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-slate-950/85 backdrop-blur-md"
                onClick={() => setSelectedPhoto(null)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative z-10 max-w-3xl w-full bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl"
              >
                <button
                  onClick={() => setSelectedPhoto(null)}
                  className="absolute top-4 right-4 z-20 h-10 w-10 rounded-full bg-slate-950/60 text-white flex items-center justify-center hover:bg-slate-950 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
                <div className="max-h-[70vh] bg-black flex items-center justify-center">
                  <img src={selectedPhoto.imageUrl} alt={selectedPhoto.title} className="max-h-[70vh] w-auto object-contain" />
                </div>
                <div className="p-6 text-white bg-slate-900">
                  <span className="text-xs font-bold text-blue-400 uppercase">{selectedPhoto.category}</span>
                  <h3 className="text-xl font-bold mt-1">{selectedPhoto.title}</h3>
                  {selectedPhoto.caption && <p className="text-sm text-slate-400 mt-2">{selectedPhoto.caption}</p>}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
