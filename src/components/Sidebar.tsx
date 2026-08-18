import React from 'react';
import { ViewDirectory, UserProfile } from '../types';
import { MessageSquare, Film, FileText, Terminal, Settings, LogOut, Lock, Server, Users, ShieldAlert } from 'lucide-react';

interface SidebarProps {
  currentView: ViewDirectory;
  onSelectView: (view: ViewDirectory) => void;
  onlineCount: number;
  totalUsersCount: number;
  uptimeString: string;
  usersList: UserProfile[];
  currentUid: string;
  onOpenSettings: () => void;
  onSignOut: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  onlineCount,
  totalUsersCount,
  uptimeString,
  usersList,
  currentUid,
  onOpenSettings,
  onSignOut,
  isOpenMobile,
  onCloseMobile,
}) => {
  const friendUser = usersList.find((u) => u.uid !== currentUid);
  const isFriendOnline = friendUser?.isOnline ?? false;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-xs z-30 md:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed md:static top-10 bottom-0 left-0 w-64 bg-[#070908] border-r border-[#1e1e1e] p-4 flex flex-col justify-between font-mono text-xs select-none transition-transform duration-200 z-40 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="space-y-6 overflow-y-auto pr-1">
          {/* SYSTEM STATUS */}
          <section className="space-y-2">
            <h3 className="text-[10px] text-gray-500 mb-2 tracking-[0.2em] uppercase font-bold flex items-center justify-between border-b border-[#1e1e1e] pb-1">
              <span>System Status</span>
              <Server className="w-3 h-3 text-green-500" />
            </h3>
            <div className="space-y-1 text-[11px] bg-[#0a0c0b] border border-[#1e1e1e] p-2.5 rounded-xs">
              <div className="flex justify-between"><span className="text-gray-600">SERVER</span><span className="text-green-500 font-semibold">ONLINE</span></div>
              <div className="flex justify-between"><span className="text-gray-600">CONNECTION</span><span className="text-green-500 font-semibold">SECURE</span></div>
              <div className="flex justify-between"><span className="text-gray-600">USERS</span><span className="text-gray-300"><span className="text-green-500 font-bold">{onlineCount}</span> / {totalUsersCount || 2}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">UPTIME</span><span className="text-gray-400 text-[10px]">{uptimeString}</span></div>
              {friendUser && (
                <div className="pt-1.5 mt-1 border-t border-[#1e1e1e] flex justify-between items-center text-[10px]">
                  <span className="text-gray-500">{friendUser.displayName || 'PEER_NODE'}</span>
                  <span className={isFriendOnline ? 'text-green-500' : 'text-gray-600'}>
                    {isFriendOnline ? '● ONLINE' : '○ OFFLINE'}
                  </span>
                </div>
              )}
            </div>
          </section>

          {/* CHANNELS */}
          <section className="space-y-2">
            <h3 className="text-[10px] text-gray-500 mb-2 tracking-[0.2em] uppercase font-bold border-b border-[#1e1e1e] pb-1">
              Channels
            </h3>
            <div className="space-y-1">
              <button
                onClick={() => {
                  onSelectView('MESSAGES');
                  onCloseMobile();
                }}
                className={`w-full text-left px-2 py-1 flex items-center justify-between border-l text-xs transition-colors ${
                  currentView === 'MESSAGES'
                    ? 'bg-gray-800/30 text-green-500 border-green-500 font-bold'
                    : 'text-gray-500 border-transparent hover:text-gray-300 hover:bg-[#1e1e1e]/40'
                }`}
              >
                <div className="flex items-center space-x-1.5">
                  <span className="text-green-500">&gt;</span>
                  <span>PRIVATE_CHANNEL_01</span>
                </div>
                <span className="text-[10px] opacity-50">🔒</span>
              </button>
            </div>
          </section>

          {/* DIRECTORY */}
          <section className="space-y-2">
            <h3 className="text-[10px] text-gray-500 mb-2 tracking-[0.2em] uppercase font-bold border-b border-[#1e1e1e] pb-1">
              Directory
            </h3>
            <div className="space-y-1 text-[12px]">
              <button
                onClick={() => {
                  onSelectView('MESSAGES');
                  onCloseMobile();
                }}
                className={`w-full text-left px-2 py-1 rounded-xs flex items-center space-x-2 transition-colors ${
                  currentView === 'MESSAGES'
                    ? 'text-green-500 font-bold bg-[#1e1e1e]/50'
                    : 'text-gray-400 hover:bg-[#1e1e1e]'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>[M] MESSAGES</span>
              </button>

              <button
                onClick={() => {
                  onSelectView('MEDIA');
                  onCloseMobile();
                }}
                className={`w-full text-left px-2 py-1 rounded-xs flex items-center space-x-2 transition-colors ${
                  currentView === 'MEDIA'
                    ? 'text-green-500 font-bold bg-[#1e1e1e]/50'
                    : 'text-gray-400 hover:bg-[#1e1e1e]'
                }`}
              >
                <Film className="w-3.5 h-3.5" />
                <span>[V] MEDIA</span>
              </button>

              <button
                onClick={() => {
                  onSelectView('FILES');
                  onCloseMobile();
                }}
                className={`w-full text-left px-2 py-1 rounded-xs flex items-center space-x-2 transition-colors ${
                  currentView === 'FILES'
                    ? 'text-green-500 font-bold bg-[#1e1e1e]/50'
                    : 'text-gray-400 hover:bg-[#1e1e1e]'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>[F] FILES</span>
              </button>

              <button
                onClick={() => {
                  onSelectView('LOGS');
                  onCloseMobile();
                }}
                className={`w-full text-left px-2 py-1 rounded-xs flex items-center space-x-2 transition-colors ${
                  currentView === 'LOGS'
                    ? 'text-green-500 font-bold bg-[#1e1e1e]/50'
                    : 'text-gray-400 hover:bg-[#1e1e1e]'
                }`}
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>[L] LOGS</span>
              </button>
            </div>
          </section>

          {/* SYSTEM */}
          <section className="space-y-2">
            <h3 className="text-[10px] text-gray-500 mb-2 tracking-[0.2em] uppercase font-bold border-b border-[#1e1e1e] pb-1">
              System
            </h3>
            <div className="space-y-1 text-[12px]">
              <button
                onClick={() => {
                  onOpenSettings();
                  onCloseMobile();
                }}
                className="w-full text-left px-2 py-1 rounded-xs text-gray-400 hover:bg-[#1e1e1e] flex items-center space-x-2 transition-colors"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>[S] SETTINGS</span>
              </button>

              <button
                onClick={onSignOut}
                className="w-full text-left px-2 py-1 rounded-xs text-gray-400 hover:text-red-400 hover:bg-red-950/20 flex items-center space-x-2 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>[X] SIGN OUT</span>
              </button>
            </div>
          </section>
        </div>

        {/* SESSION KEY & AUTH STATUS */}
        <section className="mt-auto pt-4 border-t border-[#1e1e1e]">
          <h3 className="text-[10px] text-gray-500 mb-2 tracking-[0.1em] uppercase font-bold">Session Key</h3>
          <div className="text-[9px] text-gray-600 break-all leading-tight font-mono space-y-1">
            <div>8F 6A 3C 91 7D 2B 11 9F</div>
            <div>D3 4E 7F 2A 6B 9C 20 1E</div>
            <div className="text-green-900 font-bold pt-1 uppercase">AUTHENTICATION: ACTIVE</div>
          </div>
        </section>
      </aside>
    </>
  );
};
