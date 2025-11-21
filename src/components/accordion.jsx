import React, { useState } from "react";

export function Accordion({ children }) {
  return <div className="border rounded divide-y">{children}</div>;
}

export function AccordionItem({ children }) {
  return <div>{children}</div>;
}

export function AccordionTrigger({ children }) {
  const [open, setOpen] = useState(false);
  return (
    <button
      onClick={() => setOpen((o) => !o)}
      className="w-full text-left px-3 py-2 font-medium bg-gray-50 hover:bg-gray-100"
    >
      {children}
    </button>
  );
}

export function AccordionContent({ children }) {
  return <div className="p-3 text-sm text-gray-700">{children}</div>;
}
