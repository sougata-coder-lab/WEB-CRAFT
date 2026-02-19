import express from 'express';
import {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  generateForProject,
  rollbackVersion,
  togglePublish,
} from '../controllers/projectController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.get('/', getProjects);
router.post('/', createProject);
router.get('/:id', getProject);
router.put('/:id', updateProject);
router.delete('/:id', deleteProject);
router.post('/:id/generate', generateForProject);
router.post('/:id/rollback/:versionIndex', rollbackVersion);
router.put('/:id/publish', togglePublish);

export default router;
