export function generateStaticParams() {
  return [
    { id: "g-football-mystery" },
    { id: "g-space-pictures" },
    { id: "g-word-battle" },
    { id: "g-minecraft-adventure" },
    { id: "g-vocab-match" },
    { id: "g-sentence-builder" },
    { id: "g-listening-quiz" },
  ];
}

export default function ActivityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
