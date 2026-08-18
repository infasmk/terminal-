import React from 'react';
import { AlertTriangle, ShieldAlert, LogOut } from 'lucide-react';

interface AccessDeniedModalProps {
  userEmail: string;
  onSignOut: () => void;
}

export const AccessDeniedModal: React.FC<AccessDeniedModalProps> = ({ userEmail, onSignOut }) => {
  return (
    <div className="min-h-screen bg-[#050706] text-[#ef4444] font-mono flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-md bg-[#090505] border border-[#3b1212] rounded-xs shadow-2xl p-6 space-y-5 text-center">
        <div className="flex justify-center">
          <div className="p-3 bg-[#1f0a0a] border border-[#521313] rounded-full text-[#ef4444]">
            <ShieldAlert className="w-8 h-8" />
          </div>
        </div>

        <div className="space-y-1">
          <h1 className="text-lg font-bold tracking-widest">ACCESS DENIED</h1>
          <p className="text-xs text-[#fca5a5]">USER NOT AUTHORIZED</p>
          <p className="text-[10px] text-[#7f1d1d] font-mono">[{userEmail}]</p>
        </div>

        <div className="bg-[#140808] border border-[#2b0d0d] p-3 rounded-xs text-[11px] text-[#991b1b] space-y-1">
          <div>CHANNEL ACCESS RESTRICTED</div>
          <div className="text-[10px] text-[#6b1e1e]">THIS SYSTEM IS STRICTLY LIMITED TO AUTHORIZED OPERATORS</div>
        </div>

        <button
          onClick={onSignOut}
          className="w-full py-2 bg-[#2b0c0c] hover:bg-[#ef4444] text-[#ef4444] hover:text-black border border-[#521313] font-bold rounded-xs transition-colors text-xs flex items-center justify-center space-x-2"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>TERMINATE SESSION</span>
        </button>
      </div>
    </div>
  );
};
