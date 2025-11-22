import React from 'react';
import { X, Trash2, Upload, FileText, Download, History, Contact, Image as ImageIcon } from 'lucide-react';
import { HistoryItem, Language } from '../types';
import { generateCSV, downloadCSV } from '../utils/csvUtils';
import { downloadVCard, generateContactFilename, getTimestamp } from '../utils/vcardUtils';
import { combineImages } from '../utils/imageUtils';
import { translations } from '../utils/translations';
import JSZip from 'jszip';

interface HistorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onLoad: (item: HistoryItem) => void;
  onDelete: (id: string) => void;
  onClear: () => void;
  lang: Language;
}

export const HistorySidebar: React.FC<HistorySidebarProps> = ({
  isOpen, onClose, history, onLoad, onDelete, onClear, lang
}) => {
  const t = translations[lang];

  const handleExportCSV = () => {
    const csv = generateCSV(history);
    downloadCSV(csv, `${getTimestamp()}_vcard_export.csv`);
  };

  const handleExportAllVCF = () => {
    const vcfContent = history.map(item => item.vcard).join('\n');
    downloadVCard(vcfContent, `${getTimestamp()}_vcard_backup_all.vcf`);
  };

  const handleDownloadSingle = (item: HistoryItem) => {
    const filename = generateContactFilename({ fn: item.name, org: item.org }) + '.vcf';
    downloadVCard(item.vcard, filename);
  };

  const handleExportImages = async () => {
    const zip = new JSZip();
    const folder = zip.folder("scans");

    if (!folder) return;

    // Find items with images
    const itemsWithImages = history.filter(item => item.images && item.images.length > 0);

    if (itemsWithImages.length === 0) {
      alert("Keine Bilder zum Exportieren gefunden.");
      return;
    }

    for (const item of itemsWithImages) {
      if (!item.images) continue;

      const baseFilename = generateContactFilename({ fn: item.name, org: item.org });

      // Combine front and back if multiple
      try {
        const combinedBlob = await combineImages(item.images[0], item.images[1]);
        folder.file(`${baseFilename}.jpg`, combinedBlob);
      } catch (e) {
        console.error("Failed to combine images for", item.name, e);
      }
    }

    zip.generateAsync({ type: "blob" }).then((content) => {
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${getTimestamp()}_vcard_scans.zip`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      <div className={`fixed top-0 right-0 h-full w-80 sm:w-96 bg-white dark:bg-slate-950 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out border-l border-slate-200 dark:border-slate-800 flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>

        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2 text-slate-800 dark:text-slate-100 font-semibold">
            <History size={20} className="text-blue-600 dark:text-blue-400" />
            <h3>{t.historyTitle} ({history.length})</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-md transition-colors text-slate-500">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {history.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 text-center">
              <History size={48} className="mb-4 opacity-20" />
              <p>{t.noHistory}</p>
              <p className="text-xs mt-2">{t.noHistoryHint}</p>
            </div>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                onClick={() => { onLoad(item); onClose(); }}
                className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 transition-all cursor-pointer relative"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="overflow-hidden mr-2">
                    <h4 className="font-medium text-slate-900 dark:text-slate-100 text-sm truncate">{item.name || 'Unbekannt'}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{item.org}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {item.images && item.images.length > 0 && (
                      <div className="p-1 text-slate-400" title="Enthält Bild">
                        <ImageIcon size={14} />
                      </div>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDownloadSingle(item); }}
                      className="text-slate-400 hover:text-blue-500 p-1 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                      title="VCF herunterladen"
                    >
                      <Download size={14} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
                      className="text-slate-400 hover:text-red-500 p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                      title="Löschen"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/50">
                  <span className="text-[10px] text-slate-400">
                    {new Date(item.timestamp).toLocaleDateString()} {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className="flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 group-hover:underline">
                    <Upload size={12} /> {t.load}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Actions */}
        {history.length > 0 && (
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={handleExportAllVCF}
                className="flex flex-col items-center justify-center gap-1 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 py-2 rounded-lg text-[10px] font-medium transition-colors"
              >
                <Contact size={16} />
                {t.vcfBackup}
              </button>
              <button
                onClick={handleExportCSV}
                className="flex flex-col items-center justify-center gap-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-[10px] font-medium transition-colors shadow-sm"
              >
                <FileText size={16} />
                {t.csvExport}
              </button>
              <button
                onClick={handleExportImages}
                className="flex flex-col items-center justify-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg text-[10px] font-medium transition-colors shadow-sm"
              >
                <ImageIcon size={16} />
                {t.imgExport}
              </button>
            </div>

            <button
              onClick={() => { if (window.confirm(t.confirmClear)) onClear(); }}
              className="w-full flex items-center justify-center gap-2 text-slate-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 py-2 rounded-lg text-xs transition-colors"
            >
              <Trash2 size={14} />
              {t.clearHistory}
            </button>
          </div>
        )}
      </div>
    </>
  );
};