import React, { useState } from "react";

export function Modal({ title, children }) {
  const [open, setOpen] = useState(true);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
      onClick={() => setOpen(false)} // click outside closes
    >
      <div
        className="bg-white p-6 rounded-md shadow-lg min-w-[300px]"
        onClick={(e) => e.stopPropagation()} // prevent inside click closing
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-lg">{title}</h3>
          <button
            onClick={() => setOpen(false)}
            className="text-sm px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
          >
            Close
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}
