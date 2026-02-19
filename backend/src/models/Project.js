import mongoose from 'mongoose';

const versionSchema = new mongoose.Schema({
  code: { type: String, required: true },
  prompt: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const projectSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    prompt: {
      type: String,
      required: [true, 'Prompt is required'],
    },
    code: {
      type: String,
      default: '',
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    versions: {
      type: [versionSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Index for community gallery queries
projectSchema.index({ isPublished: 1, createdAt: -1 });

const Project = mongoose.model('Project', projectSchema);
export default Project;
