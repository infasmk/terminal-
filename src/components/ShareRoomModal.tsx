import React, { useState } from 'react';
import { Lock, Copy, Check, Share2, Key, Eye, EyeOff, X, ShieldCheck } from 'lucide-react';
import { createOrUpdateRoom } from '../services/roomService';

interface ShareRoomModalProps {
  roomId: string;
  currentPassword?: string;
  userUid: string;
  onClose: () => void;
  onPasswordUpdated: (newPassword: string) => void;
}

export const ShareRoomModal: React.FC<ShareRoomModalProps> = ({
  roomId,
  currentPassword = '',
  userUid,
  onClose,
  onPasswordUpdated,
}) => {
  const [passwordInput, setPasswordInput] = useState(currentPassword);
  const [showPassword, setShowPassword] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const shareUrl = `${window.location.origin}${window.location.pathname}?room=${encodeURIComponent(roomId)}${
    passwordInput ? `&pass=${encodeURIComponent(passwordInput)}` : ''
  }`;

  const invitationText = `🔒 NEXUS PRIVATE CHAT ROOM
-----------------------------
Room ID: ${roomId}
${passwordInput ? `Password: ${passwordInput}` : 'Access: Open (No Password)'}
Join Link: ${shareUrl}`;

  const handleCopyInvitation = () => {
    navigator.clipboard.writeText(invitationText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await createOrUpdateRoom(roomId, passwordInput, userUid);
    onPasswordUpdated(passwordInput.trim());
    setIsSaving(false);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-[#050706]/90 backdrop-blur-xs z-50 flex items-center justify-center p-3 font-mono text-xs select-none">
      <div className="w-full max-w-md bg-[#070b09] border border-[#16251b] rounded-xs shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-[#050907] border-b border-[#142018] px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Share2 className="w-4 h-4 text-[#10b981]" />
            <span className="font-bold text-[#e2e8f0]">SHARE PRIVATE ROOM</span>
          </div>
          <button onClick={onClose} className="text-[#64748b] hover:text-[#ef4444] transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Room Badge */}
          <div className="bg-[#050907] border border-[#121f17] p-3 rounded-xs flex items-center justify-between">
            <div>
              <div className="text-[10px] text-[#64748b]">ACTIVE ROOM ID</div>
              <div className="text-base font-bold text-[#10b981] font-mono tracking-wider">{roomId}</div>
            </div>
            <div className="flex items-center space-x-1 bg-[#0d1f14] border border-[#162a1e] px-2 py-1 text-[10px] text-[#10b981]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{passwordInput ? 'PROTECTED' : 'UNPROTECTED'}</span>
            </div>
          </div>

          {/* Password Protection Form */}
          <form onSubmit={handleSavePassword} className="space-y-2 bg-[#050907] border border-[#121f17] p-3 rounded-xs">
            <div className="flex items-center justify-between">
              <label className="text-[10px] text-[#94a3b8] font-bold flex items-center space-x-1.5">
                <Key className="w-3.5 h-3.5 text-[#10b981]" />
                <span>ROOM ACCESS PASSWORD</span>
              </label>
              {isSaved && <span className="text-[10px] text-[#10b981] font-bold">SAVED!</span>}
            </div>

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Enter room password (leave empty for public)"
                className="w-full bg-black border border-[#1e1e1e] focus:border-[#10b981] px-3 py-1.5 pr-8 text-white text-xs outline-none rounded-xs font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-2 text-[#64748b] hover:text-white"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full py-1.5 bg-[#0d1f14] border border-[#162a1e] text-[#10b981] hover:bg-[#10b981] hover:text-black font-bold text-[11px] rounded-xs transition-colors"
            >
              {isSaving ? 'SAVING...' : 'UPDATE ROOM PASSWORD'}
            </button>
          </form>

          {/* Share Invitation Card */}
          <div className="space-y-2 bg-[#050907] border border-[#121f17] p-3 rounded-xs">
            <div className="text-[10px] text-[#94a3b8] font-bold">SHARE INVITATION DETAILS</div>
            <pre className="bg-black p-2 border border-[#1e1e1e] text-[10px] text-[#10b981] rounded-xs whitespace-pre-wrap font-mono leading-relaxed">
              {invitationText}
            </pre>

            <button
              type="button"
              onClick={handleCopyInvitation}
              className="w-full py-1.5 bg-[#10b981] text-black hover:bg-[#34d399] font-bold text-[11px] rounded-xs transition-colors flex items-center justify-center space-x-1.5"
            >
              {isCopied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>INVITATION COPIED TO CLIPBOARD!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>COPY SHAREABLE INVITATION</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
