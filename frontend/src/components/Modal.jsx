import React, { useEffect } from "react";

export function Modal({ title, children, open=true, onClose }) {
  // Lock scroll when open
  useEffect(() => {
    if (!open) return;

    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Escape key support
  useEffect(() => {
    if (!open) return;

    const handleKey = (e) => {
      if (e.key === "Escape") {
        onClose?.();
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;
  console.log("Modal mounted");

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">
            {title}
          </h3>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition text-xl leading-none"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        <div className="text-gray-300 text-sm leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  );
}
