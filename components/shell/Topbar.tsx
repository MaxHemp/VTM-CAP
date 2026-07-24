export function Topbar({
  bereich,
  titel,
  aktionen,
}: {
  bereich: string;
  titel: string;
  aktionen?: React.ReactNode;
}) {
  return (
    <header
      style={{
        flex: "none",
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "18px 28px",
        background: "var(--c-white)",
        borderBottom: "1px solid var(--border-soft)",
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="kicker">{bereich}</div>
        <h1
          style={{
            margin: "3px 0 0",
            fontFamily: "var(--font-display)",
            fontSize: "1.4rem",
            fontWeight: 800,
            letterSpacing: "-0.035em",
          }}
        >
          {titel}
        </h1>
      </div>
      {aktionen}
    </header>
  );
}
