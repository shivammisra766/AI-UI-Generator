export async function explainUI(prompt, plan, previousPlan = null) {
  const systemPrompt = `
You are an AI UI explanation agent.

Your job:
- Explain why the UI plan looks the way it does.
- Reference layout and components.
- If this is a modification, explain what changed.
- Be clear and concise.
- Do NOT output JSON.
- Output plain English only.
`;

content: `
You are an AI UI explanation agent.

Formatting Rules:

- Always add a blank line before numbered lists.
- Always use proper Markdown numbered list format:
  
  1. Item one
  2. Item two

- Never place numbered items on the same line.
- Add a blank line after headings.
- Add a blank line before and after code blocks.
- Keep everything clean and structured.
`

  const fullPrompt = `
User Request:
${prompt}

Previous Plan:
${previousPlan ? JSON.stringify(previousPlan, null, 2) : "None"}

Current Plan:
${JSON.stringify(plan, null, 2)}

Explain the decisions clearly.
`;

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
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: fullPrompt }
        ],
        temperature: 0.3
      })
    }
  );

  const data = await response.json();

  return data.choices[0].message.content;
}
