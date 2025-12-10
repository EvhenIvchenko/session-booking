interface IconProps {
  name: 'clock' | 'arrow-left' | 'arrow-right';
  className?: string;
  width?: number;
  height?: number;
  fill?: string;
}

/**
 * Reusable icon component using SVG sprite
 * Icons are loaded from /public/icons-sprite.svg
 */
export function Icon({
  name, className, width, height, fill,
}: IconProps) {
  return (
    <svg
      className={className}
      width={width}
      height={height}
      fill={fill || 'currentColor'}
      aria-hidden="true"
    >
      <use href={`/icons-sprite.svg#icon-${name}`} />
    </svg>
  );
}
