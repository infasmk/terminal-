export type MessageType = 'text' | 'video' | 'image' | 'file';

export interface FileAttachment {
  url: string;
  name: string;
  size: number; // in bytes
  type: string; // mime type or extension
  hash: string; // SHA-256
  duration?: string; // for video e.g. "00:47"
  storagePath?: string;
}

export interface Message {
  id: string;
  channelId: string;
  senderUid: string;
  senderName: string; // e.g. "OPERATOR_01" or "OPERATOR_02"
  senderEmail: string;
  text?: string;
  type: MessageType;
  attachment?: FileAttachment;
  readBy: string[]; // array of uids
  createdAt: number; // timestamp
  expiresAt?: number; // timestamp or undefined
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string; // e.g. "OPERATOR_01"
  isOnline: boolean;
  lastSeen: number;
  isTyping: boolean;
  role: 'OPERATOR' | 'ADMIN';
}

export interface SystemLog {
  id: string;
  timestamp: string; // formatted HH:mm:ss or ISO
  event: string;
  level: 'INFO' | 'WARN' | 'SEC' | 'ERR';
  userUid?: string;
}

export type ViewDirectory = 'MESSAGES' | 'MEDIA' | 'FILES' | 'LOGS' | 'SETTINGS';

export interface AppSettings {
  compactMode: boolean;
  reducedMotion: boolean;
  soundAlerts: boolean;
  terminalFontSize: 'sm' | 'md' | 'lg';
  autoDownloadMaxMb: number;
  messageExpirationHours: number; // 0 = NONE, 1, 24, 168 (7 days)
}

export interface UploadProgress {
  messageId?: string;
  fileName: string;
  fileSize: number;
  progressPercent: number;
  bytesTransferred: number;
  status: 'UPLOADING' | 'COMPLETE' | 'FAILED' | 'CANCELLED';
  cancelFn?: () => void;
  error?: string;
}
