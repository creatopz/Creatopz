import { AvatarConfig, DEFAULT_AVATAR, MoodExpression } from "@/lib/types";

/**
 * Renders a retro pixel-art avatar from a small config object, entirely in
 * inline SVG (crisp at any size, no image uploads needed). 16x16 grid.
 */
export default function PixelAvatar({
  config = DEFAULT_AVATAR,
  mood,
  size = 48,
  className = "",
  title,
}: {
  config?: AvatarConfig;
  mood?: MoodExpression;
  size?: number;
  className?: string;
  title?: string;
}) {
  const { skin, hair, hairStyle, eyes, eyebrows, mouth, faceShape, accessory } = config;

  const faceRect =
    faceShape === "square"
      ? { x: 3, y: 3, w: 10, h: 10 }
      : faceShape === "long"
      ? { x: 4, y: 2, w: 8, h: 12 }
      : { x: 3, y: 3, w: 10, h: 9 };

  return (
    <svg
      viewBox="0 0 16 16"
      width={size}
      height={size}
      shapeRendering="crispEdges"
      className={className}
      role="img"
      aria-label={title ?? "Pixel avatar"}
    >
      <rect x={0} y={0} width={16} height={16} fill="transparent" />
      {/* face */}
      <rect x={faceRect.x} y={faceRect.y} width={faceRect.w} height={faceRect.h} fill={skin} />

      {/* hair */}
      {hairStyle === "short" && <rect x={faceRect.x - 1} y={faceRect.y - 1} width={faceRect.w + 2} height={2} fill={hair} />}
      {hairStyle === "buzz" && <rect x={faceRect.x} y={faceRect.y - 1} width={faceRect.w} height={1} fill={hair} />}
      {hairStyle === "spiky" && (
        <>
          <rect x={faceRect.x - 1} y={faceRect.y - 2} width={2} height={2} fill={hair} />
          <rect x={faceRect.x + 3} y={faceRect.y - 3} width={2} height={3} fill={hair} />
          <rect x={faceRect.x + 7} y={faceRect.y - 3} width={2} height={3} fill={hair} />
          <rect x={faceRect.x + faceRect.w - 1} y={faceRect.y - 2} width={2} height={2} fill={hair} />
        </>
      )}
      {hairStyle === "long" && (
        <>
          <rect x={faceRect.x - 1} y={faceRect.y - 1} width={faceRect.w + 2} height={2} fill={hair} />
          <rect x={faceRect.x - 1} y={faceRect.y + 1} width={2} height={faceRect.h - 1} fill={hair} />
          <rect x={faceRect.x + faceRect.w - 1} y={faceRect.y + 1} width={2} height={faceRect.h - 1} fill={hair} />
        </>
      )}

      {/* eyebrows */}
      {eyebrows === "flat" && (
        <>
          <rect x={faceRect.x + 1} y={faceRect.y + 2} width={2} height={1} fill="#111" />
          <rect x={faceRect.x + faceRect.w - 3} y={faceRect.y + 2} width={2} height={1} fill="#111" />
        </>
      )}
      {eyebrows === "worried" && (
        <>
          <rect x={faceRect.x + 1} y={faceRect.y + 1} width={2} height={1} fill="#111" />
          <rect x={faceRect.x + faceRect.w - 3} y={faceRect.y + 2} width={2} height={1} fill="#111" />
        </>
      )}
      {eyebrows === "raised" && (
        <>
          <rect x={faceRect.x + 1} y={faceRect.y + 1} width={2} height={1} fill="#111" />
          <rect x={faceRect.x + faceRect.w - 3} y={faceRect.y + 1} width={2} height={1} fill="#111" />
        </>
      )}

      {/* eyes */}
      {eyes === "dot" && (
        <>
          <rect x={faceRect.x + 1} y={faceRect.y + 4} width={1} height={1} fill="#111" />
          <rect x={faceRect.x + faceRect.w - 2} y={faceRect.y + 4} width={1} height={1} fill="#111" />
        </>
      )}
      {eyes === "wide" && (
        <>
          <rect x={faceRect.x + 1} y={faceRect.y + 3} width={2} height={2} fill="#111" />
          <rect x={faceRect.x + faceRect.w - 3} y={faceRect.y + 3} width={2} height={2} fill="#111" />
        </>
      )}
      {eyes === "sleepy" && (
        <>
          <rect x={faceRect.x + 1} y={faceRect.y + 4} width={2} height={1} fill="#111" />
          <rect x={faceRect.x + faceRect.w - 3} y={faceRect.y + 4} width={2} height={1} fill="#111" />
        </>
      )}
      {eyes === "wink" && (
        <>
          <rect x={faceRect.x + 1} y={faceRect.y + 4} width={2} height={1} fill="#111" />
          <rect x={faceRect.x + faceRect.w - 3} y={faceRect.y + 3} width={2} height={2} fill="#111" />
        </>
      )}
      {eyes === "closed" && (
        <>
          <rect x={faceRect.x + 1} y={faceRect.y + 4} width={2} height={1} fill="#111" />
          <rect x={faceRect.x + faceRect.w - 3} y={faceRect.y + 4} width={2} height={1} fill="#111" />
        </>
      )}

      {/* mouth */}
      {mouth === "line" && <rect x={faceRect.x + 3} y={faceRect.y + faceRect.h - 3} width={faceRect.w - 6} height={1} fill="#111" />}
      {mouth === "smile" && (
        <>
          <rect x={faceRect.x + 2} y={faceRect.y + faceRect.h - 4} width={faceRect.w - 4} height={1} fill="#111" />
          <rect x={faceRect.x + 3} y={faceRect.y + faceRect.h - 3} width={faceRect.w - 6} height={1} fill="#111" />
        </>
      )}
      {mouth === "frown" && (
        <rect x={faceRect.x + 3} y={faceRect.y + faceRect.h - 4} width={faceRect.w - 6} height={1} fill="#111" />
      )}
      {mouth === "open" && (
        <rect x={faceRect.x + 4} y={faceRect.y + faceRect.h - 4} width={faceRect.w - 8} height={2} fill="#111" />
      )}
      {mouth === "wobble" && (
        <>
          <rect x={faceRect.x + 3} y={faceRect.y + faceRect.h - 3} width={2} height={1} fill="#111" />
          <rect x={faceRect.x + faceRect.w - 5} y={faceRect.y + faceRect.h - 4} width={2} height={1} fill="#111" />
        </>
      )}

      {accessory === "blush" && (
        <>
          <rect x={faceRect.x} y={faceRect.y + faceRect.h - 4} width={1} height={1} fill="#FF3B30" opacity={0.5} />
          <rect x={faceRect.x + faceRect.w - 1} y={faceRect.y + faceRect.h - 4} width={1} height={1} fill="#FF3B30" opacity={0.5} />
        </>
      )}
      {accessory === "glasses" && (
        <rect x={faceRect.x} y={faceRect.y + 3} width={faceRect.w} height={2} fill="none" stroke="#111" strokeWidth={0.4} />
      )}
      {accessory === "freckles" && (
        <>
          <rect x={faceRect.x + 1} y={faceRect.y + 5} width={0.5} height={0.5} fill="#8B5A2B" />
          <rect x={faceRect.x + faceRect.w - 2} y={faceRect.y + 5} width={0.5} height={0.5} fill="#8B5A2B" />
        </>
      )}

    </svg>
  );
}
