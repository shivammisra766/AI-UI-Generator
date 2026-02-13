import React from "react";

export function Card({
  title,
  children,
  footer,
  onClick,
  className = "",
  variant = "default"
}) {
  const variants = {
    default:
      "bg-white border border-gray-200 shadow-md hover:shadow-xl",
    dark:
      "bg-gray-900 border border-gray-800 shadow-lg hover:shadow-2xl",
    outline:
      "bg-transparent border border-gray-300 shadow-none",
  };

  const isClickable = typeof onClick === "function";

  return (
    <div
      onClick={onClick}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      className={`
        rounded-2xl
        p-6
        transition
        duration-200
        ${variants[variant] || variants.default}
        ${isClickable ? "cursor-pointer active:scale-[0.98]" : ""}
        ${className}
      `}
    >
      {title && (
        <div className="mb-4">
          <h3
            className={`text-lg font-semibold ${
              variant === "dark"
                ? "text-white"
                : "text-gray-800"
            }`}
          >
            {title}
          </h3>
        </div>
      )}

      <div
        className={`text-sm leading-relaxed ${
          variant === "dark"
            ? "text-gray-300"
            : "text-gray-600"
        }`}
      >
        {children}
      </div>

      {footer && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          {footer}
        </div>
      )}
    </div>
  );
}
