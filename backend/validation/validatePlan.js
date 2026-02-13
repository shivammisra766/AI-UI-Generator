const allowedComponents = [
  "Button",
  "Card",
  "Input",
  "Table",
  "Modal",
  "Chart"
];

function validateNode(node) {
  if (!node.id || typeof node.id !== "string") {
    throw new Error(`Invalid node id in node: ${JSON.stringify(node)}`);
  }

  if (!allowedComponents.includes(node.type)) {
    throw new Error(
      `Invalid component type: "${node.type}". ` +
      `Allowed types: ${allowedComponents.join(", ")}. ` +
      `Node ID: ${node.id}`
    );
  }

  if (typeof node.props !== "object" || node.props === null) {
    throw new Error(`Invalid props in node ID: ${node.id}`);
  }

  if (node.children && !Array.isArray(node.children)) {
    throw new Error(`Children must be array in node ID: ${node.id}`);
  }

  if (node.children) {
    node.children.forEach(validateNode);
  }
}


export function validatePlan(plan) {
  const allowedLayouts = ["dashboard", "form", "table", "landing"];

  if (!plan.layout || typeof plan.layout !== "string") {
    throw new Error(
      `Layout must be a string. Received: ${typeof plan.layout}`
    );
  }

  if (!allowedLayouts.includes(plan.layout)) {
    throw new Error(
      `Invalid layout: "${plan.layout}". ` +
      `Allowed layouts: ${allowedLayouts.join(", ")}.`
    );
  }

  if (!Array.isArray(plan.main)) {
    throw new Error(
      `Main must be an array. Received: ${typeof plan.main}`
    );
  }

  plan.main.forEach(validateNode);

  if (plan.modals) {
    if (!Array.isArray(plan.modals)) {
      throw new Error(
        `Modals must be an array. Received: ${typeof plan.modals}`
      );
    }

    plan.modals.forEach(validateNode);
  }

  return true;
}
