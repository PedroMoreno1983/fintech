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
  height = 32,
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
        : height - ((v - min) / (max - min)) * (height - 4) - 2;
    return [x, y] as const;
  });

  // Calculate smooth cubic Bezier curve points
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i];
    const p1 = pts[i + 1];
    
    // Control points positioned along the x-axis for organic flow
    const cp1x = p0[0] + (p1[0] - p0[0]) / 3;
    const cp1y = p0[1];
    const cp2x = p0[0] + (2 * (p1[0] - p0[0])) / 3;
    const cp2y = p1[1];
    
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1[0]} ${p1[1]}`;
  }

  const dFill = `${d} L ${w} ${height} L 0 ${height} Z`;
  const gradId = `spark-grad-${Math.floor(Math.random() * 100000)}`;

  return (
    <svg
      viewBox={`0 0 ${w} ${height}`}
      preserveAspectRatio="none"
      style={{ width: "100%", height }}
      className={className}
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.22" />
          <stop offset="100%" stopColor={color} stopOpacity="0.00" />
        </linearGradient>
      </defs>
      {fill && <path d={dFill} fill={`url(#${gradId})`} />}
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
