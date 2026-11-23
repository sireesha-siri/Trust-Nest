import { Router } from 'express';
import { CityServiceController } from '../controllers/cityServiceController.js';

const router = Router();

router.get('/', CityServiceController.getCityServices);

export default router;
