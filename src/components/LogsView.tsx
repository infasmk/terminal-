import React, { useState } from 'react';
import { SystemLog } from '../types';
import { Terminal, Download, RefreshCw, ShieldAlert } from 'lucide-react';

interface LogsViewProps {
  logs: SystemLog[];
}

export const LogsView: React.FC<LogsViewProps> = ({ logs }) => {
  const [filterLevel, setFilterLevel] = useState<'ALL' | 'INFO' | 'WARN' | 'SEC' | 'ERR'>('ALL');

  const filteredLogs = logs.filter((l) => {
    if (filterLevel === 'ALL') return true;
    return l.level === filterLevel;
  });

  const handleExportLogs = () => {
    const textContent = logs
      .map((l) => `[${l.timestamp}] [${l.level}] ${l.event} (USER: ${l.userUid || 'SYSTEM'})`)
      .join('\n');

    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nexus_system_log_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 space-y-4 font-mono text-xs text-[#a0aec0] h-full flex flex-col">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#142218] pb-3 shrink-0">
        <div className="flex items-center space-x-2">
          <Terminal className="w-4 h-4 text-[#10b981]" />
          <span className="font-bold text-[#e2e8f0] text-sm">SYSTEM LOG CONSOLE</span>
          <span className="text-[#64748b]">({logs.length} RECORDED)</span>
        </div>

        <div className="flex items-center space-x-3">
          {/* Level selector */}
          <div className="flex items-center bg-[#050907] border border-[#142218] rounded-xs p-0.5 text-[10px]">
            {(['ALL', 'INFO', 'WARN', 'SEC', 'ERR'] as const).map((lvl) => (
              <button
                key={lvl}
                onClick={() => setFilterLevel(lvl)}
                className={`px-2 py-0.5 rounded-xs font-bold transition-colors ${
                  filterLevel === lvl
                    ? 'bg-[#0d1e13] text-[#10b981] border border-[#10b981]/40'
                    : 'text-[#64748b] hover:text-[#cbd5e1]'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportLogs}
            className="px-2.5 py-1 bg-[#0d1a12] border border-[#162a1e] text-[#10b981] hover:bg-[#10b981] hover:text-black rounded-xs text-[10px] font-bold transition-all flex items-center space-x-1"
          >
            <Download className="w-3 h-3" />
            <span>EXPORT TXT</span>
          </button>
        </div>
      </div>

      {/* Terminal Log Console Screen */}
      <div className="flex-1 bg-[#040705] border border-[#142218] rounded-xs p-3 font-mono text-[11px] overflow-y-auto space-y-1">
        {filteredLogs.length === 0 ? (
          <div className="text-[#475569] text-center py-8">NO LOG ENTRIES FOR SELECTED LEVEL</div>
        ) : (
          filteredLogs.map((log, idx) => (
            <div key={idx} className="flex items-start space-x-2 leading-relaxed hover:bg-[#070e0a] p-1 rounded-xs">
              <span className="text-[#475569] select-none">[{log.timestamp}]</span>
              <span
                className={`font-bold px-1 rounded-xs text-[10px] select-none ${
                  log.level === 'ERR'
                    ? 'bg-[#2b0a0a] text-[#ef4444] border border-[#521313]'
                    : log.level === 'WARN'
                    ? 'bg-[#261c06] text-[#eab308] border border-[#4a360a]'
                    : log.level === 'SEC'
                    ? 'bg-[#0a1c2b] text-[#38bdf8] border border-[#123852]'
                    : 'bg-[#0a1c12] text-[#10b981] border border-[#123824]'
                }`}
              >
                {log.level}
              </span>
              <span className="text-[#e2e8f0] flex-1">{log.event}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
