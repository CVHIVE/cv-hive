import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import * as employerController from './employers.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validateRequest } from '../../middleware/validateRequest';
import { updateCompanySchema } from './employers.validation';

const storage = multer.diskStorage({
  destination: path.join(__dirname, '../../../uploads'),
  filename: (req, file, cb) => {
    cb(null, `logo-${Date.now()}${path.extname(file.originalname)}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 2 * 1024 * 1024 } });

const router = Router();

router.get('/directory', employerController.getDirectory);
router.get('/profile', authenticate, authorize('EMPLOYER'), employerController.getProfile);
router.put('/profile', authenticate, authorize('EMPLOYER'), validateRequest(updateCompanySchema), employerController.updateProfile);
router.post('/logo', authenticate, authorize('EMPLOYER'), upload.single('logo'), employerController.uploadLogo);
router.get('/profile/:slug', employerController.getPublicProfile);

export default router;
