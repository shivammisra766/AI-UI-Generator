import React from "react";
import { useState } from "react";
import { renderNode } from "./renderer/renderNode";
function App() {
const [prompt, setPrompt] = useState("");
const [history, setHistory] = useState([]);
const [plan, setPlan] = useState(null);
const [explanation, setExplaination] = useState("");

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
  console.log("Received plan:", data);
  setHistory(prev => [...prev, {plan: data.plan, explanation: data.explanation}]);
setPlan(data.plan);
setExplaination(data.explanation);
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
    <button onClick={() => {
  if (history.length > 1) {
    const newHistory = [...history];
    newHistory.pop();
    setHistory(newHistory);

    const last = newHistory[newHistory.length - 1];
    setPlan(last.plan);
    setExplaination(last.explanation);
  }
}}>
  Rollback
</button>


    <hr style={{ margin: "20px 0" }} />

{Array.isArray(plan?.main) && (
  <>
    {plan.main.map((node) => (
      <React.Fragment key={node.id}>
        {renderNode(node)}
      </React.Fragment>
    ))}

    {Array.isArray(plan?.modals) &&
      plan.modals.map((node) => (
        <React.Fragment key={node.id}>
          {renderNode(node)}
        </React.Fragment>
      ))}
  </>
)}


{explanation && (
  <div style={{
    marginTop: "20px",
    padding: "10px",
    background: "#f3f3f3",
    border: "1px solid #ccc"
  }}>
    <strong>AI Explanation:</strong>
    <p>{explanation}</p>
  </div>
)}


  </div>
);
}

export default App;
