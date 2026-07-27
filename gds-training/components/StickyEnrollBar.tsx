import { Phone, MessageCircle, BookOpen } from "lucide-react";

type Props = {
  whatsapp: string;
  phone?: string;
};

export default function StickyEnrollBar({ whatsapp, phone }: Props) {
  const callHref = phone
    ? `tel:${phone.replace(/\s+/g, "")}`
    : `tel:+8801521438546`;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-aviation-100 bg-white/95 px-3 py-2.5 backdrop-blur md:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
      <div className="mx-auto flex max-w-6xl items-center gap-2">
        {/* Call Now */}
        <a
          href={callHref}
          aria-label="Call Now"
          className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition active:scale-95"
        >
          <Phone className="h-4 w-4 text-green-600" />
          <span>Call</span>
        </a>

        {/* WhatsApp */}
        <a
          href={whatsapp}
          target="_blank"
          rel="noreferrer"
          aria-label="WhatsApp"
          className="flex items-center justify-center gap-1.5 rounded-xl border border-green-200 bg-green-50 px-3 py-2.5 text-xs font-bold text-green-700 shadow-sm transition active:scale-95"
        >
          <MessageCircle className="h-4 w-4" />
          <span>WhatsApp</span>
        </a>

        {/* Enroll Now — primary CTA */}
        <a
          href="/#lead-form"
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-cta-500 to-cta-600 py-2.5 text-xs font-bold text-white shadow-md transition active:scale-95"
        >
          <BookOpen className="h-4 w-4" />
          Enroll Now
        </a>
      </div>
    </div>
  );
}
