import { HistoryItem, VCardData } from '../types';
import { parseVCardString } from './vcardUtils';

export const generateCSV = (history: HistoryItem[]): string => {
  const headers = [
    'Vorname',
    'Nachname',
    'Firma',
    'Titel',
    'Email (Geschäftlich)',
    'Telefon (Geschäftlich)',
    'Mobil',
    'Webseite',
    'Notizen',
    'Erstellt am'
  ];

  const escapeCsv = (str: string | undefined) => {
    if (!str) return '';
    const escaped = str.replace(/"/g, '""');
    return `"${escaped}"`;
  };

  const rows = history.map(item => {
    const parsed = parseVCardString(item.vcard);
    const data = parsed.data;

    // Parse Name N:Family;Given...
    let familyName = '';
    let givenName = '';
    if (data.n) {
      const parts = data.n.split(';'); // Note: In vcardUtils we joined them with space, but raw N logic might differ. 
      // Actually vcardUtils.ts logic for N simplifies it to a string "Family Given".
      // Let's try to split FN or N string for CSV best effort
      const nameParts = (data.n || data.fn || '').split(' ');
      if (nameParts.length > 1) {
          familyName = nameParts.pop() || '';
          givenName = nameParts.join(' ');
      } else {
          familyName = nameParts[0] || '';
      }
    }

    // Extract specific types
    const workEmail = data.email?.find(e => e.type.toUpperCase().includes('WORK') || e.type.toUpperCase().includes('INTERNET'))?.value || data.email?.[0]?.value;
    const workPhone = data.tel?.find(t => t.type.toUpperCase().includes('WORK'))?.value;
    const cellPhone = data.tel?.find(t => t.type.toUpperCase().includes('CELL') || t.type.toUpperCase().includes('MOBILE'))?.value;
    const website = data.url?.[0]?.value;

    return [
      escapeCsv(givenName),
      escapeCsv(familyName),
      escapeCsv(data.org),
      escapeCsv(data.title),
      escapeCsv(workEmail),
      escapeCsv(workPhone),
      escapeCsv(cellPhone),
      escapeCsv(website),
      escapeCsv(data.note),
      escapeCsv(new Date(item.timestamp).toLocaleDateString('de-DE'))
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
};

export const downloadCSV = (content: string, filename: string = 'kontakte_export.csv') => {
  // Add BOM (\uFEFF) so Excel recognizes UTF-8 encoding correctly
  const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};