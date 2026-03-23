type Props = {
  params: Promise<{ id: string }>;
};

export default async function SpotDetailPage({ params }: Props) {
  const { id } = await params;

  return (
    <main style={{ padding: "24px", color: "var(--color-text-primary)" }}>
      <h1>スポット詳細（Step 7 で実装予定）</h1>
      <p style={{ color: "var(--color-text-secondary)", marginTop: "8px" }}>
        スポットID: {id}
      </p>
    </main>
  );
}
