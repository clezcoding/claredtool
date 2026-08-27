type MaterialIconProps = {
  ligature: string;
  decorative?: boolean;
  label?: string;
  className?: string;
  fill?: number;
  wght?: number;
  grad?: number;
  opsz?: number;
};

export function MaterialIcon({
  ligature,
  decorative = true,
  label,
  className,
  fill = 0,
  wght = 400,
  grad = 0,
  opsz = 24,
}: MaterialIconProps) {
  const classes = className
    ? `material-symbols-outlined ${className}`
    : "material-symbols-outlined";

  return (
    <span
      className={classes}
      style={{
        fontVariationSettings: `'FILL' ${fill}, 'wght' ${wght}, 'GRAD' ${grad}, 'opsz' ${opsz}`,
      }}
      aria-hidden={decorative ? true : undefined}
      aria-label={decorative ? undefined : label}
    >
      <span aria-hidden="true">{ligature}</span>
    </span>
  );
}
