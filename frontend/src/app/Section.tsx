// Section.tsx

export default function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-8">
      <h2 className="text-2xl font-semibold mb-4 text-green-700">{title}</h2>
      {children}
    </section>
  );
}
