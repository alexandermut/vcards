import { HistoryItem } from '../types';
import { parseVCardString } from './vcardUtils';

export const generateJSON = (history: HistoryItem[]): string => {
    const exportData = {
        version: "1.0",
        exportedAt: new Date().toISOString(),
        contacts: history.map(item => {
            const parsed = parseVCardString(item.vcard);
            return {
                id: item.id,
                name: item.name,
                organization: item.org,
                vcardData: parsed.data,
                rawVCard: item.vcard,
                source: item.images && item.images.length > 0 ? 'scan' : 'manual',
                timestamp: item.timestamp,
                createdAt: new Date(item.timestamp).toISOString()
            };
        })
    };

    return JSON.stringify(exportData, null, 2);
};

export const downloadJSON = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};
