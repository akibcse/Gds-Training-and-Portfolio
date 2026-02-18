type Props = {
  whatsapp: string;
};

export default function StickyEnrollBar({ whatsapp }: Props) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-aviation-100 bg-white/95 p-3 backdrop-blur md:hidden">
      <div className="mx-auto flex max-w-6xl gap-2">
        <a
          href="/#lead-form"
          className="flex-1 rounded-xl bg-gradient-to-r from-aviation-600 to-cyan-500 px-4 py-2 text-center text-sm font-semibold text-white"
        >
          Enroll Now
        </a>
        <a
          href={whatsapp}
          className="flex-1 rounded-xl border border-aviation-200 px-4 py-2 text-center text-sm font-semibold text-aviation-700"
        >
          WhatsApp
        </a>
      </div>
    </div>
  );
}
