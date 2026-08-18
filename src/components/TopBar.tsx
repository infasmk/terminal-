import React from 'react';
import { Hash, Menu, LogOut, Settings as SettingsIcon } from 'lucide-react';

interface TopBarProps {
  currentOperator: string;
  uptimeString: string;
  currentRoomId: string;
  onToggleSidebar: () => void;
  onOpenSettings: () => void;
  onSignOut: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentOperator,
  uptimeString,
  currentRoomId,
  onToggleSidebar,
  onOpenSettings,
  onSignOut,
}) => {
  return (
    <header className="h-10 bg-[#0a0c0b] border-b border-[#1e1e1e] px-3 sm:px-4 flex items-center justify-between font-mono text-xs text-gray-300 select-none z-20 shrink-0">
      {/* Left Branding */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onToggleSidebar}
          className="md:hidden p-1 text-gray-400 hover:text-white hover:bg-gray-800/50 border border-[#1e1e1e] rounded transition-colors"
          title="Toggle Menu"
        >
          <Menu className="w-4 h-4" />
        </button>

        <div className="flex items-center space-x-2">
          <span className="text-white font-bold tracking-widest text-xs">NEXUS // CONSOLE</span>
          <span className="hidden sm:inline text-gray-600 px-1 text-[10px] font-mono">v2.4.1</span>
        </div>

        {/* Current Room Badge */}
        <div className="flex items-center space-x-1.5 bg-[#07130c] border border-[#162a1e] text-[#10b981] px-2 py-0.5 rounded-xs font-bold text-[10px]">
          <Hash className="w-3 h-3 text-[#10b981]" />
          <span>{currentRoomId || 'ROOM_ALPHA'}</span>
        </div>
      </div>

      {/* Middle Encryption & Uptime */}
      <div className="hidden lg:flex items-center space-x-4 text-[10px]">
        <span className="text-gray-500 tracking-tighter">ENCRYPTION: AES-256-GCM</span>
        <div className="flex items-center space-x-1.5 text-gray-500">
          <span>UPTIME:</span>
          <span className="text-green-500 font-mono tracking-wider">{uptimeString}</span>
        </div>
      </div>

      {/* Right Connection Status & User Badge */}
      <div className="flex items-center space-x-3 text-[11px]">
        <div className="flex items-center space-x-2 bg-black/40 border border-[#1e1e1e] px-2.5 py-0.5 rounded-xs">
          <span className="hidden sm:inline text-[10px] text-gray-400">SECURE CONNECTION ESTABLISHED</span>
          <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_5px_rgba(74,222,128,0.5)]"></span>
        </div>

        <div className="flex items-center space-x-2 text-gray-300 border-l border-[#1e1e1e] pl-3">
          <span className="text-green-500 font-semibold">{currentOperator}</span>
          <button
            onClick={onOpenSettings}
            className="p-1 text-gray-500 hover:text-white transition-colors"
            title="Console Settings"
          >
            <SettingsIcon className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onSignOut}
            className="p-1 text-gray-500 hover:text-red-400 transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
