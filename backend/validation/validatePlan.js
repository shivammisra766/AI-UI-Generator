import { AppError } from "../utils/AppError.js";

const allowedComponents = [
  "Button",
  "Card",
  "Input",
  "Table",
  "Modal",
  "Chart"
];

const allowedLayouts = ["dashboard", "table", "landing"]; // removed "form"

const allowedRootKeys = ["layout", "main", "modals"];

function validateNode(node, depth = 0) {
  if (!node || typeof node !== "object") {
    throw new AppError(
      "INVALID_NODE",
      "Each node must be an object.",
      400
    );
  }

  // 🔥 Depth guard
  if (depth > 5) {
    throw new AppError(
      "MAX_DEPTH_EXCEEDED",
      "Component nesting depth exceeds safe limit (5).",
      400
    );
  }

  if (!node.id || typeof node.id !== "string") {
    throw new AppError(
      "INVALID_NODE_ID",
      `Invalid or missing id in node.`,
      400
    );
  }

  if (!allowedComponents.includes(node.type)) {
    throw new AppError(
      "INVALID_COMPONENT",
      `Invalid component type: "${node.type}". Allowed: ${allowedComponents.join(", ")}.`,
      400
    );
  }

  if (typeof node.props !== "object" || node.props === null) {
    throw new AppError(
      "INVALID_PROPS",
      `Invalid props in node ID: ${node.id}`,
      400
    );
  }

  const allowedPropsByType = {
    Card: ["title"],
    Button: ["label"],
    Input: ["placeholder"],
    Chart: ["chartType"],
    Table: ["columns", "data"],
    Modal: ["title"]
  };

  const allowedProps = allowedPropsByType[node.type];

  Object.keys(node.props).forEach((propKey) => {
    if (!allowedProps.includes(propKey)) {
      throw new AppError(
        "INVALID_PROP_KEY",
        `Property "${propKey}" is not allowed on ${node.type}.`,
        400
      );
    }
  });

  switch (node.type) {
    case "Card":
      if (!node.props.title?.trim()) {
        throw new AppError(
          "INVALID_PROPS",
          `Card requires non-empty "title" prop. Node ID: ${node.id}`,
          400
        );
      }
      break;

    case "Button":
      if (!node.props.label?.trim()) {
        throw new AppError(
          "INVALID_PROPS",
          `Button requires non-empty "label" prop. Node ID: ${node.id}`,
          400
        );
      }
      break;

    case "Input":
      if (!node.props.placeholder?.trim()) {
        throw new AppError(
          "INVALID_PROPS",
          `Input requires non-empty "placeholder" prop. Node ID: ${node.id}`,
          400
        );
      }
      break;

    case "Chart":
      if (!["bar", "line", "pie"].includes(node.props.chartType)) {
        throw new AppError(
          "INVALID_PROPS",
          `Chart requires valid "chartType" (bar | line | pie). Node ID: ${node.id}`,
          400
        );
      }
      break;

    case "Table":
      if (!Array.isArray(node.props.columns) || !Array.isArray(node.props.data)) {
        throw new AppError(
          "INVALID_PROPS",
          `Table requires "columns" and "data" arrays. Node ID: ${node.id}`,
          400
        );
      }
      break;

    case "Modal":
      if (!node.props.title?.trim()) {
        throw new AppError(
          "INVALID_PROPS",
          `Modal requires non-empty "title" prop. Node ID: ${node.id}`,
          400
        );
      }
      break;
  }

  if (!Array.isArray(node.children)) {
    throw new AppError(
      "INVALID_CHILDREN",
      `Children must be an array. Node ID: ${node.id}`,
      400
    );
  }

  // 🔥 Proper recursive call with depth increment
  node.children.forEach(child =>
    validateNode(child, depth + 1)
  );
}


export function validatePlan(plan) {
  if (!plan || typeof plan !== "object") {
    throw new AppError(
      "INVALID_PLAN",
      "Plan must be an object.",
      400
    );
  }

  // Prevent unknown root keys
  Object.keys(plan).forEach((key) => {
    if (!allowedRootKeys.includes(key)) {
      throw new AppError(
        "INVALID_SCHEMA",
        `Unexpected root property: ${key}`,
        400
      );
    }
  });

  if (!plan.layout || typeof plan.layout !== "string") {
    throw new AppError(
      "INVALID_LAYOUT",
      "Layout must be a string.",
      400
    );
  }

  if (!allowedLayouts.includes(plan.layout)) {
    throw new AppError(
      "INVALID_LAYOUT",
      `Invalid layout: "${plan.layout}". Allowed: ${allowedLayouts.join(", ")}`,
      400
    );
  }

  if (!Array.isArray(plan.main)) {
    throw new AppError(
      "INVALID_MAIN",
      "Main must be an array.",
      400
    );
  }

  if (plan.main.length === 0) {
    throw new AppError(
      "EMPTY_LAYOUT",
      "UI cannot be empty. At least one component is required.",
      400
    );
  }

  plan.main.forEach(validateNode);

  if (!Array.isArray(plan.modals)) {
    throw new AppError(
      "INVALID_MODALS",
      "Modals must be an array.",
      400
    );
  }
  

  plan.modals.forEach(validateNode);
  function collectAllIds(plan) {
  const ids = new Set();
  const duplicates = new Set();

  function traverse(nodes) {
    if (!nodes) return;

    nodes.forEach((node) => {
      if (ids.has(node.id)) {
        duplicates.add(node.id);
      } else {
        ids.add(node.id);
      }

      traverse(node.children);
    });
  }

  traverse(plan.main);
  traverse(plan.modals);

  return duplicates;
}

const duplicateIds = collectAllIds(plan);

if (duplicateIds.size > 0) {
  throw new AppError(
    "DUPLICATE_ID",
    `Duplicate component IDs detected: ${[...duplicateIds].join(", ")}`,
    400
  );
}
function countNodes(plan) {
  let count = 0;

  function traverse(nodes) {
    if (!nodes) return;
    nodes.forEach(node => {
      count++;
      traverse(node.children);
    });
  }

  traverse(plan.main);
  traverse(plan.modals);

  return count;
}

if (countNodes(plan) > 20) {
  throw new AppError(
    "NODE_LIMIT_EXCEEDED",
    "Plan exceeds maximum allowed component count (20).",
    400
  );
}


  return true;
}

export function validateStructureIntegrity(previousPlan, newPlan) {
  if (!previousPlan) return;

  const prevMap = buildParentMap(previousPlan);
  const newMap = buildParentMap(newPlan);

  Object.keys(prevMap).forEach((id) => {

    // 🔒 ID must exist
    if (!(id in newMap)) {
      throw new AppError(
        "ID_REMOVAL_FORBIDDEN",
        `Component "${id}" cannot be removed during modification.`,
        400
      );
    }

    // 🔒 Parent must not change
    if (prevMap[id] !== newMap[id]) {
      throw new AppError(
        "STRUCTURAL_VIOLATION",
        `Component "${id}" cannot change parent from "${prevMap[id]}" to "${newMap[id]}".`,
        400
      );
    }

  });
}

function buildParentMap(plan) {
  const map = {};

  function traverse(nodes, parentId = null) {
    if (!nodes) return;

    nodes.forEach((node) => {
      map[node.id] = parentId;

      if (node.children && node.children.length > 0) {
        traverse(node.children, node.id);
      }
    });
  }

  traverse(plan.main, "MAIN");
  traverse(plan.modals, "MODALS");

  return map;
}
