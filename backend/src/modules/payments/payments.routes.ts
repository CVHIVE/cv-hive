import { Router } from 'express';
import * as paymentController from './payments.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';

const router = Router();

router.get('/', authenticate, authorize('EMPLOYER'), paymentController.getPaymentMethods);
router.post('/', authenticate, authorize('EMPLOYER'), paymentController.addPaymentMethod);
router.put('/:id/default', authenticate, authorize('EMPLOYER'), paymentController.setDefault);
router.delete('/:id', authenticate, authorize('EMPLOYER'), paymentController.deletePaymentMethod);

export default router;
