import { Router } from 'express';
import * as subController from './subscriptions.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';

const router = Router();

router.post('/checkout', authenticate, authorize('EMPLOYER'), subController.createCheckout);
router.get('/status', authenticate, authorize('EMPLOYER'), subController.getStatus);
router.post('/verify-session', authenticate, authorize('EMPLOYER'), subController.verifySession);
router.post('/cancel', authenticate, authorize('EMPLOYER'), subController.cancelSubscription);

export default router;
