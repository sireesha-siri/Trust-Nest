import { Router } from 'express';
import { CommunityController } from '../controllers/communityController.js';

const router = Router();

router.get('/reports', CommunityController.getReports);
router.post('/reports', CommunityController.createReport);
router.post('/reports/:id/upvote', CommunityController.upvoteReport);

export default router;
