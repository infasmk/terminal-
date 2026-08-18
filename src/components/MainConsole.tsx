import React, { useState, useEffect, useRef } from 'react';
import { Message, MessageType, UploadProgress, UserProfile } from '../types';
import { MessageItem } from './MessageItem';
import { MessageComposer } from './MessageComposer';
import { Lock, Search, Share2, ShieldCheck, Terminal } from 'lucide-react';

interface MainConsoleProps {
  messages: Message[];
  currentUid: string;
  currentRoomId: string;
  isRoomProtected?: boolean;
  onOpenShareRoom: () => void;
  onSendMessage: (text: string, type?: MessageType) => Promise<void>;
  onFileUpload: (file: File) => void;
  activeUpload: UploadProgress | null;
  onCancelUpload: () => void;
  usersList: UserProfile[];
  onUserTyping: () => void;
  onOpenVideo: (url: string, name: string, hash: string, duration?: string, size?: number) => void;
  onOpenImage: (url: string, name: string, hash: string) => void;
  onDeleteMessage: (id: string) => void;
  expirationHours: number;
  soundAlerts: boolean;
}

export const MainConsole: React.FC<MainConsoleProps> = ({
  messages,
  currentUid,
  currentRoomId,
  isRoomProtected = false,
  onOpenShareRoom,
  onSendMessage,
  onFileUpload,
  activeUpload,
  onCancelUpload,
  usersList,
  onUserTyping,
  onOpenVideo,
  onOpenImage,
  onDeleteMessage,
  expirationHours,
  soundAlerts,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Find friend user
  const friendUser = usersList.find((u) => u.uid !== currentUid);
  const isFriendTyping = friendUser?.isTyping ?? false;
  const friendName = friendUser?.displayName || 'OPERATOR_02';

  // Auto scroll to bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, activeUpload, isFriendTyping]);

  // Filter messages based on search
  const filteredMessages = messages.filter((m) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    if (m.text?.toLowerCase().includes(term)) return true;
    if (m.attachment?.name.toLowerCase().includes(term)) return true;
    if (m.senderName.toLowerCase().includes(term)) return true;
    return false;
  });

  return (
    <div className="flex-1 flex flex-col bg-[#050706] h-full overflow-hidden font-mono select-none">
      {/* Channel Header Bar */}
      <div className="bg-[#0a0c0b] border-b border-[#1e1e1e] px-4 py-2 flex items-center justify-between z-10 shrink-0 text-xs">
        <div className="flex items-center space-x-2">
          <span className="text-gray-500 uppercase text-xs">ROOM:</span>
          <span className="text-white font-bold text-xs tracking-wider">{currentRoomId}</span>
          {isRoomProtected ? (
            <span className="flex items-center space-x-1 text-[10px] bg-[#1a1205] border border-[#3b270a] text-[#f59e0b] px-1.5 py-0.5 rounded-xs font-bold">
              <Lock className="w-3 h-3" />
              <span>PRIVATE</span>
            </span>
          ) : (
            <span className="flex items-center space-x-1 text-[10px] bg-[#07130c] border border-[#162a1e] text-[#10b981] px-1.5 py-0.5 rounded-xs font-bold">
              <ShieldCheck className="w-3 h-3" />
              <span>OPEN</span>
            </span>
          )}
        </div>

        {/* Share Button & Search Bar */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <button
            onClick={onOpenShareRoom}
            className="flex items-center space-x-1.5 bg-[#0d1f14] border border-[#162a1e] text-[#10b981] hover:bg-[#10b981] hover:text-black px-2.5 py-1 rounded-xs font-bold text-[10px] transition-colors"
            title="Share Room Details & Password"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">SHARE ROOM</span>
          </button>

          <div className="relative">
            <Search className="w-3 h-3 absolute left-2 top-2 text-gray-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="SEARCH..."
              className="bg-black border border-[#1e1e1e] focus:border-green-500 text-white placeholder-gray-600 pl-6 pr-2 py-1 rounded-xs text-[11px] outline-none w-28 sm:w-44"
            />
          </div>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-3 overflow-y-auto space-y-2">
        {filteredMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-[#475569] text-xs space-y-2">
            <Terminal className="w-6 h-6 text-[#10b981]/50" />
            <div>NO MESSAGES IN ROOM #{currentRoomId}</div>
            <div className="text-[10px] text-[#334155]">INITIATE TRANSMISSION BELOW</div>
          </div>
        ) : (
          filteredMessages.map((msg) => (
            <MessageItem
              key={msg.id}
              message={msg}
              currentUid={currentUid}
              onOpenVideo={onOpenVideo}
              onOpenImage={onOpenImage}
              onDeleteMessage={onDeleteMessage}
            />
          ))
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Message Composer */}
      <div className="shrink-0">
        <MessageComposer
          onSendMessage={onSendMessage}
          onFileUpload={onFileUpload}
          activeUpload={activeUpload}
          onCancelUpload={onCancelUpload}
          isFriendTyping={isFriendTyping}
          friendName={friendName}
          onUserTyping={onUserTyping}
          expirationHours={expirationHours}
          soundAlerts={soundAlerts}
        />
      </div>
    </div>
  );
};
