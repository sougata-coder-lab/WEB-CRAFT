import Project from '../models/Project.js';
import { generateWebsiteCode } from '../utils/aiGenerator.js';

// @desc    Get all projects for current user
// @route   GET /api/projects
// @access  Private
export const getProjects = async (req, res, next) => {
  try {
    const projects = await Project.find({ userId: req.user._id })
      .sort({ updatedAt: -1 })
      .select('-versions');

    res.json({ success: true, projects });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Private
export const getProject = async (req, res, next) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, userId: req.user._id });

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    res.json({ success: true, project });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new project
// @route   POST /api/projects
// @access  Private
export const createProject = async (req, res, next) => {
  try {
    const { title, prompt, code } = req.body;

    if (!title || !prompt) {
      return res.status(400).json({ success: false, message: 'Title and prompt are required' });
    }

    const project = await Project.create({
      userId: req.user._id,
      title,
      prompt,
      code: code || '',
      versions: code ? [{ code, prompt }] : [],
    });

    res.status(201).json({ success: true, project });
  } catch (error) {
    next(error);
  }
};

// @desc    Update project (save new code / revision)
// @route   PUT /api/projects/:id
// @access  Private
export const updateProject = async (req, res, next) => {
  try {
    const { title, code, prompt, addVersion } = req.body;

    const project = await Project.findOne({ _id: req.params.id, userId: req.user._id });

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (title) project.title = title;
    if (code !== undefined) project.code = code;
    if (prompt) project.prompt = prompt;

    // Add new version if requested
    if (addVersion && code) {
      project.versions.push({ code, prompt: prompt || project.prompt });
      // Keep only last 20 versions
      if (project.versions.length > 20) {
        project.versions = project.versions.slice(-20);
      }
    }

    await project.save();

    res.json({ success: true, project });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private
export const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findOneAndDelete({ _id: req.params.id, userId: req.user._id });

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    res.json({ success: true, message: 'Project deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate AI code for project
// @route   POST /api/projects/:id/generate
// @access  Private
export const generateForProject = async (req, res, next) => {
  try {
    const { prompt, useExisting } = req.body;

    if (!prompt) {
      return res.status(400).json({ success: false, message: 'Prompt is required' });
    }

    const project = await Project.findOne({ _id: req.params.id, userId: req.user._id });

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const existingCode = useExisting ? project.code : null;
    const code = await generateWebsiteCode(prompt, existingCode);

    // Save new version
    project.versions.push({ code, prompt });
    if (project.versions.length > 20) {
      project.versions = project.versions.slice(-20);
    }

    project.code = code;
    project.prompt = prompt;
    await project.save();

    res.json({ success: true, code, project });
  } catch (error) {
    next(error);
  }
};

// @desc    Rollback to a specific version
// @route   POST /api/projects/:id/rollback/:versionIndex
// @access  Private
export const rollbackVersion = async (req, res, next) => {
  try {
    const { versionIndex } = req.params;
    const idx = parseInt(versionIndex);

    const project = await Project.findOne({ _id: req.params.id, userId: req.user._id });

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (idx < 0 || idx >= project.versions.length) {
      return res.status(400).json({ success: false, message: 'Invalid version index' });
    }

    const version = project.versions[idx];
    project.code = version.code;
    project.prompt = version.prompt;
    await project.save();

    res.json({ success: true, code: version.code, project });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle publish/unpublish project
// @route   PUT /api/projects/:id/publish
// @access  Private
export const togglePublish = async (req, res, next) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, userId: req.user._id });

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (!project.code) {
      return res.status(400).json({ success: false, message: 'Cannot publish a project without code' });
    }

    project.isPublished = !project.isPublished;
    await project.save();

    res.json({
      success: true,
      isPublished: project.isPublished,
      message: project.isPublished ? 'Project published to community' : 'Project unpublished',
    });
  } catch (error) {
    next(error);
  }
};
