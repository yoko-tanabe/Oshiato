export default function MapPage() {
  return (
    <main
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100dvh",
        flexDirection: "column",
        gap: "16px",
      }}
    >
      <h1 style={{ fontFamily: "var(--font-display)", color: "var(--color-accent-primary)" }}>
        OSHIATO
      </h1>
      <p style={{ color: "var(--color-text-secondary)" }}>
        地図画面（Step 4 で実装予定）
      </p>
    </main>
  );
}
