type SparkProps = {
  data: number[];
  color?: string;
  height?: number;
  fill?: boolean;
  className?: string;
};

export function Spark({
  data,
  color = "var(--color-primary)",
  height = 28,
  fill = true,
  className,
}: SparkProps) {
  if (data.length < 2) {
    return <div style={{ height }} className={className} />;
  }
  const max = Math.max(...data);
  const min = Math.min(...data);
  const w = 100;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y =
      max === min
        ? height / 2
        : height - ((v - min) / (max - min)) * (height - 2) - 1;
    return [x, y] as const;
  });
  const d = pts
    .map((p, i) => (i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`))
    .join(" ");
  const dFill = `${d} L${w},${height} L0,${height} Z`;
  return (
    <svg
      viewBox={`0 0 ${w} ${height}`}
      preserveAspectRatio="none"
      style={{ width: "100%", height }}
      className={className}
    >
      {fill && <path d={dFill} fill={color} opacity="0.10" />}
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
