import Project from '../models/Project.js';
import User from '../models/User.js';

// @desc    Get all published projects for community gallery
// @route   GET /api/community
// @access  Public
export const getCommunityProjects = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const projects = await Project.find({ isPublished: true })
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'name email')
      .select('title prompt code isPublished createdAt updatedAt userId');

    const total = await Project.countDocuments({ isPublished: true });

    const formattedProjects = projects.map((p) => ({
      id: p._id,
      title: p.title,
      prompt: p.prompt,
      code: p.code,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      creator: {
        id: p.userId._id,
        name: p.userId.name,
        initials: p.userId.name
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2),
      },
    }));

    res.json({
      success: true,
      projects: formattedProjects,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single published project for public view
// @route   GET /api/community/:id
// @access  Public
export const getPublicProject = async (req, res, next) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, isPublished: true })
      .populate('userId', 'name email')
      .select('title prompt code isPublished createdAt updatedAt userId');

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found or not published' });
    }

    res.json({
      success: true,
      project: {
        id: project._id,
        title: project.title,
        prompt: project.prompt,
        code: project.code,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
        creator: {
          id: project.userId._id,
          name: project.userId.name,
          initials: project.userId.name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
