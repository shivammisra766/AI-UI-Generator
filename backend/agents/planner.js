import dotenv from "dotenv";
dotenv.config();

import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function planUI(userPrompt, existingPlan = null) {
  
  const systemInstruction = `
You are a deterministic UI planner.

Rules:
- Output STRICT JSON only.
- No markdown.
- No explanations.
- No comments.
- No JSX.
- Use only allowed components.
- Preserve existing IDs unless explicitly removed.

Allowed components:
Button
Card
Input
Table
Modal
Chart

Schema:
{
  "layout": "dashboard | form | table | landing",
  "main": [
    {
      "id": "string",
      "type": "AllowedComponent",
      Component-specific prop rules:
Card:
  props: { "title": "string" }

Chart:
  props: { "chartType": "bar | line | pie" }

Button:
  props: { "label": "string" }

Input:
  props: { "placeholder": "string" }

Table:
  props: { "columns": string[], "data": string[][] }

Modal:
  props: { "title": "string" }

      "children": []
    }
  ],
  "modals": []
}
`;

  let fullPrompt;

  if (existingPlan) {
    fullPrompt = `
Existing UI Plan:
${JSON.stringify(existingPlan, null, 2)}

User Modification Request:
${userPrompt}

Modify the existing plan.
Return updated JSON only.
`;
  } else {
    fullPrompt = `
User Request:
${userPrompt}

Return JSON only.
`;
  }

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      temperature: 0,
      messages: [
        { role: "system", content: systemInstruction },
        { role: "user", content: fullPrompt }
      ],
    });

    const rawText = completion.choices[0]?.message?.content || "";

    console.log("Raw model output:", rawText);

    const cleaned = extractJSON(rawText);

    return cleaned;

  } catch (error) {
    console.error("Groq Error:", error);
    throw new Error("LLaMA planning failed");
  }
}

function extractJSON(text) {
  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");

  if (firstBrace === -1 || lastBrace === -1) {
    throw new Error("No JSON found in model output");
  }

  const jsonString = text.slice(firstBrace, lastBrace + 1);

  try {
    return JSON.parse(jsonString);
  } catch (err) {
    console.error("JSON parse error:", jsonString);
    throw new Error("Invalid JSON from model");
  }
}
