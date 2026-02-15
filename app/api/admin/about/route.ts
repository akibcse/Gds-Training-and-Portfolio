import { NextResponse } from "next/server";
import {
  getPortfolioProfileRecord,
  getProfileRecord,
  setPortfolioProfileRecord,
  setProfileRecord,
  type PortfolioProfileRecord,
  type ProfileRecord
} from "@/lib/admin-data";
import { isAdminAuthenticated } from "@/lib/admin";

export const dynamic = 'force-dynamic';


export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [profile, portfolioProfile] = await Promise.all([getProfileRecord(), getPortfolioProfileRecord()]);
  return NextResponse.json({ profile, portfolioProfile });
}

const normalizeProfile = (input: ProfileRecord): ProfileRecord => ({
  name: input?.name?.trim() || "",
  tagline: input?.tagline?.trim() || "",
  headline: input?.headline?.trim() || "",
  description: input?.description?.trim() || "",
  phone: input?.phone?.trim() || "",
  email: input?.email?.trim() || "",
  whatsapp: input?.whatsapp?.trim() || "",
  address: {
    street: input?.address?.street?.trim() || "",
    city: input?.address?.city?.trim() || "",
    region: input?.address?.region?.trim() || "",
    postalCode: input?.address?.postalCode?.trim() || "",
    country: input?.address?.country?.trim() || ""
  },
  experienceYears: Number(input?.experienceYears) || 0,
  studentsTrained: Number(input?.studentsTrained) || 0,
  jobPlacementSupport: Boolean(input?.jobPlacementSupport)
});

const normalizePortfolioProfile = (input: PortfolioProfileRecord): PortfolioProfileRecord => ({
  fullName: input?.fullName?.trim() || "",
  profileImage: input?.profileImage?.trim() || "",
  location: input?.location?.trim() || "",
  phones: Array.isArray(input?.phones) ? input.phones.map((item) => item?.trim() || "").filter(Boolean) : [],
  email: input?.email?.trim() || "",
  careerObjective: input?.careerObjective?.trim() || "",
  careerSummary: Array.isArray(input?.careerSummary) ? input.careerSummary.map((item) => item?.trim() || "").filter(Boolean) : [],
  specialQualification: input?.specialQualification?.trim() || "",
  experience: Array.isArray(input?.experience)
    ? input.experience.map((item) => ({
      title: item?.title?.trim() || "",
      organization: item?.organization?.trim() || "",
      location: item?.location?.trim() || "",
      duration: item?.duration?.trim() || "",
      years: item?.years?.trim() || "",
      highlights: Array.isArray(item?.highlights) ? item.highlights.map((hl) => hl?.trim() || "").filter(Boolean) : []
    }))
    : [],
  education: Array.isArray(input?.education)
    ? input.education.map((item) => ({
      exam: item?.exam?.trim() || "",
      institute: item?.institute?.trim() || "",
      result: item?.result?.trim() || "",
      year: item?.year?.trim() || ""
    }))
    : [],
  trainings: Array.isArray(input?.trainings) ? input.trainings.map((item) => item?.trim() || "").filter(Boolean) : [],
  professionalQualification: input?.professionalQualification?.trim() || "",
  skills: Array.isArray(input?.skills) ? input.skills.map((item) => item?.trim() || "").filter(Boolean) : [],
  languages: Array.isArray(input?.languages)
    ? input.languages.map((item) => ({
      name: item?.name?.trim() || "",
      reading: item?.reading?.trim() || "",
      writing: item?.writing?.trim() || "",
      speaking: item?.speaking?.trim() || ""
    }))
    : []
});

export async function PUT(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    profile?: ProfileRecord;
    portfolioProfile?: PortfolioProfileRecord;
  };

  if (!body.profile || !body.portfolioProfile) {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const profile = normalizeProfile(body.profile);
  const portfolioProfile = normalizePortfolioProfile(body.portfolioProfile);

  if (!profile.name || !portfolioProfile.fullName) {
    return NextResponse.json({ error: "Name fields are required." }, { status: 400 });
  }

  await Promise.all([setProfileRecord(profile), setPortfolioProfileRecord(portfolioProfile)]);
  return NextResponse.json({ success: true });
}
