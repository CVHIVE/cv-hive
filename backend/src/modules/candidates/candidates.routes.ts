import { Router } from 'express';
import * as candidateController from './candidates.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validateRequest } from '../../middleware/validateRequest';
import { updateProfileSchema } from './candidates.validation';
import { uploadCV } from '../../middleware/upload';

const router = Router();

router.get('/profile', authenticate, authorize('CANDIDATE'), candidateController.getProfile);
router.put('/profile', authenticate, authorize('CANDIDATE'), validateRequest(updateProfileSchema), candidateController.updateProfile);
router.post('/cv/upload', authenticate, authorize('CANDIDATE'), uploadCV.single('cv'), candidateController.uploadCV);
router.get('/', authenticate, authorize('EMPLOYER', 'ADMIN'), candidateController.searchCandidates);
router.get('/:slug', candidateController.getPublicProfile);

export default router;
