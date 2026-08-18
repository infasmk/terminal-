import React, { useEffect } from 'react';
import { Download, X, Image as ImageIcon } from 'lucide-react';

interface ImageViewerModalProps {
  url: string;
  name: string;
  hash: string;
  onClose: () => void;
}

export const ImageViewerModal: React.FC<ImageViewerModalProps> = ({
  url,
  name,
  hash,
  onClose,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="fixed inset-0 bg-[#050706]/95 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6 font-mono text-xs select-none">
      <div className="w-full max-w-4xl bg-[#070b09] border border-[#16251b] rounded-xs shadow-2xl flex flex-col overflow-hidden max-h-[95vh]">
        <div className="bg-[#050907] border-b border-[#142018] px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center space-x-2 truncate">
            <ImageIcon className="w-4 h-4 text-[#60a5fa]" />
            <span className="font-bold text-[#e2e8f0] truncate">{name}</span>
          </div>

          <div className="flex items-center space-x-3">
            <a
              href={url}
              download={name}
              target="_blank"
              rel="noreferrer"
              className="text-[#10b981] hover:text-[#34d399] transition-colors p-1"
              title="Download File"
            >
              <Download className="w-4 h-4" />
            </a>
            <button
              onClick={onClose}
              className="text-[#64748b] hover:text-[#ef4444] transition-colors p-1"
              title="Close Viewer [ESC]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="bg-black p-4 flex-1 flex items-center justify-center overflow-auto max-h-[75vh]">
          <img src={url} alt={name} className="max-h-[70vh] object-contain" />
        </div>

        <div className="bg-[#050907] border-t border-[#142018] p-3 text-[10px] text-[#64748b] flex justify-between">
          <span>SHA256: {hash}</span>
          <span>IMAGE PREVIEW MODE</span>
        </div>
      </div>
    </div>
  );
};
