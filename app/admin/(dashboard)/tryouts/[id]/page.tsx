import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { prisma } from "@/lib/db/prisma";
import { TryoutStatusControls } from "@/components/admin/tryout-status-controls";
import { positionLabel, academicLevelLabel, formatDateTimeLong } from "@/lib/utils/format";

export const metadata: Metadata = { title: "Applicant" };

export default async function AdminTryoutDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const application = await prisma.tryoutApplication.findUnique({ where: { id } });
  if (!application) notFound();

  const fields: { label: string; value: string | number | null }[] = [
    { label: "Student ID", value: application.studentId },
    { label: "Programme", value: application.programme },
    { label: "Level", value: academicLevelLabel(application.level) },
    { label: "Phone", value: application.phone },
    { label: "Email", value: application.email },
    { label: "Date of birth", value: application.dateOfBirth.toDateString() },
    { label: "Position", value: positionLabel(application.position) },
    { label: "Height (cm)", value: application.heightCm },
    { label: "Years played", value: application.yearsPlayed },
    { label: "Preferred jersey #", value: application.preferredJerseyNumber },
    { label: "Emergency contact", value: `${application.emergencyContactName} · ${application.emergencyContactPhone}` },
    { label: "Applied", value: formatDateTimeLong(application.createdAt) },
  ];

  return (
    <div className="max-w-3xl">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-4xl tracking-tight text-rail-white">{application.fullName}</h1>
        </div>
        {application.photoUrl && (
          <div className="relative h-24 w-24 border border-rail-line overflow-hidden shrink-0">
            <Image src={application.photoUrl} alt={application.fullName} fill sizes="96px" className="object-cover" />
          </div>
        )}
      </div>

      <TryoutStatusControls id={application.id} status={application.status} />

      <dl className="grid sm:grid-cols-2 gap-5 mt-8">
        {fields.map((f) => (
          <div key={f.label}>
            <dt className="text-xs uppercase tracking-wide text-rail-silver">{f.label}</dt>
            <dd className="mt-1 text-rail-white">{f.value ?? "—"}</dd>
          </div>
        ))}
      </dl>

      {application.previousExperience && (
        <div className="mt-8">
          <p className="text-xs uppercase tracking-wide text-rail-silver mb-1.5">Previous experience</p>
          <p className="text-rail-white whitespace-pre-line">{application.previousExperience}</p>
        </div>
      )}

      <div className="mt-8">
        <p className="text-xs uppercase tracking-wide text-rail-silver mb-1.5">Motivation</p>
        <p className="text-rail-white whitespace-pre-line">{application.motivation}</p>
      </div>
    </div>
  );
}
