import type { AvatarConfig } from "@/types/database";
import type { Expression } from "@/lib/avatar";

const UNIT = 6;
const GRID_W = 16;
const GRID_H = 18;

type Rect = { x: number; y: number; w: number; h: number; fill: string };

// head bounding box depends on face shape
function headBox(faceShape: AvatarConfig["faceShape"]) {
  if (faceShape === "long") return { x: 5, y: 1, w: 6, h: 8 };
  return { x: 5, y: 2, w: 6, h: 6 }; // round + square share a box; round fakes curvature with corner cuts
}

function buildRects(config: AvatarConfig, expression: Expression): { base: Rect[]; corners: Rect[]; accent?: Rect[] } {
  const head = headBox(config.faceShape);
  const skin = config.skinTone;
  const base: Rect[] = [];
  const corners: Rect[] = [];

  // --- head ---
  base.push({ x: head.x, y: head.y, w: head.w, h: head.h, fill: skin });
  if (config.faceShape === "round") {
    corners.push(
      { x: head.x, y: head.y, w: 1, h: 1, fill: config.background },
      { x: head.x + head.w - 1, y: head.y, w: 1, h: 1, fill: config.background },
      { x: head.x, y: head.y + head.h - 1, w: 1, h: 1, fill: config.background },
      { x: head.x + head.w - 1, y: head.y + head.h - 1, w: 1, h: 1, fill: config.background }
    );
  }

  // --- neck + shoulders/clothing ---
  const neckY = head.y + head.h;
  base.push({ x: head.x + 2, y: neckY, w: 2, h: 1, fill: skin });

  const shoulderX = head.x - 2;
  const shoulderW = head.w + 4;
  const shoulderY = neckY + 1;
  const shoulderH = GRID_H - shoulderY;
  base.push({ x: shoulderX, y: shoulderY, w: shoulderW, h: shoulderH, fill: config.clothingColor });

  if (config.clothing === "collar") {
    base.push(
      { x: head.x + 1, y: shoulderY, w: 1, h: 2, fill: config.background },
      { x: head.x + head.w - 2, y: shoulderY, w: 1, h: 2, fill: config.background }
    );
  }
  if (config.clothing === "hoodie") {
    base.push({ x: head.x, y: shoulderY, w: head.w, h: 1, fill: config.clothingColor });
    base.push(
      { x: head.x + 2, y: shoulderY + 1, w: 0.6, h: 3, fill: config.background },
      { x: head.x + head.w - 2.6, y: shoulderY + 1, w: 0.6, h: 3, fill: config.background }
    );
  }
  if (config.clothing === "stripes") {
    for (let i = 0; i < shoulderH; i += 2) {
      base.push({ x: shoulderX, y: shoulderY + i, w: shoulderW, h: 1, fill: config.background });
    }
    base.push({ x: shoulderX, y: shoulderY, w: shoulderW, h: shoulderH, fill: "transparent" });
  }

  // --- hair ---
  const hairY = head.y - 1;
  if (config.hair === "buzz") {
    base.push({ x: head.x, y: hairY, w: head.w, h: 1, fill: config.hairColor });
  } else if (config.hair === "short") {
    base.push({ x: head.x, y: hairY, w: head.w, h: 1, fill: config.hairColor });
    base.push(
      { x: head.x - 1, y: head.y, w: 1, h: 2, fill: config.hairColor },
      { x: head.x + head.w, y: head.y, w: 1, h: 2, fill: config.hairColor }
    );
  } else if (config.hair === "long") {
    base.push({ x: head.x, y: hairY, w: head.w, h: 1, fill: config.hairColor });
    base.push(
      { x: head.x - 1, y: head.y, w: 1, h: head.h + 2, fill: config.hairColor },
      { x: head.x + head.w, y: head.y, w: 1, h: head.h + 2, fill: config.hairColor }
    );
  } else if (config.hair === "curly") {
    base.push({ x: head.x - 1, y: hairY, w: head.w + 2, h: 2, fill: config.hairColor });
    base.push(
      { x: head.x - 1, y: hairY - 1, w: 1, h: 1, fill: config.hairColor },
      { x: head.x + 1, y: hairY - 1, w: 1, h: 1, fill: config.hairColor },
      { x: head.x + head.w - 1, y: hairY - 1, w: 1, h: 1, fill: config.hairColor }
    );
  } else if (config.hair === "mohawk") {
    base.push({ x: head.x + head.w / 2 - 1, y: hairY - 2, w: 2, h: 3, fill: config.hairColor });
  }

  // --- eyes ---
  const eyeY = head.y + 2;
  const leftEyeX = head.x + 1;
  const rightEyeX = head.x + head.w - 2;
  const eyeW = config.eyes === "wide" ? 1.6 : 1;
  const eyeH = config.eyes === "sleepy" ? 0.5 : 1;
  const eyeYOffset = config.eyes === "sleepy" ? 0.5 : 0;
  base.push(
    { x: leftEyeX, y: eyeY + eyeYOffset, w: eyeW, h: eyeH, fill: "#111111" },
    { x: rightEyeX, y: eyeY + eyeYOffset, w: eyeW, h: eyeH, fill: "#111111" }
  );

  // --- eyebrows ---
  if (config.eyebrows !== "none") {
    const browY = config.eyebrows === "raised" ? eyeY - 1.2 : eyeY - 0.8;
    base.push(
      { x: leftEyeX - 0.2, y: browY, w: 1.4, h: 0.5, fill: config.hairColor },
      { x: rightEyeX - 0.2, y: browY, w: 1.4, h: 0.5, fill: config.hairColor }
    );
  }

  // --- accessories ---
  if (config.accessory === "glasses") {
    base.push(
      { x: leftEyeX - 0.4, y: eyeY - 0.3, w: 1.8, h: 1.6, fill: "none" as string },
      { x: rightEyeX - 0.4, y: eyeY - 0.3, w: 1.8, h: 1.6, fill: "none" as string }
    );
  }
  if (config.accessory === "cap") {
    base.push({ x: head.x - 1, y: hairY - 1, w: head.w + 2, h: 1.4, fill: config.clothingColor });
    base.push({ x: head.x - 1, y: hairY + 0.2, w: head.w / 2 + 1, h: 0.6, fill: config.clothingColor });
  }
  if (config.accessory === "earring") {
    base.push({ x: head.x + head.w - 0.6, y: head.y + head.h - 2, w: 0.5, h: 0.8, fill: "#C7FF00" });
  }

  // --- details ---
  if (config.detail === "freckles") {
    base.push(
      { x: leftEyeX + 0.2, y: eyeY + 1.4, w: 0.4, h: 0.4, fill: "#00000055" as string },
      { x: rightEyeX + 0.6, y: eyeY + 1.4, w: 0.4, h: 0.4, fill: "#00000055" as string }
    );
  }
  if (config.detail === "scar") {
    base.push({ x: rightEyeX + 0.4, y: eyeY - 0.6, w: 0.4, h: 2.2, fill: "#00000040" as string });
  }
  if (config.detail === "blush" || expression === "embarrassed") {
    base.push(
      { x: leftEyeX - 0.4, y: eyeY + 1.6, w: 1, h: 0.6, fill: "#FF3B3055" as string },
      { x: rightEyeX + 0.6, y: eyeY + 1.6, w: 1, h: 0.6, fill: "#FF3B3055" as string }
    );
  }

  return { base, corners };
}

function ExpressionOverlay({ config, expression }: { config: AvatarConfig; expression: Expression }) {
  const head = headBox(config.faceShape);
  const mouthX = head.x + 2;
  const mouthY = head.y + head.h - 2;

  switch (expression) {
    case "awkward_smile":
      return <path d={`M${(mouthX) * UNIT} ${mouthY * UNIT} q${1 * UNIT} ${1 * UNIT} ${2 * UNIT} 0`} stroke="#111" strokeWidth={1} fill="none" />;
    case "nervous":
      return (
        <>
          <path d={`M${mouthX * UNIT} ${mouthY * UNIT} l${0.8 * UNIT} 0 l${0.4 * UNIT} ${0.4 * UNIT} l${0.8 * UNIT} -${0.4 * UNIT}`} stroke="#111" strokeWidth={1} fill="none" />
          <rect x={(head.x + head.w) * UNIT} y={(head.y - 1) * UNIT} width={UNIT * 0.6} height={UNIT * 0.6} fill="#245CFF" opacity={0.7} />
        </>
      );
    case "crying_ok":
      return (
        <>
          <path d={`M${mouthX * UNIT} ${(mouthY + 0.3) * UNIT} q${1 * UNIT} ${0.6 * UNIT} ${2 * UNIT} 0`} stroke="#111" strokeWidth={1} fill="none" />
          <rect x={(head.x + 1) * UNIT} y={(head.y + 3.2) * UNIT} width={UNIT * 0.5} height={UNIT * 1.2} fill="#245CFF" />
          <rect x={(head.x + head.w - 1.5) * UNIT} y={(head.y + 3.4) * UNIT} width={UNIT * 0.5} height={UNIT} fill="#245CFF" />
        </>
      );
    case "dead_inside":
      return <rect x={mouthX * UNIT} y={mouthY * UNIT} width={2 * UNIT} height={UNIT * 0.35} fill="#111" />;
    case "angry":
      return (
        <>
          <path d={`M${mouthX * UNIT} ${(mouthY + 0.5) * UNIT} q${1 * UNIT} -${0.5 * UNIT} ${2 * UNIT} 0`} stroke="#111" strokeWidth={1} fill="none" />
          <rect x={(head.x + 1) * UNIT} y={(head.y + 1.2) * UNIT} width={(head.w - 2) * UNIT} height={UNIT * 0.4} fill="#FF3B30" />
        </>
      );
    case "confused":
      return (
        <>
          <path d={`M${mouthX * UNIT} ${mouthY * UNIT} l${1.2 * UNIT} ${0.3 * UNIT} l${0.8 * UNIT} -${0.3 * UNIT}`} stroke="#111" strokeWidth={1} fill="none" />
          <text x={(head.x + head.w + 0.4) * UNIT} y={(head.y) * UNIT} fontSize={UNIT * 1.2} fontFamily="monospace" fill="#245CFF">
            ?
          </text>
        </>
      );
    case "embarrassed":
      return <path d={`M${mouthX * UNIT} ${mouthY * UNIT} q${1 * UNIT} ${0.8 * UNIT} ${2 * UNIT} 0`} stroke="#111" strokeWidth={1} fill="none" />;
    case "pretending_fine":
      return (
        <>
          <rect x={mouthX * UNIT} y={mouthY * UNIT} width={2 * UNIT} height={UNIT * 0.35} fill="#111" />
          <path d={`M${(head.x - 0.5) * UNIT} ${(head.y + head.h + 0.5) * UNIT} l${(head.w + 1) * UNIT} 0`} stroke="#FF3B30" strokeWidth={0.6} opacity={0.5} />
        </>
      );
    case "neutral":
    default:
      return <rect x={mouthX * UNIT} y={mouthY * UNIT} width={2 * UNIT} height={UNIT * 0.35} fill="#111" />;
  }
}

export function AvatarRenderer({
  config,
  expression = "neutral",
  size = 96,
  className,
}: {
  config: AvatarConfig;
  expression?: Expression;
  size?: number;
  className?: string;
}) {
  const { base, corners } = buildRects(config, expression);

  return (
    <svg
      viewBox={`0 0 ${GRID_W * UNIT} ${GRID_H * UNIT}`}
      width={size}
      height={size}
      shapeRendering="crispEdges"
      className={`pixelated ${className ?? ""}`}
      role="img"
      aria-label="Your Fault Line pixel avatar"
    >
      <rect width={GRID_W * UNIT} height={GRID_H * UNIT} fill={config.background} />
      {base.map((r, i) =>
        r.fill === "none" ? (
          <rect key={i} x={r.x * UNIT} y={r.y * UNIT} width={r.w * UNIT} height={r.h * UNIT} fill="none" stroke="#111111" strokeWidth={0.8} />
        ) : (
          <rect key={i} x={r.x * UNIT} y={r.y * UNIT} width={r.w * UNIT} height={r.h * UNIT} fill={r.fill} />
        )
      )}
      {corners.map((r, i) => (
        <rect key={`c${i}`} x={r.x * UNIT} y={r.y * UNIT} width={r.w * UNIT} height={r.h * UNIT} fill={r.fill} />
      ))}
      <ExpressionOverlay config={config} expression={expression} />
      {/* brand signature: a tiny crack in the corner, always present */}
      <path d={`M${GRID_W * UNIT - 6} 2 l-2 4 l3 3`} stroke="#FF3B30" strokeWidth="1" fill="none" opacity="0.55" />
    </svg>
  );
}
