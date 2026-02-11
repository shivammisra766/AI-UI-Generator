import React from "react";
import { componentMap } from "./componentMap";

export function renderNode(node) {
  const Component = componentMap[node.type];

  if (!Component) {
    console.error("Invalid component:", node.type);
    return null;
  }

  return (
    <Component {...node.props}>
      {node.children &&
        node.children.map((child) => (
          <React.Fragment key={child.id}>
            {renderNode(child)}
          </React.Fragment>
        ))}
    </Component>
  );
}

