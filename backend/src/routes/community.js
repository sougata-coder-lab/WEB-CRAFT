import express from 'express';
import { getCommunityProjects, getPublicProject } from '../controllers/communityController.js';

const router = express.Router();

router.get('/', getCommunityProjects);
router.get('/:id', getPublicProject);

export default router;
