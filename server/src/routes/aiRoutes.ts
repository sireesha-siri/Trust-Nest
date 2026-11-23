import { Router } from 'express';
import { AIController } from '../controllers/aiController.js';

const router = Router();

// Endpoint to parse natural-language accommodation queries
router.post('/parse-requirements', AIController.parseRequirements);

// Endpoint to check Gemini AI operational readiness
router.get('/status', AIController.getStatus);

export default router;
