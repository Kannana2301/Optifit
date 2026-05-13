import React from "react";

function LoadingState() {
  return (
    <div className="op-loading">
      <div className="spinner-border text-success" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );
}

export default LoadingState;
