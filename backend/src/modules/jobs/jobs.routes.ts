import { Router } from 'express';
import * as jobController from './jobs.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validateRequest } from '../../middleware/validateRequest';
import { createJobSchema, updateJobSchema, applyJobSchema, updateApplicationStatusSchema } from './jobs.validation';

const router = Router();

// Public routes
router.get('/recent', jobController.getRecentJobs);
router.get('/search', jobController.searchJobs);
router.get('/:id/similar', jobController.getSimilarJobsHandler);
router.get('/:id/employer-metrics', jobController.getEmployerResponseMetrics);
router.get('/:id', jobController.getJob);

// Admin/Cron route for auto-pause and auto-expire
router.post('/admin/auto-pause', authenticate, authorize('ADMIN'), jobController.runAutoPause);

// Employer routes
router.post('/', authenticate, authorize('EMPLOYER'), validateRequest(createJobSchema), jobController.createJob);
router.put('/:id', authenticate, authorize('EMPLOYER'), validateRequest(updateJobSchema), jobController.updateJob);
router.post('/:id/pay', authenticate, authorize('EMPLOYER'), jobController.payForJob);
router.post('/verify-payment', authenticate, authorize('EMPLOYER'), jobController.verifyJobPayment);
router.put('/:id/close', authenticate, authorize('EMPLOYER'), jobController.closeJob);
router.get('/employer/mine', authenticate, authorize('EMPLOYER'), jobController.getEmployerJobs);
router.get('/:id/applications', authenticate, authorize('EMPLOYER'), jobController.getApplicationsForJob);
router.put('/applications/:applicationId/status', authenticate, authorize('EMPLOYER'), validateRequest(updateApplicationStatusSchema), jobController.updateApplicationStatus);
router.get('/applications/:applicationId/history', authenticate, authorize('EMPLOYER'), jobController.getApplicationStatusHistory);

// Candidate routes
router.post('/:id/apply', authenticate, authorize('CANDIDATE'), jobController.applyToJob);
router.get('/applications/mine', authenticate, authorize('CANDIDATE'), jobController.getCandidateApplications);
router.post('/:id/save', authenticate, authorize('CANDIDATE'), jobController.saveJob);
router.delete('/:id/save', authenticate, authorize('CANDIDATE'), jobController.unsaveJob);
router.get('/saved/mine', authenticate, authorize('CANDIDATE'), jobController.getSavedJobs);

export default router;
