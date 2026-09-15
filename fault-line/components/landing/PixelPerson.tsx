export default function PixelPerson({ wobble = 0 }: { wobble?: number }) {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 8 8"
      shapeRendering="crispEdges"
      style={{ transform: `rotate(${wobble}deg)`, transformOrigin: "bottom center" }}
    >
      <rect x="3" y="0" width="2" height="2" fill="#111" />
      <rect x="2" y="2" width="4" height="3" fill="#111" />
      <rect x="1" y="5" width="2" height="2" fill="#111" />
      <rect x="5" y="5" width="2" height="2" fill="#111" />
    </svg>
  );
}
