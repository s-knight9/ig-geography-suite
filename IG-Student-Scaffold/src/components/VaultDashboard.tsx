import React, { useState, useEffect } from 'react';
import { Folder, FileText, Search, Plus, Trash2, ChevronRight, X, Clock, Frame } from 'lucide-react';
import { VaultFolder, VaultScaffold, fetchFolders, fetchScaffolds, createFolder, deleteFolder, deleteScaffold } from '../lib/vaultApi';

interface VaultDashboardProps {
  teacherCode: string;
  onClose: () => void;
  onSelectScaffold: (scaffold: VaultScaffold) => void;
}

export function VaultDashboard({ teacherCode, onClose, onSelectScaffold }: VaultDashboardProps) {
  const [folders, setFolders] = useState<VaultFolder[]>([]);
  const [scaffolds, setScaffolds] = useState<VaultScaffold[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [newFolderName, setNewFolderName] = useState('');
  const [showNewFolder, setShowNewFolder] = useState(false);

  useEffect(() => {
    loadVault();
  }, [teacherCode]);

  const loadVault = async () => {
    try {
      setLoading(true);
      const [f, s] = await Promise.all([
        fetchFolders(teacherCode),
        fetchScaffolds(teacherCode)
      ]);
      setFolders(f);
      setScaffolds(s);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    try {
      const f = await createFolder(teacherCode, newFolderName.trim(), currentFolderId);
      setFolders([...folders, f]);
      setNewFolderName('');
      setShowNewFolder(false);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteFolder = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Delete this folder and all contents?')) return;
    try {
      await deleteFolder(id, teacherCode);
      await loadVault();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteScaffold = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Delete this scaffold?')) return;
    try {
      await deleteScaffold(id, teacherCode);
      setScaffolds(scaffolds.filter(s => s.id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Derived state
  const currentFolders = folders.filter(f => f.parent_id === currentFolderId);
  const currentScaffolds = scaffolds.filter(s => s.folder_id === currentFolderId);

  const filteredFolders = search 
    ? folders.filter(f => f.name.toLowerCase().includes(search.toLowerCase()))
    : currentFolders;
  const filteredScaffolds = search 
    ? scaffolds.filter(s => s.title.toLowerCase().includes(search.toLowerCase()) || s.tags?.toLowerCase().includes(search.toLowerCase()))
    : currentScaffolds;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-end">
      <div className="w-[800px] h-full bg-slate-50 dark:bg-slate-950 shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800 transition-colors animate-in slide-in-from-right">
        
        {/* Header */}
        <div className="h-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 shrink-0 relative z-20">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
              <Frame className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-800 dark:text-white tracking-tight">Saved Scaffolds</h1>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 block">Scaffold Manager</span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="px-8 py-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setCurrentFolderId(null)}
              className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"
            >
              Vault Root
            </button>
            {currentFolderId && (
              <>
                <ChevronRight className="w-4 h-4 text-slate-300" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {folders.find(f => f.id === currentFolderId)?.name}
                </span>
              </>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text"
                placeholder="Search vault..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border border-transparent rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 focus:bg-white focus:border-indigo-500 outline-none w-64 transition-all"
              />
            </div>
            <button 
              onClick={() => setShowNewFolder(!showNewFolder)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors"
            >
              <Plus className="w-4 h-4" /> New Folder
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          {showNewFolder && (
            <form onSubmit={handleCreateFolder} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-indigo-200 dark:border-indigo-900/50 flex gap-3 shadow-sm">
              <input 
                type="text"
                placeholder="Folder name..."
                value={newFolderName}
                onChange={e => setNewFolderName(e.target.value)}
                autoFocus
                className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-sm text-slate-700 dark:text-slate-200 outline-none focus:border-indigo-500"
              />
              <button type="submit" className="px-6 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700">Create</button>
              <button type="button" onClick={() => setShowNewFolder(false)} className="px-6 py-2 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-lg hover:bg-slate-300 dark:hover:bg-slate-700">Cancel</button>
            </form>
          )}

          {loading ? (
            <div className="text-center py-12 text-slate-400 font-medium">Loading Vault...</div>
          ) : filteredFolders.length === 0 && filteredScaffolds.length === 0 ? (
            <div className="text-center py-20 flex flex-col items-center">
              <Folder className="w-16 h-16 text-slate-200 dark:text-slate-800 mb-4" />
              <p className="text-sm font-bold text-slate-400">This folder is empty.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {filteredFolders.map(folder => (
                <div 
                  key={folder.id}
                  onClick={() => { setSearch(''); setCurrentFolderId(folder.id); }}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex items-center justify-between cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-800 hover:shadow-md transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <Folder className="w-6 h-6 text-indigo-500 fill-indigo-100 dark:fill-indigo-900/30" />
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{folder.name}</span>
                  </div>
                  <button 
                    onClick={(e) => handleDeleteFolder(folder.id, e)}
                    className="p-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {filteredScaffolds.map(scaffold => (
                <div 
                  key={scaffold.id}
                  onClick={() => { onSelectScaffold(scaffold); onClose(); }}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex items-center justify-between cursor-pointer hover:border-blue-300 dark:hover:border-blue-800 hover:shadow-md transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">{scaffold.title}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] font-black uppercase text-slate-400">{scaffold.paperType}</span>
                        <span className="text-[10px] font-black uppercase text-slate-400">{scaffold.targetMarks}</span>
                        <span className="text-[10px] font-black uppercase text-slate-400">{scaffold.framework}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(scaffold.created_at).toLocaleDateString()}
                    </span>
                    <button 
                      onClick={(e) => handleDeleteScaffold(scaffold.id, e)}
                      className="p-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
