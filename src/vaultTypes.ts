export interface VaultReport {
  id: string;
  title: string;
  tags: string[];
  content: string; // Markdown formatted
  date: string;
}

export interface VaultFolderDef {
  id: string;
  name: string;
  paper: 1 | 2;
  color: string;
}

export const VAULT_FOLDERS: VaultFolderDef[] = [
  { id: 'PH1', name: 'PH1: Changing River Environments', paper: 1, color: 'bg-[#facc15] text-[#422006] border-[#eab308]' },
  { id: 'PH2', name: 'PH2: Changing Coastal Environments', paper: 1, color: 'bg-[#1d4ed8] text-white border-[#1e40af]' },
  { id: 'PH3', name: 'PH3: Hazardous Environments', paper: 1, color: 'bg-[#a855f7] text-white border-[#9333ea]' },
  { id: 'PH4', name: 'PH4: Changing Ecosystems', paper: 1, color: 'bg-[#dc2626] text-white border-[#b91c1c]' },
  { id: 'PH5', name: 'PH5: Climate Change', paper: 1, color: 'bg-[#06b6d4] text-[#083344] border-[#0891b2]' },
  { id: 'HU6', name: 'HU6: Changing Population', paper: 2, color: 'bg-[#db2777] text-white border-[#be185d]' },
  { id: 'HU7', name: 'HU7: Changing Towns & Cities', paper: 2, color: 'bg-[#7f1d1d] text-white border-[#450a0a]' },
  { id: 'HU8', name: 'HU8: Development', paper: 2, color: 'bg-[#f97316] text-white border-[#ea580c]' },
  { id: 'HU9', name: 'HU9: Changing Economies', paper: 2, color: 'bg-[#fde047] text-[#422006] border-[#ca8a04]' },
  { id: 'HU10', name: 'HU10: Resource Provision', paper: 2, color: 'bg-[#22c55e] text-[#052e16] border-[#16a34a]' }
];

export const getVaultReports = (): Record<string, VaultReport[]> => {
  if (typeof window === 'undefined') return {};
  const stored = localStorage.getItem('ig_vault_reports');
  return stored ? JSON.parse(stored) : {};
};

export const saveVaultReport = (folderId: string, report: VaultReport) => {
  if (typeof window === 'undefined') return;
  const reports = getVaultReports();
  if (!reports[folderId]) {
    reports[folderId] = [];
  }
  reports[folderId].unshift(report);
  localStorage.setItem('ig_vault_reports', JSON.stringify(reports));
};

export const deleteVaultReport = (folderId: string, reportId: string) => {
  if (typeof window === 'undefined') return;
  const reports = getVaultReports();
  if (reports[folderId]) {
    reports[folderId] = reports[folderId].filter(r => r.id !== reportId);
    localStorage.setItem('ig_vault_reports', JSON.stringify(reports));
  }
};

export const moveVaultReport = (oldFolderId: string, newFolderId: string, reportId: string) => {
  if (typeof window === 'undefined') return;
  const reports = getVaultReports();
  
  if (reports[oldFolderId]) {
    const reportIndex = reports[oldFolderId].findIndex(r => r.id === reportId);
    if (reportIndex !== -1) {
      const [report] = reports[oldFolderId].splice(reportIndex, 1);
      
      if (!reports[newFolderId]) {
        reports[newFolderId] = [];
      }
      reports[newFolderId].unshift(report);
      localStorage.setItem('ig_vault_reports', JSON.stringify(reports));
    }
  }
};
