const fs = require('fs');

const files = [
  'src/components/ArchiveModal.tsx',
  'src/components/LoadingView.tsx',
  'src/components/ModerationResults.tsx',
  'src/components/UploadView.tsx',
  'src/components/DirectoryView.tsx'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  // replace #00bda5 with blue-600 because it was usually in bg-[#00bda5] or text-[#00bda5] etc.
  // wait, if I replace #00bda5 with blue-600, it'll become bg-[blue-600] which is invalid tailwind.
  // actually in tailwind it's just bg-blue-600.
  content = content.replace(/bg-\[#00bda5\]/g, 'bg-blue-600');
  content = content.replace(/text-\[#00bda5\]/g, 'text-blue-600');
  content = content.replace(/border-\[#00bda5\]/g, 'border-blue-600');
  content = content.replace(/border-t-\[#00bda5\]/g, 'border-t-blue-600');
  content = content.replace(/accent-\[#00bda5\]/g, 'accent-blue-600');
  
  // same for dark mode greens
  content = content.replace(/bg-green-600/g, 'bg-blue-600');
  content = content.replace(/text-green-500/g, 'text-blue-500');
  content = content.replace(/border-t-green-500/g, 'border-t-blue-500');
  content = content.replace(/dark:text-green-500/g, 'dark:text-blue-500');
  content = content.replace(/dark:bg-green-600/g, 'dark:bg-blue-600');
  content = content.replace(/bg-green-50/g, 'bg-blue-50');
  content = content.replace(/dark:bg-green-900/g, 'dark:bg-blue-900');
  content = content.replace(/text-green-700/g, 'text-blue-700');
  content = content.replace(/dark:text-green-400/g, 'dark:text-blue-400');
  content = content.replace(/border-green-100/g, 'border-blue-100');
  content = content.replace(/dark:border-green-800/g, 'dark:border-blue-800');
  content = content.replace(/dark:border-green-900/g, 'dark:border-blue-900');
  content = content.replace(/text-green-600/g, 'text-blue-600');
  content = content.replace(/hover:bg-\[#00a893\]/g, 'hover:bg-blue-700');
  content = content.replace(/bg-\[#00a893\]/g, 'bg-blue-700');
  
  fs.writeFileSync(file, content);
}
console.log('Colors replaced successfully!');
