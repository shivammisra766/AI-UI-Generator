import React from "react";
import { componentMap } from "./componentMap";

const VOID_COMPONENTS = new Set([
  "Input",   // your custom component
  "img",
  "br",
  "hr"
]);

export function renderNode(node) {
  // ---- Basic Safety Checks ----
  if (!node || typeof node !== "object") {
    console.error("Invalid node:", node);
    return null;
  }

  const { type, props = {}, children = [] } = node;

  if (!type) {
    console.error("Node missing type:", node);
    return null;
  }

  const Component = componentMap[type];

  if (!Component) {
    console.error("Invalid component:", type);
    return null;
  }

  const isVoid = VOID_COMPONENTS.has(type);

  try {
    // ---- Void Component (No Children Allowed) ----
    if (isVoid) {
      return <Component {...props} />;
    }

    // ---- Normal Component ----
    return (
      <Component {...props}>
        {Array.isArray(children) &&
          children.map((child, index) => (
            <React.Fragment key={child?.id || `child-${index}`}>
              {renderNode(child)}
            </React.Fragment>
          ))}
      </Component>
    );
  } catch (err) {
    console.error("Render error:", err, node);
    return (
      <div className="text-red-400 text-sm">
        Component Render Error
      </div>
    );
  }
}
