import React from "react";

function SimpleChart({ data = [], valueKey = "weight", labelKey = "date", height = 180 }) {
  const values = data.map((item) => Number(item[valueKey] || 0));
  const min = Math.min(...values, 0);
  const max = Math.max(...values, 1);
  const points = data.map((item, index) => {
    const x = data.length === 1 ? 50 : (index / (data.length - 1)) * 100;
    const y = 100 - ((Number(item[valueKey] || 0) - min) / Math.max(1, max - min)) * 80 - 10;
    return `${x},${y}`;
  }).join(" ");

  return (
    <div className="op-chart" style={{ height }}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" role="img">
        <polyline points={points} fill="none" stroke="#FF8C00" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        {data.map((item, index) => {
          const value = Number(item[valueKey] || 0);
          const x = data.length === 1 ? 50 : (index / (data.length - 1)) * 100;
          const y = 100 - ((value - min) / Math.max(1, max - min)) * 80 - 10;
          return <circle key={`${item[labelKey]}-${index}`} cx={x} cy={y} r="2.5" fill="#FF5F00" />;
        })}
      </svg>
      <div className="op-chart-labels">
        {data.slice(0, 6).map((item, index) => <span key={index}>{String(item[labelKey]).slice(0, 10)}</span>)}
      </div>
    </div>
  );
}

export default SimpleChart;
