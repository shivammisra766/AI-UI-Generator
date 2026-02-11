import React from 'react';
export function Chart({ chartType, type }) {
  const finalType = chartType || type;

  return (
    <div>
      Mock {finalType} Chart
    </div>
  );
}
