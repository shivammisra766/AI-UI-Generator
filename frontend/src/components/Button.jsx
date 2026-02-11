import React from 'react';
export function Button({ label }) {
  return <button className="bg-black text-white p-2 m-2 rounded-md border-none cursor-pointer hover:bg-gray-800">{label}</button>;
}
