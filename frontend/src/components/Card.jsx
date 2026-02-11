import React from 'react';
export function Card({ title, children }) {
  return (
    <div style={{
      border: "1px solid #ccc",
      padding: "16px",
      marginBottom: "12px"
    }}>
      <h3>{title}</h3>
      {children}
    </div>
  );
}
