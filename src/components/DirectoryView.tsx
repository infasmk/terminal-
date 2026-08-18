import React, { useState } from 'react';
import { Message, FileAttachment } from '../types';
import { formatBytes, truncateHash } from '../lib/hash';
import { Film, FileText, Download, Play, Image as ImageIcon, Search, Lock, Loader2 } from 'lucide-react';
import { useResolvedAttachmentUrl } from '../hooks/useResolvedAttachmentUrl.ts';

interface DirectoryViewProps {
  mode: 'MEDIA' | 'FILES';
  messages: Message[];
  isLocked?: boolean;
  onOpenVideo: (url: string, name: string, hash: string, duration?: string, size?: number) => void;
  onOpenImage: (url: string, name: string, hash: string) => void;
}

const DirectoryMediaCard: React.FC<{
  item: FileAttachment & { createdAt: number; type: string };
  onOpenVideo: (url: string, name: string, hash: string, duration?: string, size?: number) => void;
  onOpenImage: (url: string, name: string, hash: string) => void;
}> = ({ item, onOpenVideo, onOpenImage }) => {
  const { resolvedUrl, isLoading, loadingPercent } = useResolvedAttachmentUrl(item);

  return (
    <div className="bg-[#070c09] border border-[#142218] p-2.5 rounded-xs space-y-2 hover:border-[#10b981]/50 transition-all group">
      {item.type === 'video' ? (
        <div
          onClick={() => {
            if (resolvedUrl) {
              onOpenVideo(resolvedUrl, item.name, item.hash, item.duration, item.size);
            }
          }}
          className="relative bg-black aspect-video rounded-xs overflow-hidden cursor-pointer flex items-center justify-center border border-[#121e16]"
        >
          {isLoading ? (
            <div className="flex flex-col items-center justify-center space-y-1">
              <Loader2 className="w-5 h-5 text-[#10b981] animate-spin" />
              <span className="text-[9px] text-[#10b981] font-mono">{loadingPercent}%</span>
            </div>
          ) : (
            <>
              <video src={resolvedUrl} className="w-full h-full object-cover opacity-75 group-hover:opacity-100" />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <div className="w-9 h-9 rounded-full bg-[#050907]/90 border border-[#10b981] text-[#10b981] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                </div>
              </div>
            </>
          )}
        </div>
      ) : (
        <div
          onClick={() => {
            if (resolvedUrl) {
              onOpenImage(resolvedUrl, item.name, item.hash);
            }
          }}
          className="relative bg-black aspect-video rounded-xs overflow-hidden cursor-pointer flex items-center justify-center border border-[#121e16]"
        >
          {isLoading ? (
            <div className="flex flex-col items-center justify-center space-y-1">
              <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
              <span className="text-[9px] text-blue-400 font-mono">{loadingPercent}%</span>
            </div>
          ) : (
            <img src={resolvedUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
          )}
        </div>
      )}

      <div className="space-y-1">
        <div className="font-bold text-[#e2e8f0] truncate text-[11px]">{item.name}</div>
        <div className="flex justify-between items-center text-[10px] text-[#64748b]">
          <span>{formatBytes(item.size)}</span>
          <span>{new Date(item.createdAt).toLocaleDateString()}</span>
        </div>
        <div className="flex justify-between items-center text-[10px] text-[#475569] pt-1 border-t border-[#101b14]">
          <span>SHA256: {truncateHash(item.hash, 8)}</span>
          {resolvedUrl ? (
            <a
              href={resolvedUrl}
              download={item.name}
              target="_blank"
              rel="noreferrer"
              className="text-[#10b981] hover:text-[#34d399] transition-colors p-0.5"
              title="Download"
            >
              <Download className="w-3.5 h-3.5" />
            </a>
          ) : (
            <span className="text-[9px] text-gray-600">LOADING...</span>
          )}
        </div>
      </div>
    </div>
  );
};

const DirectoryFileRow: React.FC<{
  item: FileAttachment & { createdAt: number; type: string };
}> = ({ item }) => {
  const { resolvedUrl } = useResolvedAttachmentUrl(item);

  return (
    <tr className="hover:bg-[#0a120d] transition-colors text-[11px]">
      <td className="p-2.5 font-bold text-[#e2e8f0] truncate max-w-xs">{item.name}</td>
      <td className="p-2.5 text-[#94a3b8]">{formatBytes(item.size)}</td>
      <td className="p-2.5 text-[#64748b] uppercase">{item.type.split('/')[1] || 'FILE'}</td>
      <td className="p-2.5 text-[#64748b]">{new Date(item.createdAt).toLocaleDateString()}</td>
      <td className="p-2.5 text-[#475569] font-mono">{truncateHash(item.hash, 12)}</td>
      <td className="p-2.5 text-right">
        {resolvedUrl ? (
          <a
            href={resolvedUrl}
            download={item.name}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center space-x-1 px-2 py-1 bg-[#0d1c12] border border-[#162a1e] text-[#10b981] hover:bg-[#10b981] hover:text-black rounded-xs text-[10px] font-bold transition-all"
          >
            <Download className="w-3 h-3" />
            <span>DOWNLOAD</span>
          </a>
        ) : (
          <span className="text-[#64748b] text-[10px]">PREPARING...</span>
        )}
      </td>
    </tr>
  );
};

interface DirectoryViewProps {
  mode: 'MEDIA' | 'FILES';
  messages: Message[];
  isLocked?: boolean;
  onOpenVideo: (url: string, name: string, hash: string, duration?: string, size?: number) => void;
  onOpenImage: (url: string, name: string, hash: string) => void;
}

export const DirectoryView: React.FC<DirectoryViewProps> = ({
  mode,
  messages,
  isLocked = false,
  onOpenVideo,
  onOpenImage,
}) => {
  const [filterType, setFilterType] = useState<'ALL' | 'VIDEO' | 'IMAGE'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  if (isLocked) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center font-mono text-xs text-[#94a3b8] h-full">
        <Lock className="w-8 h-8 text-[#f59e0b] mb-2" />
        <div className="text-sm font-bold text-[#f59e0b]">DIRECTORY LOCKED</div>
        <div className="text-[11px] text-[#64748b] mt-1">Unlock room in messages tab to view shared files and media.</div>
      </div>
    );
  }

  // Extract attachments from messages
  const attachments = messages
    .filter((m) => m.attachment)
    .map((m) => ({
      messageId: m.id,
      senderName: m.senderName,
      createdAt: m.createdAt,
      type: m.type,
      ...m.attachment!,
    }));

  if (mode === 'MEDIA') {
    const mediaItems = attachments.filter((a) => {
      const isMedia = a.type === 'video' || a.type === 'image';
      if (!isMedia) return false;
      if (filterType === 'VIDEO') return a.type === 'video';
      if (filterType === 'IMAGE') return a.type === 'image';
      if (searchTerm) {
        return a.name.toLowerCase().includes(searchTerm.toLowerCase());
      }
      return true;
    });

    return (
      <div className="p-4 space-y-4 font-mono text-xs text-[#a0aec0] h-full overflow-y-auto">
        {/* Header & Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#142218] pb-3">
          <div className="flex items-center space-x-2">
            <Film className="w-4 h-4 text-[#10b981]" />
            <span className="font-bold text-[#e2e8f0] text-sm">DIRECTORY // MEDIA</span>
            <span className="text-[#64748b]">({mediaItems.length} ITEMS)</span>
          </div>

          <div className="flex items-center space-x-3">
            {/* Filter buttons */}
            <div className="flex items-center bg-[#050907] border border-[#142218] rounded-xs p-0.5 text-[10px]">
              {(['ALL', 'VIDEO', 'IMAGE'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={`px-2.5 py-1 rounded-xs transition-colors font-bold ${
                    filterType === t
                      ? 'bg-[#0e1d13] text-[#10b981] border border-[#10b981]/40'
                      : 'text-[#64748b] hover:text-[#cbd5e1]'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Search Box */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2 top-2 text-[#475569]" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="SEARCH MEDIA..."
                className="bg-[#050907] border border-[#142218] text-[#e2e8f0] placeholder-[#475569] pl-7 pr-2 py-1 rounded-xs text-[11px] outline-none focus:border-[#10b981]"
              />
            </div>
          </div>
        </div>

        {/* Media Grid */}
        {mediaItems.length === 0 ? (
          <div className="py-12 text-center text-[#475569] border border-dashed border-[#121c16] rounded-xs">
            NO MEDIA RECORDS LOCATED IN DIRECTORY
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {mediaItems.map((item, idx) => (
              <DirectoryMediaCard
                key={idx}
                item={item}
                onOpenVideo={onOpenVideo}
                onOpenImage={onOpenImage}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // FILES MODE
  const fileItems = attachments.filter((a) => {
    if (searchTerm) return a.name.toLowerCase().includes(searchTerm.toLowerCase());
    return true;
  });

  return (
    <div className="p-4 space-y-4 font-mono text-xs text-[#a0aec0] h-full overflow-y-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#142218] pb-3">
        <div className="flex items-center space-x-2">
          <FileText className="w-4 h-4 text-[#10b981]" />
          <span className="font-bold text-[#e2e8f0] text-sm">DIRECTORY // FILES</span>
          <span className="text-[#64748b]">({fileItems.length} RECORDS)</span>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2 top-2 text-[#475569]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="SEARCH FILE RECORDS..."
            className="bg-[#050907] border border-[#142218] text-[#e2e8f0] placeholder-[#475569] pl-7 pr-2 py-1 rounded-xs text-[11px] outline-none focus:border-[#10b981]"
          />
        </div>
      </div>

      {fileItems.length === 0 ? (
        <div className="py-12 text-center text-[#475569] border border-dashed border-[#121c16] rounded-xs">
          NO FILE RECORDS LOCATED IN DIRECTORY
        </div>
      ) : (
        <div className="overflow-x-auto border border-[#142218] rounded-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#080d0a] border-b border-[#142218] text-[10px] text-[#64748b] uppercase tracking-wider">
                <th className="p-2.5">NAME</th>
                <th className="p-2.5">SIZE</th>
                <th className="p-2.5">TYPE</th>
                <th className="p-2.5">DATE</th>
                <th className="p-2.5">SHA256 HASH</th>
                <th className="p-2.5 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#101b14] bg-[#050907]">
              {fileItems.map((item, idx) => (
                <DirectoryFileRow key={idx} item={item} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
