import { SEED_TEACHERS } from "@/lib/marketplace/seed";

export function generateStaticParams() {
  return SEED_TEACHERS.map((t) => ({ id: t.id }));
}

export default function TeacherIdLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
