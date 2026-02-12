import { planUI } from "../agents/planner.js";
import { explainUI } from "../agents/explainer.js";

export const generatePlan = async (req, res) => {
  try {
    const { prompt, existingPlan } = req.body;

    const previousPlan = existingPlan || null;


    const plan = await planUI(prompt, previousPlan);

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
