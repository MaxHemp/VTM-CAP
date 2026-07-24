export default function LadeZustand() {
  return (
    <div style={{ flex: 1, display: "grid", placeItems: "center", padding: 40 }}>
      <div style={{ display: "grid", justifyItems: "center", gap: 14 }}>
        <span
          aria-hidden="true"
          style={{
            width: 34,
            height: 34,
            borderRadius: "50%",
            border: "3px solid var(--c-neutral-200)",
            borderTopColor: "var(--c-blue-700)",
            animation: "vtm-spin 800ms linear infinite",
          }}
        />
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.64rem",
            fontWeight: 600,
            letterSpacing: "0.12em",
            color: "var(--text-muted)",
          }}
        >
          LÄDT …
        </span>
      </div>
    </div>
  );
}
