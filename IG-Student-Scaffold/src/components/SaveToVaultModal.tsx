import React, { useState, useEffect } from 'react';
import { X, Folder, ChevronRight, Plus } from 'lucide-react';
import { VaultFolder, fetchFolders, createFolder, saveScaffold } from '../lib/vaultApi';

interface SaveToVaultModalProps {
  teacherCode: string;
  onClose: () => void;
  scaffoldData: {
    paperType: string;
    targetMarks: string;
    framework: string;
    question: string;
    scaffold_text: string;
    frame_text: string;
  };
}

export function SaveToVaultModal({ teacherCode, onClose, scaffoldData }: SaveToVaultModalProps) {
  const [title, setTitle] = useState('');
  const [folders, setFolders] = useState<VaultFolder[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  useEffect(() => {
    loadFolders();
  }, [teacherCode]);

  const loadFolders = async () => {
    try {
      setLoading(true);
      const f = await fetchFolders(teacherCode);
      setFolders(f);
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

  const handleSave = async () => {
    if (!title.trim()) {
      alert("Please enter a title for the scaffold.");
      return;
    }
    
    // Default to root if no folder selected, but we use "root" or actual ID
    // Let's use 'root' if currentFolderId is null
    const folderId = currentFolderId || 'root';

    try {
      setSaving(true);
      await saveScaffold(teacherCode, folderId, title.trim(), scaffoldData);
      onClose();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const currentFolders = folders.filter(f => f.parent_id === currentFolderId);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
          <h2 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest">Save to Vault</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-y-auto space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Scaffold Title <span className="text-red-500">*</span></label>
            <input 
              type="text" 
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g., Coastal Management Framework"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-sm font-medium text-slate-800 dark:text-slate-100 outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Select Location</label>
            
            <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-3 flex flex-col h-64">
              {/* Path Breadcrumbs */}
              <div className="flex items-center gap-2 mb-3 pb-3 border-b border-slate-200 dark:border-slate-700">
                <button onClick={() => setCurrentFolderId(null)} className="text-[11px] font-bold text-slate-500 hover:text-indigo-600 transition-colors">
                  Vault Root
                </button>
                {currentFolderId && (
                  <>
                    <ChevronRight className="w-3 h-3 text-slate-400" />
                    <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
                      {folders.find(f => f.id === currentFolderId)?.name}
                    </span>
                  </>
                )}
              </div>

              {/* Folder List */}
              <div className="flex-1 overflow-y-auto space-y-1">
                {loading ? (
                  <div className="text-center py-8 text-xs text-slate-400">Loading...</div>
                ) : currentFolders.length === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-400 font-medium italic">Empty Directory</div>
                ) : (
                  currentFolders.map(f => (
                    <div 
                      key={f.id}
                      onClick={() => setCurrentFolderId(f.id)}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer hover:bg-white dark:hover:bg-slate-700 transition-colors group border border-transparent hover:border-slate-200 dark:hover:border-slate-600"
                    >
                      <Folder className="w-4 h-4 text-indigo-500 fill-indigo-100 dark:fill-indigo-900/30 group-hover:scale-110 transition-transform" />
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{f.name}</span>
                    </div>
                  ))
                )}
              </div>

              {/* Create Folder Inline */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-700 mt-2">
                {showNewFolder ? (
                  <form onSubmit={handleCreateFolder} className="flex gap-2">
                    <input 
                      type="text"
                      autoFocus
                      placeholder="Folder name..."
                      value={newFolderName}
                      onChange={e => setNewFolderName(e.target.value)}
                      className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-xs outline-none focus:border-indigo-500"
                    />
                    <button type="submit" className="text-[10px] font-bold bg-indigo-600 text-white px-3 py-1 rounded">Save</button>
                    <button type="button" onClick={() => setShowNewFolder(false)} className="text-[10px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-3 py-1 rounded">Cancel</button>
                  </form>
                ) : (
                  <button 
                    onClick={() => setShowNewFolder(true)}
                    className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> New Folder
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            disabled={saving || !title.trim()}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-lg transition-all"
          >
            {saving ? 'Saving...' : 'Save Document'}
          </button>
        </div>

      </div>
    </div>
  );
}
