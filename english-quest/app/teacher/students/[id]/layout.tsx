export function generateStaticParams() {
  return [{ id: "alex" }, { id: "emma" }, { id: "noah" }];
}

export default function StudentProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
