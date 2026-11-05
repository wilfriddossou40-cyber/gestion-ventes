import { useId } from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
} from "recharts";

function StatCard({
  icon: Icon,
  label,
  loading,
  sparkline,
  trend,
  trendLabel,
  value,
  valueLabel,
  variant,
}) {
  const gradientId = useId().replaceAll(":", "");
  const hasTrend = trend !== null && trend !== undefined && Number.isFinite(Number(trend));
  const TrendIcon = Number(trend) < 0 ? ArrowDownRight : ArrowUpRight;

  return (
    <article className={`dashboard-stat-card${variant ? ` is-${variant}` : ""}`}>
      {loading ? (
        <div className="dashboard-stat-skeleton" aria-label={label} />
      ) : (
        <>
          <div className="dashboard-stat-top">
            <span className="dashboard-stat-label">{label}</span>
            <span className="dashboard-stat-icon"><Icon size={19} aria-hidden="true" /></span>
          </div>
          <div className="dashboard-stat-value-row">
            <strong aria-label={valueLabel}>{value}</strong>
            {sparkline?.length > 1 && (
              <div className="dashboard-sparkline" aria-hidden="true">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={sparkline}>
                    <defs>
                      <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="var(--chart-2)" stopOpacity={0.25} />
                        <stop offset="100%" stopColor="var(--chart-2)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area
                      dataKey="total"
                      fill={`url(#${gradientId})`}
                      isAnimationActive={false}
                      stroke="var(--chart-2)"
                      strokeWidth={2}
                      type="monotone"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
          {hasTrend && (
            <span className={`dashboard-stat-trend${Number(trend) < 0 ? " is-negative" : ""}`}>
              <TrendIcon size={14} aria-hidden="true" />
              {trendLabel}
            </span>
          )}
        </>
      )}
    </article>
  );
}

export default StatCard;
