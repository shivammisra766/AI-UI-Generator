import { planUI } from "../agents/planner.js";

export const generatePlan = async (req, res, next) => {
  try {
    const { prompt, existingPlan } = req.body;

    const plan = await planUI(prompt, existingPlan);

    res.json({ plan });
  } catch (err) {
    next(err);
  }
};
