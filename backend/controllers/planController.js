import { planUI } from "../agents/planner.js";
import { explainUI } from "../agents/explainer.js";
import { validatePlan, validateStructureIntegrity  } from "../validation/validatePlan.js"; ;
import { validatePrompt } from "../validation/promptGuard.js";
let generationCount = 0;
const MAX_GENERATIONS = 30;

export const generatePlan = async (req, res, next) => {
  try {
    if (generationCount >= MAX_GENERATIONS) {
      throw new AppError(
        "GENERATION_LIMIT_REACHED",
        "Maximum number of UI generations reached.",
        429
      );
    }

    const { prompt, existingPlan } = req.body;
    const previousPlan = existingPlan || null;

    const isExplicitRewrite =
      /redesign|regenerate|start over|ignore previous|rebuild|from scratch/i.test(
        prompt
      );

    validatePrompt(prompt);

    const plan = await planUI(prompt, previousPlan);

    validatePlan(plan);

    if (!isExplicitRewrite) {
      validateStructureIntegrity(previousPlan, plan);
    }

    // 🔥 Increment only after successful validation
    generationCount++;

    // 🔥 Setup SSE headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    // Send plan immediately
    res.write(`event: plan\n`);
    res.write(`data: ${JSON.stringify(plan)}\n\n`);

    // 🔥 Stream explanation
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
          max_tokens: 800,
          stream: true,
          messages: [
            {
              role: "system",
              content: `You are an AI UI explanation agent. Explain clearly and concisely.`
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
            const content = parsed.choices?.[0]?.delta?.content || "";

            if (content) {
              res.write(`event: explanation\n`);
              res.write(`data: ${content}\n\n`);
            }
          } catch {
            // Ignore invalid streaming chunks
          }
        }
      }
    }

    res.end();
  } catch (err) {
    next(err);
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
