import { Router } from 'express';
import * as adminController from './admin.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';

const router = Router();

router.use(authenticate, authorize('ADMIN'));

// Platform stats & activity
router.get('/stats', adminController.getPlatformStats);
router.get('/activity', adminController.getRecentActivity);

// Users management
router.get('/users', adminController.getAllUsers);
router.get('/users/:id', adminController.getUserById);
router.delete('/users/:id', adminController.deleteUser);

// Candidates & Employers
router.get('/candidates', adminController.getAllCandidates);
router.get('/employers', adminController.getAllEmployers);

// Jobs moderation
router.get('/jobs', adminController.getAllJobs);
router.put('/jobs/:id/status', adminController.updateJobStatus);

// Subscription management
router.put('/employers/:id/subscription', adminController.updateEmployerSubscription);

// Cleanup
router.post('/cleanup-demos', adminController.cleanupDemos);

export default router;
