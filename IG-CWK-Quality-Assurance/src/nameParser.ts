export function parseCandidateName(rawCandidateName: string) {
  let cleanName = rawCandidateName.trim();
  cleanName = cleanName.replace(/^(?:DRAFT|FINAL)[\s,-]+/i, '');
  cleanName = cleanName.replace(/[\s,-]+(?:DRAFT|FINAL)$/i, '');
  cleanName = cleanName.replace(/^\[(?:DRAFT|FINAL)\][\s,-]*/i, '');
  cleanName = cleanName.replace(/[\s,-]*\[(?:DRAFT|FINAL)\]$/i, '');
  cleanName = cleanName.replace(/^\((?:DRAFT|FINAL)\)[\s,-]*/i, '');
  cleanName = cleanName.replace(/[\s,-]*\((?:DRAFT|FINAL)\)$/i, '');

  let surname = '';
  let forename = '';
  let preferredName = '';
  const parts = cleanName.split(',');

  if (parts.length > 2) {
    surname = parts[0]?.trim() || '';
    forename = parts[1]?.trim() || '';
    preferredName = parts.slice(2).join(',').trim();
    if (preferredName.startsWith('(') && preferredName.endsWith(')')) {
      preferredName = preferredName.slice(1, -1);
    }
  } else if (parts.length === 2) {
    surname = parts[0]?.trim() || '';
    forename = parts[1]?.trim() || '';
    
    // Check if the forename contains the preferred name in parentheses
    const match = forename.match(/^(.*?)\s*\((.*?)\)?$/);
    if (match) {
      forename = match[1].trim();
      preferredName = match[2].trim();
    }
  } else {
    // old format without commas
    const match = cleanName.match(/^(.*?)\s*\((.*?)\)?$/);
    let baseName = cleanName.trim();
    if (match) {
      baseName = match[1].trim();
      preferredName = match[2].trim();
    }
    const nameParts = baseName.split(/\s+/);
    if (nameParts.length > 1) {
      const koreanSurnames = ['kim', 'lee', 'lim', 'choi', 'yang', 'park', 'jeong', 'jung', 'kang', 'cho', 'yoon', 'jang', 'han', 'shin', 'oh', 'seo', 'song', 'hwang'];
      const firstWordLower = nameParts[0].toLowerCase();
      
      if (koreanSurnames.includes(firstWordLower)) {
        surname = nameParts[0];
        forename = nameParts.slice(1).join(' ');
      } else {
        surname = nameParts[nameParts.length - 1] || ''; // default to last word as surname
        forename = nameParts.slice(0, -1).join(' ');
      }
    } else {
      surname = nameParts[0] || '';
      forename = '';
    }
  }

  const formattedName = preferredName 
      ? `${surname}, ${forename}, (${preferredName})` 
      : `${surname}, ${forename}`;

  return { surname, forename, preferredName, formattedName };
}
