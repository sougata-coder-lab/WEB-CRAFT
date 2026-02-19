import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe, ExternalLink, Users } from 'lucide-react';
import { toast } from 'sonner';
import api from '../services/api';
import type { CommunityProject } from '../types';

const CommunityCard = ({ project }: { project: CommunityProject }) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/view/${project.id}`)}
      className="group bg-gray-950 border border-white/10 rounded-2xl overflow-hidden hover:border-indigo-500/30 transition-all cursor-pointer"
    >
      {/* Preview */}
      <div className="relative h-44 bg-gray-900 overflow-hidden">
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
            <Globe size={24} className="text-gray-600" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="bg-indigo-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1">
            <ExternalLink size={12} />
            View Site
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="text-white font-semibold text-sm truncate mb-1">{project.title}</h3>
        <p className="text-gray-500 text-xs truncate mb-3">{project.prompt}</p>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
            {project.creator.initials}
          </div>
          <span className="text-gray-400 text-xs truncate">{project.creator.name}</span>
        </div>
      </div>
    </div>
  );
};

const Community = () => {
  const [projects, setProjects] = useState<CommunityProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    fetchProjects(1);
  }, []);

  const fetchProjects = async (pageNum: number) => {
    try {
      const res = await api.get(`/community?page=${pageNum}&limit=12`);
      const { projects: newProjects, pagination } = res.data;
      if (pageNum === 1) {
        setProjects(newProjects);
      } else {
        setProjects((prev) => [...prev, ...newProjects]);
      }
      setTotalCount(pagination.total);
      setHasMore(pageNum < pagination.pages);
      setPage(pageNum);
    } catch {
      toast.error('Failed to load community projects');
    } finally {
      setIsLoading(false);
    }
  };

  const loadMore = () => {
    fetchProjects(page + 1);
  };

  return (
    <div className="min-h-screen bg-black pt-24 pb-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 bg-indigo-600/10 border border-indigo-500/20 rounded-full px-4 py-2 mb-6">
            <Users size={14} className="text-indigo-400" />
            <span className="text-indigo-300 text-sm font-medium">Community Gallery</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">
            Explore AI-Generated Websites
          </h1>
          <p className="text-gray-400 text-lg">
            {totalCount > 0 ? `${totalCount} websites` : 'Websites'} built by the community
          </p>
        </div>

        {/* Grid */}
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
              <Globe size={28} className="text-gray-600" />
            </div>
            <h3 className="text-white font-semibold text-lg mb-2">No published websites yet</h3>
            <p className="text-gray-400 text-sm">Be the first to publish your AI-generated website!</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {projects.map((project) => (
                <CommunityCard key={project.id} project={project} />
              ))}
            </div>

            {hasMore && (
              <div className="text-center mt-10">
                <button
                  onClick={loadMore}
                  className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium px-6 py-3 rounded-xl transition-colors mx-auto"
                >
                  Load More
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Community;
