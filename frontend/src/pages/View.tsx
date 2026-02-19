import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Zap, ArrowLeft } from 'lucide-react';
import api from '../services/api';
import type { CommunityProject } from '../types';

const View = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<CommunityProject | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    api
      .get(`/community/${id}`)
      .then((res) => setProject(res.data.project))
      .catch(() => setError('Project not found or not published'))
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex gap-2">
          <div className="w-2 h-2 bg-indigo-500 rounded-full bounce-dot" />
          <div className="w-2 h-2 bg-indigo-500 rounded-full bounce-dot" />
          <div className="w-2 h-2 bg-indigo-500 rounded-full bounce-dot" />
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-white text-2xl font-bold mb-3">Project Not Found</h2>
          <p className="text-gray-400 mb-6">{error || 'This project does not exist or is not published.'}</p>
          <Link
            to="/community"
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-3 rounded-xl transition-colors mx-auto w-fit"
          >
            <ArrowLeft size={16} />
            Back to Gallery
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-black/90 border-b border-white/5 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Link to="/community" className="p-2 text-gray-400 hover:text-white transition-colors">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-white font-semibold text-sm truncate max-w-xs">{project.title}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <div className="w-4 h-4 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                {project.creator.initials}
              </div>
              <span className="text-gray-400 text-xs">{project.creator.name}</span>
            </div>
          </div>
        </div>
        <Link to="/" className="flex items-center gap-1.5">
          <div className="w-6 h-6 bg-indigo-600 rounded-md flex items-center justify-center">
            <Zap size={12} className="text-white" />
          </div>
          <span className="text-white text-sm font-semibold hidden sm:block">
            WebCraft<span className="text-indigo-400">AI</span>
          </span>
        </Link>
      </div>

      {/* Full iframe */}
      <div className="flex-1">
        <iframe
          srcDoc={project.code}
          sandbox="allow-scripts allow-same-origin allow-forms"
          className="w-full h-full border-0"
          style={{ minHeight: 'calc(100vh - 57px)' }}
          title={project.title}
        />
      </div>
    </div>
  );
};

export default View;
