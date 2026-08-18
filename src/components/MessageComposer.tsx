import React, { useState, useRef, ChangeEvent } from 'react';
import { UploadProgress, MessageType } from '../types';
import { formatBytes } from '../lib/hash';
import { Paperclip, Send, X, AlertTriangle } from 'lucide-react';
import { sounds } from '../lib/audio';

interface MessageComposerProps {
  onSendMessage: (text: string, type?: MessageType) => Promise<void>;
  onFileUpload: (file: File) => void;
  activeUpload: UploadProgress | null;
  onCancelUpload: () => void;
  isFriendTyping: boolean;
  friendName: string;
  onUserTyping: () => void;
  expirationHours: number;
  soundAlerts: boolean;
}

export const MessageComposer: React.FC<MessageComposerProps> = ({
  onSendMessage,
  onFileUpload,
  activeUpload,
  onCancelUpload,
  isFriendTyping,
  friendName,
  onUserTyping,
  expirationHours,
  soundAlerts,
}) => {
  const [text, setText] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
    onUserTyping();
    if (soundAlerts && e.target.value.length % 5 === 0) {
      sounds.playKeyBeep();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() && !activeUpload) return;
    const msg = text.trim();
    setText('');
    await onSendMessage(msg, 'text');
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      onFileUpload(file);
      e.target.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative bg-[#070b08] border-t border-[#18261e] p-2.5 sm:p-3 font-mono text-xs select-none ${
        isDragging ? 'bg-[#0d1c12] border-[#10b981]' : ''
      }`}
    >
      {/* Drag overlay notice */}
      {isDragging && (
        <div className="absolute inset-0 bg-[#0d1f14]/90 border-2 border-dashed border-[#10b981] z-20 flex items-center justify-center text-[#10b981] font-bold tracking-widest text-sm">
          [ RELEASE FILE TO INITIATE TRANSMISSION ]
        </div>
      )}

      {/* Typing Status Notification */}
      {isFriendTyping && (
        <div className="text-[11px] text-[#10b981] animate-pulse mb-2 flex items-center space-x-1.5 font-bold">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#10b981]"></span>
          <span>{friendName} IS TYPING...</span>
        </div>
      )}

      {/* Active Upload Card */}
      {activeUpload && (
        <div className="mb-3 bg-[#050907] border border-[#162a1e] p-2.5 rounded-xs space-y-2">
          <div className="flex items-center justify-between text-[11px] text-[#10b981] font-bold">
            <span>UPLOAD // TRANSMISSION</span>
            <button
              onClick={onCancelUpload}
              className="text-[#64748b] hover:text-[#ef4444] transition-colors flex items-center space-x-1 text-[10px]"
            >
              <X className="w-3 h-3" />
              <span>CANCEL</span>
            </button>
          </div>

          <div className="flex items-center justify-between text-[11px] text-[#e2e8f0]">
            <span className="truncate max-w-[200px] sm:max-w-xs">{activeUpload.fileName}</span>
            <span className="text-[#64748b]">{formatBytes(activeUpload.fileSize)}</span>
          </div>

          {/* ASCII Progress Bar */}
          <div className="space-y-1">
            <div className="w-full bg-[#0d1610] h-3 rounded-xs border border-[#142318] overflow-hidden relative flex items-center">
              <div
                className="bg-[#10b981] h-full transition-all duration-150"
                style={{ width: `${activeUpload.progressPercent}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[10px] text-[#a0aec0]">
              <span className="font-mono">
                {formatBytes(activeUpload.bytesTransferred)} / {formatBytes(activeUpload.fileSize)}
              </span>
              <span className="text-[#10b981] font-bold">{activeUpload.progressPercent}%</span>
            </div>
          </div>
        </div>
      )}

      {/* Message Expiration Active Bar */}
      {expirationHours > 0 && (
        <div className="mb-2 text-[10px] text-[#eab308] bg-[#141005] border border-[#2b220a] px-2 py-1 rounded-xs flex items-center justify-between">
          <span className="flex items-center space-x-1">
            <AlertTriangle className="w-3 h-3 text-[#eab308]" />
            <span>EXPIRATION ACTIVE: {expirationHours} HOUR(S)</span>
          </span>
          <span className="text-[#64748b]">MESSAGES PURGED AUTOMATICALLY</span>
        </div>
      )}

      {/* Main Composer Form */}
      <form onSubmit={handleSubmit} className="flex items-center space-x-2">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={!!activeUpload}
          className="p-2 bg-black hover:bg-gray-900 text-gray-400 hover:text-green-500 border border-[#1e1e1e] rounded-xs transition-colors shrink-0 disabled:opacity-50"
          title="Attach Media / File"
        >
          <Paperclip className="w-4 h-4" />
        </button>

        <div className="flex-1 border border-[#1e1e1e] bg-black p-1.5 px-3 flex items-center space-x-2 rounded-xs focus-within:border-green-500/80 transition-colors">
          <span className="text-green-500 font-bold select-none">&gt;</span>
          <input
            type="text"
            value={text}
            onChange={handleTextChange}
            placeholder="TYPE A SECURE MESSAGE..."
            className="bg-transparent text-white font-mono text-xs w-full focus:outline-none placeholder-gray-600"
          />
          <button
            type="submit"
            disabled={!text.trim() || !!activeUpload}
            className="text-green-500 border border-green-900/50 px-3 py-1 text-[10px] hover:bg-green-900/20 font-bold tracking-wider shrink-0 disabled:opacity-40 transition-colors"
          >
            [ SEND ]
          </button>
        </div>
      </form>
    </div>
  );
};
