import React, { forwardRef } from "react";

export const Button = forwardRef(function Button(
  {
    children,
    label,
    onClick,
    type = "button",
    disabled = false,
    loading = false,
    variant = "primary",
    className = "",
    ...props
  },
  ref
) {
  const variants = {
    primary:
      "bg-blue-600 hover:bg-blue-700 focus:ring-blue-400 text-white",
    secondary:
      "bg-gray-800 hover:bg-gray-700 focus:ring-gray-500 text-white",
    danger:
      "bg-red-600 hover:bg-red-700 focus:ring-red-400 text-white",
    outline:
      "border border-gray-400 text-gray-200 hover:bg-gray-800 focus:ring-gray-400",
  };

  const isDisabled = disabled || loading;

  return (
    <button
      ref={ref}
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      aria-busy={loading}
      className={`
        inline-flex items-center justify-center gap-2
        px-5 py-2.5
        rounded-xl
        font-medium
        shadow-lg
        transition-all duration-200
        active:scale-95
        focus:outline-none focus:ring-2 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant] || variants.primary}
        ${className}
      `}
      {...props}
    >
      {loading && (
        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
      )}

      {children || label}
    </button>
  );
});
