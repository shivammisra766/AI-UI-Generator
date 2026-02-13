import React, { useState } from "react";
import { renderNode } from "./renderer/renderNode";
import { Toaster, toast } from "react-hot-toast";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
const API_BASE =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

function App() {
  const [prompt, setPrompt] = useState("");
  const [history, setHistory] = useState([]);
  const [plan, setPlan] = useState(null);
  const [explanation, setExplaination] = useState("");
  const [editablePlanText, setEditablePlanText] = useState("");
  const [driftWarning, setDriftWarning] = useState(false);
  const [editorMode, setEditorMode] = useState("json"); 
  const [isGenerating, setIsGenerating] = useState(false);
  const [promptConflictOpen, setPromptConflictOpen] = useState(false);

  React.useEffect(() => {
  console.log("PLAN STRUCTURE:", plan);
}, [plan]);


async function executeGeneration(existingPlanToSend) {
  try {
    setIsGenerating(true);
    toast.loading("Generating UI...", { id: "generate" });

    setExplaination("");
    setEditablePlanText("");
    setDriftWarning(false);

    const response = await fetch(`${API_BASE}/plan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt,
        existingPlan: existingPlanToSend
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      toast.error(
        errorData?.error?.message || "Generation failed",
        { id: "generate" }
      );
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");

    let fullExplanation = "";
    let streamedPlan = null;
    let receivedPlan = false;
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      let boundaryIndex;
      while ((boundaryIndex = buffer.indexOf("\n\n")) !== -1) {
        const event = buffer.slice(0, boundaryIndex);
        buffer = buffer.slice(boundaryIndex + 2);

        if (event.includes("event: plan")) {
          const planLine = event
            .split("\n")
            .find((line) => line.startsWith("data:"));

          if (planLine) {
            const parsedPlan = JSON.parse(
              planLine.replace("data: ", "").trim()
            );

            streamedPlan = parsedPlan;
            setPlan(parsedPlan);
            setEditablePlanText(
              JSON.stringify(parsedPlan, null, 2)
            );
            receivedPlan = true;
          }
        }

        if (event.includes("event: explanation")) {
          const explanationLine = event
            .split("\n")
            .find((line) => line.startsWith("data:"));

          if (explanationLine) {
            fullExplanation += explanationLine.replace(
              "data: ",
              ""
            );
            setExplaination(fullExplanation);
          }
        }
      }
    }

    toast.success("UI generated successfully!", {
      id: "generate"
    });

    if (receivedPlan && streamedPlan) {
      setHistory((prev) => [
        ...prev,
        {
          prompt,
          plan: streamedPlan,
          explanation: fullExplanation
        }
      ]);
    }
    if (plan && streamedPlan) {
  const drift = computeDrift(plan, streamedPlan);

  if (drift.preservationRate < 0.6 || drift.layoutChanged) {
    setDriftWarning(true);
  }
}


  } catch (err) {
    toast.error("Server error: " + err.message, {
      id: "generate"
    });
  } finally {
    setIsGenerating(false);
  }
}

async function handleGenerate() {
  if (!prompt || prompt.trim() === "") {
    toast.error("Prompt cannot be empty");
    return;
  }

  if (isGenerating) return; // prevent double click

  const isSameAsLastPrompt =
    history.length > 0 &&
    history[history.length - 1].prompt?.trim().toLowerCase() ===
      prompt.trim().toLowerCase();

  // ✅ If same prompt → open modal instead of generating
  if (isSameAsLastPrompt) {
    setPromptConflictOpen(true);
    return;
  }

  // Otherwise generate normally (refinement mode)
  executeGeneration(plan);
}

  async function handleManualEdit() {
    if(!editablePlanText || editablePlanText.trim() === "") {
      toast.error("Editable plan cannot be empty");
      return;
    }
    try {
      const parsed = JSON.parse(editablePlanText);

      const res = await fetch(`${API_BASE}/plan/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: parsed })
      });

      const result = await res.json();

      if (!res.ok) {
  toast.error(
    result?.error?.message || "Validation failed"
  );
  return;
}


      toast.success("Manual edit applied successfully!");

      setHistory(prev => [
        ...prev,
        { plan: parsed, explanation: "Manual edit applied." }
      ]);

      setPlan(parsed);
      setExplaination("Manual edit applied.");

    } catch (err) {
      toast.error("Invalid JSON structure. " + err.message);
    }
  }

  function extractNodes(plan) {
  if (!plan) return [];

  const nodes = [];

  function traverse(nodeList) {
    if (!nodeList) return;

    nodeList.forEach(node => {
      nodes.push({
        id: node.id,
        type: node.type
      });

      if (node.children) {
        traverse(node.children);
      }
    });
  }

  traverse(plan.main || []);
  traverse(plan.modals || []);

  return nodes;
}

function computeDrift(previousPlan, currentPlan) {
  if (!previousPlan || !currentPlan) {
    return {
      preservationRate: 1,
      layoutChanged: false
    };
  }

  const prevNodes = extractNodes(previousPlan);
  const currNodes = extractNodes(currentPlan);

  if (prevNodes.length === 0) {
    return {
      preservationRate: 1,
      layoutChanged: false
    };
  }

  const prevIds = new Set(prevNodes.map(n => n.id));
  const currIds = new Set(currNodes.map(n => n.id));

  let preserved = 0;

  prevIds.forEach(id => {
    if (currIds.has(id)) preserved++;
  });

  const preservationRate = preserved / prevIds.size;
  const layoutChanged =
    previousPlan.layout !== currentPlan.layout;

  return {
    preservationRate,
    layoutChanged
  };
}

function generateJSX(node, indent = 0) {
  const space = "  ".repeat(indent);

  const propsString = Object.entries(node.props || {})
    .map(([key, value]) =>
      typeof value === "string"
        ? `${key}="${value}"`
        : `${key}={${JSON.stringify(value)}}`
    )
    .join(" ");

  if (!node.children || node.children.length === 0) {
    return propsString
  ? `${space}<${node.type} ${propsString} />`
  : `${space}<${node.type} />`;

  }

  const childrenJSX = node.children
    .map(child => generateJSX(child, indent + 1))
    .join("\n");

  return `${space}<${node.type}${propsString ? " " + propsString : ""}>
${childrenJSX}
${space}</${node.type}>`;
}

function planToJSX(plan) {
  if (!plan) return "";

  const mainJSX = (plan.main || [])
    .map(node => generateJSX(node, 2))
    .join("\n");

  const modalJSX = (plan.modals || [])
    .map(node => generateJSX(node, 2))
    .join("\n");

  return `import React from "react";

const GeneratedComponent = () => {
  return (
    <>
${mainJSX}
${modalJSX}
    </>
  );
};

export default GeneratedComponent;
`;
}

  return (
<>
  <Toaster position="top-right" />

  <div className="relative flex flex-col md:flex-row h-screen bg-gray-950 text-gray-100">
{isGenerating && (
  <div className="absolute inset-0 z-50 flex items-center justify-center backdrop-brightness-70">
    <div className="bg-gray-600 px-6 py-4 rounded-xl shadow-xl flex flex-col items-center gap-3">
      
      {/* Spinner */}
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>

      <p className="text-gray-200 text-sm font-medium">
        Generating UI...
      </p>
    </div>
  </div>
)}
{promptConflictOpen && (
  <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
    <div className="bg-gray-900 w-[400px] rounded-2xl p-6 shadow-2xl border border-gray-800">
      
      <h3 className="text-lg font-semibold text-white mb-4">
        Same Prompt Detected
      </h3>

      <p className="text-sm text-gray-400 mb-6">
        You already generated UI for this prompt. What would you like to do?
      </p>

      <div className="flex flex-col gap-3">

        <button
          onClick={() => {
            setPromptConflictOpen(false);
            executeGeneration(null); // fresh
          }}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-white transition"
        >
          🔁 Regenerate from Scratch
        </button>

        <button
          onClick={() => {
            setPromptConflictOpen(false);
            executeGeneration(plan); // refine
          }}
          className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg text-white transition"
        >
          ✏ Refine Existing UI
        </button>

        <button
          onClick={() => setPromptConflictOpen(false)}
          className="text-gray-400 hover:text-white text-sm mt-2"
        >
          Cancel
        </button>

      </div>
    </div>
  </div>
)}


    {/* LEFT PANEL */}
    <div className="md:w-[30%] w-full border-r border-gray-800 p-5 overflow-y-auto flex flex-col gap-6 bg-gray-900">

      {/* Prompt Section */}
      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-white">Prompt</h2>

        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe your UI..."
          className="w-full h-24 bg-gray-800 border border-gray-700 rounded-lg p-2 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          onClick={handleGenerate}
          className="bg-blue-600 hover:bg-blue-700 transition px-4 py-2 rounded-full w-fit cursor-pointer"
        >
          Generate UI
        </button>
      </div>

      {/* History Timeline */}
      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-white">History</h2>

        <div className="flex flex-col gap-3">
          {history.map((item, index) => (
            <div
              key={index}
              className="border border-gray-700 rounded p-3 bg-gray-800 hover:bg-gray-700 cursor-pointer transition"
              onClick={() => {
                setPlan(item.plan);
                setEditablePlanText(JSON.stringify(item.plan, null, 2));
                setExplaination(item.explanation);
                toast.success("Loaded from history");
              }}
            >
              <div className="text-xs text-gray-400">
                Version {index + 1}
              </div>
              <div className="text-sm text-gray-200 truncate">
                {item.explanation}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Explanation */}
      {explanation && (
  <div className="flex flex-col gap-4 mt-4">
    <h2 className="text-xl font-semibold text-white border-b border-gray-800 pb-2">
      Explanation
    </h2>

    <div className="
      bg-gray-900
      border border-gray-800
      rounded-xl
      p-5
      shadow-lg
      leading-relaxed
      text-gray-200
      overflow-x-auto
    ">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
  h1: ({node, ...props}) => (
    <h1 className="text-2xl font-bold mt-6 mb-3 text-white" {...props} />
  ),

  h2: ({node, ...props}) => (
    <h2 className="text-xl font-semibold mt-5 mb-2 text-white" {...props} />
  ),

  h3: ({node, ...props}) => (
    <h3 className="text-lg font-medium mt-4 mb-2 text-gray-100" {...props} />
  ),

  p: ({node, ...props}) => (
    <p className="mb-3 leading-relaxed text-gray-300" {...props} />
  ),

  ul: ({node, ...props}) => (
    <ul className="list-disc ml-6 mb-3 space-y-1" {...props} />
  ),

  ol: ({node, ...props}) => (
    <ol className="list-decimal ml-6 mb-3 space-y-1" {...props} />
  ),

  pre: ({node, ...props}) => (
    <pre className="bg-black/60 p-4 rounded-lg overflow-x-auto text-sm my-4" {...props} />
  ),

  code({ inline, className, children, ...props }) {
    if (inline) {
      return (
        <code className="bg-gray-800 px-1 py-0.5 rounded text-green-400 text-sm">
          {children}
        </code>
      );
    }
    return (
      <code className={className} {...props}>
        {children}
      </code>
    );
  }
}}

      >
        {explanation}
      </ReactMarkdown>
    </div>
  </div>
)}
{driftWarning && (
  <div className="bg-yellow-900/30 border border-yellow-600 text-yellow-300 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
    <span className="text-yellow-400 mt-0.5">⚠</span>
    <div>
      <div className="font-medium">
        Large structural change detected
      </div>
      <div className="text-xs text-yellow-200 mt-1">
        The AI may have rewritten major parts of the UI.
      </div>
    </div>
  </div>
)}


    </div>

    {/* RIGHT PANEL */}
    <div className="md:w-[70%] w-full p-5 flex flex-col gap-6 overflow-y-auto bg-gray-950">

      {/* JSON Editor */}
      <div className="flex flex-col gap-3">
        <div className="flex gap-2 mb-3">
  <button
    onClick={() => setEditorMode("json")}
    className={`px-4 py-1 rounded-full text-sm transition ${
      editorMode === "json"
        ? "bg-blue-600 text-white"
        : "bg-gray-800 text-gray-400 hover:bg-gray-700"
    }`}
  >
    JSON
  </button>

  <button
    onClick={() => setEditorMode("jsx")}
    className={`px-4 py-1 rounded-full text-sm transition ${
      editorMode === "jsx"
        ? "bg-blue-600 text-white"
        : "bg-gray-800 text-gray-400 hover:bg-gray-700"
    }`}
  >
    JSX
  </button>
</div>


<h2 className="text-lg font-semibold text-white">
  {editorMode === "json" ? "JSON Editor" : "JSX View"}
</h2>

{editorMode === "json" ? (
  <textarea
    value={editablePlanText}
    onChange={(e) => setEditablePlanText(e.target.value)}
    className="w-full h-64 bg-gray-900 border border-gray-700 rounded-lg p-3 font-mono text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500"
  />
) : (
  <textarea
    value={planToJSX(plan)}
    readOnly
    className="w-full h-64 bg-gray-900 border border-gray-700 rounded-lg p-3 font-mono text-sm text-green-400"
  />
)}

        <button
          onClick={handleManualEdit}
          className="bg-green-600 hover:bg-green-700 transition px-4 py-2 rounded-full w-fit cursor-pointer"
        >
          Apply Manual Edit
        </button>
      </div>

      <hr className="border-gray-800" />

      {/* Live Preview */}
      {plan && (
        <div className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold text-white">Live Preview</h2>

          <div className="border border-gray-800 rounded p-6 bg-gray-900 shadow-lg">
            {plan.main?.map((node, index) => (
  <React.Fragment key={node.id || index}>
    {renderNode(node)}
  </React.Fragment>
))}

          </div>
        </div>
      )}
    </div>
    
  </div>
</>

  );
}

export default App;
