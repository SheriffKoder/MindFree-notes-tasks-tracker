'use client';

export interface DonutChartProps {
  /** Progress value (0–100); clamped to range. */
  percentage: number;
  /** Progress arc + label color. Defaults to `currentColor`. */
  color?: string;
  /** Background track color. Defaults to the theme border. */
  trackColor?: string;
  /** Whether to render the numeric label in the center. Defaults to true. */
  showLabel?: boolean;
  /** Circle radius within the 80×80 viewBox. Defaults to 32. */
  radius?: number;
  className?: string;
}

function DonutChart({
  percentage,
  color = "currentColor",
  trackColor = "var(--color-border)",
  showLabel = true,
  radius = 32,
  className = "",
}: DonutChartProps) {
  const clamped = Math.min(100, Math.max(0, Number(percentage)));
  const circumference = 2 * Math.PI * radius;

  return (
    <div className={`relative flex h-full items-center justify-center ${className}`}>
      <svg className="h-full w-full -rotate-90" viewBox="0 0 80 80">
        <circle
          strokeWidth="8"
          stroke={trackColor}
          fill="transparent"
          r={radius}
          cx="40"
          cy="40"
        />
        <circle
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - clamped / 100)}
          strokeLinecap="round"
          stroke={color}
          fill="transparent"
          r={radius}
          cx="40"
          cy="40"
        />
      </svg>
      {showLabel ? (
        <span
          className="absolute inset-0 flex items-center justify-center text-xs font-medium sm:text-sm"
          style={{ color }}
        >
          {clamped.toFixed(0)}%
        </span>
      ) : null}
    </div>
  );
}

export default DonutChart;
