import { Router } from 'express';
import * as authController from './auth.controller';
import { validateRequest } from '../../middleware/validateRequest';
import { registerSchema, registerEmployerSchema, loginSchema } from './auth.validation';
import { authenticate } from '../../middleware/authenticate';

const router = Router();

router.post('/register', validateRequest(registerSchema), authController.register);
router.post('/register-employer', validateRequest(registerEmployerSchema), authController.registerEmployer);
router.post('/login', validateRequest(loginSchema), authController.login);
router.get('/me', authenticate, authController.getMe);
router.post('/logout', authenticate, authController.logout);
router.post('/verify-email', authController.verifyEmail);
router.post('/resend-verification', authenticate, authController.resendVerification);
router.post('/resend-verification-public', authController.resendVerificationByEmail);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/change-password', authenticate, authController.changePassword);

export default router;
