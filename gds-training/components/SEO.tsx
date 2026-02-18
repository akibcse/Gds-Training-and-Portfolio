type SEOProps = {
  id: string;
  data: Record<string, unknown>;
};

export default function SEO({ id, data }: SEOProps) {
  return (
    <script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
