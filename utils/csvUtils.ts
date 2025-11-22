import { HistoryItem, VCardData } from '../types';
import { parseVCardString } from './vcardUtils';

export const generateCSV = (history: HistoryItem[]): string => {
  // Outlook / Google Contacts compatible headers
  const headers = [
    'First Name',
    'Middle Name',
    'Last Name',
    'Title',
    'Company',
    'Department',
    'Job Title',
    'Business Street',
    'Business City',
    'Business Postal Code',
    'Business State',
    'Business Country',
    'Business Phone',
    'Mobile Phone',
    'Home Phone',
    'Business Fax',
    'Email Address',
    'Email 2',
    'Email 3',
    'Web Page',
    'LinkedIn URL',
    'Xing URL',
    'Notes',
    'Birthday'
  ];

  const escapeCsv = (str: string | undefined | null) => {
    if (!str) return '';
    const escaped = str.replace(/"/g, '""');
    return `"${escaped}"`;
  };

  const rows = history.map(item => {
    const parsed = parseVCardString(item.vcard);
    const data = parsed.data;

    // --- Name Parsing ---
    let firstName = '';
    let middleName = '';
    let lastName = '';
    let title = data.title || '';

    if (data.n) {
      // N:Family;Given;Middle;Prefix;Suffix
      const parts = data.n.split(';');
      lastName = parts[0] || '';
      firstName = parts[1] || '';
      middleName = parts[2] || '';
      if (parts[3] && !title) title = parts[3]; // Use prefix as title if title is empty
    } else if (data.fn) {
      // Fallback: Try to split FN
      const parts = data.fn.split(' ');
      if (parts.length > 1) {
        lastName = parts.pop() || '';
        firstName = parts.join(' ');
      } else {
        firstName = parts[0] || ''; // Single name -> First Name
      }
    }

    // --- Address Parsing ---
    // Prefer WORK address, fallback to first available
    const adr = data.adr?.find(a => a.type && (a.type.toUpperCase().includes('WORK') || a.type.toUpperCase().includes('DOM') || a.type.toUpperCase().includes('INTl'))) || data.adr?.[0];

    // --- Phone Parsing ---
    const getPhone = (typeQuery: string) =>
      data.tel?.find(t => t.type.toUpperCase().includes(typeQuery))?.value;

    const workPhone = getPhone('WORK') || getPhone('VOICE'); // Fallback to generic voice
    const mobilePhone = getPhone('CELL') || getPhone('MOBILE');
    const homePhone = getPhone('HOME');
    const fax = getPhone('FAX');

    // --- Email Parsing ---
    const emails = data.email?.map(e => e.value) || [];

    // --- Social Media Parsing ---
    const getUrl = (query: string) =>
      data.url?.find(u => u.value.toLowerCase().includes(query) || (u.type && u.type.toUpperCase().includes(query.toUpperCase())))?.value;

    const linkedIn = getUrl('linkedin');
    const xing = getUrl('xing');
    // Generic website: First URL that is NOT social media
    const website = data.url?.find(u =>
      !u.value.toLowerCase().includes('linkedin') &&
      !u.value.toLowerCase().includes('xing') &&
      !u.value.toLowerCase().includes('twitter') &&
      !u.value.toLowerCase().includes('facebook')
    )?.value;

    return [
      escapeCsv(firstName),
      escapeCsv(middleName),
      escapeCsv(lastName),
      escapeCsv(title),
      escapeCsv(data.org),
      escapeCsv(data.role), // Mapping Role to Department/Job Title is tricky. Usually Role = Job Title.
      escapeCsv(data.role), // Using Role for Job Title as well
      escapeCsv(adr?.value.street),
      escapeCsv(adr?.value.city),
      escapeCsv(adr?.value.zip),
      escapeCsv(adr?.value.region),
      escapeCsv(adr?.value.country),
      escapeCsv(workPhone),
      escapeCsv(mobilePhone),
      escapeCsv(homePhone),
      escapeCsv(fax),
      escapeCsv(emails[0]),
      escapeCsv(emails[1]),
      escapeCsv(emails[2]),
      escapeCsv(website),
      escapeCsv(linkedIn),
      escapeCsv(xing),
      escapeCsv(data.note),
      escapeCsv(data.bday)
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