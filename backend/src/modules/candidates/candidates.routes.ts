import { Router } from 'express';
import * as candidateController from './candidates.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validateRequest } from '../../middleware/validateRequest';
import { updateProfileSchema } from './candidates.validation';
import { uploadCV } from '../../middleware/upload';

const router = Router();

// Public endpoint for database stats (landing page)
router.get('/db-stats', candidateController.getDatabaseStats);

router.get('/profile', authenticate, authorize('CANDIDATE'), candidateController.getProfile);
router.put('/profile', authenticate, authorize('CANDIDATE'), validateRequest(updateProfileSchema), candidateController.updateProfile);
router.post('/cv/upload', authenticate, authorize('CANDIDATE'), uploadCV.single('cv'), candidateController.uploadCV);
router.delete('/cv', authenticate, authorize('CANDIDATE'), candidateController.removeCV);

// Employer search & tools
router.get('/bookmarks', authenticate, authorize('EMPLOYER', 'ADMIN'), candidateController.getBookmarkedCandidates);
router.get('/bookmark-ids', authenticate, authorize('EMPLOYER', 'ADMIN'), candidateController.getBookmarkIds);
router.get('/export', authenticate, authorize('EMPLOYER', 'ADMIN'), candidateController.exportCandidates);
router.get('/', authenticate, authorize('EMPLOYER', 'ADMIN'), candidateController.searchCandidates);
router.post('/:id/bookmark', authenticate, authorize('EMPLOYER', 'ADMIN'), candidateController.bookmarkCandidate);
router.delete('/:id/bookmark', authenticate, authorize('EMPLOYER', 'ADMIN'), candidateController.unbookmarkCandidate);
router.post('/:id/reveal', authenticate, authorize('EMPLOYER', 'ADMIN'), candidateController.revealContact);
router.get('/:slug', candidateController.getPublicProfile);

export default router;
