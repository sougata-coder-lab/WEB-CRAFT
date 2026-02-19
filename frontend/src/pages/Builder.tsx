import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Zap, ArrowLeft, Monitor, Tablet, Smartphone, Save, Download, Globe, GlobeLock,
  Wand2, Send, History, Code2, X, RotateCcw, Loader2,
  Check, Copy, Eye
} from 'lucide-react';
import { toast } from 'sonner';
import api from '../services/api';
import type { Project, DeviceType } from '../types';

// ─── Generation Steps ────────────────────────────────────────────────────────
const GEN_STEPS = [
  'Analyzing your prompt...',
  'Generating layout structure...',
  'Writing HTML & CSS...',
  'Adding interactivity...',
  'Finalizing your website...',
];

// ─── Device widths ────────────────────────────────────────────────────────────
const DEVICE_WIDTHS: Record<DeviceType, string> = {
  mobile: '412px',
  tablet: '768px',
  desktop: '100%',
};

// ─── Chat Message ─────────────────────────────────────────────────────────────
interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// ─── Builder Component ────────────────────────────────────────────────────────
const Builder = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Project state
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [code, setCode] = useState('');

  // UI state
  const [device, setDevice] = useState<DeviceType>('desktop');
  const [showEditor, setShowEditor] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [editorCode, setEditorCode] = useState('');
  const [copied, setCopied] = useState(false);

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [genStep, setGenStep] = useState('');
  const [prompt, setPrompt] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);

  // Save/publish state
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isPublished, setIsPublished] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // ── Load project ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!id || id === 'new') {
      setIsLoading(false);
      return;
    }
    loadProject();
  }, [id]);

  const loadProject = async () => {
    try {
      const res = await api.get(`/projects/${id}`);
      const p: Project = res.data.project;
      setProject(p);
      setCode(p.code || '');
      setEditorCode(p.code || '');
      setIsPublished(p.isPublished);
      setPrompt(p.prompt || '');
      if (p.prompt) {
        setChatHistory([
          {
            role: 'user',
            content: p.prompt,
            timestamp: new Date(p.createdAt),
          },
          {
            role: 'assistant',
            content: p.code ? '✅ Website generated successfully!' : 'Project created. Click Generate to build your website.',
            timestamp: new Date(p.createdAt),
          },
        ]);
      }
    } catch {
      toast.error('Failed to load project');
      navigate('/projects');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Scroll chat to bottom ─────────────────────────────────────────────────
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  // ── Generate / Revise ─────────────────────────────────────────────────────
  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }
    if (!project && id !== 'new') {
      toast.error('Project not loaded');
      return;
    }

    setIsGenerating(true);
    let stepIdx = 0;
    setGenStep(GEN_STEPS[0]);
    const stepInterval = setInterval(() => {
      stepIdx = (stepIdx + 1) % GEN_STEPS.length;
      setGenStep(GEN_STEPS[stepIdx]);
    }, 1800);

    // Add user message to chat
    const userMsg: ChatMessage = { role: 'user', content: prompt, timestamp: new Date() };
    setChatHistory((prev) => [...prev, userMsg]);
    const currentPrompt = prompt;
    setPrompt('');

    try {
      let projectId = id;

      // If new project, create it first
      if (!project || id === 'new') {
        const createRes = await api.post('/projects', {
          title: currentPrompt.slice(0, 100),
          prompt: currentPrompt,
        });
        projectId = createRes.data.project._id;
        setProject(createRes.data.project);
        navigate(`/builder/${projectId}`, { replace: true });
      }

      // Generate code
      const genRes = await api.post(`/projects/${projectId}/generate`, {
        prompt: currentPrompt,
        useExisting: !!code,
      });

      const newCode = genRes.data.code;
      setCode(newCode);
      setEditorCode(newCode);
      setProject(genRes.data.project);

      clearInterval(stepInterval);
      setGenStep('');

      const assistantMsg: ChatMessage = {
        role: 'assistant',
        content: '✅ Website updated! You can see the preview on the right.',
        timestamp: new Date(),
      };
      setChatHistory((prev) => [...prev, assistantMsg]);
      toast.success('Website generated!');
    } catch (err: any) {
      clearInterval(stepInterval);
      setGenStep('');
      const errMsg = err.response?.data?.message || 'Generation failed. Please try again.';
      toast.error(errMsg);
      setChatHistory((prev) => [
        ...prev,
        { role: 'assistant', content: `❌ Error: ${errMsg}`, timestamp: new Date() },
      ]);
    } finally {
      setIsGenerating(false);
    }
  }, [prompt, project, id, code, navigate]);

  // ── Save project ──────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!project?._id) return;
    setIsSaving(true);
    try {
      await api.put(`/projects/${project._id}`, {
        code: editorCode || code,
        addVersion: false,
      });
      setCode(editorCode || code);
      toast.success('Project saved!');
    } catch {
      toast.error('Failed to save project');
    } finally {
      setIsSaving(false);
    }
  };

  // ── Apply editor changes ──────────────────────────────────────────────────
  const handleApplyEditorChanges = () => {
    setCode(editorCode);
    toast.success('Changes applied to preview');
  };

  // ── Download HTML ─────────────────────────────────────────────────────────
  const handleDownload = () => {
    if (!code) {
      toast.error('No code to download');
      return;
    }
    const blob = new Blob([code], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project?.title?.replace(/[^a-z0-9]/gi, '-').toLowerCase() || 'website'}.html`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Downloaded!');
  };

  // ── Publish / Unpublish ───────────────────────────────────────────────────
  const handlePublish = async () => {
    if (!project?._id) return;
    if (!code) {
      toast.error('Generate a website first before publishing');
      return;
    }
    setIsPublishing(true);
    try {
      const res = await api.put(`/projects/${project._id}/publish`);
      setIsPublished(res.data.isPublished);
      toast.success(res.data.message);
    } catch {
      toast.error('Failed to update publish status');
    } finally {
      setIsPublishing(false);
    }
  };

  // ── Copy code ─────────────────────────────────────────────────────────────
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Code copied!');
  };

  // ── Rollback version ──────────────────────────────────────────────────────
  const handleRollback = async (versionIndex: number) => {
    if (!project?._id) return;
    try {
      const res = await api.post(`/projects/${project._id}/rollback/${versionIndex}`);
      setCode(res.data.code);
      setEditorCode(res.data.code);
      setProject(res.data.project);
      setShowHistory(false);
      toast.success('Rolled back to version ' + (versionIndex + 1));
    } catch {
      toast.error('Failed to rollback');
    }
  };

  // ── Key handler for prompt ────────────────────────────────────────────────
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
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

  return (
    <div className="h-screen bg-black flex flex-col overflow-hidden">
      {/* ── Top Bar ── */}
      <header className="flex items-center justify-between px-4 py-2.5 bg-gray-950 border-b border-white/5 flex-shrink-0">
        <div className="flex items-center gap-3">
          <Link to="/projects" className="p-1.5 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5">
            <ArrowLeft size={18} />
          </Link>
          <Link to="/" className="flex items-center gap-1.5">
            <div className="w-6 h-6 bg-indigo-600 rounded-md flex items-center justify-center">
              <Zap size={12} className="text-white" />
            </div>
            <span className="text-white text-sm font-bold hidden sm:block">
              WebCraft<span className="text-indigo-400">AI</span>
            </span>
          </Link>
          {project && (
            <span className="text-gray-600 text-sm hidden md:block truncate max-w-xs">
              / {project.title}
            </span>
          )}
        </div>

        {/* Device toggles */}
        <div className="flex items-center gap-1 bg-black rounded-xl p-1 border border-white/5">
          {(['desktop', 'tablet', 'mobile'] as DeviceType[]).map((d) => (
            <button
              key={d}
              onClick={() => setDevice(d)}
              className={`p-1.5 rounded-lg transition-colors ${
                device === d ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:text-white'
              }`}
              title={d}
            >
              {d === 'desktop' && <Monitor size={15} />}
              {d === 'tablet' && <Tablet size={15} />}
              {d === 'mobile' && <Smartphone size={15} />}
            </button>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {code && (
            <button
              onClick={handleCopy}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-gray-400 hover:text-white border border-white/10 hover:border-white/20 rounded-lg text-xs transition-colors"
            >
              {copied ? <Check size={13} /> : <Copy size={13} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          )}
          <button
            onClick={() => setShowHistory(!showHistory)}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-xs transition-colors ${
              showHistory
                ? 'bg-indigo-600/20 border-indigo-500/40 text-indigo-300'
                : 'text-gray-400 hover:text-white border-white/10 hover:border-white/20'
            }`}
          >
            <History size={13} />
            History
          </button>
          <button
            onClick={() => setShowEditor(!showEditor)}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-xs transition-colors ${
              showEditor
                ? 'bg-indigo-600/20 border-indigo-500/40 text-indigo-300'
                : 'text-gray-400 hover:text-white border-white/10 hover:border-white/20'
            }`}
          >
            <Code2 size={13} />
            Editor
          </button>
          <button
            onClick={handleDownload}
            disabled={!code}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-gray-400 hover:text-white border border-white/10 hover:border-white/20 rounded-lg text-xs transition-colors disabled:opacity-40"
          >
            <Download size={13} />
            Download
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || !project}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-lg text-xs transition-colors disabled:opacity-40"
          >
            {isSaving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
            Save
          </button>
          <button
            onClick={handlePublish}
            disabled={isPublishing || !project || !code}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-40 ${
              isPublished
                ? 'bg-green-600/20 border border-green-500/40 text-green-300 hover:bg-red-600/20 hover:border-red-500/40 hover:text-red-300'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white'
            }`}
          >
            {isPublishing ? (
              <Loader2 size={13} className="animate-spin" />
            ) : isPublished ? (
              <Globe size={13} />
            ) : (
              <GlobeLock size={13} />
            )}
            {isPublished ? 'Published' : 'Publish'}
          </button>
        </div>
      </header>

      {/* ── Main Content ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* ── Left Panel: Chat / Prompt ── */}
        <div className="w-80 flex-shrink-0 flex flex-col bg-gray-950 border-r border-white/5 overflow-hidden">
          {/* Chat history */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {chatHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-8">
                <div className="w-12 h-12 bg-indigo-600/10 rounded-2xl flex items-center justify-center mb-3">
                  <Wand2 size={20} className="text-indigo-400" />
                </div>
                <p className="text-gray-400 text-sm font-medium mb-1">Start building</p>
                <p className="text-gray-600 text-xs">Describe the website you want to create</p>
              </div>
            ) : (
              chatHistory.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                      msg.role === 'user'
                        ? 'bg-indigo-600 text-white rounded-br-sm'
                        : 'bg-gray-900 text-gray-200 rounded-bl-sm border border-white/5'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))
            )}

            {/* Generation indicator */}
            {isGenerating && (
              <div className="flex justify-start animate-fade-in">
                <div className="bg-gray-900 border border-white/5 rounded-2xl rounded-bl-sm px-4 py-3">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full bounce-dot" />
                      <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full bounce-dot" />
                      <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full bounce-dot" />
                    </div>
                  </div>
                  <p className="text-indigo-300 text-xs">{genStep}</p>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Prompt input */}
          <div className="p-3 border-t border-white/5">
            <div className="relative bg-black border border-white/10 rounded-xl overflow-hidden focus-within:border-indigo-500 transition-colors">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={code ? 'Describe changes to make...' : 'Describe the website you want...'}
                rows={3}
                disabled={isGenerating}
                className="w-full bg-transparent text-white placeholder-gray-600 px-3 pt-3 pb-2 text-sm resize-none focus:outline-none"
              />
              <div className="flex items-center justify-between px-3 pb-2">
                <span className="text-gray-700 text-xs">Enter to send</span>
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || !prompt.trim()}
                  className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                >
                  {isGenerating ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <Send size={12} />
                  )}
                  {code ? 'Revise' : 'Generate'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Center: iframe Preview ── */}
        <div className="flex-1 flex flex-col overflow-hidden bg-gray-900">
          {/* Preview area */}
          <div className="flex-1 flex items-start justify-center overflow-auto p-4">
            {code ? (
              <div
                className="bg-white rounded-lg overflow-hidden shadow-2xl transition-all duration-300"
                style={{
                  width: DEVICE_WIDTHS[device],
                  minHeight: '100%',
                  maxWidth: '100%',
                }}
              >
                <iframe
                  ref={iframeRef}
                  srcDoc={code}
                  sandbox="allow-scripts allow-same-origin allow-forms"
                  className="w-full border-0"
                  style={{ height: 'calc(100vh - 130px)', minHeight: '500px' }}
                  title="Website Preview"
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-20 h-20 bg-gray-800 rounded-3xl flex items-center justify-center mb-4">
                  <Monitor size={32} className="text-gray-600" />
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">No preview yet</h3>
                <p className="text-gray-500 text-sm max-w-xs">
                  Enter a prompt on the left and click Generate to build your website
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── Right Panel: Code Editor ── */}
        {showEditor && (
          <div className="w-96 flex-shrink-0 flex flex-col bg-gray-950 border-l border-white/5 animate-slide-in-right">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <Code2 size={14} className="text-indigo-400" />
                <span className="text-white text-sm font-medium">Code Editor</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleApplyEditorChanges}
                  className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-500 text-white px-2.5 py-1 rounded-lg text-xs transition-colors"
                >
                  <Eye size={11} />
                  Apply
                </button>
                <button
                  onClick={() => setShowEditor(false)}
                  className="p-1 text-gray-500 hover:text-white transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
            <textarea
              value={editorCode}
              onChange={(e) => setEditorCode(e.target.value)}
              className="flex-1 bg-black text-green-400 font-mono text-xs p-4 resize-none focus:outline-none leading-relaxed"
              spellCheck={false}
              placeholder="HTML code will appear here after generation..."
            />
            <div className="px-4 py-2 border-t border-white/5 flex items-center justify-between">
              <span className="text-gray-600 text-xs">{editorCode.length} chars</span>
              <button
                onClick={() => { setEditorCode(code); toast.success('Reset to current version'); }}
                className="text-gray-500 hover:text-white text-xs flex items-center gap-1 transition-colors"
              >
                <RotateCcw size={11} />
                Reset
              </button>
            </div>
          </div>
        )}

        {/* ── Right Panel: Version History ── */}
        {showHistory && !showEditor && (
          <div className="w-72 flex-shrink-0 flex flex-col bg-gray-950 border-l border-white/5 animate-slide-in-right">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <History size={14} className="text-indigo-400" />
                <span className="text-white text-sm font-medium">Version History</span>
              </div>
              <button
                onClick={() => setShowHistory(false)}
                className="p-1 text-gray-500 hover:text-white transition-colors"
              >
                <X size={14} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {!project?.versions || project.versions.length === 0 ? (
                <div className="text-center py-8">
                  <History size={24} className="text-gray-600 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">No versions yet</p>
                </div>
              ) : (
                [...project.versions].reverse().map((version, i) => {
                  const actualIndex = project.versions.length - 1 - i;
                  return (
                    <div
                      key={i}
                      className="bg-gray-900 border border-white/5 rounded-xl p-3 hover:border-indigo-500/30 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <p className="text-white text-xs font-medium">Version {actualIndex + 1}</p>
                          <p className="text-gray-500 text-xs mt-0.5">
                            {new Date(version.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <button
                          onClick={() => handleRollback(actualIndex)}
                          className="flex items-center gap-1 bg-indigo-600/20 hover:bg-indigo-600 border border-indigo-500/30 text-indigo-300 hover:text-white px-2 py-1 rounded-lg text-xs transition-colors"
                        >
                          <RotateCcw size={10} />
                          Restore
                        </button>
                      </div>
                      <p className="text-gray-400 text-xs truncate">{version.prompt}</p>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Builder;
