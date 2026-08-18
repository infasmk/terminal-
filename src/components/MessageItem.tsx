import React from 'react';
import { Message } from '../types';
import { formatBytes, truncateHash } from '../lib/hash';
import { Play, Download, FileText, Image as ImageIcon, Trash2, Check, CheckCheck, Eye } from 'lucide-react';

interface MessageItemProps {
  message: Message;
  currentUid: string;
  onOpenVideo: (url: string, name: string, hash: string, duration?: string, size?: number) => void;
  onOpenImage: (url: string, name: string, hash: string) => void;
  onDeleteMessage: (id: string) => void;
}

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  currentUid,
  onOpenVideo,
  onOpenImage,
  onDeleteMessage,
}) => {
  const isSelf = message.senderUid === currentUid;
  const timeStr = new Date(message.createdAt).toTimeString().split(' ')[0]; // e.g. 20:43:21

  // Read status logic
  const readByOthers = message.readBy.filter((uid) => uid !== message.senderUid).length > 0;
  const isDelivered = message.readBy.length >= 1;

  return (
    <div
      className={`py-2 px-3 my-1.5 font-mono text-xs transition-colors ${
        isSelf ? 'flex flex-col items-end' : 'flex flex-col items-start'
      }`}
    >
      {/* Sender Header */}
      <div className={`flex items-baseline space-x-2 mb-1 ${isSelf ? 'flex-row-reverse' : ''}`}>
        <span className={`font-bold text-xs uppercase ${isSelf ? 'text-gray-400 ml-2' : 'text-green-500'}`}>
          {isSelf ? 'YOU' : message.senderName || 'FRIEND_01'}
        </span>
        <span className="text-[9px] text-gray-600">{timeStr}</span>
        {isSelf && (
          <button
            onClick={() => onDeleteMessage(message.id)}
            className="text-gray-600 hover:text-red-400 transition-colors p-0.5"
            title="Delete record"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Text Content */}
      {message.text && (
        <p className="text-gray-300 whitespace-pre-wrap leading-relaxed select-text text-xs sm:text-[13px]">
          {message.text}
        </p>
      )}

      {/* Media Attachment Card */}
      {message.attachment && (
        <div className="mt-2 border border-[#1e1e1e] bg-[#0a0c0b] p-3 max-w-sm rounded-sm space-y-2.5 w-full">
          {/* VIDEO ATTACHMENT */}
          {message.type === 'video' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between border-b border-[#1e1e1e] pb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-green-500 text-xs">▶</span>
                  <span className="text-[11px] text-white font-bold">{message.attachment.name}</span>
                </div>
                <span className="text-[9px] text-gray-600">MP4 / {formatBytes(message.attachment.size)}</span>
              </div>

              {/* Video Preview Frame */}
              <div className="relative group bg-black rounded-xs overflow-hidden border border-[#1e1e1e] aspect-video max-h-56 flex items-center justify-center">
                <video
                  src={message.attachment.url}
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                  preload="metadata"
                />
                <button
                  onClick={() =>
                    onOpenVideo(
                      message.attachment!.url,
                      message.attachment!.name,
                      message.attachment!.hash,
                      message.attachment!.duration,
                      message.attachment!.size
                    )
                  }
                  className="absolute inset-0 m-auto w-11 h-11 bg-black/80 hover:bg-green-500 border border-green-500 rounded-full flex items-center justify-center text-green-500 hover:text-black transition-all shadow-lg"
                  title="Play Video Stream"
                >
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                </button>
              </div>

              {/* File Metadata */}
              <div className="text-[10px] text-gray-400 space-y-1">
                <div>NAME: {message.attachment.name}</div>
                <div>HASH: {truncateHash(message.attachment.hash, 10)}</div>
                <div className="pt-2 flex justify-between items-center border-t border-[#1e1e1e]">
                  <a
                    href={message.attachment.url}
                    download={message.attachment.name}
                    target="_blank"
                    rel="noreferrer"
                    className="text-green-500 hover:text-green-400 font-bold flex items-center space-x-1"
                  >
                    <Download className="w-3 h-3" />
                    <span>[ DOWNLOAD ]</span>
                  </a>
                  <span className="text-gray-600 text-[9px]">STORAGE_NODE_03</span>
                </div>
              </div>
            </div>
          )}

          {/* IMAGE ATTACHMENT */}
          {message.type === 'image' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between border-b border-[#1e1e1e] pb-2">
                <div className="flex items-center space-x-2">
                  <ImageIcon className="w-3.5 h-3.5 text-blue-400" />
                  <span className="text-[11px] text-white font-bold">{message.attachment.name}</span>
                </div>
                <span className="text-[9px] text-gray-600">{formatBytes(message.attachment.size)}</span>
              </div>

              <div
                onClick={() =>
                  onOpenImage(message.attachment!.url, message.attachment!.name, message.attachment!.hash)
                }
                className="relative cursor-pointer group rounded-xs overflow-hidden border border-[#1e1e1e] max-h-60 flex items-center justify-center bg-black"
              >
                <img
                  src={message.attachment.url}
                  alt={message.attachment.name}
                  className="max-h-60 object-contain group-hover:scale-[1.01] transition-transform"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="bg-black/90 text-green-500 border border-green-500 px-2 py-1 text-[10px] rounded-xs flex items-center space-x-1">
                    <Eye className="w-3 h-3" />
                    <span>ENLARGE PREVIEW</span>
                  </span>
                </div>
              </div>

              <div className="text-[10px] text-gray-400 flex justify-between items-center border-t border-[#1e1e1e] pt-1">
                <span>HASH: {truncateHash(message.attachment.hash, 8)}</span>
                <a
                  href={message.attachment.url}
                  download={message.attachment.name}
                  target="_blank"
                  rel="noreferrer"
                  className="text-green-500 hover:text-green-400 font-bold text-[9px]"
                >
                  [ DOWNLOAD ]
                </a>
              </div>
            </div>
          )}

          {/* OTHER FILE ATTACHMENT */}
          {message.type === 'file' && (
            <div className="space-y-1.5 text-[10px] text-gray-400">
              <div className="flex items-center justify-between border-b border-[#1e1e1e] pb-1.5">
                <div className="flex items-center space-x-2 truncate">
                  <FileText className="w-3.5 h-3.5 text-green-500 shrink-0" />
                  <span className="text-white font-bold truncate">{message.attachment.name}</span>
                </div>
                <span className="text-gray-600 shrink-0">{formatBytes(message.attachment.size)}</span>
              </div>
              <div>HASH: {truncateHash(message.attachment.hash, 12)}</div>
              <div className="pt-1 flex justify-between items-center border-t border-[#1e1e1e]">
                <a
                  href={message.attachment.url}
                  download={message.attachment.name}
                  target="_blank"
                  rel="noreferrer"
                  className="text-green-500 hover:text-green-400 font-bold flex items-center space-x-1"
                >
                  <Download className="w-3 h-3" />
                  <span>[ DOWNLOAD ]</span>
                </a>
                <span className="text-gray-600 text-[9px]">SECURE RECORD</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Footer Read Indicator for Outgoing Message */}
      {isSelf && (
        <div className="text-[9px] text-green-500 pt-1 font-mono">
          {readByOthers ? (
            <span>READ // {timeStr} ✓✓</span>
          ) : isDelivered ? (
            <span className="text-gray-500">DELIVERED // {timeStr} ✓✓</span>
          ) : (
            <span className="text-gray-600">SENT // {timeStr} ✓</span>
          )}
        </div>
      )}
    </div>
  );
};
