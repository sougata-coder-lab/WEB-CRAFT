import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, ExternalLink, Globe, GlobeLock, Loader2, FolderOpen, Wand2 } from 'lucide-react';
import { toast } from 'sonner';
import api from '../services/api';
import type { Project } from '../types';

const ProjectCard = ({
  project,
  onDelete,
  onOpen,
}: {
  project: Project;
  onDelete: (id: string) => void;
  onOpen: (id: string) => void;
}) => {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Delete this project? This cannot be undone.')) return;
    setDeleting(true);
    try {
      await api.delete(`/projects/${project._id}`);
      onDelete(project._id);
      toast.success('Project deleted');
    } catch {
      toast.error('Failed to delete project');
    } finally {
      setDeleting(false);
    }
  };

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  return (
    <div
      onClick={() => onOpen(project._id)}
      className="group bg-gray-950 border border-white/10 rounded-2xl overflow-hidden hover:border-indigo-500/30 transition-all cursor-pointer"
    >
      {/* Mini iframe preview */}
      <div className="relative h-40 bg-gray-900 overflow-hidden">
        {project.code ? (
          <iframe
            srcDoc={project.code}
            sandbox="allow-scripts allow-same-origin"
            className="w-full h-full border-0 pointer-events-none"
            style={{ transform: 'scale(0.5)', transformOrigin: 'top left', width: '200%', height: '200%' }}
            title={project.title}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Wand2 size={24} className="text-gray-600 mx-auto mb-2" />
              <p className="text-gray-600 text-xs">No preview yet</p>
            </div>
          </div>
        )}
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="bg-indigo-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1">
            <ExternalLink size={12} />
            Open Builder
          </div>
        </div>
      </div>

      {/* Card info */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-white font-semibold text-sm truncate flex-1">{project.title}</h3>
          <div className="flex items-center gap-1 flex-shrink-0">
            {project.isPublished ? (
              <span className="flex items-center gap-1 text-green-400 text-xs bg-green-400/10 px-2 py-0.5 rounded-full">
                <Globe size={10} />
                Live
              </span>
            ) : (
              <span className="flex items-center gap-1 text-gray-500 text-xs bg-white/5 px-2 py-0.5 rounded-full">
                <GlobeLock size={10} />
                Draft
              </span>
            )}
          </div>
        </div>
        <p className="text-gray-500 text-xs truncate mb-3">{project.prompt}</p>
        <div className="flex items-center justify-between">
          <span className="text-gray-600 text-xs">{timeAgo(project.updatedAt)}</span>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="p-1.5 text-gray-600 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
          >
            {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
          </button>
        </div>
      </div>
    </div>
  );
};

const Projects = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newPrompt, setNewPrompt] = useState('');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data.projects || []);
    } catch {
      toast.error('Failed to load projects');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newPrompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }
    setIsCreating(true);
    try {
      const createRes = await api.post('/projects', {
        title: newPrompt.slice(0, 100),
        prompt: newPrompt.trim(),
      });
      const projectId = createRes.data.project._id;
      toast.success('Project created! Generating website...');
      navigate(`/builder/${projectId}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create project');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = (id: string) => {
    setProjects((prev) => prev.filter((p) => p._id !== id));
  };

  return (
    <div className="min-h-screen bg-black pt-24 pb-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">My Projects</h1>
            <p className="text-gray-400 text-sm">{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
          </div>
          <button
            onClick={() => setShowNewForm(!showNewForm)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm"
          >
            <Plus size={16} />
            New Project
          </button>
        </div>

        {/* New project form */}
        {showNewForm && (
          <div className="bg-gray-950 border border-indigo-500/30 rounded-2xl p-6 mb-8 animate-fade-in">
            <h3 className="text-white font-semibold mb-4">Create New Project</h3>
            <textarea
              value={newPrompt}
              onChange={(e) => setNewPrompt(e.target.value)}
              placeholder="Describe the website you want to build..."
              rows={3}
              className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm resize-none focus:outline-none focus:border-indigo-500 transition-colors mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={handleCreate}
                disabled={isCreating || !newPrompt.trim()}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm"
              >
                {isCreating ? (
                  <><Loader2 size={14} className="animate-spin" /> Creating...</>
                ) : (
                  <><Wand2 size={14} /> Create & Generate</>
                )}
              </button>
              <button
                onClick={() => { setShowNewForm(false); setNewPrompt(''); }}
                className="px-5 py-2.5 text-gray-400 hover:text-white border border-white/10 hover:border-white/20 rounded-xl text-sm transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Projects grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex gap-2">
              <div className="w-2 h-2 bg-indigo-500 rounded-full bounce-dot" />
              <div className="w-2 h-2 bg-indigo-500 rounded-full bounce-dot" />
              <div className="w-2 h-2 bg-indigo-500 rounded-full bounce-dot" />
            </div>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FolderOpen size={28} className="text-gray-600" />
            </div>
            <h3 className="text-white font-semibold text-lg mb-2">No projects yet</h3>
            <p className="text-gray-400 text-sm mb-6">Create your first AI-generated website</p>
            <button
              onClick={() => setShowNewForm(true)}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-3 rounded-xl transition-colors mx-auto"
            >
              <Plus size={16} />
              Create First Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {projects.map((project) => (
              <ProjectCard
                key={project._id}
                project={project}
                onDelete={handleDelete}
                onOpen={(id) => navigate(`/builder/${id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Projects;
