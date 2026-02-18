import { Router } from 'express';
import * as alertController from './jobAlerts.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';

const router = Router();

router.get('/', authenticate, authorize('CANDIDATE'), alertController.getAlerts);
router.post('/', authenticate, authorize('CANDIDATE'), alertController.createAlert);
router.put('/:id', authenticate, authorize('CANDIDATE'), alertController.updateAlert);
router.delete('/:id', authenticate, authorize('CANDIDATE'), alertController.deleteAlert);

export default router;
