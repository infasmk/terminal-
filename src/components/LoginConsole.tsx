import React, { useState } from 'react';
import { Terminal, Shield, KeyRound, AlertOctagon, User } from 'lucide-react';

interface LoginConsoleProps {
  onConnectWithName: (name: string) => Promise<void>;
  authError: string | null;
}

export const LoginConsole: React.FC<LoginConsoleProps> = ({
  onConnectWithName,
  authError,
}) => {
  const [operatorName, setOperatorName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!operatorName.trim()) return;
    setIsLoading(true);
    try {
      await onConnectWithName(operatorName.trim());
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreset = async (presetName: string) => {
    setIsLoading(true);
    try {
      await onConnectWithName(presetName);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050706] text-[#a0aec0] font-mono flex flex-col items-center justify-center p-4 select-none">
      {/* Background Grid Pattern Accent */}
      <div className="absolute inset-0 bg-[radial-gradient(#122018_1px,transparent_1px)] [background-size:16px_16px] opacity-30 pointer-events-none" />

      <div className="w-full max-w-md bg-[#0a0c0b] border border-[#1e1e1e] rounded-xs shadow-2xl p-6 relative z-10 space-y-6">
        {/* Terminal Header */}
        <div className="space-y-2 border-b border-[#1e1e1e] pb-4">
          <div className="flex items-center space-x-2 text-green-500">
            <Terminal className="w-5 h-5" />
            <span className="font-bold tracking-widest text-base text-white">NEXUS // CONSOLE ACCESS</span>
          </div>
          <div className="text-[11px] text-gray-500 tracking-wider flex items-center justify-between">
            <span>ENTER YOUR OPERATOR NAME</span>
            <User className="w-3.5 h-3.5 text-green-500" />
          </div>
        </div>

        {/* Auth Error Banner */}
        {authError && (
          <div className="bg-red-950/20 border border-red-900/50 p-3 rounded-xs text-red-400 text-xs flex items-start space-x-2">
            <AlertOctagon className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-bold">CONNECTION ERROR</div>
              <div className="text-[11px] text-red-300">{authError}</div>
            </div>
          </div>
        )}

        {/* Name Entry Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="text-[10px] text-gray-500 uppercase tracking-wider block font-bold">
              YOUR NAME / CALL SIGN
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-green-500 font-bold">&gt;</span>
              <input
                type="text"
                value={operatorName}
                onChange={(e) => setOperatorName(e.target.value)}
                placeholder="e.g. Infas, Operator Alpha..."
                required
                autoFocus
                className="w-full bg-black border border-[#1e1e1e] focus:border-green-500 text-white pl-8 pr-3 py-2 rounded-xs outline-none font-mono text-xs placeholder-gray-600"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !operatorName.trim()}
            className="w-full py-2.5 bg-green-950/20 hover:bg-green-900/30 text-green-500 hover:text-green-400 font-bold border border-green-900/50 rounded-xs transition-all text-xs tracking-wider flex items-center justify-center space-x-2 disabled:opacity-40"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>{isLoading ? 'CONNECTING...' : '[ ENTER CONSOLE ]'}</span>
          </button>
        </form>

        {/* Quick Operator Presets */}
        <div className="pt-2 border-t border-[#1e1e1e] space-y-2">
          <div className="text-[10px] text-gray-500 uppercase tracking-wider flex items-center justify-between font-bold">
            <span>QUICK PRESETS (2-PERSON TEST)</span>
            <Shield className="w-3 h-3 text-green-500" />
          </div>

          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <button
              onClick={() => handlePreset('OPERATOR_01')}
              disabled={isLoading}
              className="p-2 bg-black border border-[#1e1e1e] hover:border-green-500 text-green-500 rounded-xs font-bold transition-all text-center"
            >
              OPERATOR_01 (ALPHA)
            </button>
            <button
              onClick={() => handlePreset('OPERATOR_02')}
              disabled={isLoading}
              className="p-2 bg-black border border-[#1e1e1e] hover:border-blue-400 text-blue-400 rounded-xs font-bold transition-all text-center"
            >
              OPERATOR_02 (BETA)
            </button>
          </div>
        </div>

        {/* Security Footer Note */}
        <div className="text-[10px] text-gray-600 pt-2 border-t border-[#1e1e1e] flex justify-between">
          <span>ACCESS: OPEN</span>
          <span>CHANNEL: PRIVATE_01</span>
        </div>
      </div>

      <div className="mt-6 text-[11px] text-gray-700 tracking-widest uppercase">
        NEXUS SERVER // PRIVATE COMMUNICATION SYSTEM
      </div>
    </div>
  );
};
