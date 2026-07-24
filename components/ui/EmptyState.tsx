export function EmptyState({
  titel,
  beschreibung,
  aktionen,
}: {
  titel: string;
  beschreibung: string;
  aktionen?: React.ReactNode;
}) {
  return (
    <div style={{ flex: 1, display: "grid", placeItems: "center", padding: 40 }}>
      <div
        style={{
          display: "grid",
          justifyItems: "center",
          gap: 12,
          maxWidth: 470,
          textAlign: "center",
          padding: "46px 42px",
          background: "var(--c-paper)",
          border: "1px dashed var(--border-medium)",
          borderRadius: 6,
        }}
      >
        <svg
          width="30"
          height="30"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--c-neutral-500)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M4 7h16M4 12h16M4 17h10"></path>
        </svg>
        <strong
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "1.05rem",
            letterSpacing: "-0.02em",
            color: "var(--text-primary)",
          }}
        >
          {titel}
        </strong>
        <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "0.88rem", lineHeight: 1.6 }}>
          {beschreibung}
        </p>
        {aktionen ? <div style={{ display: "flex", gap: 10, marginTop: 4 }}>{aktionen}</div> : null}
      </div>
    </div>
  );
}
