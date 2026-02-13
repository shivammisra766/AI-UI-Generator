import React, { forwardRef } from "react";

export const Input = forwardRef(function Input(
  {
    label="Input",
    name,
    id,
    placeholder,
    value,
    onChange,
    type = "text",
    disabled = false,
    error,
    autoComplete,
    className = "",
    ...props
  },
  ref
) {
  const inputId = id || name || label.toLowerCase().replace(/\s+/g, "-");
  const computedPlaceholder =
  placeholder ?? `Enter ${label}`;


  return (
    <div className="w-full flex flex-col gap-2">
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-gray-300"
        >
          {label}
        </label>
      )}

      <input
        ref={ref}
        id={inputId}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={computedPlaceholder}
        autoComplete={autoComplete}
        className={`
          w-full
          px-4 py-2.5
          bg-gray-900
          border
          ${error ? "border-red-500 focus:ring-red-500" : "border-gray-700 focus:ring-blue-500 focus:border-blue-500"}
          rounded-xl
          text-gray-100
          placeholder-gray-500
          transition
          duration-200
          focus:outline-none
          focus:ring-2
          hover:border-gray-600
          disabled:opacity-50
          disabled:cursor-not-allowed
          ${className}
        `}
        aria-invalid={!!error}
        {...props}
      />

      {error && (
        <span className="text-xs text-red-400">
          {error}
        </span>
      )}
    </div>
  );
});
