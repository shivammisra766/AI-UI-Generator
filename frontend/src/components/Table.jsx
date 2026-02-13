import React from "react";
import { renderNode } from "../renderer/renderNode";

export function Table({ columns, data }) {
  // ---- Normalize Inputs ----
  const safeColumns = Array.isArray(columns) ? columns : [];
  const safeData = Array.isArray(data) ? data : [];

  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-gray-800 bg-gray-900 shadow-lg">
      <table className="w-full text-sm text-left text-gray-300">
        {/* ================= HEADER ================= */}
        <thead className="bg-gray-800 text-gray-400 uppercase text-xs tracking-wider">
          <tr>
            {safeColumns.map((col, index) => {
              const key =
                typeof col === "object" && col?.id
                  ? `col-${col.id}`
                  : `col-${index}`;

              return (
                <th
                  key={key}
                  className="px-6 py-4 font-semibold"
                >
                  {renderSafeCell(col)}
                </th>
              );
            })}
          </tr>
        </thead>

        {/* ================= BODY ================= */}
        <tbody className="divide-y divide-gray-800">
          {safeData.map((row, rowIndex) => {
            const cells = normalizeRow(row);

            return (
              <tr
                key={`row-${rowIndex}`}
                className="hover:bg-gray-800/60 transition duration-150"
              >
                {cells.map((cell, cellIndex) => (
                  <td
                    key={`cell-${rowIndex}-${cellIndex}`}
                    className="px-6 py-4"
                  >
                    {renderSafeCell(cell)}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ================= UTILITIES ================= */

function normalizeRow(row) {
  if (Array.isArray(row)) return row;
  if (row && typeof row === "object")
    return Object.values(row);
  return [];
}

function renderSafeCell(value) {
  if (value == null) return null;

  // Node object
  if (
    typeof value === "object" &&
    value.type &&
    value.id
  ) {
    try {
      return renderNode(value);
    } catch (err) {
      console.error("Render error:", err);
      return <span className="text-red-400">Invalid Node</span>;
    }
  }

  // Primitive
  if (
    typeof value === "string" ||
    typeof value === "number"
  ) {
    return value;
  }

  // Fallback
  return (
    <span className="text-gray-500">
      Unsupported
    </span>
  );
}
