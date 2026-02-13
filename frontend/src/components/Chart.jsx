import React from "react";

export function Chart({
  chartType,
  type,
  title,
  data,
  loading = false,
  className = ""
}) {
  const finalType =
    typeof chartType === "string"
      ? chartType
      : typeof type === "string"
      ? type
      : "Bar";

  const hasData = Array.isArray(data) && data.length > 0;

  return (
    <div
      className={`
        bg-gray-900
        border border-gray-800
        rounded-2xl
        p-6
        shadow-lg
        transition
        duration-200
        ${className}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">
          {title || `${finalType} Chart`}
        </h3>

        <span className="text-xs px-3 py-1 rounded-full bg-gray-800 text-gray-400">
          {loading ? "Loading..." : "Mock Data"}
        </span>
      </div>

      {/* Chart Area */}
      <div
        className="
          h-48
          rounded-xl
          flex
          items-center
          justify-center
          border border-gray-700
          bg-gray-800
        "
        role="img"
        aria-label={`${finalType} chart`}
      >
        {loading ? (
          <div className="animate-pulse text-gray-500 text-sm">
            Loading chart...
          </div>
        ) : !hasData ? (
          <div className="text-gray-500 text-sm">
            No data available
          </div>
        ) : (
          <div className="text-gray-400 text-sm">
            {finalType} Visualization Area
          </div>
        )}
      </div>
    </div>
  );
}
