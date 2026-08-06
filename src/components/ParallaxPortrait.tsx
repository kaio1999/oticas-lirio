import Image from "next/image";

type Props = {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
};

/** Retrato estático — sem listeners (evita reflow forçado no Lighthouse). */
export function ParallaxPortrait({
  src,
  alt,
  className = "",
  priority = false,
}: Props) {
  return (
    <div className={`parallax-portrait ${className}`}>
      <div className="parallax-portrait__frame" style={{ transform: "none" }}>
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          quality={80}
          className="parallax-portrait__img"
          sizes="(max-width: 768px) 92vw, (max-width: 1200px) 46vw, 560px"
        />
      </div>
    </div>
  );
}
