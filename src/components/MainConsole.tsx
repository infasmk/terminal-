import React, { useState, useEffect, useRef } from 'react';
import { Message, MessageType, UploadProgress, UserProfile, SystemLog } from '../types';
import { MessageItem } from './MessageItem';
import { MessageComposer } from './MessageComposer';
import { Lock, Search, Terminal, ChevronDown, ChevronUp } from 'lucide-react';

interface MainConsoleProps {
  messages: Message[];
  currentUid: string;
  onSendMessage: (text: string, type?: MessageType) => Promise<void>;
  onFileUpload: (file: File) => void;
  activeUpload: UploadProgress | null;
  onCancelUpload: () => void;
  usersList: UserProfile[];
  onUserTyping: () => void;
  onOpenVideo: (url: string, name: string, hash: string, duration?: string, size?: number) => void;
  onOpenImage: (url: string, name: string, hash: string) => void;
  onDeleteMessage: (id: string) => void;
  systemLogs: SystemLog[];
  expirationHours: number;
  soundAlerts: boolean;
}

export const MainConsole: React.FC<MainConsoleProps> = ({
  messages,
  currentUid,
  onSendMessage,
  onFileUpload,
  activeUpload,
  onCancelUpload,
  usersList,
  onUserTyping,
  onOpenVideo,
  onOpenImage,
  onDeleteMessage,
  systemLogs,
  expirationHours,
  soundAlerts,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showSystemLog, setShowSystemLog] = useState(true);
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
          <span className="text-gray-500 uppercase text-xs">Channel:</span>
          <span className="text-white font-bold text-xs">PRIVATE_CHANNEL_01</span>
        </div>

        {/* Search Bar & Node Status */}
        <div className="flex items-center space-x-3">
          <div className="text-[10px] text-gray-500 hidden sm:inline">NODE: SYNC_228</div>
          <div className="relative">
            <Search className="w-3 h-3 absolute left-2 top-2 text-gray-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="SEARCH CHANNEL..."
              className="bg-black border border-[#1e1e1e] focus:border-green-500 text-white placeholder-gray-600 pl-6 pr-2 py-1 rounded-xs text-[11px] outline-none w-32 sm:w-44"
            />
          </div>

          <button
            onClick={() => setShowSystemLog(!showSystemLog)}
            className="p-1 text-gray-500 hover:text-white border border-[#1e1e1e] rounded-xs"
            title="Toggle System Log Snippet"
          >
            {showSystemLog ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* System Log Snippet Box */}
      {showSystemLog && (
        <div className="bg-[#0a0c0b] border border-[#1e1e1e] p-2 mx-4 mt-3 mb-1 font-mono text-[9px] text-gray-500 overflow-hidden leading-relaxed shrink-0">
          <div className="flex items-center justify-between text-green-500 font-bold border-b border-[#1e1e1e] pb-1 mb-1">
            <span className="flex items-center space-x-1">
              <Terminal className="w-3 h-3" />
              <span>SYSTEM LOG</span>
            </span>
            <span className="text-[9px] text-gray-600">HANDSHAKE SUCCESSFUL // LATENCY: 24MS</span>
          </div>

          <div className="space-y-0.5 max-h-16 overflow-y-auto font-mono text-gray-400">
            {systemLogs.slice(-3).map((log, i) => (
              <div key={i} className="flex space-x-2">
                <span className="text-gray-600">[{log.timestamp}]</span>
                <span className="text-gray-300">{log.event}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 p-3 overflow-y-auto space-y-2">
        {filteredMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-[#475569] text-xs space-y-2">
            <Terminal className="w-6 h-6 text-[#10b981]/50" />
            <div>NO MESSAGES IN PRIVATE_CHANNEL_01</div>
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
