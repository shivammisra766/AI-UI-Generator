import React from "react";
import { useState } from "react";
import { renderNode } from "./renderer/renderNode";
function App() {
const [prompt, setPrompt] = useState("");
const [plan, setPlan] = useState(null);

async function handleGenerate() {
  const res = await fetch("http://localhost:5000/plan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ 
  prompt,
  existingPlan: plan 
})
  });
  const data = await res.json();
  setPlan(data.plan);
}


  return (
  <div style={{ padding: "20px" }}>
    <textarea
      value={prompt}
      onChange={(e) => setPrompt(e.target.value)}
      placeholder="Describe your UI..."
      style={{ width: "100%", height: "80px" }}
    />

    <button onClick={handleGenerate} style={{ marginTop: "10px" }}>
      Generate UI
    </button>

    <hr style={{ margin: "20px 0" }} />

    {plan &&
      plan.main.map((node) => (
        <React.Fragment key={node.id}>
          {renderNode(node)}
        </React.Fragment>
      ))}
  </div>
);
}

export default App;
