export type Expression =
  | "composed"
  | "anxious"
  | "awkward"
  | "crying"
  | "angry"
  | "confused"
  | "silly"
  | "blank";

const EYES: Record<Expression, { l: string; r: string }> = {
  composed: { l: "M3 4h2v2H3z", r: "M7 4h2v2H7z" },
  anxious: { l: "M3 3h2v3H3z", r: "M7 3h2v3H7z" },
  awkward: { l: "M3 5h2v1H3z", r: "M7 4h2v2H7z" },
  crying: { l: "M3 4h2v2H3z", r: "M7 4h2v2H7z" },
  angry: { l: "M3 4l2 1v1H3z", r: "M9 4l-2 1v1h2z" },
  confused: { l: "M3 4h2v2H3z", r: "M7 5h2v1H7z" },
  silly: { l: "M2.5 4.5l3 1-3 1z", r: "M9.5 4.5l-3 1 3 1z" },
  blank: { l: "M3 4.7h2v0.6H3z", r: "M7 4.7h2v0.6H7z" },
};

const MOUTHS: Record<Expression, string> = {
  composed: "M3 8h6v1H3z",
  anxious: "M4 8.5c1-1 3-1 4 0",
  awkward: "M3.5 8h3v1h-3z",
  crying: "M3.5 9c1-1.4 3.5-1.4 4.5 0",
  angry: "M3.5 9c1.2 1 3.8 1 5 0",
  confused: "M3.5 8.3l3 .2 2.5-.5",
  silly: "M3 8c1.5 2 4.5 2 6 0",
  blank: "M3.5 8.6h5v.4h-5z",
};

export function PixelFace({
  expression,
  bg,
  size = 64,
}: {
  expression: Expression;
  bg: string;
  size?: number;
}) {
  const eyes = EYES[expression];
  const mouth = MOUTHS[expression];

  return (
    <svg
      viewBox="0 0 12 12"
      width={size}
      height={size}
      shapeRendering="crispEdges"
      className="pixelated"
      style={{ transition: "opacity 0.25s ease" }}
      role="img"
      aria-label={`pixel face, ${expression}`}
    >
      <rect width="12" height="12" fill={bg} />
      <path d={eyes.l} fill="#111111" />
      <path d={eyes.r} fill="#111111" />
      <path d={mouth} stroke="#111111" strokeWidth="0.7" fill="none" />
      {expression === "crying" && (
        <>
          <rect x="3.3" y="6.2" width="0.8" height="2" fill="#245CFF" />
          <rect x="7.1" y="6.6" width="0.8" height="1.6" fill="#245CFF" />
        </>
      )}
      {expression === "angry" && <rect x="4.5" y="2.4" width="3" height="0.6" fill="#FF3B30" />}
      {expression === "silly" && <rect x="5.2" y="1.4" width="1.6" height="1.2" fill="#C7FF00" />}
    </svg>
  );
}
