import { Router } from 'express';
import * as adminController from './admin.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';

const router = Router();

router.get('/users', authenticate, authorize('ADMIN'), adminController.getAllUsers);
router.get('/users/:id', authenticate, authorize('ADMIN'), adminController.getUserById);
router.delete('/users/:id', authenticate, authorize('ADMIN'), adminController.deleteUser);
router.put('/users/:id/reset-password', authenticate, authorize('ADMIN'), adminController.resetPassword);
router.get('/candidates', authenticate, authorize('ADMIN'), adminController.getAllCandidates);
router.get('/employers', authenticate, authorize('ADMIN'), adminController.getAllEmployers);
router.get('/jobs', authenticate, authorize('ADMIN'), adminController.getAllJobs);
router.post('/cleanup-demos', authenticate, authorize('ADMIN'), adminController.cleanupDemos);

export default router;
