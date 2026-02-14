import Link from "next/link";
import { getProfile } from "@/lib/getData";

export default async function Footer() {
  const profile = await getProfile();

  return (
    <footer className="mt-16 border-t border-aviation-100 bg-gradient-to-br from-indigo-50 to-blue-100">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 md:grid-cols-3 md:px-6">
        <div>
          <h3 className="text-lg font-semibold text-ink">{profile.name}</h3>
          <p className="mt-2 text-sm text-ink/80">
            Certified GDS Instructor portfolio for Air Ticketing Course in Bangladesh, practical GDS Training in Dhaka, Sabre, Galileo, and airline reservation mentoring.
          </p>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-ink">Quick Links</h3>
          <ul className="mt-2 space-y-2 text-sm text-ink/80">
            <li>
              <Link href="/about">About</Link>
            </li>
            <li>
              <Link href="/contact">Contact</Link>
            </li>
            <li>
              <Link href="/courses/air-ticketing-gds-masterclass">Air Ticketing Course</Link>
            </li>
            <li>
              <Link href="/admin/login">Admin</Link>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-ink">Lead Desk</h3>
          <p className="mt-2 text-sm text-ink/80">
            Email: <a className="underline" href={`mailto:${profile.email}`}>{profile.email}</a>
          </p>
          <p className="text-sm text-ink/80">
            Phone: {profile.phone}
          </p>
        </div>
      </div>
    </footer>
  );
}
