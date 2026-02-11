import React from 'react';
export function Modal({ title, children }) {
  return (
    <div className="top-0 left-0 w-full h-full fixed flex items-center justify-center bg-black/50">
      <div className="bg-white p-4 rounded-md shadow-lg">
        <h3>{title}</h3>
        {children}
      </div>
    </div>
  );
}
