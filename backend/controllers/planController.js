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

    const explanation = await explainUI(
      prompt,
      plan,
      previousPlan
    );

    res.json({
      plan,
      explanation
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
