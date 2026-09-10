const reset = {
  appearance: "none",
  minHeight: "0",
  height: "auto",
  lineHeight: "normal",
  boxShadow: "none",
  letterSpacing: "0",
  textTransform: "none" as const,
  fontFamily: "var(--font-body, Outfit, sans-serif)",
};

export const page = {
  web: {
    minHeight: "100dvh",
    width: "100%",
    overflow: "auto",
    background:
      "radial-gradient(1200px 600px at 12% -10%, rgba(245, 197, 24, 0.16), transparent 42%), radial-gradient(900px 500px at 100% 0%, rgba(214, 255, 74, 0.08), transparent 36%), linear-gradient(180deg, #0c1018 0%, #07080d 42%, #05060a 100%)",
    color: "#f6f3ea",
    fontFamily: "Outfit, sans-serif",
    fontSize: "16px",
    display: "flex",
    justifyContent: "center",
  },
};

export const shell = {
  web: {
    width: "100%",
    maxWidth: "42rem",
    margin: "0 auto",
    minHeight: "100dvh",
    padding: "1.15rem 1rem 2.4rem",
    boxSizing: "border-box",
    gap: "1.1rem",
  },
};

export const brand = {
  web: {
    fontFamily: "Bebas Neue, sans-serif",
    fontSize: "5.4rem",
    lineHeight: "0.78",
    letterSpacing: "0.08em",
    color: "#f5c518",
    margin: "0",
    textShadow: "0 0 40px rgba(245, 197, 24, 0.28)",
  },
};

export const kicker = {
  web: {
    fontFamily: "IBM Plex Mono, monospace",
    fontSize: "0.72rem",
    letterSpacing: "0.28em",
    textTransform: "uppercase",
    color: "#d6ff4a",
    margin: "0",
  },
};

export const lead = {
  web: {
    color: "rgba(246, 243, 234, 0.78)",
    fontSize: "1.12rem",
    lineHeight: "1.45",
    margin: "0",
    maxWidth: "28rem",
  },
};

export const panel = {
  web: {
    width: "100%",
    background: "linear-gradient(180deg, rgba(18, 18, 24, 0.92), rgba(10, 12, 18, 0.92))",
    border: "1px solid rgba(245, 197, 24, 0.16)",
    borderRadius: "22px",
    padding: "1.05rem",
    boxSizing: "border-box",
    gap: "0.8rem",
    boxShadow: "0 18px 50px rgba(0,0,0,0.35)",
  },
};

export const gameCard = {
  web: {
    width: "100%",
    background: "rgba(8, 10, 16, 0.72)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "20px",
    padding: "0.9rem 0.9rem 1rem",
    boxSizing: "border-box",
    gap: "0.7rem",
  },
};

export const primaryAction = {
  web: {
    ...reset,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f5c518",
    color: "#14110a",
    border: "0",
    fontWeight: "800",
    fontSize: "1.02rem",
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    borderRadius: "16px",
    padding: "0.85rem 1.1rem",
    cursor: "pointer",
    minHeight: "48px",
  },
};

export const lockAction = {
  web: {
    ...reset,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#d6ff4a",
    color: "#10140a",
    border: "0",
    fontWeight: "800",
    fontSize: "1.1rem",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    borderRadius: "16px",
    padding: "0.9rem 1.1rem",
    cursor: "pointer",
    minHeight: "52px",
  },
};

export const quietAction = {
  web: {
    ...reset,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    background: "transparent",
    color: "#f6f3ea",
    border: "1px solid rgba(246, 243, 234, 0.22)",
    fontWeight: "700",
    fontSize: "0.95rem",
    borderRadius: "16px",
    padding: "0.7rem 1rem",
    cursor: "pointer",
    minHeight: "46px",
  },
};

export const muted = {
  web: {
    color: "rgba(246, 243, 234, 0.62)",
    fontSize: "0.9rem",
    margin: "0",
    lineHeight: "1.4",
  },
};

export const pickCall = {
  web: {
    fontFamily: "Bebas Neue, sans-serif",
    fontSize: "1.85rem",
    letterSpacing: "0.06em",
    textAlign: "center",
    color: "#f5c518",
    margin: "0",
  },
};

export const timer = {
  web: {
    fontFamily: "IBM Plex Mono, monospace",
    fontSize: "1.55rem",
    letterSpacing: "0.12em",
    color: "#d6ff4a",
    margin: "0",
  },
};

export const logoMark = {
  web: {
    width: "56px",
    height: "56px",
    borderRadius: "18px",
    background: "#fff",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    boxShadow: "0 8px 18px rgba(0,0,0,0.28)",
  },
};

export const ticker = {
  web: {
    width: "100%",
    overflow: "hidden",
    gap: "0.45rem",
    flexWrap: "wrap",
    justifyContent: "center",
  },
};

export const navRow = {
  web: {
    width: "100%",
    justifyContent: "space-between",
    alignItems: "center",
  },
};

export const scorePill = {
  web: {
    fontFamily: "IBM Plex Mono, monospace",
    fontSize: "0.78rem",
    letterSpacing: "0.08em",
    padding: "0.28rem 0.55rem",
    borderRadius: "999px",
    background: "rgba(214, 255, 74, 0.12)",
    color: "#d6ff4a",
    margin: "0",
  },
};

export const win = {
  web: {
    boxShadow: "0 0 0 1px rgba(214, 255, 74, 0.55)",
  },
};

export const lose = {
  web: {
    opacity: "0.72",
  },
};
