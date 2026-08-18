import React from 'react';
import { AppSettings } from '../types';
import { Settings as SettingsIcon, X, Sliders, MessageSquare, Shield, Bell, Terminal } from 'lucide-react';

interface SettingsModalProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  currentOperator: string;
  userEmail: string;
  onClose: () => void;
  onSignOut: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onUpdateSettings,
  currentOperator,
  userEmail,
  onClose,
  onSignOut,
}) => {
  return (
    <div className="fixed inset-0 bg-[#050706]/90 backdrop-blur-xs z-50 flex items-center justify-center p-3 font-mono text-xs select-none">
      <div className="w-full max-w-lg bg-[#070b09] border border-[#16251b] rounded-xs shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-[#050907] border-b border-[#142018] px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <SettingsIcon className="w-4 h-4 text-[#10b981]" />
            <span className="font-bold text-[#e2e8f0]">NEXUS // CONSOLE SETTINGS</span>
          </div>

          <button
            onClick={onClose}
            className="text-[#64748b] hover:text-[#ef4444] transition-colors p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-4 space-y-5 overflow-y-auto max-h-[75vh]">
          {/* INTERFACE SECTION */}
          <div className="space-y-3">
            <div className="text-[#10b981] font-bold text-[11px] border-b border-[#121f17] pb-1 flex items-center space-x-1.5">
              <Sliders className="w-3.5 h-3.5" />
              <span>INTERFACE OPTIONS</span>
            </div>

            <div className="space-y-2 text-[#94a3b8]">
              <div className="flex items-center justify-between bg-[#050907] p-2 rounded-xs border border-[#121f17]">
                <span>Compact Layout Mode</span>
                <button
                  onClick={() => onUpdateSettings({ compactMode: !settings.compactMode })}
                  className={`px-2.5 py-0.5 rounded-xs border font-bold text-[10px] ${
                    settings.compactMode ? 'bg-[#0d1f14] text-[#10b981] border-[#10b981]' : 'border-[#18261e] text-[#64748b]'
                  }`}
                >
                  {settings.compactMode ? 'ENABLED' : 'DISABLED'}
                </button>
              </div>

              <div className="flex items-center justify-between bg-[#050907] p-2 rounded-xs border border-[#121f17]">
                <span>Sound Alerts / Beeps</span>
                <button
                  onClick={() => onUpdateSettings({ soundAlerts: !settings.soundAlerts })}
                  className={`px-2.5 py-0.5 rounded-xs border font-bold text-[10px] ${
                    settings.soundAlerts ? 'bg-[#0d1f14] text-[#10b981] border-[#10b981]' : 'border-[#18261e] text-[#64748b]'
                  }`}
                >
                  {settings.soundAlerts ? 'ON' : 'OFF'}
                </button>
              </div>

              <div className="flex items-center justify-between bg-[#050907] p-2 rounded-xs border border-[#121f17]">
                <span>Terminal Font Scale</span>
                <div className="flex space-x-1 text-[10px]">
                  {(['sm', 'md', 'lg'] as const).map((sz) => (
                    <button
                      key={sz}
                      onClick={() => onUpdateSettings({ terminalFontSize: sz })}
                      className={`px-2 py-0.5 rounded-xs border uppercase ${
                        settings.terminalFontSize === sz
                          ? 'border-[#10b981] text-[#10b981] bg-[#0d1f14] font-bold'
                          : 'border-[#18261e] text-[#64748b]'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* CHAT & EXPIRATION SECTION */}
          <div className="space-y-3">
            <div className="text-[#10b981] font-bold text-[11px] border-b border-[#121f17] pb-1 flex items-center space-x-1.5">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>CHAT & MESSAGE PURGE</span>
            </div>

            <div className="space-y-2 text-[#94a3b8]">
              <div className="bg-[#050907] p-2.5 rounded-xs border border-[#121f17] space-y-1.5">
                <div className="flex justify-between items-center">
                  <span>Automated Message Expiration</span>
                  <span className="text-[#10b981] font-bold">
                    {settings.messageExpirationHours === 0
                      ? 'NONE'
                      : `${settings.messageExpirationHours} HOUR(S)`}
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-1.5 pt-1 text-[10px]">
                  {[
                    { label: 'NONE', hours: 0 },
                    { label: '1 HOUR', hours: 1 },
                    { label: '24 HOURS', hours: 24 },
                    { label: '7 DAYS', hours: 168 },
                  ].map((opt) => (
                    <button
                      key={opt.hours}
                      onClick={() => onUpdateSettings({ messageExpirationHours: opt.hours })}
                      className={`py-1 rounded-xs border font-bold transition-colors ${
                        settings.messageExpirationHours === opt.hours
                          ? 'bg-[#0d1f14] text-[#10b981] border-[#10b981]'
                          : 'bg-[#080d0a] border-[#142018] text-[#64748b] hover:text-[#cbd5e1]'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ACCOUNT & SECURITY */}
          <div className="space-y-3">
            <div className="text-[#10b981] font-bold text-[11px] border-b border-[#121f17] pb-1 flex items-center space-x-1.5">
              <Shield className="w-3.5 h-3.5" />
              <span>OPERATOR ACCOUNT</span>
            </div>

            <div className="bg-[#050907] p-2.5 rounded-xs border border-[#121f17] space-y-2 text-[11px]">
              <div className="flex justify-between">
                <span className="text-[#64748b]">OPERATOR ALIAS:</span>
                <span className="text-[#10b981] font-bold">{currentOperator}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748b]">EMAIL IDENTITY:</span>
                <span className="text-[#e2e8f0] font-mono">{userEmail}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748b]">CHANNEL ACCESS:</span>
                <span className="text-[#10b981]">PRIVATE_CHANNEL_01</span>
              </div>

              <div className="pt-2">
                <button
                  onClick={onSignOut}
                  className="w-full py-1.5 bg-[#120808] border border-[#381212] text-[#ef4444] hover:bg-[#ef4444] hover:text-black font-bold rounded-xs transition-colors"
                >
                  TERMINATE SESSION / SIGN OUT
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#050907] border-t border-[#142018] p-3 text-right">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#0d1a12] border border-[#162a1e] text-[#10b981] hover:bg-[#10b981] hover:text-black font-bold rounded-xs transition-colors"
          >
            CLOSE SETTINGS
          </button>
        </div>
      </div>
    </div>
  );
};
