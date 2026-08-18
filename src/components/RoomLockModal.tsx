import React, { useState } from 'react';
import { Lock, Key, ArrowRight, ShieldAlert, AlertTriangle } from 'lucide-react';

interface RoomLockModalProps {
  roomId: string;
  onUnlock: (password: string) => boolean | Promise<boolean>;
  onCancel: () => void;
}

export const RoomLockModal: React.FC<RoomLockModalProps> = ({ roomId, onUnlock, onCancel }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError('PASSWORD IS REQUIRED');
      return;
    }

    setError(null);
    setIsVerifying(true);
    const success = await onUnlock(password.trim());
    setIsVerifying(false);

    if (!success) {
      setError('INCORRECT PASSWORD. ACCESS DENIED.');
    }
  };

  return (
    <div className="fixed inset-0 bg-[#050706]/95 backdrop-blur-md z-50 flex items-center justify-center p-4 font-mono text-xs select-none">
      <div className="w-full max-w-sm bg-[#070b09] border border-[#f59e0b] rounded-xs shadow-[0_0_30px_rgba(245,158,11,0.15)] overflow-hidden flex flex-col animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="bg-[#1c1205] border-b border-[#3b250a] px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Lock className="w-4 h-4 text-[#f59e0b]" />
            <span className="font-bold text-[#fef3c7] tracking-wider">PRIVATE ROOM LOCKED</span>
          </div>
          <div className="text-[10px] text-[#f59e0b] font-bold">AES-256</div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="bg-[#050907] border border-[#1e1e1e] p-3 rounded-xs text-center space-y-1">
            <div className="text-[10px] text-[#64748b]">ENTER PASSWORD TO ACCESS ROOM</div>
            <div className="text-lg font-bold text-[#10b981] font-mono tracking-widest">{roomId}</div>
          </div>

          {error && (
            <div className="bg-[#1f0a0a] border border-[#451212] p-2 text-[10px] text-[#ef4444] rounded-xs flex items-center space-x-1.5 font-bold">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] text-[#94a3b8] font-bold flex items-center space-x-1">
              <Key className="w-3 h-3 text-[#f59e0b]" />
              <span>ROOM ACCESS PASSWORD</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-black border border-[#1e1e1e] focus:border-[#f59e0b] px-3 py-2 text-white text-sm outline-none rounded-xs font-mono text-center tracking-widest"
              autoFocus
            />
          </div>

          <div className="flex items-center space-x-2 pt-1">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-2 bg-[#0d1310] border border-[#1e1e1e] text-[#64748b] hover:text-white font-bold text-xs rounded-xs transition-colors"
            >
              CANCEL
            </button>
            <button
              type="submit"
              disabled={isVerifying}
              className="flex-1 py-2 bg-[#f59e0b] text-black hover:bg-[#fbbf24] font-bold text-xs rounded-xs transition-colors flex items-center justify-center space-x-1"
            >
              <span>{isVerifying ? 'VERIFYING...' : 'UNLOCK ROOM'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
