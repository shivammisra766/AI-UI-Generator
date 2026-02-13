import express from 'express';
import { generatePlan, validateOnly } from '../controllers/planController.js';

const router = express.Router();

router.post('/', generatePlan);
router.post('/validate', validateOnly);

export default router;