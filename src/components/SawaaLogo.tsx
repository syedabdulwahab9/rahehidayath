import sawaaLogo from "@/assets/sawaa-enterprise-logo.png";

/**
 * Sawaa Enterprise — refined circular brand mark.
 * A single slow gilded ring, a quiet inner rule and a soft glow. Everything is
 * contained inside the element bounds so it never overflows its container.
 */
export function SawaaLogo({
  size = "size-28",
  className = "",
}: {
  size?: string;
  className?: string;
}) {
  return (
    <span
      className={`sawaa-mark relative grid ${size} place-items-center overflow-hidden rounded-full ${className}`}
    >
      <span aria-hidden className="sawaa-mark-aura" />
      <span aria-hidden className="sawaa-mark-ring" />
      <span aria-hidden className="sawaa-mark-dash" />

      <span className="sawaa-mark-core relative z-10 grid size-[80%] place-items-center overflow-hidden rounded-full bg-background">
        <img
          src={sawaaLogo}
          alt="Sawaa Enterprise logo"
          className="size-full rounded-full object-cover"
          loading="lazy"
        />
      </span>
    </span>
  );
}
