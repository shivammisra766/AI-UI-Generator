import { planUI } from "../agents/planner.js";
import { explainUI } from "../agents/explainer.js";
import { validatePlan } from "../validation/validatePlan.js"; ;
import { validatePrompt } from "../validation/promptGuard.js";

export const generatePlan = async (req, res) => {
  try {
    const { prompt, existingPlan } = req.body;
    const previousPlan = existingPlan || null;

    validatePrompt(prompt);

    const plan = await planUI(prompt, previousPlan);
    validatePlan(plan);

    // 🔥 Setup SSE headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    // Send plan immediately
    res.write(`event: plan\n`);
    res.write(`data: ${JSON.stringify(plan)}\n\n`);

    // 🔥 Stream explanation from Groq
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          stream: true,
          messages: [
            {
              role: "system",
              content: `
You are an AI UI explanation agent.
Explain clearly and concisely.
`
            },
            {
              role: "user",
              content: `
User Request:
${prompt}

Previous Plan:
${previousPlan ? JSON.stringify(previousPlan) : "None"}

Current Plan:
${JSON.stringify(plan)}
`
            }
          ]
        })
      }
    );

    // 🔥 Parse streaming response properly
    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split("\n");

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.replace("data: ", "").trim();

          if (data === "[DONE]") {
            res.end();
            return;
          }

          try {
            const parsed = JSON.parse(data);
            const content =
              parsed.choices?.[0]?.delta?.content || "";

            if (content) {
              res.write(`event: explanation\n`);
              res.write(`data: ${content}\n\n`);
            }
          } catch (err) {
            // Ignore invalid JSON lines
          }
        }
      }
    }

    res.end();

  } catch (err) {
    console.error(err);
    res.status(500).end();
  }
};

export const validateOnly = (req, res) => {
  try {
    const { plan } = req.body;

    validatePlan(plan);

    res.json({ success: true });

  } catch (err) {
    res.status(400).json({
      error: err.message
    }); 
  }
};
