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
    throw new Error("Invalid node id");
  }

  if (!allowedComponents.includes(node.type)) {
    throw new Error(`Invalid component type: ${node.type}`);
  }

  if (typeof node.props !== "object") {
    throw new Error("Invalid props");
  }

  if (node.children && !Array.isArray(node.children)) {
    throw new Error("Children must be array");
  }

  if (node.children) {
    node.children.forEach(validateNode);
  }
}

export function validatePlan(plan) {
  const allowedLayouts = ["dashboard", "form", "table", "landing"];

  if (!allowedLayouts.includes(plan.layout)) {
    throw new Error("Invalid layout");
  }

  if (!Array.isArray(plan.main)) {
    throw new Error("Main must be array");
  }

  plan.main.forEach(validateNode);

  if (plan.modals) {
    if (!Array.isArray(plan.modals)) {
      throw new Error("Modals must be array");
    }
    plan.modals.forEach(validateNode);
  }

  return true;
}
