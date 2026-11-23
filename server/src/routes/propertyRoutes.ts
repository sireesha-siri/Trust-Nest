import { Router } from 'express';
import { PropertyController } from '../controllers/propertyController.js';

const router = Router();

// Property listings
router.get('/', PropertyController.getProperties);
router.get('/:id', PropertyController.getPropertyById);

// Discrepancy reporting for specific property
router.post('/:id/discrepancies', PropertyController.createDiscrepancy);
router.get('/:id/discrepancies', PropertyController.getDiscrepancies);

export default router;
