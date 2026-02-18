import { Router } from 'express';
import * as analyticsController from './analytics.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';

const router = Router();

router.get('/dashboard', authenticate, authorize('EMPLOYER'), analyticsController.getDashboardAnalytics);
router.get('/jobs/:jobId', authenticate, authorize('EMPLOYER'), analyticsController.getJobAnalytics);

export default router;
