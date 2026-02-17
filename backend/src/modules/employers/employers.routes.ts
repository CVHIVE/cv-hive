import { Router } from 'express';
import * as employerController from './employers.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validateRequest } from '../../middleware/validateRequest';
import { updateCompanySchema } from './employers.validation';

const router = Router();

router.get('/profile', authenticate, authorize('EMPLOYER'), employerController.getProfile);
router.put('/profile', authenticate, authorize('EMPLOYER'), validateRequest(updateCompanySchema), employerController.updateProfile);

export default router;
