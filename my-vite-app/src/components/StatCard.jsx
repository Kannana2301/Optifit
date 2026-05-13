import React from "react";

function StatCard({ label, value, detail, tone = "gold" }) {
  return (
    <div className={`op-card op-stat op-tone-${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      {detail && <small>{detail}</small>}
    </div>
  );
}

export default StatCard;
