import React, { useState } from "react";
import { renderNode } from "./renderer/renderNode";
import { Toaster, toast } from "react-hot-toast";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";


function App() {
  const [prompt, setPrompt] = useState("");
  const [history, setHistory] = useState([]);
  const [plan, setPlan] = useState(null);
  const [explanation, setExplaination] = useState("");
  const [editablePlanText, setEditablePlanText] = useState("");

  async function handleGenerate() {
  if (!prompt || prompt.trim() === "") {
    toast.error("Prompt cannot be empty");
    return;
  }

  try {
    toast.loading("Generating UI...", { id: "generate" });

    setExplaination("");
    setEditablePlanText("");

    const response = await fetch("http://localhost:5000/plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt,
        existingPlan: plan
      })
    });

    if (!response.ok) {
      toast.error("Generation failed", { id: "generate" });
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");

    let fullExplanation = "";
    let receivedPlan = false;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });

      const events = chunk.split("\n\n");

      for (const event of events) {
        if (event.includes("event: plan")) {
          const planLine = event
            .split("\n")
            .find(line => line.startsWith("data:"));

          if (planLine) {
            const planData = planLine.replace("data: ", "").trim();
            const parsedPlan = JSON.parse(planData);

            setPlan(parsedPlan);
            setEditablePlanText(JSON.stringify(parsedPlan, null, 2));
            receivedPlan = true;
          }
        }

        if (event.includes("event: explanation")) {
          const explanationLine = event
            .split("\n")
            .find(line => line.startsWith("data:"));

          if (explanationLine) {
            const text = explanationLine.replace("data: ", "");
            fullExplanation += text;
            setExplaination(fullExplanation);
          }
        }
      }
    }

    toast.success("UI generated successfully!", { id: "generate" });

    if (receivedPlan) {
      setHistory(prev => [
        ...prev,
        { plan, explanation: fullExplanation }
      ]);
    }

  } catch (err) {
    toast.error("Server error: " + err.message, { id: "generate" });
  }
}


  async function handleManualEdit() {
    if(!editablePlanText || editablePlanText.trim() === "") {
      toast.error("Editable plan cannot be empty");
      return;
    }
    try {
      const parsed = JSON.parse(editablePlanText);

      const res = await fetch("http://localhost:5000/plan/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: parsed })
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error || "Validation failed");
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

  return (
<>
  <Toaster position="top-right" />

  <div className="flex flex-col md:flex-row h-screen bg-gray-950 text-gray-100">

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
            <p className="mb-3 whitespace-pre-line" {...props} />
          ),
          ul: ({node, ...props}) => (
            <ul className="list-disc ml-6 mb-3 space-y-1" {...props} />
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
              <pre className="bg-black/60 p-4 rounded-lg overflow-x-auto text-sm">
                <code className={className} {...props}>
                  {children}
                </code>
              </pre>
            );
          }
        }}
      >
        {explanation}
      </ReactMarkdown>
    </div>
  </div>
)}

    </div>

    {/* RIGHT PANEL */}
    <div className="md:w-[70%] w-full p-5 flex flex-col gap-6 overflow-y-auto bg-gray-950">

      {/* JSON Editor */}
      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-white">JSON Editor</h2>

        <textarea
          value={editablePlanText}
          onChange={(e) => setEditablePlanText(e.target.value)}
          className="w-full h-64 bg-gray-900 border border-gray-700 rounded-lg p-3 font-mono text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500"
        />

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
            {plan.main?.map((node) => renderNode(node))}
          </div>
        </div>
      )}
    </div>

  </div>
</>

  );
}

export default App;
